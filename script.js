/* COOL / CYCLE — native scrolling, no animation dependencies. */
(() => {
  'use strict';
  const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
  const clamp = (n, min = 0, max = 1) => Math.min(max, Math.max(min, n));
  const root = document.documentElement, reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let paused = reduced.matches, queued = false, current = 0, lastScroll = scrollY;
  const stories = $$('.story'), diagram = $('#diagramCard');
  const units = ['.indoor', '.compressor', '.condenser', '.valve'].map(s => diagram.querySelector(s));
  const captions = ['01 / EVAPORATION — HEAT IN', '02 / COMPRESSION — WORK IN', '03 / CONDENSATION — HEAT OUT', '04 / EXPANSION — PRESSURE DOWN'];
  const caption = document.createElement('p'); caption.className = 'diagram-caption'; caption.setAttribute('aria-live', 'polite'); diagram.append(caption);
  const prev = $('#prev'), next = $('#next');
  const states = [
    ['State 1 · Evaporator outlet', 'Cold gas', 'Low-pressure refrigerant has absorbed the room’s heat and leaves the evaporator as vapor.'],
    ['State 2 · Compressor outlet', 'Hot gas', 'In this idealized cycle, compression raises pressure and temperature at constant entropy: the line goes straight up.'],
    ['State 3 · Condenser outlet', 'Warm liquid', 'Heat has moved outside and the refrigerant is back to a high-pressure liquid.'],
    ['State 4 · Valve outlet', 'Cold mix', 'Throttling drops the pressure at approximately constant enthalpy. Some liquid flashes into vapor, leaving a cold liquid–vapor mixture.']
  ];
  function showState(i) {
    i = clamp(i, 0, 3);
    $('#heatReadout').textContent = states[i][0]; $('#entropyReadout').textContent = states[i][1]; $('#stateDesc').textContent = states[i][2];
    $$('.graph-point, .state-picker button').forEach(el => { const on = Number(el.dataset.state) === i; el.classList.toggle('on', on); el.setAttribute('aria-pressed', String(on)); });
  }
  function setStep(i) {
    current = clamp(i, 0, stories.length - 1);
    stories.forEach((el, n) => { el.classList.toggle('active', n === current); el.setAttribute('aria-pressed', String(n === current)); });
    units.forEach((el, n) => el.classList.toggle('is-active', n === current));
    $('#progressBar').style.width = `${(current + 1) / stories.length * 100}%`;
    $('#diagramState').textContent = `${String(current + 1).padStart(2, '0')} / 04`;
    caption.textContent = captions[current]; diagram.dataset.step = current;
    prev.disabled = current === 0; next.disabled = current === stories.length - 1;
  }
  function goToStep(i) {
    setStep(i);
    const r = stories[current].getBoundingClientRect();
    const offset = innerWidth <= 800 ? diagram.getBoundingClientRect().height + 110 : innerHeight * .32;
    window.scrollTo({top: Math.max(0, scrollY + r.top - offset), behavior: paused ? 'instant' : 'smooth'});
  }
  prev.addEventListener('click', () => goToStep(current - 1)); next.addEventListener('click', () => goToStep(current + 1));
  stories.forEach((el, i) => {
    el.tabIndex = 0; el.setAttribute('role', 'button'); el.setAttribute('aria-label', `Stage ${i + 1}: ${el.querySelector('h3').textContent}`);
    el.addEventListener('click', () => setStep(i));
    el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setStep(i); } });
  });
  $('#cycle').addEventListener('keydown', e => { if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); goToStep(current + (e.key === 'ArrowRight' ? 1 : -1)); } });
  $$('.graph-point, .state-picker button').forEach(el => {
    const i = Number(el.dataset.state);
    ['click', 'focus', 'pointerenter'].forEach(type => el.addEventListener(type, () => showState(i)));
    el.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); showState(i); }
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); const n = (i + (e.key === 'ArrowRight' ? 1 : 3)) % 4; showState(n); $(`.state-picker button[data-state="${n}"]`).focus(); }
    });
  });
  const themeToggle = $('#themeToggle'); let theme = null;
  try { theme = localStorage.getItem('cool-cycle-theme'); } catch { /* Optional preference storage. */ }
  document.body.classList.toggle('light-mode', theme === 'light');
  function updateTheme() {
    const light = document.body.classList.contains('light-mode');
    themeToggle.setAttribute('aria-label', light ? 'Switch to dark mode' : 'Switch to light mode');
    themeToggle.querySelector('.theme-icon').textContent = light ? '☾' : '☼'; themeToggle.querySelector('.theme-text').textContent = light ? 'DARK' : 'LIGHT';
  }
  themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('light-mode');
    try { localStorage.setItem('cool-cycle-theme', document.body.classList.contains('light-mode') ? 'light' : 'dark'); } catch { /* Nonessential persistence. */ }
    updateTheme();
  });
  const motionToggle = $('#motionToggle');
  function updateMotion() {
    document.body.classList.toggle('motion-paused', paused); root.classList.toggle('js-motion', !paused);
    motionToggle.textContent = paused ? 'RESUME MOTION' : 'PAUSE MOTION'; motionToggle.setAttribute('aria-pressed', String(paused));
    motionToggle.setAttribute('aria-label', paused ? 'Resume decorative motion' : 'Pause decorative motion');
    $$('.system-svg').forEach(svg => { if (typeof svg.pauseAnimations === 'function') { if (paused) svg.pauseAnimations(); else svg.unpauseAnimations(); } });
    if (paused) $('.thermal-ring').style.translate = '0px 0px'; schedule();
  }
  motionToggle.addEventListener('click', () => { paused = !paused; updateMotion(); });
  reduced.addEventListener('change', () => { paused = reduced.matches; updateMotion(); });
  const revealTargets = $$('.reveal, .entropy-heading, .graph-card, .principle-copy, .footer-statement');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => { entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('in'); observer.unobserve(entry.target); } }); }, {threshold: .08, rootMargin: '0px 0px -25px 0px'});
    revealTargets.forEach(el => { el.classList.add('reveal'); observer.observe(el); });
  } else revealTargets.forEach(el => el.classList.add('in'));
  const hero = $('.hero'), laws = $('#laws'), principle = $('.principle');
  const chapters = $$('.chapter-nav a').map(link => ({link, section: $(link.getAttribute('href'))}));
  function render() {
    queued = false; const h = innerHeight, y = scrollY, total = root.scrollHeight - h;
    root.style.setProperty('--read', total > 0 ? clamp(y / total) : 0);
    const lr = laws.getBoundingClientRect(); $('.laws-line').style.setProperty('--p', clamp((h * .65 - lr.top) / lr.height));
    const hr = hero.getBoundingClientRect();
    if (!paused && hr.bottom > 0) { const p = clamp(-hr.top / hr.height, -.2, 1); hero.style.setProperty('--hero-y', `${p * 65}px`); hero.style.setProperty('--art-y', `${p * -40}px`); hero.style.setProperty('--art-r', `${p * 18}deg`); }
    if (!paused) { root.style.setProperty('--strip-x', `${-clamp(y * .16, 0, 430)}px`); const pr = principle.getBoundingClientRect(); if (pr.bottom > 0 && pr.top < h) principle.style.setProperty('--principle-y', `${pr.top / h * -45}px`); }
    if (Math.abs(y - lastScroll) > 1) {
      const target = innerWidth <= 800 ? Math.min(h * .75, diagram.getBoundingClientRect().bottom + 110) : h * .5;
      let best = -1, distance = Infinity;
      stories.forEach((el, i) => { const r = el.getBoundingClientRect(); if (r.bottom > 80 && r.top < h) { const d = Math.abs(r.top + r.height * .45 - target); if (d < distance) { best = i; distance = d; } } });
      if (best >= 0 && best !== current) setStep(best);
    }
    lastScroll = y; let active = -1;
    chapters.forEach(({section}, i) => { if (section.getBoundingClientRect().top <= h * .42) active = i; });
    chapters.forEach(({link}, i) => { link.classList.toggle('active', i === active); if (i === active) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current'); });
  }
  function schedule() { if (!queued) { queued = true; requestAnimationFrame(render); } }
  addEventListener('scroll', schedule, {passive: true}); addEventListener('resize', schedule, {passive: true});
  if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
    const art = $('.thermal-ring');
    hero.addEventListener('pointermove', e => { if (paused) return; const r = hero.getBoundingClientRect(); art.style.translate = `${((e.clientX - r.left) / r.width - .5) * 12}px ${((e.clientY - r.top) / r.height - .5) * 10}px`; }, {passive: true});
    hero.addEventListener('pointerleave', () => { art.style.translate = '0px 0px'; });
  }
  setStep(0); showState(0); updateTheme(); updateMotion(); render();
})();
