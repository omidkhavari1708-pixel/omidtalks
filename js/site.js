(() => {
  document.documentElement.classList.add('js');
  // theme: dark by default, light on request, remembered
  const tb = document.querySelector('.theme');
  const theme = v => { document.documentElement.dataset.theme = v; try { localStorage.setItem('theme', v); } catch (e) {} };
  try { if (localStorage.getItem('theme') === 'light') theme('light'); } catch (e) {}
  if (tb) tb.addEventListener('click', () => theme(document.documentElement.dataset.theme === 'light' ? 'dark' : 'light'));
  const tFa = document.title, tEn = (document.querySelector('meta[name=title-en]') || {}).content || tFa;
  const html = document.documentElement, btn = document.querySelector('.lang');
  // remember the Persian text once, then swap per language
  const nodes = [...document.querySelectorAll('[data-en]')].map(el => ({ el, fa: el.innerHTML }));
  const alts = [...document.querySelectorAll('[data-en-alt]')].map(el => ({ el, fa: el.alt }));
  const arias = [...document.querySelectorAll('[data-en-aria]')].map(el => ({ el, fa: el.getAttribute('aria-label') }));
  const set = lang => {
    const en = lang === 'en';
    html.lang = lang; html.dir = en ? 'ltr' : 'rtl';
    nodes.forEach(n => {
      if (n.el.tagName === 'LI') { n.el.firstChild.textContent = en ? n.el.dataset.en : n.fa.split('<')[0]; }
      else n.el.innerHTML = en ? n.el.dataset.en : n.fa;
    });
    alts.forEach(a => a.el.alt = en ? a.el.dataset.enAlt : a.fa);
    arias.forEach(a => a.el.setAttribute('aria-label', en ? a.el.dataset.enAria : a.fa));
    btn.textContent = en ? 'FA' : 'EN';
    document.title = en ? tEn : tFa;
    document.querySelectorAll('.btn i').forEach(i => i.textContent = en ? '→' : '←');
    try { localStorage.setItem('lang', lang); } catch (e) {}
  };
  btn.addEventListener('click', () => set(html.lang === 'en' ? 'fa' : 'en'));
  let saved = null; try { saved = localStorage.getItem('lang'); } catch (e) {}
  // English first for every new visitor
  if (saved !== 'fa') set('en');

  // reveal on scroll + count up the fired-tasks number
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('on'); io.unobserve(e.target);
  }), { threshold: .15 });
  document.querySelectorAll('.rv').forEach(el => io.observe(el));
  const c = document.querySelector('[data-count]');
  if (c) new IntersectionObserver((es, o) => es.forEach(e => {
    if (!e.isIntersecting) return; o.disconnect();
    const to = +c.dataset.count; let n = 0;
    const tick = () => { c.textContent = String(++n).padStart(2, '0'); if (n < to) setTimeout(tick, 220); };
    tick();
  }), { threshold: .5 }).observe(c);

  // drag the dashboard rail with a mouse
  const rail = document.querySelector('.rail'); let down = false, x0 = 0, s0 = 0;
  if (rail) {
  rail.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') return; down = true; x0 = e.clientX; s0 = rail.scrollLeft; rail.classList.add('drag'); });
  addEventListener('pointerup', () => { down = false; rail.classList.remove('drag'); });
  rail.addEventListener('pointermove', e => { if (down) rail.scrollLeft = s0 - (e.clientX - x0); });
  }
})();
