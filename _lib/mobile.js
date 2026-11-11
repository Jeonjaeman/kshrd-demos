/* 공통 모바일 처리 : 화면폭별 영상 분기 + 모바일 전체화면 메뉴
   - <video data-src data-src-m data-poster data-poster-m> : 767px 이하에서 세로(9:16) 경량 영상으로 교체
   - <button data-mmenu> : 탭하면 전체화면 메뉴. data-mmenu 에 JSON 을 넣으면 그 메뉴를, 비우면 기본 메뉴를 쓴다
   - 색은 각 데모 :root 의 --mm-bg / --mm-fg / --mm-accent / --mm-line 으로 정한다 */
(function () {
  var isM = window.matchMedia('(max-width: 767px)').matches;
  document.documentElement.classList.toggle('is-m', isM);

  // 모바일에서 강제 줄바꿈을 공백으로 바꿀 요소 : <html data-m-nobr="선택자"> (CSS 로 br 을 숨기면 앞뒤 단어가 붙는다)
  var nobr = document.documentElement.getAttribute('data-m-nobr');
  if (isM && nobr) document.querySelectorAll(nobr).forEach(function (el) { el.innerHTML = el.innerHTML.replace(/\s*<br\s*\/?>\s*/gi, ' '); });

  document.querySelectorAll('video[data-src]').forEach(function (v) {
    var poster = isM && v.dataset.posterM ? v.dataset.posterM : v.dataset.poster;
    if (poster) v.poster = poster;
    v.muted = true;
    v.src = isM && v.dataset.srcM ? v.dataset.srcM : v.dataset.src;
    if (v.autoplay) { var p = v.play(); if (p && p.catch) p.catch(function () {}); }
  });

  var DEFAULT_MENU = [
    ['학회소개', ['학회소개', '회장 인사말', '학회연혁 및 역대회장', '학회정관', '임원명단', '오시는 길']],
    ['학술행사', ['정기학술대회', '산업교육 현장포럼', '행사안내 및 접수']],
    ['학술지', ['발간취지', '원고작성 및 투고요령', '편집위원', '심사규정', '연구윤리']],
    ['학회소식', ['공지사항', '갤러리', '알림마당']],
    ['자료실', ['학술지', '학술지 검색', '학술대회 자료집']]
  ];


  var btns = document.querySelectorAll('[data-mmenu]');
  if (!btns.length) return;
  var menu = DEFAULT_MENU;
  try { if (btns[0].dataset.mmenu) menu = JSON.parse(btns[0].dataset.mmenu); } catch (e) {}

  var logo = btns[0].dataset.mmenuLogo || '../_assets/brand/emblem.svg';
  var mm = document.createElement('div');
  mm.className = 'mm';
  mm.setAttribute('aria-hidden', 'true');
  mm.innerHTML =
    '<div class="mm__top"><span class="mm__brand"><img src="' + logo + '" alt="">한국산업교육학회</span>' +
    '<button class="mm__close" aria-label="메뉴 닫기"><i></i><i></i></button></div>' +
    '<nav class="mm__nav">' + menu.map(function (m, i) {
      return '<div class="mm__item" style="--i:' + i + '"><button class="mm__t"><span>' + m[0] + '</span><i></i></button>' +
        '<ul class="mm__sub">' + (m[1] || []).map(function (s) { return '<li>' + s + '</li>'; }).join('') + '</ul></div>';
    }).join('') + '</nav>' +
    '<div class="mm__cta"><a>로그인</a><a class="on">입회안내</a></div>' +
    '<p class="mm__foot">한국산업교육학회 사무국<br>010-3631-3100 · 서울 서대문구 신촌로 25, 2층 2535호</p>';
  document.body.appendChild(mm);

  function setOpen(open) {
    mm.classList.toggle('open', open);
    mm.setAttribute('aria-hidden', open ? 'false' : 'true');
    document.documentElement.classList.toggle('mm-open', open);
    if (window.__lenis) { open ? window.__lenis.stop() : window.__lenis.start(); }
  }
  btns.forEach(function (b) { b.addEventListener('click', function () { setOpen(true); }); });
  mm.querySelector('.mm__close').addEventListener('click', function () { setOpen(false); });
  mm.querySelectorAll('.mm__t').forEach(function (t) {
    t.addEventListener('click', function () {
      var item = t.parentElement, wasOpen = item.classList.contains('on');
      mm.querySelectorAll('.mm__item').forEach(function (x) { x.classList.remove('on'); });
      if (!wasOpen) item.classList.add('on');
    });
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setOpen(false); });
})();
