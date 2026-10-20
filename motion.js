'use strict';
(() => {
  const root = document.documentElement;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let manualOff = false;
  try { manualOff = sessionStorage.getItem('daesullaeng-motion-off') === 'true'; } catch {}
  let observer;
  const buttons = [...document.querySelectorAll('.motion-toggle')];
  function syncMotion() {
    const off = reduced.matches || manualOff;
    root.classList.toggle('motion-off', off);
    observer?.disconnect();
    const elements = [...document.querySelectorAll('[data-reveal]')];
    if (!off && 'IntersectionObserver' in window) {
      root.classList.add('motion-ready');
      observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
        });
      }, {rootMargin: '0px 0px -25px 0px', threshold: 0.06});
      elements.forEach(element => {
        const rect = element.getBoundingClientRect();
        if (rect.top < innerHeight && rect.bottom > 0) element.classList.add('is-visible');
        if (!element.classList.contains('is-visible')) observer.observe(element);
      });
    } else {
      root.classList.remove('motion-ready');
      elements.forEach(element => element.classList.add('is-visible'));
    }
    buttons.forEach(button => {
      button.setAttribute('aria-pressed', String(off));
      const label = reduced.matches ? '기기 설정으로 움직임 줄임' : off ? '애니메이션 켜기' : '애니메이션 끄기';
      button.setAttribute('aria-label', label);
      button.title = label;
      const text = button.querySelector('[data-motion-label]'); if (text) text.textContent = label;
      const symbol = button.querySelector('[aria-hidden]'); if (symbol) symbol.textContent = off ? '▷' : 'Ⅱ';
      button.disabled = reduced.matches;
    });
  }
  buttons.forEach(button => button.addEventListener('click', () => {
    manualOff = !manualOff;
    try { sessionStorage.setItem('daesullaeng-motion-off', String(manualOff)); } catch {}
    syncMotion();
  }));
  reduced.addEventListener?.('change', syncMotion);
  syncMotion();
  // All content stays visible when scripting or observers are unavailable.
  window.addEventListener('pageshow', syncMotion);
  const chapters = [...document.querySelectorAll('[data-chapter]')];
  const nav = [...document.querySelectorAll('[data-section-link]')];
  const progress = document.querySelector('.reading-progress');
  let scheduled = false;
  function updateChapter() {
    scheduled = false;
    const topOffset = (document.querySelector('.site-header')?.offsetHeight || 0) +
      (document.querySelector('.feature-wayfinder')?.offsetHeight || 0) + 80;
    let selected = chapters[0];
    chapters.forEach(chapter => { if (chapter.getBoundingClientRect().top <= topOffset) selected = chapter; });
    nav.forEach(link => {
      if (selected && link.dataset.sectionLink === selected.id) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
    if (progress) {
      const total = document.documentElement.scrollHeight - innerHeight;
      progress.style.transform = `scaleX(${total > 0 ? Math.min(1, Math.max(0, scrollY / total)) : 0})`;
    }
  }
  function queueUpdate() { if (!scheduled) { scheduled = true; requestAnimationFrame(updateChapter); } }
  if (chapters.length) {
    window.addEventListener('scroll', queueUpdate, {passive:true});
    window.addEventListener('resize', queueUpdate, {passive:true});
    updateChapter();
  }
})();
