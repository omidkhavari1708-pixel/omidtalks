(() => {
  const root = document.documentElement;
  const fa = n => String(n).replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[d]);
  const group = n => n.toLocaleString('en-US');
  const isEn = () => root.lang === 'en';
  const num = n => (isEn() ? group(n) : fa(group(n).replace(/,/g, '٬')));
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // (11) rotating word
  const words = {
    fa: ['ایجنت هوش مصنوعی', 'سایت شخصی', 'موشن', 'برند شخصی'],
    en: ['AI agents', 'personal sites', 'motion', 'personal brands'],
  };
  const word = document.querySelector('.word');
  let wi = 0;
  const setWord = () => (word.textContent = words[isEn() ? 'en' : 'fa'][wi]);
  if (!still) setInterval(() => {
    word.classList.add('out');
    setTimeout(() => { wi = (wi + 1) % words.fa.length; setWord(); word.classList.remove('out'); }, 350);
  }, 2400);

  // (10) number tickers
  const tick = el => {
    const to = +el.dataset.to;
    if (still) { el.textContent = num(to); return; }
    const t0 = performance.now();
    const step = t => {
      const p = Math.min(1, (t - t0) / 1600);
      el.textContent = num(Math.round(to * (1 - Math.pow(1 - p, 3))));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  // reveal + one-shot effects
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('in');
    if (e.target.matches('.about-copy')) e.target.querySelectorAll('.num').forEach(tick);
    io.unobserve(e.target);
  }), { threshold: 0.2 });
  document.querySelectorAll('.rv').forEach(el => io.observe(el));

  // active link in the glass nav
  const links = [...document.querySelectorAll('.nav .links a')];
  const spy = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) links.forEach(a => a.classList.toggle('on', a.hash === `#${e.target.id}`));
  }), { rootMargin: '-45% 0px -50% 0px' });
  document.querySelectorAll('main section[id]').forEach(s => spy.observe(s));

  // laptop: map the 1000x625 screen onto the photo's screen corners (homography → matrix3d)
  const corners = [[161, 254], [801, 243], [894, 668], [257, 739]];
  const scr = document.querySelector('.scr');
  const lapIn = document.querySelector('.lap-in');
  const solve = (A, b) => {
    const n = b.length;
    for (let c = 0; c < n; c++) {
      let p = c;
      for (let r = c + 1; r < n; r++) if (Math.abs(A[r][c]) > Math.abs(A[p][c])) p = r;
      [A[c], A[p]] = [A[p], A[c]]; [b[c], b[p]] = [b[p], b[c]];
      for (let r = c + 1; r < n; r++) {
        const f = A[r][c] / A[c][c];
        for (let k = c; k < n; k++) A[r][k] -= f * A[c][k];
        b[r] -= f * b[c];
      }
    }
    const x = Array(n).fill(0);
    for (let r = n - 1; r >= 0; r--) {
      let s = b[r];
      for (let k = r + 1; k < n; k++) s -= A[r][k] * x[k];
      x[r] = s / A[r][r];
    }
    return x;
  };
  const src = [[0, 0], [1000, 0], [1000, 625], [0, 625]];
  const A = [], b = [];
  src.forEach(([x, y], i) => {
    const [u, v] = corners[i];
    A.push([x, y, 1, 0, 0, 0, -u * x, -u * y]); b.push(u);
    A.push([0, 0, 0, x, y, 1, -v * x, -v * y]); b.push(v);
  });
  const [a, bb, c, d, e2, f, g, h] = solve(A, b);
  scr.style.transform = `matrix3d(${[a, d, 0, g, bb, e2, 0, h, 0, 0, 1, 0, c, f, 0, 1].join(',')})`;
  const fit = () => (lapIn.style.transform = `scale(${lapIn.parentElement.clientWidth / 1448})`);
  new ResizeObserver(fit).observe(lapIn.parentElement);

  // copy email
  document.querySelector('.copy').addEventListener('click', async e => {
    const btn = e.currentTarget;
    try { await navigator.clipboard.writeText(btn.dataset.mail); } catch { location.href = `mailto:${btn.dataset.mail}`; return; }
    btn.classList.add('done');
    setTimeout(() => btn.classList.remove('done'), 1600);
  });

  // Tehran clock on the contact card
  const clock = document.querySelector('.clock');
  const paintClock = () => {
    const t = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Tehran' });
    clock.textContent = isEn() ? `${t} Tehran` : `${fa(t)} تهران`;
  };
  paintClock();
  setInterval(paintClock, 30000);

  // light / dark
  document.querySelector('.theme').addEventListener('click', () => {
    const t = root.dataset.theme === 'dark' ? 'light' : 'dark';
    root.dataset.theme = t;
    try { localStorage.setItem('theme', t); } catch (e) {}
    document.querySelector('meta[name=theme-color]').content = t === 'dark' ? '#0e0c0d' : '#d8d0d2';
  });

  // FA / EN
  const swap = [...document.querySelectorAll('[data-en]')];
  swap.forEach(el => (el.dataset.fa = el.innerHTML));
  const alts = [...document.querySelectorAll('[data-en-alt]')];
  alts.forEach(el => (el.dataset.faAlt = el.alt));
  const arias = [...document.querySelectorAll('[data-en-aria]')];
  arias.forEach(el => (el.dataset.faAria = el.getAttribute('aria-label')));
  document.querySelector('.lang').addEventListener('click', e => {
    const en = !isEn();
    root.lang = en ? 'en' : 'fa';
    root.dir = en ? 'ltr' : 'rtl';
    swap.forEach(el => (el.innerHTML = en ? el.dataset.en : el.dataset.fa));
    alts.forEach(el => (el.alt = en ? el.dataset.enAlt : el.dataset.faAlt));
    arias.forEach(el => el.setAttribute('aria-label', en ? el.dataset.enAria : el.dataset.faAria));
    e.currentTarget.textContent = en ? 'FA' : 'EN';
    document.title = en ? 'Omid Khavarei | AI agents, personal sites, personal brand' : 'امید خاوری | ایجنت هوش مصنوعی، سایت شخصی، برند شخصی';
    setWord(); paintClock();
    document.querySelectorAll('.about-copy.in .num').forEach(el => (el.textContent = num(+el.dataset.to)));
  });
})();
