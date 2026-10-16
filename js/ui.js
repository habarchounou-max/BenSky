/* ==========================================================================
   BEN SKY TECH — Interface : toast, inclinaison 3D, aimants, copie, assistant, points de navigation
   ========================================================================== */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const BST = (window.BST = window.BST || {});
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---------- Notifications ---------- */
  const toastEl = $('#toast');
  let tt;
  BST.toast = (msg) => {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(tt);
    tt = setTimeout(() => toastEl.classList.remove('show'), 2600);
  };

  /* ---------- Copie dans le presse-papiers ---------- */
  BST.copy = async (text) => {
    try { await navigator.clipboard.writeText(text); return true; }
    catch {
      const ta = Object.assign(document.createElement('textarea'), { value: text });
      ta.style.cssText = 'position:fixed;opacity:0'; document.body.append(ta); ta.select();
      const ok = document.execCommand?.('copy'); ta.remove(); return !!ok;
    }
  };
  document.addEventListener('click', async (e) => {
    const b = e.target.closest('[data-copy]');
    if (!b) return;
    BST.toast((await BST.copy(b.dataset.copy)) ? `Copié : ${b.dataset.copy}` : 'Copie impossible sur cet appareil');
  });

  /* ---------- Inclinaison 3D avec reflet ---------- */
  if (fine && !reduce) {
    $$('[data-tilt]').forEach((el) => {
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        el.style.setProperty('--ry', ((x - .5) * 10).toFixed(2) + 'deg');
        el.style.setProperty('--rx', ((.5 - y) * 10).toFixed(2) + 'deg');
        el.style.setProperty('--gx', (x * 100).toFixed(0) + '%');
        el.style.setProperty('--gy', (y * 100).toFixed(0) + '%');
      });
      el.addEventListener('pointerleave', () => ['--rx', '--ry'].forEach((k) => el.style.removeProperty(k)));
    });

    /* ---------- Boutons « aimant » ---------- */
    $$('[data-magnetic]').forEach((el) => {
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        const dx = (e.clientX - (r.left + r.width / 2)) * .22, dy = (e.clientY - (r.top + r.height / 2)) * .3;
        el.style.translate = `${dx.toFixed(1)}px ${dy.toFixed(1)}px`;
      });
      el.addEventListener('pointerleave', () => { el.style.translate = ''; });
    });
  }

  /* ---------- Points de navigation latéraux ---------- */
  const dots = $$('.dotnav a');
  if (dots.length && 'IntersectionObserver' in window) {
    const map = new Map(dots.map((a) => [a.getAttribute('href').slice(1), a]));
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        dots.forEach((d) => d.classList.remove('active'));
        map.get(en.target.id)?.classList.add('active');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    map.forEach((_, id) => { const t = document.getElementById(id); t && io.observe(t); });
  }

  /* ---------- Assistant : « Quel équipement pour vous ? » ---------- */
  const chipsBox = $('#finder-chips');
  const result = $('#finder-result');
  if (chipsBox && result && BST.tabs) {
    const entries = [];
    $$('.gpanel').forEach((panel) => {
      const tab = BST.tabs.find((t) => t.getAttribute('aria-controls') === panel.id);
      $$('.gideal li', panel).forEach((li) => entries.push({ role: li.textContent.trim(), panel, tab }));
    });
    entries.forEach((en) => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'fchipbtn'; b.textContent = en.role; b.setAttribute('aria-pressed', 'false');
      b.addEventListener('click', () => {
        $$('.fchipbtn', chipsBox).forEach((c) => c.setAttribute('aria-pressed', String(c === b)));
        show(en);
      });
      chipsBox.append(b);
    });

    const show = ({ role, panel, tab }) => {
      const name = $('h3', panel).textContent;
      const img = $('.shot img', panel);
      result.hidden = false;
      result.replaceChildren();
      const fig = Object.assign(document.createElement('div'), { className: 'fr-img' });
      const im = Object.assign(document.createElement('img'), { src: img.getAttribute('src'), alt: '', width: 640, height: 480 });
      fig.append(im);
      const txt = Object.assign(document.createElement('div'), { className: 'fr-txt' });
      const k = Object.assign(document.createElement('p'), { className: 'fr-k', textContent: `Pour « ${role} », nous recommandons` });
      const h = Object.assign(document.createElement('h4'), { textContent: name });
      const tg = Object.assign(document.createElement('p'), { className: 'fr-tag', textContent: $('.gtag', panel).textContent });
      const ds = Object.assign(document.createElement('p'), { textContent: $('.gdesc', panel).textContent });
      ds.style.cssText = 'margin-top:8px;color:var(--muted);font-weight:300';
      const act = Object.assign(document.createElement('div'), { className: 'fr-act' });
      const see = Object.assign(document.createElement('button'), { type: 'button', className: 'btn btn-primary btn-sm', textContent: 'Voir la gamme' });
      see.addEventListener('click', () => {
        BST.selectTab(tab);
        $('#showcase').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
      });
      const add = Object.assign(document.createElement('button'), { type: 'button', className: 'btn btn-ghost btn-sm', textContent: 'Ajouter au devis' });
      add.dataset.add = name; add.dataset.cat = 'Ordinateurs';
      act.append(see, add);
      txt.append(k, h, tg, ds, act);
      result.append(fig, txt);
    };
  }

  /* ---------- Parallaxe de la scène produit ---------- */
  if (fine && !reduce) {
    $$('.gstage').forEach((st) => {
      st.addEventListener('pointermove', (e) => {
        const r = st.getBoundingClientRect();
        st.style.setProperty('--px', (((e.clientX - r.left) / r.width) * 2 - 1).toFixed(3));
        st.style.setProperty('--py', (((e.clientY - r.top) / r.height) * 2 - 1).toFixed(3));
      });
      st.addEventListener('pointerleave', () => { st.style.setProperty('--px', 0); st.style.setProperty('--py', 0); });
    });
  }

  /* ---------- Bandeau des marques : la vitesse suit le défilement ---------- */
  if (!reduce) {
    const anims = $$('.mtrack').map((t) => t.getAnimations()[0]).filter(Boolean);
    if (anims.length) {
      let lastY = scrollY, rate = 1, target = 1, raf = 0;
      const tick = () => {
        const dir = Math.sign(target) || 1;
        target += (dir - target) * .04;
        rate += (target - rate) * .08;
        anims.forEach((a) => { a.playbackRate = rate; });
        raf = Math.abs(rate - dir) > .02 ? requestAnimationFrame(tick) : 0;
      };
      addEventListener('scroll', () => {
        const dy = scrollY - lastY; lastY = scrollY;
        if (Math.abs(dy) < 2) return;
        target = Math.sign(dy) * Math.min(1 + Math.abs(dy) * .18, 7);
        if (!raf) raf = requestAnimationFrame(tick);
      }, { passive: true });
    }
  }
})();
