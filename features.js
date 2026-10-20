'use strict';
(() => {
  const filters = [...document.querySelectorAll('[data-category]')];
  const stores = [...document.querySelectorAll('[data-store-category]')];
  filters.forEach(button => button.addEventListener('click', () => {
    filters.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    let count = 0;
    stores.forEach(store => {
      store.hidden = button.dataset.category !== 'all' && store.dataset.storeCategory !== button.dataset.category;
      if (!store.hidden) count++;
    });
    document.getElementById('filter-status').textContent = `${button.textContent} 예시 가게 ${count}곳`;
  }));
  const favorite = document.getElementById('favorite-demo');
  favorite.addEventListener('click', () => {
    const saved = favorite.getAttribute('aria-pressed') !== 'true';
    favorite.setAttribute('aria-pressed', String(saved));
    favorite.querySelector('.saved-heart').textContent = saved ? '♥' : '♡';
    favorite.querySelector('b').textContent = saved ? '나만의 가게 저장' : '저장 전 일반 핀';
    const pin = document.getElementById('favorite-preview-pin'); pin.classList.toggle('not-saved', !saved);
    pin.querySelector('img').alt = saved ? '저장한 가게 핀' : '';
  });
  const scopeButtons = [...document.querySelectorAll('[data-scope]')];
  const posts = [...document.querySelectorAll('[data-post-scope]')];
  scopeButtons.forEach(button => button.addEventListener('click', () => {
    scopeButtons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    let count = 0;
    posts.forEach(post => { post.hidden = button.dataset.scope !== 'all' && post.dataset.postScope !== button.dataset.scope; if (!post.hidden) count++; });
    document.getElementById('scope-status').textContent = `${button.textContent} 예시 게시글 ${count}개`;
  }));
  const stories = [
    {overline:'A LITTLE COFFEE BREAK',title:'공강의 여유는\n커피 한 잔만큼.',tag:'⌖ 나만의 아지트 · 예시 가게',image:'cafe',alt:'카페 픽토그램'},
    {overline:'A TASTE WORTH SHARING',title:'같이 먹어서\n더 맛있는 한 끼.',tag:'⌖ 오늘의 파스타 · 예시 가게',image:'pasta',alt:'파스타 픽토그램'},
    {overline:'MY EVERYDAY MOMENT',title:'든든하게,\n오늘도 시작.',tag:'⌖ 든든한 한 끼 · 예시 가게',image:'rice',alt:'한식 픽토그램'}
  ];
  let storyIndex = 0;
  function showStory(index) {
    storyIndex = (index + stories.length) % stories.length;
    const story = stories[storyIndex];
    document.getElementById('story-player').dataset.story = String(storyIndex);
    document.getElementById('story-overline').textContent = story.overline;
    document.getElementById('story-title').textContent = story.title;
    document.getElementById('story-tag').textContent = story.tag;
    document.getElementById('story-count').textContent = `${storyIndex + 1} / ${stories.length}`;
    document.querySelector('.story-drawing .coffee-art').hidden = storyIndex !== 0;
    const image = document.getElementById('story-food-image'); image.src = `assets/${story.image}.png`; image.alt = story.alt; image.hidden = storyIndex === 0;
    document.querySelectorAll('.story-timeline span').forEach((element, i) => element.classList.toggle('is-current', i === storyIndex));
  }
  document.getElementById('story-prev').addEventListener('click', () => showStory(storyIndex - 1));
  document.getElementById('story-next').addEventListener('click', () => showStory(storyIndex + 1));
  const steps = [
    {title:'내 이야기를 들려주세요.',description:'가입 정보와 소개를 바탕으로 프로필을 준비해요. 학과·학부는 공개 여부를 선택할 수 있어요.',chips:['나의 소개','학과 공개 선택'],next:'다음: 취향 선택',art:'profile'},
    {title:'가고 싶은 곳을 골라요.',description:'최대 10곳의 가게와 만날 학교 범위를 선택해요. 공통으로 가고 싶은 가게가 있는 상대를 찾아요.',chips:['최대 10곳','우리 학교 또는 학교 선택'],next:'다음: 신청과 수락',art:'food'},
    {title:'같은 취향에 인사를 건네요.',description:'공통 가게를 확인하고 포인트로 신청해요. 상대방도 수락하면 두 사람의 대화가 시작돼요.',chips:['공통 가게 확인','상호 수락'],next:'다음: 대화와 약속',art:'accept'},
    {title:'대화하고, 만나고, 마무리까지.',description:'대화를 나누며 장소와 시간을 정해요. 만남 후에는 완료할 수 있고, 원하지 않으면 취소할 수 있어요.',chips:['대화·약속','완료 또는 취소'],next:'처음부터 다시 보기',art:'chat'}
  ];
  const stepTabs = [...document.querySelectorAll('[data-step]')];
  let stepIndex = 0;
  function makeNode(tag, className, text) { const node = document.createElement(tag); node.className = className; if (text) node.textContent = text; return node; }
  function showStep(index, focus = false) {
    stepIndex = (index + steps.length) % steps.length;
    const step = steps[stepIndex];
    stepTabs.forEach((tab, i) => { tab.setAttribute('aria-selected',String(i === stepIndex)); tab.tabIndex = i === stepIndex ? 0 : -1; tab.classList.toggle('is-complete',i < stepIndex); });
    document.getElementById('journey-panel').setAttribute('aria-labelledby',stepTabs[stepIndex].id);
    document.getElementById('journey-kicker').textContent = `STEP 0${stepIndex + 1}`;
    document.getElementById('journey-title').textContent = step.title;
    document.getElementById('journey-description').textContent = step.description;
    document.getElementById('journey-chips').replaceChildren(...step.chips.map(text => makeNode('span','',text)));
    const next = document.getElementById('journey-next'); next.firstChild.textContent = step.next + ' ';
    const art = document.getElementById('journey-illustration'); art.replaceChildren();
    if (step.art === 'profile') art.append(makeNode('span','journey-avatar','☺'));
    if (step.art === 'food') ['cafe','pasta','rice'].forEach((name, i) => { const image = makeNode('img',''); image.src = `assets/${name}.png`; image.alt = ['카페','양식','한식'][i]; art.append(image); });
    if (step.art === 'accept') art.append(makeNode('span','journey-check','✓'));
    if (step.art === 'chat') art.append(makeNode('span','journey-chat','그곳에서 만날까요?'),makeNode('span','journey-chat','좋아요, 함께해요!'));
    if (focus) stepTabs[stepIndex].focus();
  }
  stepTabs.forEach((tab,i) => {
    tab.addEventListener('click',()=>showStep(i));
    tab.addEventListener('keydown',event => {
      let target;
      if (event.key === 'ArrowRight') target = i+1;
      if (event.key === 'ArrowLeft') target = i-1;
      if (event.key === 'Home') target = 0;
      if (event.key === 'End') target = steps.length-1;
      if (target !== undefined) {event.preventDefault(); showStep(target,true);}
    });
  });
  document.getElementById('journey-next').addEventListener('click',()=>showStep(stepIndex+1));
})();
