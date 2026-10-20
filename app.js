'use strict';
const tabs = [...document.querySelectorAll('[role="tab"]')];
function activateTab(tab, focus = false) {
  tabs.forEach(item => {
    const active = item === tab;
    item.setAttribute('aria-selected', String(active));
    item.tabIndex = active ? 0 : -1;
    document.getElementById(item.getAttribute('aria-controls')).hidden = !active;
  });
  if (focus) tab.focus();
}
tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => activateTab(tab));
  tab.addEventListener('keydown', event => {
    let target;
    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') target = (index + 1) % tabs.length;
    if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') target = (index + tabs.length - 1) % tabs.length;
    if (event.key === 'Home') target = 0;
    if (event.key === 'End') target = tabs.length - 1;
    if (target !== undefined) { event.preventDefault(); activateTab(tabs[target], true); }
  });
});
const config = window.DAESULLAENG_CONFIG || {};
function safeHttps(value) {
  try { const url = new URL(value); return url.protocol === 'https:' ? url.href : null; } catch { return null; }
}
const downloadArea = document.getElementById('download-links');
[ ['appStoreUrl', 'App Store'], ['googlePlayUrl', 'Google Play'], ['serviceUrl', '웹에서 시작하기'] ].forEach(([key, label], index) => {
  const url = safeHttps(config[key]);
  if (!url) return;
  const link = document.createElement('a'); link.className = 'store-badge available';
  link.href = url; link.target = '_blank'; link.rel = 'noopener noreferrer';
  const caption = document.createElement('small'); caption.textContent = index < 2 ? '다운로드' : '대슐랭가이드';
  const title = document.createElement('b'); title.textContent = label + ' ↗';
  const inner = document.createElement('div'); inner.append(caption, title); link.append(inner);
  if (index < 2) downloadArea.children[index].replaceWith(link); else downloadArea.append(link);
});
if (config.launched && ['appStoreUrl', 'googlePlayUrl', 'serviceUrl'].some(key => safeHttps(config[key]))) {
  document.getElementById('launch-status').textContent = 'NOW OPEN';
  document.getElementById('launch-title').textContent = '이제, 학교 앞에서 만나요.';
  document.getElementById('launch-description').textContent = '대슐랭가이드에서 대학가의 새로운 즐거움을 만나보세요.';
  document.querySelector('.campus-label').lastChild.textContent = ' 정식 서비스 오픈';
}
document.getElementById('copy-link').addEventListener('click', async () => {
  const url = new URL(location.href); url.hash = 'launch'; url.search = '';
  const status = document.getElementById('copy-status');
  try {
    if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
    await navigator.clipboard.writeText(url.href);
    document.getElementById('copy-fallback').hidden = true;
    status.textContent = '링크를 복사했어요. 함께할 친구에게 공유해 보세요!';
  } catch {
    const fallback = document.getElementById('copy-fallback'); fallback.hidden = false;
    const input = fallback.querySelector('input'); input.value = url.href; input.focus(); input.select();
    status.textContent = '자동 복사가 지원되지 않아 주소를 표시했어요.';
  }
});
document.getElementById('year').textContent = new Date().getFullYear();
