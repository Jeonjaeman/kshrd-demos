/* DEMO 3 — 사진 중심안 : Lenis + GSAP ScrollTrigger(sticky pin + scrub) + 캔버스 프레임 시퀀스 + three.js 먼지 입자 */
gsap.registerPlugin(ScrollTrigger);

const K = window.KSHRD;
const IS_M = matchMedia('(max-width: 767px)').matches;
const FINE = matchMedia('(hover: hover) and (pointer: fine)').matches;
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = (s, p = document) => p.querySelector(s);
const $$ = (s, p = document) => [...p.querySelectorAll(s)];
const IMG = n => `../_assets/img/${n}.jpg`, SM = n => `../_assets/img/sm/${n}.jpg`;
const pad2 = n => String(n).padStart(2, '0');
const clamp01 = v => Math.max(0, Math.min(1, v));

/* ---------- 0. 스무스 스크롤 ---------- */
let lenis = null;
if (!RM) {
  lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.9, smoothWheel: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(t => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  window.__lenis = lenis;
}

/* ---------- 1. 데이터 → 화면 (data.js 의 실제 학회 데이터) ---------- */
$('#nav').innerHTML = K.nav.map(n => `<span>${n}</span>`).join('');
$('#heroKind').textContent = K.next.kind;
$('#heroChip').textContent = `${K.next.date} — ${K.next.place}`;
$('#heroStrip').innerHTML = [
  ['Event', K.next.kind],
  ['Theme', K.next.title],
  ['Date', `${K.next.date} <small>${K.next.dow} ${K.next.time}</small>`],
  ['Venue', K.next.place],
].map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('') + '<div><span class="hero__go">행사안내 및 접수 <i>→</i></span></div>';

$('#aboutIntro').textContent = K.org.intro;
$('#pvPurpose').textContent = K.org.intro;
$('#pvVision').textContent = K.org.intro2;
$('#stats').innerHTML = K.stats.map(s =>
  `<li><p class="stats__n"><b data-count="${s.n}">0</b><small>${s.unit}</small></p><p class="stats__t">${s.label}</p><p class="stats__e">${s.en}</p></li>`).join('');

// 포럼 카드 : 생성 사진을 순환 사용 (특정 기업 공간으로 단정하지 않는다)
const F_IMGS = ['h2014_forum', 'p_workshop', 'p_whiteboard', 'p_question', 'h2017_tour', 'p_notes', 'p_students', 'p_auditorium', 'p_network', 'p_panel_woman', 'p_stage', 'p_hall'];
$('#forumTrack').innerHTML = K.forums.map((f, i) => {
  const overseas = f.host === '해외학자포럼';
  return `<li class="fcard">
    <div class="fcard__img"><img src="${SM(overseas ? 'h2025_hybrid' : F_IMGS[i % F_IMGS.length])}" alt="" loading="lazy" draggable="false">
      <span class="fcard__no">${pad2(f.no)}</span>${overseas ? '<span class="fcard__tag">OVERSEAS</span>' : ''}</div>
    <div class="fcard__chips"><span class="chip">${f.d}</span><span class="chip chip--on">${f.host}</span></div>
    <p class="fcard__t">${f.t}</p></li>`;
}).join('');

const lastTheme = K.themes[K.themes.length - 1];
$('#confTitle').innerHTML = lastTheme.t.replace(' — ', IS_M ? '<br>' : ' —<br>');
const E_IMGS = { '2026.11.13': 'p_stage', '2026.06.19': 'h2026_poster', '2026.05.22': 'p_workshop', '2025.11.29': 'p_auditorium', '2025.08.19': 'p_whiteboard', '2025.05.16': 'h2025_hybrid' };
$('#eventGrid').innerHTML = K.events.map(e => `<li class="ecard" data-kind="${e.kind}" data-cur="VIEW">
  <img src="${SM(E_IMGS[e.d] || 'p_hall')}" alt="" loading="lazy">
  <div class="ecard__top"><span class="ecard__state${e.state === '예정' ? ' is-next' : ''}">${e.state}</span><span class="ecard__date">${e.d}</span></div>
  <div class="ecard__body"><span class="ecard__kind">${e.kind}</span><p class="ecard__t">${e.t}</p><p class="ecard__s">${e.sub}</p>${e.place ? `<span class="ecard__p">@ ${e.place}</span>` : ''}</div></li>`).join('');
const kinds = ['전체', ...new Set(K.events.map(e => e.kind))];
$('#confFilter').innerHTML = kinds.map((k, i) => `<button class="${i ? '' : 'on'}" data-k="${k}">${k}</button>`).join('');

$('#quoteText').textContent = K.quote.text;
$('#quoteBy').textContent = '— ' + K.quote.by;

const J = K.org.journal;
$('#journalEn').textContent = J.en;
$('#journalIssn').textContent = `ISSN ${J.issn} · VOL. ${J.vol}`;
$('#journalMeta').innerHTML = [['Volume', `제${J.vol}권 · 2026`], ['Frequency', '연 3회'], ['ISSN', J.issn]]
  .map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('');
$('#journalFields').innerHTML = K.fields.map(f => `<li>${f}</li>`).join('');
const N_IMGS = { '학술지': 'p_journals', '현장포럼': 'p_workshop', '학술대회': 'p_hall' };
$('#newsList').innerHTML = K.news.map(n => `<li data-img="${SM(N_IMGS[n.cat] || 'p_library')}"><span class="news__d">${n.d}</span><span class="news__c">${n.cat}</span><span class="news__t">${n.t}</span><span class="news__a">→</span></li>`).join('');

$('#partnerGrid').innerHTML = K.org.partners.map((p, i) => `<li class="tile"><span class="tile__n">${pad2(i + 1)}</span><span class="tile__t">${p}</span></li>`).join('')
  + `<li class="tile tile--more"><span class="tile__n">MEMBERS</span><span class="tile__t">1,000+ <small style="font-family:var(--sans);font-size:.5em;font-weight:600;opacity:.7;display:block;margin-top:6px;letter-spacing:-.02em">산·학·관·연 회원</small></span></li>`;

$('#ftAddr').textContent = K.org.address;
$('#ftContact').textContent = `Tel. ${K.org.tel} · E-mail. ${K.org.email}`;
$('#ftReg').textContent = `고유번호 ${K.org.regno}`;
$('#ftMenu').innerHTML = [...K.nav, '입회안내'].map(n => `<li>${n}</li>`).join('');

/* ---------- 2. 텍스트 분할 · 등장 ---------- */
function splitWords(el) {
  const lines = el.innerHTML.split(/<br\s*\/?>/i);
  el.innerHTML = lines.map(l => l.trim().split(/\s+/).map(w => `<span class="w"><span>${w}</span></span>`).join(' ')).join('<br>');
  return $$('.w > span', el);
}
if (!RM) {
  $$('.split').forEach(el => {
    const words = splitWords(el);
    gsap.to(words, { y: 0, duration: 1.15, ease: 'power4.out', stagger: 0.055,
      scrollTrigger: { trigger: el, start: 'top 86%', toggleActions: 'play none none reverse' } });
  });
  $$('.reveal').forEach(el => {
    gsap.to(el, { opacity: 1, y: 0, duration: 1.1, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none reverse' } });
  });
  // 사진 : clip-path 로 열리며 안쪽 이미지는 줌아웃
  $$('.rv-img').forEach(el => {
    const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 84%', toggleActions: 'play none none reverse' } });
    tl.to(el, { clipPath: 'inset(0 0 0% 0)', duration: 1.5, ease: 'power4.inOut' })
      .to($('img, .quote__frame', el), { scale: 1, duration: 2, ease: 'power3.out' }, 0);
  });
  // 깊이 차 패럴랙스
  $$('[data-speed]').forEach(el => {
    const s = +el.dataset.speed;
    gsap.fromTo(el, { yPercent: -s }, { yPercent: s, ease: 'none',
      scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } });
  });
}

/* ---------- 3. 헤더 : 섹션 밝기에 따라 색 반전 · 내릴 때 숨김 ---------- */
const hd = $('#hd');
$$('main > section[data-theme], footer[data-theme]').forEach(sec => {
  ScrollTrigger.create({ trigger: sec, start: 'top 38px', end: 'bottom 38px',
    onToggle: self => { if (self.isActive) hd.dataset.theme = sec.dataset.theme; } });
});
let lastY = 0;
function onScroll(y) {
  hd.classList.toggle('is-solid', y > innerHeight * 0.9);
  hd.classList.toggle('is-hide', y > lastY && y > innerHeight * 1.2 && !document.documentElement.classList.contains('mm-open'));
  lastY = y;
}
if (lenis) lenis.on('scroll', ({ scroll }) => onScroll(scroll)); else addEventListener('scroll', () => onScroll(scrollY), { passive: true });

/* ---------- 4. 히어로 : 등장 → pin + scrub 로 영상이 둥근 카드로 ---------- */
const heroVideo = $('#heroVideo');
function heroIntro() {
  if (RM) return;
  gsap.timeline({ delay: .15 })
    .fromTo('.hd', { opacity: 0 }, { opacity: 1, duration: 1.2, ease: 'power2.out' }, 0)
    .fromTo('.hero__media video', { scale: 1.18 }, { scale: 1, duration: 2.6, ease: 'power3.out' }, 0)
    .from('.hero__label', { opacity: 0, y: 20, duration: .9, ease: 'power3.out' }, .35)
    .to('.hero__title .line > span', { y: 0, duration: 1.4, ease: 'power4.out', stagger: .14 }, .3)
    .to('.hero__strip > div', { opacity: 1, y: 0, duration: .9, ease: 'power3.out', stagger: .08 }, .9)
    .from('.hero__scroll', { opacity: 0, duration: 1 }, 1.4);
}
(document.fonts && document.fonts.ready ? Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 1500))]) : Promise.resolve()).then(heroIntro);

const padPx = () => parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--pad')) || Math.max(20, Math.min(64, innerWidth * 0.034));
const cardTo = IS_M
  ? { top: () => innerHeight * 0.115, left: () => innerWidth * 0.055, width: () => innerWidth * 0.89, height: () => innerHeight * 0.36, borderRadius: 16 }
  : { top: () => innerHeight * 0.16, left: () => innerWidth * 0.52, width: () => innerWidth * 0.48 - padPx(), height: () => innerHeight * 0.68, borderRadius: 22 };
const heroTl = gsap.timeline({ defaults: { ease: 'none' },
  scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom bottom', scrub: 0.7, invalidateOnRefresh: true } });
heroTl
  .to('.hero__copy', { opacity: 0, y: -90, duration: .26 }, 0)
  .to('.hero__scroll', { opacity: 0, duration: .1 }, 0)
  .to('.hero__dust', { opacity: 0, duration: .25 }, 0)
  .to('#heroMedia', { ...cardTo, ease: 'power2.inOut', duration: .56 }, .06)
  .to('.hero__dim', { opacity: .32, duration: .4 }, .2)
  .fromTo('.hero__next', { autoAlpha: 0, y: 70 }, { autoAlpha: 1, y: 0, ease: 'power2.out', duration: .3 }, .42)
  .to('.hero__chip', { opacity: 1, duration: .15 }, .62)
  .to({}, { duration: .18 }, .82);

/* ---------- 5. 영상 프레임 스크롤 ----------
   복도(0~40%) → 문 통과(40~60%) → 세미나홀(60~100%) 순서의 전진 숏을 캔버스에 scrub.
   데스크톱 1280×720 145프레임, 모바일 480×854 73프레임. 시퀀스가 없으면 사진 3장 교차로 대체. */
(function sequence() {
  const sec = $('#seq'), canvas = $('#seqCanvas'), ctx = canvas.getContext('2d');
  const dir = `../_assets/video/${IS_M ? 'frames_corridor_m' : 'frames_corridor'}/`;
  const caps = $$('.seq__cap').map(el => ({ el, from: +el.dataset.from, to: +el.dataset.to }));
  const fb = $$('#seqFallback img');
  const state = { frame: 0, p: 0 };
  let total = IS_M ? 73 : 145, frames = [], loaded = 0, lastDrawn = -1;
  const DPR = Math.min(devicePixelRatio || 1, 1.5);

  if (!IS_M) gsap.set('.seq__cap[data-pos="c"]', { xPercent: -50, yPercent: -50 });

  function size() { canvas.width = Math.round(canvas.clientWidth * DPR); canvas.height = Math.round(canvas.clientHeight * DPR); lastDrawn = -1; draw(); }
  function draw() {
    let i = Math.round(state.frame), img = frames[i];
    // 아직 못 받은 프레임이면 가장 가까운 앞 프레임
    while (i > 0 && !(img && img.complete && img.naturalWidth)) img = frames[--i];
    if (!img || !img.complete || !img.naturalWidth || i === lastDrawn) return;
    const cw = canvas.width, ch = canvas.height, ir = img.naturalWidth / img.naturalHeight, cr = cw / ch;
    let w, h; if (cr > ir) { w = cw; h = cw / ir; } else { h = ch; w = ch * ir; }
    ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
    lastDrawn = i;
  }
  function hud() {
    const p = state.p;
    $('#seqFrame').textContent = String(Math.round(state.frame) + 1).padStart(3, '0');
    $('#seqBar').style.transform = `scaleX(${p})`;
    caps.forEach(c => {
      const a = clamp01((p - c.from) / 0.05), b = clamp01((c.to - p) / 0.05);
      gsap.set(c.el, { opacity: a * b, y: (1 - a) * 46 - (1 - b) * 46 });
    });
    if (sec.classList.contains('no-frames')) {
      gsap.set(fb[1], { opacity: clamp01((p - 0.34) / 0.12) });
      gsap.set(fb[2], { opacity: clamp01((p - 0.62) / 0.12) });
      gsap.set(fb, { scale: 1 + p * 0.12 });
    }
  }
  function load() {
    $('#seqTotal').textContent = total;
    const src = i => `${dir}f_${String(i + 1).padStart(3, '0')}.jpg`;
    const first = new Image();
    first.onload = () => {
      frames[0] = first; loaded = 1; size();
      for (let i = 1; i < total; i++) {
        const im = new Image();
        im.onload = im.onerror = () => {
          loaded++; $('#seqPct').textContent = Math.round(loaded / total * 100) + '%';
          if (loaded >= total) { $('#seqLoading').classList.add('done'); lastDrawn = -1; draw(); }
        };
        im.src = src(i); frames[i] = im;
      }
    };
    first.onerror = () => { sec.classList.add('no-frames'); $('#seqLoading').classList.add('done'); $('.seq__hud span').style.visibility = 'hidden'; hud(); };
    first.src = src(0);
  }
  // 프레임 수는 count.txt 가 우선
  fetch(dir + 'count.txt').then(r => r.ok ? r.text() : '').then(t => { const n = parseInt(t, 10); if (n > 1) total = n; }).catch(() => {}).finally(load);

  gsap.to(state, { p: 1, ease: 'none',
    scrollTrigger: { trigger: sec, start: 'top top', end: 'bottom bottom', scrub: 0.6 },
    onUpdate() { state.frame = state.p * (total - 1); draw(); hud(); } });
  addEventListener('resize', size);
  hud();
})();

/* ---------- 6. 학회 소개 : 숫자 카운트 ---------- */
$$('.stats__n b').forEach(el => {
  const n = +el.dataset.count, o = { v: 0 };
  const put = () => { el.textContent = Math.round(o.v).toLocaleString('en-US'); };
  if (RM) { o.v = n; put(); return; }
  gsap.to(o, { v: n, duration: 2.2, ease: 'power3.out', onUpdate: put, scrollTrigger: { trigger: el, start: 'top 90%', once: true } });
});
gsap.from('.stats__list li', { y: 50, opacity: 0, duration: 1, ease: 'power3.out', stagger: .1, scrollTrigger: { trigger: '.stats__list', start: 'top 86%' } });

/* ---------- 7. 현장포럼 : 가로 드래그(관성) + 진행 표시 ---------- */
(function forums() {
  const wrap = $('#fWrap'), bar = $('#fBar'), count = $('#fCount'), cards = $$('.fcard', wrap);
  const step = () => cards[1] ? cards[1].offsetLeft - cards[0].offsetLeft : 300;
  function ui() {
    const max = wrap.scrollWidth - wrap.clientWidth, r = wrap.clientWidth / wrap.scrollWidth;
    bar.style.width = r * 100 + '%';
    bar.style.left = (max > 0 ? wrap.scrollLeft / max : 0) * (1 - r) * 100 + '%';
    const i = Math.min(cards.length, Math.round(wrap.scrollLeft / step()) + 1);
    count.textContent = `${pad2(i)} / ${cards.length}`;
  }
  wrap.addEventListener('scroll', ui, { passive: true }); addEventListener('resize', ui); ui();

  let down = false, sx = 0, sl = 0, v = 0, lx = 0, raf = 0, moved = false;
  wrap.addEventListener('pointerdown', e => {
    if (e.pointerType !== 'mouse') return;
    down = true; moved = false; sx = lx = e.clientX; sl = wrap.scrollLeft; v = 0; cancelAnimationFrame(raf); gsap.killTweensOf(wrap);
  });
  addEventListener('pointermove', e => {
    if (!down) return;
    const dx = e.clientX - sx;
    if (!moved && Math.abs(dx) > 4) { moved = true; wrap.classList.add('dragging'); }
    wrap.scrollLeft = sl - dx; v = e.clientX - lx; lx = e.clientX;
  });
  addEventListener('pointerup', () => {
    if (!down) return; down = false; wrap.classList.remove('dragging');
    (function glide() { if (Math.abs(v) < 0.4) return; wrap.scrollLeft -= v; v *= 0.94; raf = requestAnimationFrame(glide); })();
  });
  const go = d => gsap.to(wrap, { scrollLeft: wrap.scrollLeft + d * step() * (IS_M ? 1 : 3), duration: 1, ease: 'power3.out', overwrite: true });
  $('#fPrev').addEventListener('click', () => go(-1)); $('#fNext').addEventListener('click', () => go(1));

  if (!RM) {
    gsap.from(cards.slice(0, 8), { x: 140, opacity: 0, duration: 1.2, ease: 'power3.out', stagger: .07, scrollTrigger: { trigger: wrap, start: 'top 88%' } });
    gsap.to('.forums__bg img', { yPercent: -14, ease: 'none', scrollTrigger: { trigger: '#forums', start: 'top bottom', end: 'bottom top', scrub: true } });
    gsap.from('.forums__panel', { y: 120, duration: 1.2, ease: 'power3.out', scrollTrigger: { trigger: '.forums__panel', start: 'top 96%', toggleActions: 'play none none reverse' } });
  }
})();

/* ---------- 8. 학술대회 : 배경 스케일 · 카드 등장 · 필터 ---------- */
if (!RM) {
  gsap.to('.conf__bg img', { scale: 1, ease: 'none', scrollTrigger: { trigger: '.conf__hero', start: 'top bottom', end: 'bottom top', scrub: true } });
  gsap.to('.conf__head', { yPercent: -70, opacity: 0, ease: 'none', scrollTrigger: { trigger: '.conf__panel', start: 'top 92%', end: 'top 40%', scrub: true } });
  gsap.fromTo('.ecard', { y: 90, opacity: 0 }, { y: 0, opacity: 1, duration: 1.1, ease: 'power3.out', stagger: .09, scrollTrigger: { trigger: '#eventGrid', start: 'top 86%' } });
}
$('#confFilter').addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  $$('#confFilter button').forEach(x => x.classList.toggle('on', x === b));
  const k = b.dataset.k, show = [];
  $$('.ecard').forEach(c => { const on = k === '전체' || c.dataset.kind === k; c.classList.toggle('is-off', !on); if (on) show.push(c); });
  gsap.fromTo(show, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: .7, ease: 'power3.out', stagger: .06, overwrite: true });
  ScrollTrigger.refresh();
});

/* ---------- 9. 인용 영상 : 파일이 없으면 사진으로 ---------- */
const qv = $('#quoteVideo');
qv.addEventListener('error', () => qv.classList.add('is-err'));
ScrollTrigger.create({ trigger: '#quote', start: 'top bottom', end: 'bottom top',
  onToggle: s => { if (s.isActive) { const p = qv.play(); if (p && p.catch) p.catch(() => {}); } else qv.pause(); } });
if (!RM) gsap.fromTo('.quote__brace path', { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.6, ease: 'power3.inOut', scrollTrigger: { trigger: '.quote__brace', start: 'top 92%' } });

/* ---------- 10. 학술지 : 표지 3D 틸트 · 소식 썸네일 ---------- */
(function journal() {
  const wrap = $('#coverWrap'), cover = $('#cover');
  const REST = { rotationY: -22, rotationX: 7 };
  gsap.set(cover, { ...REST, transformPerspective: 1400 });
  if (FINE && !RM) {
    const ry = gsap.quickTo(cover, 'rotationY', { duration: .8, ease: 'power3.out' }), rx = gsap.quickTo(cover, 'rotationX', { duration: .8, ease: 'power3.out' });
    wrap.addEventListener('mousemove', e => {
      const r = wrap.getBoundingClientRect(), px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      ry((px - .5) * 44); rx(-(py - .5) * 30);
      cover.style.setProperty('--sx', px * 100 + '%'); cover.style.setProperty('--sy', py * 100 + '%');
      cover.style.setProperty('--shx', -(px - .5) * 40 + 'px'); cover.style.setProperty('--shy', -(py - .5) * 16 + 'px');
    });
    wrap.addEventListener('mouseleave', () => { ry(REST.rotationY); rx(REST.rotationX); });
  } else if (!RM) {
    // 터치 기기 : 스크롤에 따라 천천히 돌아간다
    gsap.fromTo(cover, { rotationY: -30 }, { rotationY: 6, ease: 'none', scrollTrigger: { trigger: wrap, start: 'top bottom', end: 'bottom top', scrub: true } });
  }
  if (!RM) {
    gsap.from(cover, { y: 120, opacity: 0, duration: 1.4, ease: 'power3.out', scrollTrigger: { trigger: wrap, start: 'top 82%' } });
    gsap.from('.news__list li', { y: 30, opacity: 0, duration: .8, ease: 'power3.out', stagger: .06, scrollTrigger: { trigger: '.news__list', start: 'top 88%' } });
    gsap.from('.journal__meta > div', { y: 24, opacity: 0, duration: .8, stagger: .08, scrollTrigger: { trigger: '.journal__meta', start: 'top 90%' } });
  }
})();

/* ---------- 11. 커서 라벨(VIEW / DRAG) · 소식 썸네일 ---------- */
if (FINE) {
  const cur = $('#cur'), curT = $('span', cur), th = $('#thumb'), thImg = $('img', th);
  const cx = gsap.quickTo(cur, 'x', { duration: .35, ease: 'power3.out' }), cy = gsap.quickTo(cur, 'y', { duration: .35, ease: 'power3.out' });
  const tx = gsap.quickTo(th, 'x', { duration: .6, ease: 'power3.out' }), ty = gsap.quickTo(th, 'y', { duration: .6, ease: 'power3.out' });
  addEventListener('mousemove', e => { cx(e.clientX); cy(e.clientY); tx(e.clientX); ty(e.clientY); });
  document.addEventListener('mouseover', e => {
    const t = e.target.closest('[data-cur]');
    if (t) { curT.textContent = t.dataset.cur; cur.classList.add('on'); } else cur.classList.remove('on');
    const n = e.target.closest('.news__list li');
    if (n) { if (thImg.getAttribute('src') !== n.dataset.img) thImg.src = n.dataset.img; th.classList.add('on'); } else th.classList.remove('on');
  });
}

/* ---------- 12. 함께하는 기관 · 입회 · 푸터 ---------- */
if (!RM) {
  gsap.from('.tile', { opacity: 0, y: 40, duration: .9, ease: 'power3.out', stagger: { each: .06, grid: 'auto', from: 'start' }, scrollTrigger: { trigger: '.tiles', start: 'top 86%' } });
  gsap.to('.join__bg img', { scale: 1, ease: 'none', scrollTrigger: { trigger: '#join', start: 'top bottom', end: 'bottom top', scrub: true } });
  gsap.to('.ft__word span', { y: 0, duration: 1.4, ease: 'power4.out', stagger: .08, scrollTrigger: { trigger: '.ft__word', start: 'top 96%', toggleActions: 'play none none reverse' } });
}

/* ---------- 13. 히어로 먼지 입자 (three.js) : 영상 위에 얇게 떠서 깊이를 만든다 ---------- */
addEventListener('load', () => {
  ScrollTrigger.refresh();
  if (IS_M || RM || !window.THREE) return;
  const canvas = $('#heroDust'), media = $('#heroMedia');
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: 'low-power' }); } catch (e) { return; }
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(50, 1, 0.1, 50); cam.position.z = 9;
  const N = 420, pos = new Float32Array(N * 3), spd = new Float32Array(N);
  for (let i = 0; i < N; i++) { pos[i * 3] = (Math.random() - .5) * 26; pos[i * 3 + 1] = (Math.random() - .5) * 14; pos[i * 3 + 2] = (Math.random() - .5) * 12; spd[i] = .15 + Math.random() * .5; }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d');
  const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,226,170,1)'); gr.addColorStop(.35, 'rgba(255,200,120,.35)'); gr.addColorStop(1, 'rgba(255,200,120,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
  const mat = new THREE.PointsMaterial({ size: .16, map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: .75 });
  const pts = new THREE.Points(geo, mat); scene.add(pts);
  let mx = 0, my = 0, active = true, t0 = performance.now();
  function size() { const w = media.clientWidth, h = media.clientHeight; renderer.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); }
  size(); addEventListener('resize', size);
  addEventListener('mousemove', e => { mx = e.clientX / innerWidth - .5; my = e.clientY / innerHeight - .5; });
  ScrollTrigger.create({ trigger: '#hero', start: 'top top', end: '30% top', onToggle: s => { active = s.isActive; } });
  gsap.ticker.add(() => {
    if (!active) return;
    const now = performance.now(), dt = Math.min(.05, (now - t0) / 1000); t0 = now;
    const a = geo.attributes.position.array;
    for (let i = 0; i < N; i++) { a[i * 3 + 1] += spd[i] * dt * .5; a[i * 3] += Math.sin(now * .0003 + i) * dt * .12; if (a[i * 3 + 1] > 7) a[i * 3 + 1] = -7; }
    geo.attributes.position.needsUpdate = true;
    cam.position.x += (mx * 1.6 - cam.position.x) * .04; cam.position.y += (-my * 1 - cam.position.y) * .04; cam.lookAt(0, 0, 0);
    renderer.render(scene, cam);
  });
});
