// Adapted from heic-to 1.6.7 src/worker.js (LGPL-3.0-or-later).
// Changes: dimension limit, transferable pixels, one job per disposable worker.
import buildLibheif from './vendor/heic/libheif.js';
const libheif = buildLibheif();
self.onmessage = async ({data: buffer}) => {
  let decoder, images;
  try {
    decoder = new libheif.HeifDecoder();
    images = decoder.decode(buffer);
    const image = images.find(item => item.is_primary()) || images[0];
    if (!image) throw new Error('사진을 읽을 수 없어요.');
    const width = image.get_width(), height = image.get_height();
    if (width < 1 || height < 1 || width * height > 40000000) {
      throw new Error('4천만 화소 이하의 사진을 선택해 주세요.');
    }
    const rgba = new ImageData(width, height);
    for (let i = 3; i < rgba.data.length; i += 4) rgba.data[i] = 255;
    const decoded = await new Promise((resolve, reject) => image.display(rgba,
      value => value ? resolve(value) : reject(new Error('사진을 변환하지 못했어요.'))));
    self.postMessage({width, height, pixels: decoded.data.buffer}, [decoded.data.buffer]);
  } catch (error) {
    self.postMessage({error: error.message || '사진을 변환하지 못했어요.'});
  } finally {
    images?.forEach(image => image.free());
    if (decoder?.decoder) libheif.heif_context_free(decoder.decoder);
  }
};
