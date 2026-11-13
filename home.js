'use strict';
(() => {
  const config = window.DG_PUBLIC_FEED;
  const boards = {free:'자유',info:'정보',food:'맛집',promo:'홍보'};
  const element = (tag, cls, text) => {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text !== undefined) node.textContent = text;
    return node;
  };
  function link(action, id) {
    const query = new URLSearchParams({action, v:window.DG_WEB_REVISION || ''});
    if (id) query.set('id', id);
    return 'web/?' + query;
  }
  async function read(path, body) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 12000);
    try {
      const response = await fetch(config.url + '/rest/v1/' + path, {
        method: body ? 'POST' : 'GET', signal:controller.signal,
        headers:{apikey:config.key,Authorization:'Bearer '+config.key,'Content-Type':'application/json'},
        ...(body ? {body:JSON.stringify(body)} : {})
      });
      if (!response.ok) throw new Error('Feed unavailable');
      const data = await response.json();
      if (!Array.isArray(data)) throw new Error('Unexpected feed');
      return data;
    } finally { clearTimeout(timer); }
  }
  function card(row, review) {
    const node = element('a','feed-card');
    node.href = link(review ? 'read-review' : 'read-post', review ? row.store_id : row.id);
    const meta = element('div','feed-meta');
    const stars = Number(row.rating);
    meta.append(element('span','',review ? '★ '+(Number.isFinite(stars) ? stars.toFixed(1) : '—')+' · '+(row.user_name || '회원') : boards[row.board] || '게시판'));
    const date = new Date(row.created_at);
    meta.append(element('time','',isNaN(date.getTime()) ? '' : date.toLocaleDateString('ko-KR',{month:'long',day:'numeric'})));
    node.append(meta,element('h3','',review ? row.store_name || row.stores?.name || '가게 리뷰' : row.title),element('p','',review ? row.comment : row.content));
    const reactions = element('div','feed-reactions');
    const count = value => Number.isFinite(Number(value)) ? Math.max(0, Number(value)) : 0;
    reactions.append(element('span','', '♡ '+ count(review ? row.helpful_count : row.like_count)),element('span','','댓글 '+count(row.comment_count)));
    node.append(reactions);
    return node;
  }
  async function load(kind) {
    const area = document.getElementById(kind+'-feed');
    area.setAttribute('aria-busy','true');
    try {
      const review = kind === 'reviews';
      const rows = review
        ? await read('rpc/dg_home_feed_reviews',{target_university:'한양대학교 ERICA',feed_sort:'latest',page_limit:2})
        : await read('dg_bulletin_posts?'+new URLSearchParams({select:'id,title,content,board,created_at,like_count,comment_count',board:'in.(free,info,food,promo)',created_at:'lte.'+new Date().toISOString(),order:'created_at.desc,id.desc',limit:'2'}));
      // An anonymous request deliberately never exposes university/department boards.
      const visible = rows.filter(row => review || Object.hasOwn(boards,row.board));
      area.replaceChildren(...visible.map(row => card(row,review)));
      if (!visible.length) area.append(element('p','feed-state','아직 작성된 글이 없어요. 첫 이야기를 남겨보세요.'));
    } catch (_) {
      const message = element('p','feed-state','새로운 이야기를 불러오지 못했어요. ');
      const retry = element('button','','다시 시도'); retry.type='button'; retry.addEventListener('click',()=>load(kind));
      message.append(retry); area.replaceChildren(message);
    } finally { area.setAttribute('aria-busy','false'); }
  }
  document.getElementById('year').textContent = new Date().getFullYear();
  load('reviews'); load('posts');
  // Returning from the web editor also updates this landing page's public feed.
  window.addEventListener('pageshow', event => { if(event.persisted){load('reviews');load('posts');} });
})();
