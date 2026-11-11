/* DEMO 1 — KSHRD 37년 아카이브
   구조는 KIET 50주년 디지털역사관(main.js)의 Intro / History / HighlightSlider / Comment 모듈을 따랐고,
   시대 배경 전환만 class 토글 대신 three.js 셰이더(노이즈 디졸브 + 포인터 시차)로 바꿨다. */
(function () {
  'use strict';
  var K = window.KSHRD, d = document, root = d.documentElement, body = d.body;
  var $ = function (s, c) { return (c || d).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || d).querySelectorAll(s)); };
  var mqM = window.matchMedia('(max-width: 1024px)');
  var isM = mqM.matches;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var IMG = '../_assets/img/', SM = IMG + 'sm/';
  gsap.registerPlugin(ScrollTrigger);
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  window.scrollTo(0, 0);
  if (mqM.addEventListener) mqM.addEventListener('change', function () { location.reload(); });

  /* ================= 내용 채우기 (data.js) ================= */
  var SUBS = [
    ['학회소개', '회장 인사말', '학회연혁 및 역대회장', '학회정관', '임원명단', '오시는 길'],
    ['정기학술대회', '산업교육 현장포럼', '행사안내 및 접수'],
    ['발간취지', '원고작성 및 투고요령', '편집위원', '심사규정', '연구윤리'],
    ['공지사항', '갤러리', '알림마당'],
    ['학술지', '학술지 검색', '학술대회 자료집']
  ];
  var ERA_BG = ['era1_lamp', 'era2_sea', 'era3_horizon', 'era4_light'];
  var ERA_PH = [
    ['h1989_founding', 'h1997_conf', 'h1998_intl'],
    ['h2001_elearning', 'h2005_panel', 'h2009_group'],
    ['h2014_forum', 'h2017_tour', 'h2019_30th'],
    ['h2020_online', 'h2025_hybrid', 'h2026_poster']
  ];
  var ERA_EV = [[0, 1, 2], [0, 1, 3], [0, 2, 3], [0, 1, 3]];       // 사진에 붙일 events 순번
  var PH_POS = [['c', 'r', 'l'], ['l', 'c', 'r'], ['r', 'l', 'c'], ['c', 'r', 'l']];
  var THEME_IMG = ['p_auditorium', 'p_hall', 'p_workshop', 'p_students', 'p_library', 'p_question', 'p_whiteboard', 'p_network',
    'p_notes', 'p_panel_woman', 'p_center_dusk', 'p_stage', 'p_campus_aerial', 'p_duo', 'h2014_forum', 'h2019_30th', 'h2026_poster', 'h2005_panel'];
  var OLD_IMG = ['h1997_conf', 'h1998_intl', 'h1989_founding', 'h2001_elearning', 'h2005_panel', 'h2009_group'];

  (function build() {
    // 헤더 메뉴 : 링크 없이 이름 + hover
    $('#gnb').innerHTML = K.nav.map(function (n, i) { return '<li><button type="button" class="hd__m" data-i="' + i + '">' + n + '</button></li>'; }).join('');
    $('#gnbPanel').innerHTML = K.nav.map(function (n, i) {
      return '<div class="hd__col" data-i="' + i + '"><strong>' + n + '</strong><ul>' + SUBS[i].map(function (s) { return '<li>' + s + '</li>'; }).join('') + '</ul></div>';
    }).join('');

    // 4개 시대
    $('#eras').innerHTML = K.eras.map(function (e, i) {
      var light = i === 3;
      var figs = ERA_PH[i].map(function (name, j) {
        var ev = e.events[ERA_EV[i][j]];
        return '<figure class="ph ph--' + PH_POS[i][j] + '"><div class="ph__par"><div class="ph__in">' +
          '<img src="' + (isM ? SM : IMG) + name + '.jpg" alt="' + ev.t + '" loading="lazy" decoding="async" width="1024" height="688">' +
          '<figcaption><b>' + ev.y + '</b><span>' + ev.t + '</span></figcaption></div></div></figure>';
      }).join('');
      return '<article class="era era--' + (i % 2 ? 'even' : 'odd') + (light ? ' era--light' : '') + '" data-i="' + i + '">' +
        '<div class="era__txt">' +
        '<span class="era__k">KSHRD 37년<b>0' + (i + 1) + '</b></span>' +
        '<div class="era__badge"><i>' + (i + 1) + '</i><strong>' + e.tag + '</strong><em>' + e.from + ' — ' + e.to + '</em></div>' +
        '<h3><span class="ln"><span>' + e.title[0] + '</span></span><span class="ln"><span>' + e.title[1] + '</span></span></h3>' +
        '<p>' + e.desc + '</p></div>' +
        '<div class="era__imgs">' + figs + '</div></article>';
    }).join('');

    // 곡면 마퀴 카드 : 연도 + 주제
    $('#arcTrack').innerHTML = K.themes.map(function (t, i) {
      var old = t.y < 2000, mid = t.y < 2010;
      var img = mid ? OLD_IMG[i % OLD_IMG.length] : THEME_IMG[i % THEME_IMG.length];
      return '<div class="tc' + (old ? ' tc--old' : mid ? ' tc--mid' : '') + '"><div class="tc__in" data-bg="' + SM + img + '.jpg"><b>' + t.y + '</b><p>' + t.t + '</p></div></div>';
    }).join('');

    // 다음 행사 카드
    var nx = K.next;
    $('#nextKind').innerHTML = nx.kind.replace('산업교육 ', '산업교육<br>');
    $('#nextInfo').innerHTML = nx.date + ' ' + nx.dow + ' ' + nx.time + '<br>' + nx.place;

    // 질문 카드 벽
    var cols = isM ? 2 : 4, colHtml = [], HL = { 2020: 1, 2021: 1, 2023: 1 };
    for (var c = 0; c < cols; c++) colHtml.push('');
    K.themes.slice().reverse().forEach(function (t, i) {
      colHtml[i % cols] += '<div class="q' + (HL[t.y] ? ' q--hl' : '') + '"><p>' + t.t + '</p><footer><strong>' + t.y + '</strong><i></i>학술대회 주제</footer></div>';
    });
    $('#wall').innerHTML = colHtml.map(function (h) { return '<div class="wall__col">' + h + h + '</div>'; }).join('');

    // 푸터
    var o = K.org;
    $('#ftInfo').innerHTML = '<span><b>학회사무국</b>' + o.address + '</span><span><b>Tel.</b>' + o.tel + '</span><span><b>E-mail.</b>' + o.email + '</span><span><b>고유번호</b>' + o.regno + '</span>';
  })();

  /* ================= 스무스 스크롤 ================= */
  var lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    window.__lenis = lenis;
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
  }

  var hd = $('.hd'), core = $('#core'), logo = $('#coreLogo'), eraFace = $('#coreEra'), s1 = $('#s1'), s2 = $('#s2');
  gsap.set(logo, { xPercent: -50, yPercent: -50 });
  gsap.set(eraFace, { scale: .82 });

  /* ================= 인트로 (KIET Intro 모듈) ================= */
  var KEY = 'kshrd_demo1_intro';
  function heroIn(immediate) {
    var lines = $$('.s1 .ln > span'), years = $$('.s1__year span'), lead = $('.s1__lead'), sc = $('.s1__scroll');
    if (immediate) {
      gsap.set(lines, { yPercent: 0, y: 0 }); gsap.set([years, lead, sc], { autoAlpha: 1 });
      return;
    }
    gsap.fromTo(lines, { yPercent: 105, y: 0 }, { yPercent: 0, duration: 1.1, ease: 'power3.out', stagger: .1 });
    gsap.fromTo(years[0], { autoAlpha: 0, x: 40 }, { autoAlpha: 1, x: 0, duration: 1, ease: 'power2.out', delay: .35 });
    gsap.fromTo(years[1], { autoAlpha: 0, x: -40 }, { autoAlpha: 1, x: 0, duration: 1, ease: 'power2.out', delay: .35 });
    gsap.to([lead, sc], { autoAlpha: 1, duration: .9, delay: .8, stagger: .15 });
  }
  function introDone() {
    try { sessionStorage.setItem(KEY, '1'); } catch (e) {}
    gsap.set(core, { clearProps: 'zIndex' });
    body.classList.remove('is-loading'); body.classList.add('is-ready');
    root.classList.remove('lock');
    if (lenis) lenis.start();
    ScrollTrigger.refresh();
    GL.boot();
  }
  function runIntro() {
    var paths = $$('#coreMark .draw'), mark = $('#coreMark'), parts = [$('#coreAbbr'), $('#coreSince'), $('#coreNum')];
    var played = false;
    try { played = sessionStorage.getItem(KEY) === '1'; } catch (e) {}
    if (/[?&]nointro/.test(location.search) || reduce) played = true;
    paths.forEach(function (p) { var L = p.getTotalLength(); p.style.strokeDasharray = L; p.style.strokeDashoffset = played ? 0 : L; });
    if (played) { heroIn(true); introDone(); return; }

    root.classList.add('lock'); if (lenis) lenis.stop();
    var size = core.offsetWidth, cr = core.getBoundingClientRect();
    var offY = Math.abs(cr.top + cr.height / 2 - innerHeight / 2);
    var mr = mark.getBoundingClientRect();
    var dy = innerHeight / 2 - (mr.top + mr.height / 2);
    gsap.set(core, { zIndex: 300 });
    gsap.set(logo, { width: innerWidth + 4, height: innerHeight + offY * 2 + 4, borderRadius: 0 });
    // 로고가 화면을 덮은 상태에서 마크만 화면 한가운데 크게
    var mr2 = mark.getBoundingClientRect();
    dy = innerHeight / 2 - (mr2.top + mr2.height / 2);
    gsap.set(mark, { y: dy, scale: isM ? 2.2 : 3, transformOrigin: '50% 50%' });
    gsap.set(parts, { autoAlpha: 0, y: 14 });

    gsap.timeline({ onComplete: function () { gsap.set(logo, { clearProps: 'width,height,borderRadius' }); introDone(); } })
      .to(paths, { strokeDashoffset: 0, duration: 2.1, ease: 'power2.inOut', stagger: .2 }, .2)
      .to(logo, { width: size, height: size, borderRadius: size / 2, duration: 1.15, ease: 'power3.inOut' }, '+=.1')
      .to(mark, { y: 0, scale: 1, duration: 1.15, ease: 'power3.inOut' }, '<')
      .to(parts, { autoAlpha: 1, y: 0, duration: .6, ease: 'power2.out', stagger: .09 }, '-=.4')
      .add(function () { heroIn(false); }, '-=.55')
      .to({}, { duration: .5 });
  }

  /* ================= 헤더 ================= */
  (function header() {
    var ms = $$('.hd__m'), cols = $$('.hd__col');
    ms.forEach(function (m) {
      m.addEventListener('mouseenter', function () {
        hd.classList.add('hd--open');
        ms.forEach(function (x) { x.classList.toggle('on', x === m); });
        cols.forEach(function (c) { c.classList.toggle('on', c.dataset.i === m.dataset.i); });
      });
    });
    cols.forEach(function (c) {
      c.addEventListener('mouseenter', function () {
        cols.forEach(function (x) { x.classList.toggle('on', x === c); });
        ms.forEach(function (x) { x.classList.toggle('on', x.dataset.i === c.dataset.i); });
      });
    });
    hd.addEventListener('mouseleave', function () { hd.classList.remove('hd--open'); ms.forEach(function (x) { x.classList.remove('on'); }); });
    var onScroll = function () { hd.classList.toggle('hd--scrolled', window.scrollY > 24); };
    window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  })();
  var secs = $$('[data-theme]', $('main')), secOn = secs.map(function () { return false; }), curEra = -1;
  function headerTheme() {
    var th = 'light', inS2 = false;
    for (var i = 0; i < secs.length; i++) if (secOn[i]) { th = secs[i].dataset.theme; inS2 = secs[i] === s2; }
    if (inS2 && curEra === 3) th = 'light';
    hd.dataset.theme = th;
  }
  secs.forEach(function (sec, i) {
    ScrollTrigger.create({ trigger: sec, start: 'top 48px', end: 'bottom 48px', onToggle: function (self) { secOn[i] = self.isActive; headerTheme(); } });
  });
  secOn[0] = true;

  /* ================= 시대 배경 : three.js 셰이더 (실패·모바일은 CSS 페이드) ================= */
  var GL = (function () {
    var bg = $('#s2bg'), cv = $('#gl'), layers = $$('i', bg);
    var api = { ok: false, booted: false };
    var TONE = [[.2, 0], [.32, 0], [.34, 0], [0, .14]];   // [어둡게, 희게]
    var renderer, scene, cam, mat, U, texs = [], cbs = [], shown = 0, tw = null, running = false, rafId = 0;
    var mouse = { x: 0, y: 0, tx: 0, ty: 0 }, t0 = performance.now(), want = 0;

    function cssTo(i) {
      layers.forEach(function (l, k) {
        if (k === i && l.dataset.src) { l.style.backgroundImage = 'url(' + (isM ? l.dataset.src.replace('/img/', '/img/sm/') : l.dataset.src) + ')'; l.removeAttribute('data-src'); }
        l.classList.toggle('on', k === i);
      });
    }
    function load(i, cb) {
      if (i < 0 || i >= ERA_BG.length) return;
      if (texs[i] && texs[i].image) { cb && cb(); return; }
      if (cb) (cbs[i] = cbs[i] || []).push(cb);
      if (texs[i]) return;
      texs[i] = new THREE.TextureLoader().load(IMG + ERA_BG[i] + '.jpg', function (t) {
        t.minFilter = THREE.LinearFilter; t.magFilter = THREE.LinearFilter; t.generateMipmaps = false;
        (cbs[i] || []).forEach(function (f) { f(); }); cbs[i] = [];
      });
    }
    function resize() {
      if (!api.ok) return;
      var w = bg.clientWidth, h = bg.clientHeight;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
      renderer.setSize(w, h, false);
      U.uRes.value.set(w, h);
    }
    function frame() {
      rafId = requestAnimationFrame(frame);
      mouse.x += (mouse.tx - mouse.x) * .05; mouse.y += (mouse.ty - mouse.y) * .05;
      U.uMouse.value.set(mouse.x, mouse.y);
      U.uTime.value = (performance.now() - t0) / 1000;
      renderer.render(scene, cam);
    }
    api.run = function (on) {
      if (!api.ok || on === running) return;
      running = on;
      if (on) frame(); else cancelAnimationFrame(rafId);
    };
    api.to = function (i) {
      want = i;
      if (!api.ok) { cssTo(i); return; }
      load(i, function () {
        if (want !== i) return;
        if (tw) { tw.kill(); tw = null; if (U.uMix.value > .5) { U.uA.value = U.uB.value; U.uToneA.value.copy(U.uToneB.value); shown = U._inc; } U.uMix.value = 0; }
        if (i === shown) return;
        U.uB.value = texs[i]; U.uToneB.value.set(TONE[i][0], TONE[i][1]); U._inc = i; U.uMix.value = 0;
        tw = gsap.to(U.uMix, { value: 1, duration: 1.7, ease: 'power2.inOut', onComplete: function () {
          U.uA.value = texs[i]; U.uToneA.value.set(TONE[i][0], TONE[i][1]); U.uMix.value = 0; shown = i; tw = null;
        } });
      });
      load(i + 1); load(i - 1);
    };
    api.boot = function () {
      if (api.booted) return; api.booted = true;
      if (isM || reduce || !window.THREE) return;
      try {
        renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: false, alpha: false, powerPreference: 'high-performance' });
      } catch (e) { return; }
      if (!renderer || !renderer.getContext()) return;
      scene = new THREE.Scene(); cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
      U = {
        uA: { value: null }, uB: { value: null }, uMix: { value: 0 }, uTime: { value: 0 },
        uMouse: { value: new THREE.Vector2() }, uRes: { value: new THREE.Vector2(1, 1) }, uAsp: { value: 2688 / 1520 },
        uToneA: { value: new THREE.Vector2(TONE[0][0], TONE[0][1]) }, uToneB: { value: new THREE.Vector2(TONE[0][0], TONE[0][1]) }
      };
      mat = new THREE.ShaderMaterial({
        uniforms: U, depthTest: false, depthWrite: false,
        vertexShader: 'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}',
        fragmentShader: [
          'precision highp float;',
          'uniform sampler2D uA;uniform sampler2D uB;uniform float uMix;uniform float uTime;uniform vec2 uMouse;uniform vec2 uRes;uniform float uAsp;uniform vec2 uToneA;uniform vec2 uToneB;',
          'varying vec2 vUv;',
          'vec3 m289(vec3 x){return x-floor(x*(1./289.))*289.;}vec2 m289(vec2 x){return x-floor(x*(1./289.))*289.;}vec3 perm(vec3 x){return m289(((x*34.)+1.)*x);}',
          'float sn(vec2 v){const vec4 C=vec4(.211324865405187,.366025403784439,-.577350269189626,.024390243902439);',
          ' vec2 i=floor(v+dot(v,C.yy));vec2 x0=v-i+dot(i,C.xx);vec2 i1=(x0.x>x0.y)?vec2(1.,0.):vec2(0.,1.);vec4 x12=x0.xyxy+C.xxzz;x12.xy-=i1;',
          ' i=m289(i);vec3 p=perm(perm(i.y+vec3(0.,i1.y,1.))+i.x+vec3(0.,i1.x,1.));',
          ' vec3 m=max(.5-vec3(dot(x0,x0),dot(x12.xy,x12.xy),dot(x12.zw,x12.zw)),0.);m=m*m;m=m*m;',
          ' vec3 x=2.*fract(p*C.www)-1.;vec3 h=abs(x)-.5;vec3 ox=floor(x+.5);vec3 a0=x-ox;m*=1.79284291400159-.85373472095314*(a0*a0+h*h);',
          ' vec3 g;g.x=a0.x*x0.x+h.x*x0.y;g.yz=a0.yz*x12.xz+h.yz*x12.yw;return 130.*dot(m,g);}',
          'float fbm(vec2 p){float a=.5;float s=0.;for(int i=0;i<4;i++){s+=a*sn(p);p*=2.03;a*=.5;}return s;}',
          'vec2 cov(vec2 uv){float ra=uRes.x/uRes.y;vec2 s=ra>uAsp?vec2(1.,uAsp/ra):vec2(ra/uAsp,1.);return (uv-.5)*s*.92+.5;}',
          'void main(){',
          ' vec2 uv=vUv;float ra=uRes.x/uRes.y;vec2 p=vec2(uv.x*ra,uv.y);',
          ' float n=clamp(fbm(p*1.5+vec2(uTime*.018,-uTime*.012))*.55+.5,0.,1.);',
          ' vec2 flow=vec2(sn(p*2.2+vec2(0.,uTime*.05)),sn(p*2.2+vec2(uTime*.045,9.3)))*.004;',
          ' vec2 mp=uMouse*.5+.5;vec2 dm=vec2((uv.x-mp.x)*ra,uv.y-mp.y);float lens=smoothstep(.6,0.,length(dm));',
          ' vec2 par=-uMouse*(.009+.013*n)+dm*lens*.02;',                         // 포인터 시차(노이즈를 깊이로) + 볼록 렌즈
          ' float rv=smoothstep(n-.2,n+.2,uMix*1.4-.2);',                          // 노이즈 문턱 디졸브
          ' vec2 dv=vec2(n-.5,fbm(p*1.5+11.3)*.5)*.13;',
          ' vec3 a=texture2D(uA,cov(uv)+flow+par+dv*rv).rgb;',
          ' vec3 b=texture2D(uB,cov(uv)+flow+par-dv*(1.-rv)).rgb;',
          ' a=mix(a*(1.-uToneA.x),vec3(1.),uToneA.y);b=mix(b*(1.-uToneB.x),vec3(1.),uToneB.y);',
          ' vec3 c=mix(a,b,rv);c+=rv*(1.-rv)*.42;',                                // 전환 경계의 빛
          ' float vg=smoothstep(1.2,.3,length((uv-.5)*vec2(1.05,1.3)));c*=mix(.86,1.,vg);',
          ' float g=fract(sin(dot(gl_FragCoord.xy+fract(uTime)*61.,vec2(12.9898,78.233)))*43758.5453);c+=(g-.5)*.022;',
          ' gl_FragColor=vec4(c,1.);}'
        ].join('\n')
      });
      scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat));
      api.ok = true;
      load(0, function () {
        U.uA.value = texs[0]; U.uB.value = texs[0];
        resize(); renderer.render(scene, cam);
        root.classList.add('gl-on');
        if (curEra > 0) api.to(curEra);
        if (ScrollTrigger.isInViewport(s2)) api.run(true);
      });
      load(1);
      window.addEventListener('resize', resize);
      window.addEventListener('mousemove', function (e) { mouse.tx = e.clientX / innerWidth * 2 - 1; mouse.ty = -(e.clientY / innerHeight * 2 - 1); }, { passive: true });
      cv.addEventListener('webglcontextlost', function (e) { e.preventDefault(); api.run(false); api.ok = false; root.classList.remove('gl-on'); cssTo(Math.max(curEra, 0)); });
    };
    return api;
  })();

  /* ================= 2. 37년 ================= */
  var eraEls = $$('.era'), coreTxt = $('#coreEraTxt'), prog = $('#coreProg'), needle = $('#coreNeedle'), pill = $('#s2pill');
  function setEra(i) {
    if (i === curEra) return;
    var first = curEra < 0; curEra = i;
    var e = K.eras[i];
    body.classList.toggle('era-light', i === 3);
    s2.classList.toggle('is-light', i === 3);
    var put = function () { coreTxt.children[0].textContent = e.tag; coreTxt.children[1].textContent = e.from; coreTxt.children[2].textContent = e.to; };
    if (first || reduce) put();
    else gsap.timeline().to(coreTxt, { autoAlpha: 0, y: -10, duration: .22, ease: 'power1.in' }).add(put).fromTo(coreTxt, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: .45, ease: 'power2.out' });
    GL.to(i);
    headerTheme();
  }
  setEra(0);

  // 엠블럼 : 로고 ↔ 시대 나침반
  function face(era) {
    core.classList.toggle('core--era', era);
    gsap.to(logo, { autoAlpha: era ? 0 : 1, scale: era ? .82 : 1, duration: .55, ease: 'power2.out', overwrite: 'auto' });
    gsap.to(eraFace, { autoAlpha: era ? 1 : 0, scale: era ? 1 : .82, duration: .55, ease: 'power2.out', overwrite: 'auto' });
  }
  if (isM) {
    ScrollTrigger.create({ trigger: s2, start: 'top 82%', onEnter: function () { core.classList.add('is-out'); }, onLeaveBack: function () { core.classList.remove('is-out'); } });
  } else {
    ScrollTrigger.create({ trigger: s2, start: 'top 60%', onEnter: function () { face(true); }, onLeaveBack: function () { face(false); } });
    ScrollTrigger.create({
      trigger: eraEls[0], start: 'top top', endTrigger: eraEls[eraEls.length - 1], end: 'bottom bottom',
      onUpdate: function (st) { gsap.set(needle, { rotation: st.progress * 360 }); prog.style.strokeDashoffset = 923.6 * (1 - st.progress); }
    });
    ScrollTrigger.create({ trigger: eraEls[0], start: 'top 40%', endTrigger: eraEls[eraEls.length - 1], end: 'bottom 88%', toggleClass: { targets: pill, className: 'on' } });
  }
  ScrollTrigger.create({ trigger: s2, start: 'top bottom', end: 'bottom top', onToggle: function (self) { GL.run(self.isActive); } });

  // 히어로가 물러날 때
  if (!reduce) {
    gsap.to('.s1__bg', { yPercent: 5, ease: 'none', scrollTrigger: { trigger: s1, start: 'top top', end: 'bottom top', scrub: true } });
    if (!isM) {
      gsap.to('.s1__left', { x: -90, autoAlpha: 0, ease: 'none', scrollTrigger: { trigger: s1, start: '8% top', end: '70% top', scrub: true } });
      gsap.to('.s1__right', { x: 90, autoAlpha: 0, ease: 'none', scrollTrigger: { trigger: s1, start: '8% top', end: '70% top', scrub: true } });
      gsap.to('.s1__year', { autoAlpha: 0, ease: 'none', scrollTrigger: { trigger: s1, start: '8% top', end: '55% top', scrub: true } });
    }
  }

  eraEls.forEach(function (el, i) {
    ScrollTrigger.create({ trigger: el, start: 'top 55%', end: 'bottom 55%', onEnter: function () { setEra(i); }, onEnterBack: function () { setEra(i); } });
    var txt = $('.era__txt', el), figs = $$('.ph', el);
    if (reduce) { gsap.set($$('.ln > span', el), { yPercent: 0, y: 0 }); return; }
    // 제목·설명 : KIET initTitleAnimation (play none none reverse)
    gsap.timeline({ scrollTrigger: { trigger: el, start: isM ? 'top 78%' : 'top 56%', toggleActions: isM ? 'play none none none' : 'play none none reverse' } })
      .fromTo([$('.era__k', txt), $('.era__badge', txt)], { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: .6, ease: 'power2.out' }, 0)
      .fromTo($$('.ln > span', txt), { yPercent: 105, y: 0 }, { yPercent: 0, duration: 1.05, ease: 'power3.out', stagger: .12 }, .05)
      .fromTo($('p', txt), { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: .9, ease: 'power2.out' }, .35);
    // 사진 : KIET initImageAnimations + 시차
    figs.forEach(function (f, j) {
      gsap.fromTo(f, { scale: .9, autoAlpha: 0, y: 60 }, { scale: 1, autoAlpha: 1, y: 0, duration: .7, ease: 'power2.out', scrollTrigger: { trigger: f, start: 'top 90%', toggleActions: isM ? 'play none none none' : 'play none none reverse' } });
      if (!isM) {
        var sp = [14, 26, 8][j];
        gsap.fromTo($('.ph__par', f), { yPercent: sp }, { yPercent: -sp, ease: 'none', scrollTrigger: { trigger: f, start: 'top bottom', end: 'bottom top', scrub: true } });
      }
      if (canHover && !isM) {
        var inner = $('.ph__in', f);
        f.addEventListener('mousemove', function (e) {
          var r = inner.getBoundingClientRect(), px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
          gsap.to(inner, { rotationY: (px - .5) * 14, rotationX: (.5 - py) * 11, duration: .5, ease: 'power2.out', overwrite: 'auto' });
          inner.style.setProperty('--gx', (px * 100) + '%'); inner.style.setProperty('--gy', (py * 100) + '%');
        });
        f.addEventListener('mouseleave', function () { gsap.to(inner, { rotationY: 0, rotationX: 0, duration: .9, ease: 'elastic.out(1,.6)', overwrite: 'auto' }); });
      }
    });
  });

  /* ================= 3. 곡면 마퀴 (KIET HighlightSlider : 42px/s 무한 루프 + 3D 아치·스크롤 속도·드래그) ================= */
  (function arc() {
    var el = $('#arc'), items = $$('.tc', el), n = items.length;
    var em = 10, step = 0, total = 0, half = 1, x = 0, dragV = 0, sv = 0, lastY = window.scrollY, visible = false, dragging = false, lastPX = 0, bgDone = false;
    function measure() { em = parseFloat(getComputedStyle(el).fontSize); step = (26 + 3.4) * em; total = step * n; half = el.offsetWidth / 2; }
    function render() {
      for (var i = 0; i < n; i++) {
        var px = (i * step + x) % total; if (px < 0) px += total; if (px > total / 2) px -= total;
        var nn = px / half, it = items[i];
        if (nn > 1.45 || nn < -1.45) { if (it._v !== 0) { it.style.visibility = 'hidden'; it._v = 0; } continue; }
        if (it._v !== 1) { it.style.visibility = 'visible'; it._v = 1; }
        it.style.transform = 'translate3d(' + (px * (1 - .1 * nn * nn)).toFixed(1) + 'px,0,' + (nn * nn * em * 27).toFixed(1) + 'px) rotateY(' + (-nn * 40).toFixed(2) + 'deg)';
      }
    }
    function tick(time, dt) {
      var s = Math.min(dt, 60) / 1000, y = window.scrollY;
      sv += ((y - lastY) / (s || .016) - sv) * .12; lastY = y;
      if (!visible) return;
      if (!dragging) {
        var boost = Math.max(-1100, Math.min(1100, sv * .32));
        x += (-(reduce ? 0 : 42) - boost + dragV) * s;
        dragV *= Math.pow(.94, dt / 16.7);
      }
      render();
    }
    function loadBg() { if (bgDone) return; bgDone = true; $$('.tc__in', el).forEach(function (t) { t.style.backgroundImage = 'url(' + t.dataset.bg + ')'; }); }
    measure(); x = -step * 2; render();
    window.addEventListener('resize', measure);
    ScrollTrigger.create({ trigger: el, start: 'top 220%', once: true, onEnter: loadBg });
    ScrollTrigger.create({ trigger: el, start: 'top bottom', end: 'bottom top', onToggle: function (self) { visible = self.isActive; if (visible) { loadBg(); measure(); } } });
    gsap.ticker.add(tick);
    el.addEventListener('pointerdown', function (e) { dragging = true; lastPX = e.clientX; dragV = 0; el.classList.add('is-drag'); try { el.setPointerCapture(e.pointerId); } catch (_) {} });
    el.addEventListener('pointermove', function (e) { if (!dragging) return; var dx = e.clientX - lastPX; lastPX = e.clientX; x += dx; dragV = dragV * .6 + dx * 60 * .4; });
    var up = function () { if (!dragging) return; dragging = false; el.classList.remove('is-drag'); };
    el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up); el.addEventListener('lostpointercapture', up);
  })();

  /* ================= 4. 질문 카드 벽 : 세로 마퀴, hover 시 멈춤 ================= */
  (function wall() {
    var wallEl = $('#wall'), cols = $$('.wall__col', wallEl), tws = [];
    if (reduce) return;
    cols.forEach(function (c, i) {
      var up = i % 2 === 0;
      tws.push(gsap.fromTo(c, { yPercent: up ? 0 : -50 }, { yPercent: up ? -50 : 0, duration: 70 + i * 9, ease: 'none', repeat: -1, paused: true }));
    });
    var slow = function (v) { tws.forEach(function (t) { gsap.to(t, { timeScale: v, duration: .6, overwrite: true }); }); };
    ScrollTrigger.create({ trigger: wallEl, start: 'top bottom', end: 'bottom top', onToggle: function (self) { tws.forEach(function (t) { self.isActive ? t.play() : t.pause(); }); } });
    if (canHover) { wallEl.addEventListener('mouseenter', function () { slow(0); }); wallEl.addEventListener('mouseleave', function () { slow(1); }); }
  })();

  /* ================= 등장 · 숫자 · 기타 ================= */
  if (!reduce) {
    $$('.tit, .tit2').forEach(function (t) {
      gsap.fromTo(t.children, { autoAlpha: 0, y: 44 }, { autoAlpha: 1, y: 0, duration: .95, ease: 'power3.out', stagger: .1, scrollTrigger: { trigger: t, start: 'top 84%' } });
    });
    gsap.fromTo('.card', { autoAlpha: 0, y: 70 }, { autoAlpha: 1, y: 0, duration: .9, ease: 'power3.out', stagger: .1, clearProps: 'transform', scrollTrigger: { trigger: '.cards', start: 'top 84%' } });
    gsap.fromTo('#arc', { autoAlpha: 0, y: 60 }, { autoAlpha: 1, y: 0, duration: 1.1, ease: 'power3.out', scrollTrigger: { trigger: '#arc', start: 'top 88%' } });
    gsap.fromTo('#wall', { autoAlpha: 0, y: 50 }, { autoAlpha: 1, y: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: '#wall', start: 'top 88%' } });
  }
  (function count() {
    var big = $('.card__big'); if (!big || reduce) return;
    var o = { v: 0 }, to = +big.dataset.count;
    big.firstChild.nodeValue = '0';
    ScrollTrigger.create({ trigger: big, start: 'top 92%', once: true, onEnter: function () { gsap.to(o, { v: to, duration: 1.6, ease: 'power2.out', onUpdate: function () { big.firstChild.nodeValue = Math.round(o.v); } }); } });
  })();
  $('#toTop').addEventListener('click', function () { if (lenis) lenis.scrollTo(0, { duration: 1.6 }); else window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); });

  runIntro();

  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(function () { ScrollTrigger.refresh(); });
})();
