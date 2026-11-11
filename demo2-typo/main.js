/* DEMO 2 — 타이포 중심. GSAP ScrollTrigger + Lenis + three.js(r128). 문구·목록은 ../_lib/data.js (window.KSHRD) */
(function () {
  'use strict';
  var K = window.KSHRD || {};
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var html = document.documentElement;
  var isM = window.matchMedia('(max-width: 767px)').matches;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var IMG = '../_assets/img/sm/';
  var pad = function (n) { return String(n).padStart(2, '0'); };
  var clamp = function (a, b, v) { return Math.max(a, Math.min(b, v)); };
  var get = function (path) { return path.split('.').reduce(function (o, k) { return o == null ? o : o[k]; }, K); };
  var lenis = null;

  /* 데모용 휘장 (영문명 링 + since 1989 + 세 줄기 곡선) */
  var EMB = '<svg viewBox="0 0 200 200" fill="none" aria-hidden="true"><defs><path id="embT" d="M100,178 a78,78 0 1,1 .01,0"/><path id="embB" d="M16,100 a84,84 0 0,0 168,0"/></defs>' +
    '<circle cx="100" cy="100" r="97" stroke="currentColor" stroke-width="1.8"/><circle cx="100" cy="100" r="62" stroke="currentColor" stroke-width="1.8"/>' +
    '<text font-family="Barlow Condensed,Arial Narrow,Arial,sans-serif" font-size="11.4" font-weight="600" letter-spacing="2.1" fill="currentColor"><textPath href="#embT" startOffset="50%" text-anchor="middle">THE KOREAN SOCIETY FOR HUMAN RESOURCE DEVELOPMENT</textPath></text>' +
    '<text font-family="Barlow Condensed,Arial Narrow,Arial,sans-serif" font-size="11.4" font-weight="600" letter-spacing="4" fill="currentColor"><textPath href="#embB" startOffset="50%" text-anchor="middle">SINCE 1989</textPath></text>' +
    '<g stroke="currentColor" stroke-width="5.5" stroke-linecap="round"><path d="M66 122C84 118 100 104 110 74"/><path d="M80 130C98 124 114 108 124 82"/><path d="M94 138C112 130 128 114 138 92"/></g></svg>';

  /* ---------- 텍스트 유틸 ---------- */
  function splitWords(el) {
    var t = el.textContent.trim();
    el.setAttribute('aria-label', t);
    el.textContent = '';
    return t.split(/\s+/).map(function (w) {
      var s = document.createElement('span');
      s.className = 'w'; s.textContent = w; s.setAttribute('aria-hidden', 'true');
      el.appendChild(s); el.appendChild(document.createTextNode(' '));
      return s;
    });
  }
  function splitRv(el) {
    var out = [], nodes = Array.prototype.slice.call(el.childNodes);
    el.innerHTML = '';
    function wrap(content) {
      var o = document.createElement('span'), i = document.createElement('span');
      o.className = 'rw';
      if (typeof content === 'string') i.textContent = content; else i.appendChild(content);
      o.appendChild(i); el.appendChild(o); out.push(i);
    }
    nodes.forEach(function (n) {
      if (n.nodeType === 3) {
        n.textContent.split(/(\s+)/).forEach(function (p) {
          if (!p) return;
          if (/^\s+$/.test(p)) el.appendChild(document.createTextNode(' ')); else wrap(p);
        });
      } else if (n.nodeName === 'BR') el.appendChild(n);
      else wrap(n);
    });
    return out;
  }
  var KR = '가나다라마바사아자차카타파하학회산업교육연구현장배움일터소식'.split('');
  var EN = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#/'.split('');
  function scramble(el, dur) {
    var txt = el.dataset.t || (el.dataset.t = el.textContent);
    var n = txt.length, t0 = performance.now(), d = (dur || 0.45) * 1000;
    cancelAnimationFrame(el._sc);
    (function f(now) {
      var p = Math.min(1, (now - t0) / d), k = Math.floor(p * n), out = '';
      for (var i = 0; i < n; i++) {
        var ch = txt[i];
        if (i < k || /[\s·.,—\-()0-9「」:]/.test(ch)) out += ch;
        else out += (/[가-힣]/.test(ch) ? KR : EN)[Math.floor(Math.random() * (/[가-힣]/.test(ch) ? KR.length : EN.length))];
      }
      el.textContent = out;
      if (p < 1) el._sc = requestAnimationFrame(f);
    })(t0);
  }

  /* ---------- DOM 구성 ---------- */
  function build() {
    $$('[data-k]').forEach(function (el) { var v = get(el.dataset.k); if (v != null) el.textContent = v; });
    $$('.emb').forEach(function (el) { el.innerHTML = EMB; });

    $('.hd__nav').innerHTML = (K.nav || []).map(function (n, i) {
      return '<button type="button" class="nav__i"><sup>' + pad(i + 1) + '</sup><span data-sc>' + n + '</span></button>';
    }).join('');
    $('.ft__nav').innerHTML = (K.nav || []).map(function (n) { return '<span data-sc>' + n + '</span>'; }).join('');

    /* 숫자 */
    var notes = ['1989 → 2026', '2013 → 2026', 'ISSN ' + get('org.journal.issn'), '학계 · 산업계 · 기관'];
    $('.nums__g').innerHTML = (K.stats || []).map(function (s, i) {
      return '<div class="num"><div class="num__top mono"><span>' + pad(i + 1) + ' — ' + s.en + '</span><span>' + notes[i] + '</span></div>' +
        '<div class="num__n"><span data-n="' + s.n + '">0</span><small>' + s.unit + '</small></div><p class="num__l">' + s.label + '</p></div>';
    }).join('');

    /* 현장포럼: 연도별 배너 + 행 */
    var groups = {}, order = [];
    (K.forums || []).forEach(function (f) { var y = f.d.slice(0, 4); if (!groups[y]) { groups[y] = []; order.push(y); } groups[y].push(f); });
    var colors = ['#c6f432', '#ff74c8', '#ff8f2a', '#49d8ff', '#ffe54a', '#bd96ff'];
    var last = (K.forums || []).length;
    var h = '';
    order.forEach(function (y, gi) {
      var g = groups[y];
      h += '<div class="yb" style="--c:' + colors[gi % colors.length] + '"><div class="yb__l mono"><span>CH.' + pad(g[0].no) + (g.length > 1 ? ' — CH.' + pad(g[g.length - 1].no) : '') + '</span><span>' + g.length + (g.length > 1 ? ' SESSIONS' : ' SESSION') + '</span></div>' +
        '<div class="yb__t"><span class="fb fb--l">Field Forum</span><span class="emb">' + EMB + '</span><span class="fb fb--r">' + y + '</span></div></div>';
      g.forEach(function (f) {
        h += '<div class="fr' + (f.no === last ? ' is-next' : '') + (f.host === '해외학자포럼' ? ' is-os' : '') + '" data-i="' + (f.no - 1) + '" data-cur="VIEW">' +
          '<span class="fr__no">CH.' + pad(f.no) + '</span><strong class="fr__h">' + f.host + '</strong><span class="fr__t">' + f.t + '</span><span class="fr__d">' + f.d + '</span><span class="fr__a">→</span></div>';
      });
    });
    $('.forum__list').innerHTML = h;
    $('.forum__idx').innerHTML = (K.forums || []).map(function (f, i) { return '<button type="button" tabindex="-1" data-i="' + i + '">CH.' + pad(f.no) + '</button>'; }).join('');
    $('.forum__no').textContent = last;

    /* 학술대회 주제 마퀴 3줄 */
    var th = K.themes || [], per = Math.ceil(th.length / 3), rows = '';
    for (var r = 0; r < 3; r++) {
      rows += '<div class="mq' + (r === 1 ? ' mq--o' : '') + '"><div class="mq__t">' + th.slice(r * per, (r + 1) * per).map(function (t) {
        return '<span class="mq__i"><em>' + t.y + '</em><b>' + t.t + '</b><s>✳</s></span>';
      }).join('') + '</div></div>';
    }
    $('.themes__rows').innerHTML = rows;

    /* 소식·출판 타일 */
    var catEn = { '학술지': 'Publication', '현장포럼': 'Forum', '학술대회': 'Conference', '해외학자포럼': 'Forum' };
    var news = K.news || [], ev = K.events || [], jr = get('org.journal') || {};
    function txt(n, span) {
      return '<article class="tl tl--txt brk tl--' + span + '" data-cur="READ"><div class="tl__l mono"><b>' + (catEn[n.cat] || 'Notice') + '</b>●<span>' + n.d + '</span></div>' +
        '<h3 class="tl__t">' + n.t + '</h3><div class="tl__f mono"><span>공지사항 · ' + n.cat + '</span><i>↗</i></div></article>';
    }
    function ph(e, img, big, span) {
      return '<article class="tl tl--ph tl--' + span + '" data-cur="VIEW"><img src="../_assets/img/' + img + '.jpg" srcset="' + IMG + img + '.jpg 960w, ../_assets/img/' + img + '.jpg 1920w" sizes="(max-width:767px) 100vw, 56vw" alt="" loading="lazy">' +
        '<div class="tl__in"><div class="tl__l mono"><b>' + (catEn[e.kind] || 'Event') + '</b>●<span>' + e.d + '</span>' + (e.place ? '<span>· ' + e.place + '</span>' : '') + '</div>' +
        '<div class="tl__big">' + big + '</div><h3 class="tl__t">' + e.t + ' — ' + e.sub + '</h3></div></article>';
    }
    var jrTile = '<article class="tl tl--jr tl--4" data-cur="OPEN"><img class="tl__cv" src="' + IMG + 'p_cover.jpg" alt="" loading="lazy"><div class="tl__c">' +
      '<div class="tl__l mono"><b>Journal</b>●<span>Vol.' + jr.vol + '</span></div><h3 class="tl__t">' + jr.ko + '</h3>' +
      '<p class="tl__s"><em class="serif">' + jr.en + '</em><br>ISSN ' + jr.issn + ' · ' + jr.freq + '</p><div class="tl__f mono"><span>학술지</span><i>↗</i></div></div></article>';
    var t = '';
    if (ev[1]) t += ph(ev[1], 'p_hall', 'Spring<br>Conference', '7 tl--r2');
    if (news[0]) t += txt(news[0], 5);
    if (news[1]) t += txt(news[1], 5);
    if (news[2]) t += txt(news[2], 4);
    t += jrTile;
    if (news[3]) t += txt(news[3], 4);
    if (news[4]) t += txt(news[4], 3);
    if (ev[0]) t += ph(ev[0], 'p_center_dusk', 'Field Forum ' + last, 6);
    if (news[5]) t += txt(news[5], 3);
    $('.tiles__g').innerHTML = t;

    $('.cta__tags').innerHTML = (K.fields || []).map(function (f) { return '<span>' + f + '</span>'; }).join('');

    var line = '<span>' + get('org.en') + '</span><span>✳</span><span>SINCE 1989</span><span>✳</span><span>산·학·관·연</span><span>✳</span><span>「' + jr.ko + '」 ISSN ' + jr.issn + '</span><span>✳</span>';
    $('.ft__mqt').innerHTML = line + line + line + line;
  }

  /* ---------- 폭 맞춤 타이포 ---------- */
  function fit(el, box) {
    if (!el || !box) return;
    el.style.fontSize = '200px';
    var w = el.getBoundingClientRect().width, bw = box.clientWidth;
    if (w > 0 && bw > 0) el.style.fontSize = (200 * bw / w * 0.994) + 'px';
  }
  function fitAll() {
    fit($('.hero__word'), $('.hero__wbox'));
    fit($('.ft__word'), $('.ft__wbox'));
    if (!isM) fit($('.forum__big'), $('.forum__bigbox'));
  }

  /* ---------- Lenis ---------- */
  function initLenis() {
    if (reduce || !window.Lenis) return;
    lenis = new window.Lenis({ duration: 1.15, smoothWheel: true });
    window.__lenis = lenis;
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
  }

  /* ---------- 커서 ---------- */
  function initCursor() {
    if (!fine) return;
    html.classList.add('has-cur');
    var cur = $('.cur'), lab = $('b', cur);
    var x = gsap.quickTo(cur, 'x', { duration: 0.16, ease: 'power3' }), y = gsap.quickTo(cur, 'y', { duration: 0.16, ease: 'power3' });
    var on = false;
    window.addEventListener('mousemove', function (e) { if (!on) { on = true; gsap.set(cur, { x: e.clientX, y: e.clientY }); cur.classList.add('is-on'); } x(e.clientX); y(e.clientY); }, { passive: true });
    document.addEventListener('mouseover', function (e) {
      var l = e.target.closest('[data-cur]'), k = e.target.closest('.nav__i,.hd__join,.hd__logo,.forum__idx button,.cta__tags span,.ft__nav span,.mq__i,.num');
      cur.classList.toggle('is-label', !!l);
      cur.classList.toggle('is-link', !l && !!k);
      if (l) lab.textContent = l.dataset.cur;
    });
    window.addEventListener('mousedown', function () { cur.classList.add('is-down'); });
    window.addEventListener('mouseup', function () { cur.classList.remove('is-down'); });
    document.addEventListener('mouseleave', function () { cur.classList.remove('is-on'); on = false; });
  }

  /* ---------- 헤더 ---------- */
  function initHeader() {
    var hd = $('.hd');
    hd.classList.add('is-top');
    ScrollTrigger.create({
      start: 0, end: 'max',
      onUpdate: function (s) {
        var yy = s.scroll();
        hd.classList.toggle('is-top', yy < 8);
        if (yy > window.innerHeight * 0.6 && s.direction === 1) hd.classList.add('is-hide');
        else hd.classList.remove('is-hide');
      }
    });
    $$('main > section, .ft').forEach(function (sec) {
      ScrollTrigger.create({
        trigger: sec, start: 'top 36px', end: 'bottom 36px',
        onToggle: function (s) { if (s.isActive) hd.dataset.theme = sec.dataset.theme; }
      });
    });
    $$('[data-sc]').forEach(function (el) {
      var host = el.closest('.nav__i') || el;
      host.addEventListener('mouseenter', function () { scramble(el); });
    });
  }

  /* ---------- three.js 크리스털 ---------- */
  var crystal = { s: 1, p: 0 };
  function initCrystal() {
    var wrap = $('.crystal');
    if (!wrap || !window.THREE) return;
    var renderer;
    try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); } catch (e) { return; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);
    wrap.appendChild(renderer.domElement);
    var scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(30, 1, 0.1, 60);
    cam.position.z = 13;
    var root = new THREE.Group(), gem = new THREE.Group();
    scene.add(root); root.add(gem);

    var g = new THREE.IcosahedronGeometry(1.62, 0);
    if (g.index) g = g.toNonIndexed();
    g.scale(1, 1.32, 1);
    g.computeVertexNormals();
    var pal = [0x1230e6, 0x2a48ff, 0x0b1fb0, 0x1230e6, 0xc6f432, 0x0c1440, 0x3d5bff, 0x1230e6, 0x0b1fb0, 0xc6f432, 0x2a48ff];
    var pos = g.attributes.position, col = new Float32Array(pos.count * 3), c = new THREE.Color();
    for (var f = 0; f < pos.count / 3; f++) {
      c.setHex(pal[(f * 7 + 2) % pal.length]);
      for (var k = 0; k < 3; k++) { col[(f * 3 + k) * 3] = c.r; col[(f * 3 + k) * 3 + 1] = c.g; col[(f * 3 + k) * 3 + 2] = c.b; }
    }
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    gem.add(new THREE.Mesh(g, new THREE.MeshPhongMaterial({ vertexColors: true, flatShading: true, shininess: 70, specular: 0x33447a })));
    gem.add(new THREE.LineSegments(new THREE.EdgesGeometry(g), new THREE.LineBasicMaterial({ color: 0xefeee9, transparent: true, opacity: 0.7 })));

    var cage = new THREE.LineSegments(new THREE.WireframeGeometry(new THREE.IcosahedronGeometry(2.5, 1)), new THREE.LineBasicMaterial({ color: 0x1230e6, transparent: true, opacity: 0.3 }));
    root.add(cage);

    var sats = [], satCols = [0xc6f432, 0x0c1440, 0x1230e6, 0xc6f432];
    for (var i = 0; i < 4; i++) {
      var pivot = new THREE.Group();
      pivot.rotation.set(0.45 + i * 0.6, i * 0.85, i * 0.42);
      root.add(pivot);
      var R = 2.86 + i * 0.07, pts = [];
      for (var a = 0; a <= 128; a++) pts.push(new THREE.Vector3(Math.cos(a / 128 * Math.PI * 2) * R, 0, Math.sin(a / 128 * Math.PI * 2) * R));
      pivot.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: 0x0c1440, transparent: true, opacity: 0.32 })));
      var sm = new THREE.Mesh(new THREE.OctahedronGeometry(0.17, 0), new THREE.MeshPhongMaterial({ color: satCols[i], flatShading: true, shininess: 30 }));
      pivot.add(sm);
      sats.push({ m: sm, R: R, sp: 0.32 + i * 0.11, ph: i * 1.7 });
    }
    scene.add(new THREE.AmbientLight(0xffffff, 0.66));
    var d1 = new THREE.DirectionalLight(0xffffff, 0.95); d1.position.set(3, 5, 6); scene.add(d1);
    var d2 = new THREE.DirectionalLight(0x9fb0ff, 0.5); d2.position.set(-5, -2, 2); scene.add(d2);

    function size() {
      var w = wrap.clientWidth, hh = wrap.clientHeight;
      if (!w || !hh) return;
      renderer.setSize(w, hh, false);
      cam.aspect = w / hh; cam.updateProjectionMatrix();
    }
    size();
    if (window.ResizeObserver) new ResizeObserver(size).observe(wrap); else window.addEventListener('resize', size);

    var rx = 0.25, ry = 0, vx = 0, vy = 0.004, tx = 0, ty = 0, drag = false, lx = 0, ly = 0, vis = true;
    if (fine) window.addEventListener('mousemove', function (e) {
      tx = (e.clientY / window.innerHeight - 0.5) * 0.5; ty = (e.clientX / window.innerWidth - 0.5) * 0.8;
    }, { passive: true });
    wrap.addEventListener('pointerdown', function (e) { drag = true; lx = e.clientX; ly = e.clientY; try { wrap.setPointerCapture(e.pointerId); } catch (er) {} });
    wrap.addEventListener('pointermove', function (e) {
      if (!drag) return;
      vy = (e.clientX - lx) * 0.009; vx = (e.clientY - ly) * 0.009; lx = e.clientX; ly = e.clientY;
      ry += vy; rx += vx;
    });
    function end() { drag = false; }
    wrap.addEventListener('pointerup', end); wrap.addEventListener('pointercancel', end); wrap.addEventListener('lostpointercapture', end);
    if (window.IntersectionObserver) new IntersectionObserver(function (en) { vis = en[0].isIntersecting; }).observe(wrap);

    var spin = reduce ? 0 : 0.004;
    gsap.ticker.add(function (time) {
      if (!vis) return;
      if (!drag) { vy += (spin - vy) * 0.03; vx *= 0.93; ry += vy; rx += vx; rx += (0.25 - rx) * 0.012; }
      gem.rotation.set(rx, ry, crystal.p * 1.4);
      root.rotation.x += (tx - root.rotation.x) * 0.06;
      root.rotation.y += (ty - root.rotation.y) * 0.06;
      if (!reduce) { cage.rotation.y -= 0.0017; cage.rotation.x += 0.0009; }
      for (var j = 0; j < sats.length; j++) {
        var o = sats[j], an = (reduce ? 0 : time) * o.sp + o.ph;
        o.m.position.set(Math.cos(an) * o.R, 0, Math.sin(an) * o.R);
        o.m.rotation.x += 0.02; o.m.rotation.y += 0.03;
      }
      root.scale.setScalar(Math.max(0.0001, crystal.s * (1 - crystal.p * 0.22)));
      root.position.y = -crystal.p * 0.9;
      renderer.render(scene, cam);
    });
  }

  /* ---------- 드래그 스티커 ---------- */
  function initStickers() {
    var hero = $('.hero');
    $$('.stk').forEach(function (el) {
      var rot = parseFloat(el.dataset.r) || 0, x = 0, y = 0, vx = 0, vy = 0, drag = false, lx = 0, ly = 0, raf = 0, base = null;
      function apply() { el.style.transform = 'translate3d(' + x + 'px,' + y + 'px,0) rotate(' + (rot + clamp(-18, 18, vx * 0.7)) + 'deg)'; }
      apply();
      if (!fine) return;
      function bounds() {
        var hr = hero.getBoundingClientRect();
        var w = el.offsetWidth, hh = el.offsetHeight, l = el.offsetLeft, t = el.offsetTop;
        return { minX: -l + 4, maxX: hr.width - l - w - 4, minY: -t + 60, maxY: hr.height - t - hh - 4 };
      }
      el.addEventListener('pointerdown', function (e) {
        drag = true; lx = e.clientX; ly = e.clientY; vx = vy = 0; base = bounds();
        cancelAnimationFrame(raf); el.classList.add('is-drag'); el.style.zIndex = 9;
        try { el.setPointerCapture(e.pointerId); } catch (er) {}
        e.preventDefault();
      });
      el.addEventListener('pointermove', function (e) {
        if (!drag) return;
        vx = e.clientX - lx; vy = e.clientY - ly; lx = e.clientX; ly = e.clientY;
        x = clamp(base.minX, base.maxX, x + vx); y = clamp(base.minY, base.maxY, y + vy);
        apply();
      });
      function up() {
        if (!drag) return;
        drag = false; el.classList.remove('is-drag');
        vx = clamp(-34, 34, vx); vy = clamp(-34, 34, vy);
        (function step() {
          vx *= 0.9; vy *= 0.9; x += vx; y += vy;
          if (x < base.minX || x > base.maxX) { vx *= -0.6; x = clamp(base.minX, base.maxX, x); }
          if (y < base.minY || y > base.maxY) { vy *= -0.6; y = clamp(base.minY, base.maxY, y); }
          apply();
          if (Math.abs(vx) + Math.abs(vy) > 0.25) raf = requestAnimationFrame(step); else { vx = 0; apply(); }
        })();
      }
      el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
    });
  }

  /* ---------- 히어로 ---------- */
  var heroTl = null;
  function initHero() {
    if (reduce) return;
    heroTl = gsap.timeline({ paused: true, defaults: { ease: 'power4.out' } });
    heroTl.from('.hero__word .l i', { yPercent: 112, duration: 1.3, stagger: 0.08 }, 0)
      .from('.hero__h .ln > span', { yPercent: 118, duration: 1.1, stagger: 0.09 }, 0.15)
      .from('.hero__meta > span', { opacity: 0, y: -8, duration: 0.6, stagger: 0.05 }, 0.3)
      .from(crystal, { s: 0, duration: 1.6, ease: 'elastic.out(1,0.75)' }, 0.35)
      .from('.hero__intro, .next', { opacity: 0, y: 26, duration: 0.9, stagger: 0.12 }, 0.6)
      .from('.stk__in', { scale: 0, rotation: -50, duration: 0.9, ease: 'back.out(1.9)', stagger: 0.1 }, 0.85)
      .from('.hero__scroll', { opacity: 0, y: 10, duration: 0.6 }, 1.3)
      .add(function () {
        $$('.stk__in').forEach(function (s, i) { gsap.to(s, { y: i % 2 ? 7 : -7, duration: 2.2 + i * 0.35, ease: 'sine.inOut', yoyo: true, repeat: -1 }); });
      });
    ScrollTrigger.create({ trigger: '.hero', start: 'top top', end: 'bottom top', onUpdate: function (s) { crystal.p = s.progress; } });
    if (!isM) {
      var off = [-70, 46, -34, 78, -52];
      gsap.to('.hero__word .l', { y: function (i) { return off[i]; }, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
      gsap.to('.hero__mid', { yPercent: -14, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    }
  }

  /* ---------- 선언문 (pin + 단어 모임) ---------- */
  function initMani() {
    var t = $('.mani__t'), pct = $('.mani__pct');
    t.textContent = get('org.intro') + ' ' + get('org.intro2');
    var words = splitWords(t);
    words.forEach(function (w) { if (/산·학·관·연|1989년|토론의|변화를/.test(w.textContent)) w.classList.add('k'); });
    if (reduce) { pct.textContent = '100%'; return; }
    if (isM) {
      gsap.set(words, { opacity: 0.16 });
      gsap.to(words, { opacity: 1, ease: 'none', stagger: 0.08, scrollTrigger: { trigger: t, start: 'top 82%', end: 'bottom 58%', scrub: true, onUpdate: function (s) { pct.textContent = String(Math.round(s.progress * 100)).padStart(3, '0') + '%'; } } });
      return;
    }
    var W = window.innerWidth, H = window.innerHeight, rnd = gsap.utils.random;
    gsap.set(words, {
      x: function () { return rnd(-0.36, 0.36) * W; }, y: function () { return rnd(-0.28, 0.4) * H; },
      rotation: function () { return rnd(-28, 28); }, scale: function () { return rnd(0.55, 1.8); }, opacity: 0
    });
    var tl = gsap.timeline({
      scrollTrigger: {
        trigger: '.mani', start: 'top top', end: '+=300%', pin: true, scrub: 0.7, anticipatePin: 1,
        onUpdate: function (s) { pct.textContent = String(Math.round(Math.min(1, s.progress / 0.88) * 100)).padStart(3, '0') + '%'; }
      }
    });
    tl.to(words, { opacity: 1, duration: 0.22, ease: 'none', stagger: 0.032 }, 0)
      .to(words, { x: 0, y: 0, rotation: 0, scale: 1, duration: 1, ease: 'power3.out', stagger: 0.032 }, 0);
    tl.to('.mtile--emb .emb', { rotation: 360, duration: tl.duration(), ease: 'none' }, 0)
      .fromTo('.mtile--img img', { scale: 1.35 }, { scale: 1, duration: tl.duration(), ease: 'none' }, 0)
      .to({}, { duration: 0.4 });
  }

  /* ---------- 숫자 ---------- */
  function initNums() {
    $$('.num').forEach(function (cell) {
      var el = $('[data-n]', cell), n = +el.dataset.n, o = { v: 0 };
      var show = function (v) { el.textContent = Math.round(v).toLocaleString('en-US'); };
      if (reduce) { show(n); return; }
      ScrollTrigger.create({ trigger: cell, start: 'top 86%', once: true, onEnter: function () { gsap.to(o, { v: n, duration: 2, ease: 'power3.out', onUpdate: function () { show(o.v); } }); } });
    });
    if (reduce) return;
    gsap.set('.num', { opacity: 0, y: 46 });
    ScrollTrigger.batch('.num', { start: 'top 90%', once: true, onEnter: function (b) { gsap.to(b, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', stagger: 0.1 }); } });
  }

  /* ---------- 현장포럼 ---------- */
  function initForum() {
    var idx = $$('.forum__idx button'), rows = $$('.fr'), list = $('.forum__list');
    function active(i) { idx.forEach(function (b, j) { b.classList.toggle('on', j === i); }); }
    rows.forEach(function (r) {
      var i = +r.dataset.i;
      ScrollTrigger.create({ trigger: r, start: 'top 52%', end: 'bottom 52%', onToggle: function (s) { if (s.isActive) active(i); } });
    });
    idx.forEach(function (b) {
      b.addEventListener('click', function () {
        var r = rows[+b.dataset.i]; if (!r) return;
        var yy = r.getBoundingClientRect().top + window.pageYOffset - window.innerHeight * 0.42;
        if (lenis) lenis.scrollTo(yy, { duration: 1.2 }); else window.scrollTo({ top: yy, behavior: reduce ? 'auto' : 'smooth' });
      });
    });
    if (!reduce && !isM) {
      gsap.fromTo('.forum__big .fb--l', { xPercent: -10 }, { xPercent: 0, ease: 'none', scrollTrigger: { trigger: '.forum__head', start: 'top bottom', end: 'bottom 40%', scrub: true } });
      gsap.fromTo('.forum__big .fb--r', { xPercent: 10 }, { xPercent: 0, ease: 'none', scrollTrigger: { trigger: '.forum__head', start: 'top bottom', end: 'bottom 40%', scrub: true } });
      $$('.yb').forEach(function (yb) {
        gsap.fromTo($('.fb--l', yb), { xPercent: -14 }, { xPercent: 0, ease: 'none', scrollTrigger: { trigger: yb, start: 'top bottom', end: 'top 35%', scrub: true } });
        gsap.fromTo($('.fb--r', yb), { xPercent: 22 }, { xPercent: 0, ease: 'none', scrollTrigger: { trigger: yb, start: 'top bottom', end: 'top 35%', scrub: true } });
      });
    }
    if (!reduce) {
      gsap.set(rows, { opacity: 0, y: 26 });
      ScrollTrigger.batch(rows, { start: 'top 94%', once: true, onEnter: function (b) { gsap.to(b, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', stagger: 0.06, clearProps: 'transform' }); } });
    }
    /* 호버 사진 미리보기 */
    if (!fine) return;
    var pics = ['h2014_forum', 'p_workshop', 'p_center_dusk', 'p_question', 'h2017_tour', 'p_whiteboard', 'p_duo', 'p_campus_aerial', 'p_network', 'p_hall', 'p_notes', 'p_students', 'p_auditorium', 'h2019_30th', 'p_panel_woman', 'h2025_hybrid'];
    var pv = $('.pv'), pimg = $('img', pv);
    var px = gsap.quickTo(pv, 'x', { duration: 0.55, ease: 'power3' }), py = gsap.quickTo(pv, 'y', { duration: 0.55, ease: 'power3' });
    var pre = false;
    list.addEventListener('mouseenter', function () { if (pre) return; pre = true; pics.forEach(function (p) { new Image().src = IMG + p + '.jpg'; }); });
    var rowRect = null;
    list.addEventListener('mousemove', function (e) {
      var w = pv.offsetWidth, hh = pv.offsetHeight, x = e.clientX + 30, y;
      if (x + w > window.innerWidth - 16) x = e.clientX - w - 30;
      /* 올려둔 행을 가리지 않도록 행 아래(자리가 없으면 위)에 띄운다 */
      if (rowRect) { y = rowRect.bottom + 8; if (y + hh > window.innerHeight - 12) y = rowRect.top - hh - 8; }
      else y = e.clientY + 28;
      px(x); py(clamp(12, window.innerHeight - hh - 12, y));
    }, { passive: true });
    rows.forEach(function (r) {
      r.addEventListener('mouseenter', function () {
        rowRect = r.getBoundingClientRect();
        pimg.src = IMG + pics[+r.dataset.i % pics.length] + '.jpg';
        pv.classList.add('on');
        gsap.fromTo(pimg, { scale: 1.3 }, { scale: 1, duration: 0.9, ease: 'power3.out', overwrite: true });
      });
    });
    list.addEventListener('mouseleave', function () { pv.classList.remove('on'); rowRect = null; });
    window.addEventListener('scroll', function () { var h = $('.fr:hover'); if (h) rowRect = h.getBoundingClientRect(); else pv.classList.remove('on'); }, { passive: true });
  }

  /* ---------- 주제 마퀴 ---------- */
  var mqRows = [];
  function measureMq() { mqRows.forEach(function (r) { r.half = r.t.scrollWidth / 2; }); }
  function initThemes() {
    mqRows = $$('.mq').map(function (mq, i) {
      var t = $('.mq__t', mq);
      if (!reduce) t.innerHTML += t.innerHTML;
      var r = { t: t, x: 0, dir: i % 2 ? 1 : -1, half: 0, hover: false, set: gsap.quickSetter(t, 'x', 'px'), sk: gsap.quickSetter(t, 'skewX', 'deg') };
      mq.addEventListener('mouseenter', function () { r.hover = true; });
      mq.addEventListener('mouseleave', function () { r.hover = false; });
      return r;
    });
    if (reduce) { mqRows.forEach(function (r, i) { r.set(-i * 220); }); return; }
    measureMq();
    mqRows.forEach(function (r) { if (r.dir > 0) r.x = -r.half; });
    var vis = false, lastY = window.pageYOffset, vel = 0, skew = 0, base = isM ? 0.7 : 1.25;
    if (window.IntersectionObserver) new IntersectionObserver(function (en) { vis = en[0].isIntersecting; }, { rootMargin: '200px' }).observe($('.themes')); else vis = true;
    gsap.ticker.add(function (time, dt) {
      var yy = window.pageYOffset, dv = yy - lastY; lastY = yy;
      vel += (dv - vel) * 0.18;
      if (!vis) return;
      var k = Math.min(3, dt / 16.67);
      skew += (clamp(-13, 13, vel * 0.32) - skew) * 0.12;
      mqRows.forEach(function (r) {
        if (!r.half) return;
        r.x += r.dir * ((r.hover ? 0.12 : 1) * base + vel * 0.55) * k;
        if (r.x <= -r.half) r.x += r.half; else if (r.x > 0) r.x -= r.half;
        r.set(r.x); r.sk(skew * -r.dir);
      });
    });
  }

  /* ---------- 타일·헤딩 등장 ---------- */
  function initReveals() {
    if (reduce) return;
    $$('[data-rv]').forEach(function (el) {
      var parts = splitRv(el);
      gsap.from(parts, { yPercent: 125, duration: 1.05, ease: 'power4.out', stagger: 0.07, scrollTrigger: { trigger: el, start: 'top 90%', once: true } });
    });
    gsap.set('.tl', { opacity: 0, y: 54 });
    ScrollTrigger.batch('.tl', { start: 'top 92%', once: true, onEnter: function (b) { gsap.to(b, { opacity: 1, y: 0, duration: 0.95, ease: 'power3.out', stagger: 0.09, clearProps: 'transform' }); } });
    gsap.from('.forum__rc > *', { opacity: 0, y: 30, duration: 0.9, ease: 'power3.out', stagger: 0.15, scrollTrigger: { trigger: '.forum__rc', start: 'top 85%', once: true } });
    gsap.from('.cta__p, .cta__tags span, .bigbtn', { opacity: 0, y: 24, duration: 0.7, ease: 'power3.out', stagger: 0.05, scrollTrigger: { trigger: '.cta__g', start: 'top 88%', once: true } });
    gsap.from('.ft__word', { yPercent: 40, ease: 'none', scrollTrigger: { trigger: '.ft__wbox', start: 'top bottom', end: 'bottom bottom', scrub: true } });
  }

  /* ---------- 자석 버튼 ---------- */
  function initMagnet() {
    if (!fine || reduce) return;
    $$('[data-mag]').forEach(function (el) {
      var xt = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3' }), yt = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3' });
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        xt((e.clientX - r.left - r.width / 2) * 0.32); yt((e.clientY - r.top - r.height / 2) * 0.42);
      });
      el.addEventListener('mouseleave', function () { xt(0); yt(0); });
    });
  }

  /* ---------- 로더 ---------- */
  function runLoader(done) {
    var L = $('.loader'), n = $('.loader__n');
    if (!L) { done(); return; }
    if (reduce) { L.remove(); done(); return; }
    var o = { v: 0 };
    gsap.to(o, {
      v: 100, duration: 1.15, ease: 'power2.inOut',
      onUpdate: function () { n.textContent = String(Math.round(o.v)).padStart(3, '0'); },
      onComplete: function () {
        gsap.to(L, { clipPath: 'inset(0 0 100% 0)', duration: 0.95, ease: 'power4.inOut', onComplete: function () { L.remove(); } });
        gsap.delayedCall(0.4, done);
      }
    });
  }

  /* ---------- 시작 ---------- */
  function start() {
    try {
      if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
      window.scrollTo(0, 0);
      gsap.registerPlugin(ScrollTrigger);
      build();
      fitAll();
      initLenis();
      initCursor();
      initCrystal();
      initStickers();
      initHero();
      initMani();
      initNums();
      initForum();
      initThemes();
      initReveals();
      initMagnet();
      initHeader();
      ScrollTrigger.refresh();
      runLoader(function () { if (heroTl) heroTl.play(); });
      var rt;
      window.addEventListener('resize', function () {
        clearTimeout(rt);
        rt = setTimeout(function () { fitAll(); measureMq(); ScrollTrigger.refresh(); }, 180);
      });
      window.addEventListener('load', function () { fitAll(); measureMq(); ScrollTrigger.refresh(); });
    } catch (e) {
      console.error('[demo2]', e);
      var L = $('.loader'); if (L) L.remove();
    }
  }
  var waits = [];
  if (document.fonts && document.fonts.load) {
    waits.push(document.fonts.load('400 40px Anton'), document.fonts.load('600 20px "Barlow Condensed"'), document.fonts.load('400 40px "Instrument Serif"'), document.fonts.load('800 40px "Pretendard Variable"', '한국산업교육학회'));
    if (document.fonts.ready) waits.push(document.fonts.ready);
  }
  var go = false, begin = function () { if (go) return; go = true; start(); };
  Promise.all(waits).then(begin, begin);
  setTimeout(begin, 2600);
})();
