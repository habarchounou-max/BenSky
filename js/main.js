/* ==========================================================================
   BEN SKY TECH — Interactions
   JavaScript moderne (ES2022), sans dépendance, fonctionne aussi en ouverture locale.
   ========================================================================== */
(() => {
  'use strict';

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const root = document.documentElement;
  const BST = (window.BST = window.BST || {});

  /* ---------- Année du pied de page ---------- */
  const year = $('#year');
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- Thème clair / sombre ---------- */
  const themeBtn = $('#theme');
  const syncThemeBtn = () => {
    const dark = root.dataset.theme === 'dark';
    themeBtn?.setAttribute('aria-pressed', String(dark));
    themeBtn?.setAttribute('aria-label', dark ? 'Passer en thème clair' : 'Passer en thème sombre');
  };
  themeBtn?.addEventListener('click', () => {
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next;
    try { localStorage.setItem('bst-theme', next); } catch { /* stockage indisponible */ }
    syncThemeBtn();
  });
  syncThemeBtn();

  /* ---------- Menu mobile ---------- */
  const burger = $('#burger');
  const nav = $('#nav');
  const setMenu = (open) => {
    nav.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
  };
  burger?.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
  $$('a', nav).forEach((a) => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });
  matchMedia('(min-width: 1101px)').addEventListener('change', () => setMenu(false));

  /* ---------- Défilement : en-tête, progression, retour en haut ---------- */
  const header = $('.site-header');
  const bar = $('.progress');
  const toTop = $('#to-top');
  const steps = $('#steps');
  const stepItems = $$('.step', steps || document);
  const methode = $('#methode');
  const scenes = $$('.mstage .scene');
  const mdots = $$('.mdots i');
  const statement = $('.statement');
  const stmtEl = $('#stmt');
  const noScrub = reduceMotion;
  if (noScrub) statement?.classList.add('no-scrub');
  const swords = [];
  if (stmtEl) {
    const wrapWords = (src, dst) => [...src.childNodes].forEach((ch) => {
      if (ch.nodeType === 3) {
        ch.textContent.split(/(\s+)/).forEach((tok) => {
          if (!tok) return;
          if (/^\s+$/.test(tok)) { dst.append(document.createTextNode(' ')); return; }
          const w = Object.assign(document.createElement('span'), { className: 'sw', textContent: tok }); swords.push(w); dst.append(w);
        });
      } else { const c = ch.cloneNode(false); dst.append(c); wrapWords(ch, c); }
    });
    const frag = document.createDocumentFragment();
    wrapWords(stmtEl, frag);
    stmtEl.setAttribute('aria-label', stmtEl.textContent.replace(/\s+/g, ' ').trim());
    stmtEl.replaceChildren(frag);
  }
  let ticking = false;

  const onScroll = () => {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - innerHeight;
    header.classList.toggle('scrolled', y > 8);
    bar.style.setProperty('--p', max > 0 ? (y / max).toFixed(4) : 0);
    toTop.classList.toggle('show', y > innerHeight * 0.8);

    if (steps && methode) {
      const r = steps.getBoundingClientRect();
      const line = innerHeight * 0.55;
      steps.style.setProperty('--p', clamp(line - r.top - 8, 0, r.height - 16).toFixed(0) + 'px');
      let idx = 0;
      stepItems.forEach((st, i) => {
        const on = st.getBoundingClientRect().top < line;
        st.classList.toggle('active', on || i === 0 && r.top < innerHeight);
        if (on) idx = i;
      });
      scenes.forEach((sc, i) => sc.classList.toggle('on', i === idx));
      mdots.forEach((d, i) => d.classList.toggle('on', i === idx));
    }
    if (statement) {
      const r = statement.getBoundingClientRect();
      const total = Math.max(1, r.height - innerHeight);
      const prog = noScrub ? 1 : clamp((-r.top + innerHeight * 0.1) / (total * 0.82), 0, 1);
      const n = Math.round(prog * (swords.length + 1));
      swords.forEach((w, i) => w.classList.toggle('lit', i < n));
    }
    ticking = false;
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  addEventListener('resize', onScroll, { passive: true });
  onScroll();
  toTop?.addEventListener('click', () => scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }));

  /* ---------- Lien actif dans la navigation ---------- */
  const links = $$('.nav a');
  const targets = links.map((a) => $(a.getAttribute('href'))).filter(Boolean);
  if ('IntersectionObserver' in window) {
    const navIO = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        const id = en.target.id || 'contact';
        links.forEach((a) => a.classList.toggle('active', a.getAttribute('href') === '#' + id));
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    targets.forEach((t) => navIO.observe(t));
    const foot = $('.footer'); if (foot) navIO.observe(foot);
  }

  /* ---------- Titres découpés en mots (animation d'entrée) ---------- */
  const splitWords = (el) => {
    let i = 0;
    const label = el.innerHTML.replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
    const word = (node) => {
      const w = document.createElement('span'); w.className = 'w'; w.setAttribute('aria-hidden', 'true');
      const wi = document.createElement('span'); wi.className = 'wi'; wi.style.setProperty('--i', i++);
      wi.append(node); w.append(wi); return w;
    };
    const walk = (src, dst) => {
      [...src.childNodes].forEach((ch) => {
        if (ch.nodeType === 3) {
          ch.textContent.split(/(\s+)/).forEach((tok) => {
            if (!tok) return;
            dst.append(/^\s+$/.test(tok) ? document.createTextNode(' ') : word(document.createTextNode(tok)));
          });
        } else if (ch.nodeName === 'BR') {
          dst.append(ch.cloneNode());
        } else if (ch.classList?.contains('nw')) {
          dst.append(word(ch.cloneNode(true)));
        } else {
          const c = ch.cloneNode(false); c.setAttribute('aria-hidden', 'true'); dst.append(c); walk(ch, c);
        }
      });
    };
    const frag = document.createDocumentFragment();
    walk(el, frag);
    el.setAttribute('aria-label', label);
    el.replaceChildren(frag);
  };
  $$('[data-split]').forEach(splitWords);

  /* ---------- Apparition au défilement + intro ---------- */
  const startReveals = () => {
    const els = $$('.reveal, [data-split]');
    if ('IntersectionObserver' in window && !reduceMotion) {
      const io = new IntersectionObserver((entries, obs) => {
        entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('in'); obs.unobserve(en.target); } });
      }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
      els.forEach((el) => io.observe(el));
    } else {
      els.forEach((el) => el.classList.add('in'));
    }
  };

  const loader = $('#loader');
  if (root.classList.contains('loading') && loader) {
    const t0 = performance.now();
    const finish = () => {
      const wait = Math.max(0, 1100 - (performance.now() - t0));
      setTimeout(() => {
        loader.classList.add('done');
        try { sessionStorage.setItem('bst-seen', '1'); } catch { /* ignoré */ }
        setTimeout(startReveals, 320);
        setTimeout(() => root.classList.remove('loading'), 1000);
      }, wait);
    };
    document.readyState === 'complete' ? finish() : addEventListener('load', finish, { once: true });
  } else {
    startReveals();
  }

  /* ---------- Onglets des gammes (clavier accessible) ---------- */
  const tabs = $$('.gtab');
  const panels = $$('.gpanel');
  const selectTab = (tab, focus = false) => {
    tabs.forEach((t) => {
      const on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
    });
    panels.forEach((p) => { p.hidden = p.id !== tab.getAttribute('aria-controls'); });
    if (focus) tab.focus();
    // sur mobile, garde l'onglet visible dans la bande défilante
    tab.scrollIntoView?.({ inline: 'center', block: 'nearest', behavior: reduceMotion ? 'auto' : 'smooth' });
  };
  BST.tabs = tabs; BST.selectTab = selectTab;
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => selectTab(tab));
    tab.addEventListener('keydown', (e) => {
      const keys = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 };
      if (e.key in keys) { e.preventDefault(); selectTab(tabs[(i + keys[e.key] + tabs.length) % tabs.length], true); }
      if (e.key === 'Home') { e.preventDefault(); selectTab(tabs[0], true); }
      if (e.key === 'End') { e.preventDefault(); selectTab(tabs.at(-1), true); }
    });
  });

  /* ---------- Spotlight qui suit le curseur ---------- */
  $$('.spot').forEach((el) => {
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--x', (e.clientX - r.left).toFixed(0) + 'px');
      el.style.setProperty('--y', (e.clientY - r.top).toFixed(0) + 'px');
    });
  });

  /* ---------- Hero : parallaxe douce des cartes ---------- */
  const visual = $('.hero-visual');
  const cards = $$('.fcard', visual || document);
  cards.forEach((c) => c.style.setProperty('--depth', c.dataset.depth || 0));
  const pointer = { x: -9999, y: -9999, active: false };

  if (visual && !reduceMotion && matchMedia('(hover: hover)').matches) {
    const hero = $('.hero');
    hero.addEventListener('pointermove', (e) => {
      const r = hero.getBoundingClientRect();
      visual.style.setProperty('--mx', (((e.clientX - r.left) / r.width) * 2 - 1).toFixed(3));
      visual.style.setProperty('--my', (((e.clientY - r.top) / r.height) * 2 - 1).toFixed(3));
    });
    hero.addEventListener('pointerleave', () => { visual.style.setProperty('--mx', 0); visual.style.setProperty('--my', 0); });
  }

  /* ---------- Formulaire de devis : prépare un e-mail prêt à envoyer ---------- */
  const form = $('#form');
  const status = $('#form-status');
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const v = (k) => String(fd.get(k) || '').trim();
    const email = v('email');
    const ok = v('nom') && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && v('msg');
    status.classList.toggle('err', !ok);
    if (!ok) {
      status.textContent = 'Merci de renseigner votre nom, un e-mail valide et votre message.';
      form.reportValidity?.();
      return;
    }
    const subject = `Demande de devis — ${v('besoin')}`;
    const body = [
      'Bonjour l’équipe Ben Sky Tech,', '',
      v('msg'), '',
      '— — —',
      `Nom : ${v('nom')}`,
      v('org') ? `Organisation : ${v('org')}` : null,
      `E-mail : ${email}`,
      v('tel') ? `Téléphone : ${v('tel')}` : null,
      `Besoin : ${v('besoin')}`,
    ].filter((l) => l !== null).join('\n');
    const extra = BST.quote?.text?.();
    const fullBody = extra ? `${body}\n\n${extra}` : body;
    status.textContent = 'Votre messagerie va s’ouvrir avec le message prêt à envoyer. Merci !';
    location.href = `mailto:support@benskytech.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(fullBody)}`;
  });

  /* ---------- Mode hors ligne (service worker) ---------- */
  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
    addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
  }
})();
