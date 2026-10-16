/* ==========================================================================
   BEN SKY TECH — Recherche rapide (Ctrl/⌘ + K ou « / »)
   ========================================================================== */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const BST = (window.BST = window.BST || {});
  const dlg = $('#palette');
  const input = $('#pal-input');
  const listEl = $('#pal-list');
  if (!dlg || !input || !listEl) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const goTo = (sel) => { const el = $(sel); el?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' }); };
  const norm = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

  const build = () => {
    const sections = [
      ['Accueil', '#top', 'building'], ['À propos', '#apropos', 'users'], ['Nos activités', '#services', 'box'],
      ['Nos équipements', '#equipements', 'laptop'], ['Imprimantes et multifonctions', '#imprimantes', 'printer'],
      ['Notre méthode', '#methode', 'rocket'], ['Nos moyens', '#moyens', 'globe'],
      ['Partenaires et références', '#references', 'award'], ['Contact et devis', '#contact', 'mail'],
    ].map(([label, sel, icon]) => ({ group: 'Aller à', label, icon, hint: 'Section', run: () => goTo(sel) }));

    const gammes = (BST.tabs || []).map((tab) => ({
      group: 'Gammes d’ordinateurs', label: `${tab.querySelector('b').textContent} — ${tab.querySelector('small').textContent}`,
      icon: 'laptop', hint: 'Gamme', run: () => { BST.selectTab(tab); goTo('#showcase'); },
    }));

    const actions = [
      { label: 'Basculer le thème clair / sombre', icon: 'moon', hint: 'Action', run: () => $('#theme')?.click() },
      { label: 'Comparer les gammes d’ordinateurs', icon: 'layers', hint: 'Action', run: () => BST.compare?.open() },
      { label: 'Ouvrir mon devis', icon: 'list', hint: 'Action', run: () => BST.quote?.open() },
      { label: 'Appeler le (+235) 66 67 27 25', icon: 'phone', hint: 'Contact', run: () => { location.href = 'tel:+23566672725'; } },
      { label: 'Appeler le (+235) 92 66 10 46', icon: 'phone', hint: 'Contact', run: () => { location.href = 'tel:+23592661046'; } },
      { label: 'Écrire à support@benskytech.com', icon: 'mail', hint: 'Contact', run: () => { location.href = 'mailto:support@benskytech.com'; } },
      { label: 'Copier l’adresse e-mail', icon: 'copy', hint: 'Action', run: async () => BST.toast?.((await BST.copy?.('support@benskytech.com')) ? 'Copié : support@benskytech.com' : 'Copie impossible') },
    ].map((a) => ({ group: 'Actions', ...a }));
    return [...sections, ...gammes, ...actions];
  };

  let all = [], shown = [], active = 0;

  const render = () => {
    const q = norm(input.value.trim());
    const words = q.split(/\s+/).filter(Boolean);
    shown = all.filter((it) => words.every((w) => norm(it.label + ' ' + it.group).includes(w)));
    active = 0;
    listEl.replaceChildren();
    if (!shown.length) {
      const li = Object.assign(document.createElement('li'), { className: 'pal-empty', textContent: 'Aucun résultat. Essayez « imprimante », « contact » ou « Dell ».' });
      listEl.append(li); return;
    }
    let lastGroup = '';
    shown.forEach((it, i) => {
      if (it.group !== lastGroup) {
        lastGroup = it.group;
        listEl.append(Object.assign(document.createElement('li'), { className: 'pal-group', textContent: it.group, role: 'presentation' }));
      }
      const li = document.createElement('li');
      li.className = 'pal-item'; li.role = 'option'; li.id = 'pal-' + i;
      li.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
      li.innerHTML = `<svg class="ico" aria-hidden="true"><use href="#i-${it.icon}"/></svg>`;
      li.append(Object.assign(document.createElement('span'), { textContent: it.label }), Object.assign(document.createElement('small'), { textContent: it.hint }));
      li.addEventListener('click', () => run(it));
      li.addEventListener('pointermove', () => select(i, false));
      listEl.append(li);
    });
  };

  const select = (i, scroll = true) => {
    active = (i + shown.length) % shown.length;
    [...listEl.querySelectorAll('.pal-item')].forEach((el, k) => el.setAttribute('aria-selected', String(k === active)));
    if (scroll) document.getElementById('pal-' + active)?.scrollIntoView({ block: 'nearest' });
  };

  const run = (it) => { dlg.close(); setTimeout(it.run, 120); };

  const open = () => {
    if (dlg.open) return;
    all = build(); input.value = ''; render(); dlg.showModal(); input.focus();
  };

  input.addEventListener('input', render);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); select(active + 1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); select(active - 1); }
    else if (e.key === 'Enter' && shown[active]) { e.preventDefault(); run(shown[active]); }
  });
  dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
  $('#open-palette')?.addEventListener('click', open);

  document.addEventListener('keydown', (e) => {
    const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName || '');
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); dlg.open ? dlg.close() : open(); }
    else if (e.key === '/' && !typing && !dlg.open) { e.preventDefault(); open(); }
  });
})();
