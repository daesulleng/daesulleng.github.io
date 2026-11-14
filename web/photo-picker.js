// All conversion stays on this device. Only the final compressed image enters
// Flutter's editor and the authenticated upload pipeline. No remote converter.
(() => {
  const base = new URL('.', document.currentScript.src);
  const MAX_BYTES = 30 * 1024 * 1024;
  const UPLOAD_MAX_BYTES = 1000000;
  let busy = false;
  const canvasBlob = (canvas, type, quality) => new Promise((resolve, reject) =>
    canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('사진을 저장하지 못했어요.')), type, quality));

  async function normalizePhoto(file, signal, status) {
    if (!file.size || file.size > MAX_BYTES) throw new Error('30MB 이하의 사진을 선택해 주세요.');
    const header = new Uint8Array(await file.slice(0, 64).arrayBuffer());
    const tag = String.fromCharCode(...header);
    const heic = tag.slice(4, 8) === 'ftyp' && /heic|heix|hevc|hevx|mif1|msf1/.test(tag.slice(8));
    let source, objectUrl, sourceCanvas;
    try {
      if (heic) {
        status.textContent = '아이폰 사진을 변환하고 있어요…';
        const pixels = await new Promise((resolve, reject) => {
          const worker = new Worker(new URL('heic-worker.js?v=1', base), {type: 'module'});
          const finish = (error, value) => {
            clearTimeout(timer); signal.removeEventListener('abort', cancel);
            worker.terminate(); error ? reject(error) : resolve(value);
          };
          const cancel = () => finish(new DOMException('Cancelled', 'AbortError'));
          const timer = setTimeout(() => finish(new Error('변환 시간이 길어지고 있어요. 사진 크기를 줄여 다시 시도해 주세요.')), 45000);
          worker.onmessage = ({data}) => finish(data.error ? new Error(data.error) : null, data);
          worker.onerror = () => finish(new Error('아이폰 사진 변환기를 불러오지 못했어요. 새로고침 후 다시 시도해 주세요.'));
          signal.addEventListener('abort', cancel, {once: true});
          file.arrayBuffer().then(buffer => {
            if (signal.aborted) cancel(); else worker.postMessage(buffer, [buffer]);
          }).catch(error => finish(error));
        });
        sourceCanvas = document.createElement('canvas');
        sourceCanvas.width = pixels.width; sourceCanvas.height = pixels.height;
        sourceCanvas.getContext('2d', {colorSpace: 'srgb'}).putImageData(
          new ImageData(new Uint8ClampedArray(pixels.pixels), pixels.width, pixels.height), 0, 0);
        source = sourceCanvas;
      } else {
        // Native image decoding applies orientation and embedded colour profiles.
        objectUrl = URL.createObjectURL(file);
        source = new Image(); source.src = objectUrl;
        await source.decode();
      }
      if (signal.aborted) throw new DOMException('Cancelled', 'AbortError');
      const width = source.naturalWidth || source.width, height = source.naturalHeight || source.height;
      if (!width || !height || width * height > 40000000) throw new Error('4천만 화소 이하의 사진을 선택해 주세요.');
      status.textContent = '사진 크기와 용량을 최적화하고 있어요…';
      const canvas = document.createElement('canvas');
      let scale = Math.min(1, 2048 / Math.max(width, height));
      try {
        for (let attempt = 0; attempt < 8; attempt++) {
          canvas.width = Math.max(1, Math.round(width * scale));
          canvas.height = Math.max(1, Math.round(height * scale));
          const context = canvas.getContext('2d', {alpha: false, colorSpace: 'srgb'});
          context.fillStyle = '#ffffff'; context.fillRect(0, 0, canvas.width, canvas.height);
          context.imageSmoothingEnabled = true; context.imageSmoothingQuality = 'high';
          context.drawImage(source, 0, 0, canvas.width, canvas.height);
          for (const quality of [.92, .88, .84, .80]) {
            const output = await canvasBlob(canvas, 'image/jpeg', quality);
            if (signal.aborted) throw new DOMException('Cancelled', 'AbortError');
            if (output.size <= UPLOAD_MAX_BYTES) return new Uint8Array(await output.arrayBuffer());
          }
          scale *= .85;
        }
        throw new Error('사진 용량을 줄이지 못했어요. 다른 사진을 선택해 주세요.');
      } finally { canvas.width = canvas.height = 1; }
    } finally {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      if (sourceCanvas) sourceCanvas.width = sourceCanvas.height = 1;
    }
  }

  window.dgPickPhoto = (camera = false) => new Promise((resolve, reject) => {
    if (busy) { resolve(null); return; }
    busy = true;
    const input = document.createElement('input'); input.type = 'file';
    input.accept = 'image/jpeg,image/png,image/webp,image/heic,image/heif,.jpg,.jpeg,.png,.webp,.heic,.heif';
    input.style.display = 'none';
    if (camera) input.setAttribute('capture', 'environment');
    document.body.append(input);
    const done = value => { busy = false; input.remove(); resolve(value); };
    input.addEventListener('cancel', () => done(null), {once: true});
    input.addEventListener('change', async () => {
      const file = input.files?.[0];
      if (!file) { done(null); return; }
      const abort = new AbortController();
      const dialog = document.createElement('dialog');
      dialog.setAttribute('aria-label', '사진 준비');
      dialog.style.cssText = 'border:1px solid #ddd;border-radius:20px;padding:28px;max-width:min(360px,85vw);font:16px system-ui;color:#25262b';
      const title = document.createElement('strong'); title.textContent = '사진 준비 중';
      const status = document.createElement('p'); status.setAttribute('role', 'status'); status.textContent = '사진을 확인하고 있어요…';
      const caption = document.createElement('p'); caption.textContent = '원본은 전송하지 않아요. 변환 후 사진을 편집할 수 있어요.'; caption.style.cssText = 'color:#686b73;font-size:13px;line-height:1.6';
      const cancel = document.createElement('button'); cancel.textContent = '취소'; cancel.style.cssText = 'border:0;border-radius:10px;padding:12px 20px;background:#bb2833;color:white;cursor:pointer';
      cancel.onclick = () => abort.abort(); dialog.addEventListener('cancel', () => abort.abort());
      dialog.append(title, status, caption, cancel); document.body.append(dialog); dialog.showModal();
      try {
        const output = await normalizePhoto(file, abort.signal, status);
        done(abort.signal.aborted ? null : output);
      } catch (error) {
        if (error.name === 'AbortError') done(null);
        else {
          status.textContent = error.message || '사진을 변환하지 못했어요.';
          caption.textContent = 'JPG·PNG·HEIC·HEIF 형식의 30MB 이하 사진을 선택해 주세요.';
          cancel.textContent = '확인';
          await new Promise(close => { cancel.onclick = close; dialog.addEventListener('cancel', close, {once:true}); });
          busy = false; input.remove(); reject(error);
        }
      } finally { dialog.close(); dialog.remove(); }
    }, {once: true});
    input.click();
  });
})();
