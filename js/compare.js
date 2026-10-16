/* ==========================================================================
   BEN SKY TECH — Comparateur de gammes (données lues directement dans les fiches)
   ========================================================================== */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const BST = (window.BST = window.BST || {});
  const dlg = $('#compare'), chipsBox = $('#cmp-chips'), table = $('#cmp-table');
  if (!dlg || !chipsBox || !table) return;

  const ROWS = ['Idéal pour', 'Processeur', 'Mémoire', 'Stockage', 'Écran', 'Sécurité', 'Confort', 'Autonomie', 'Robustesse', 'Ventilation', 'Système', 'Image'];
  const data = $$('.gpanel').map((p) => {
    const tab = document.querySelector(`[aria-controls="${p.id}"]`);
    const specs = {};
    $$('.spec', p).forEach((sp) => { specs[$('dt', sp).textContent.trim()] = $('dd', sp).textContent.trim(); });
    specs['Idéal pour'] = $$('.gideal li', p).map((l) => l.textContent.trim()).join(', ');
    return { id: p.id, name: $('h3', p).textContent.trim(), short: tab.querySelector('b').textContent, specs };
  });
  const selected = new Set(data.map((d) => d.id));

  const el = (tag, props = {}, ...kids) => { const n = Object.assign(document.createElement(tag), props); n.append(...kids); return n; };

  const render = () => {
    chipsBox.replaceChildren(...data.map((d) => {
      const b = el('button', { type: 'button', className: 'fchipbtn', textContent: d.short });
      b.setAttribute('aria-pressed', String(selected.has(d.id)));
      b.addEventListener('click', () => {
        if (selected.has(d.id)) { if (selected.size > 2) selected.delete(d.id); else BST.toast?.('Gardez au moins deux gammes à comparer'); }
        else selected.add(d.id);
        render();
      });
      return b;
    }));
    const cols = data.filter((d) => selected.has(d.id));
    const head = el('tr', {}, el('th', { scope: 'col', textContent: 'Critère' }), ...cols.map((c) => {
      const add = el('button', { type: 'button', className: 'chipbtn' });
      add.dataset.add = c.name; add.dataset.cat = 'Ordinateurs';
      add.innerHTML = '<svg class="ico" aria-hidden="true"><use href="#i-plus"/></svg>Au devis';
      const th = el('th', { scope: 'col', textContent: c.name });
      th.append(el('small', {}, add));
      return th;
    }));
    const rows = ROWS.filter((r) => cols.some((c) => c.specs[r])).map((r) =>
      el('tr', {}, el('th', { scope: 'row', textContent: r }), ...cols.map((c) =>
        c.specs[r] ? el('td', { textContent: c.specs[r] }) : el('td', { className: 'na', textContent: '—' }))));
    table.replaceChildren(el('thead', {}, head), el('tbody', {}, ...rows));
  };

  const open = () => { if (!dlg.open) { render(); dlg.showModal(); } };
  BST.compare = { open };
  $('#open-compare')?.addEventListener('click', open);
  $('#cmp-close')?.addEventListener('click', () => dlg.close());
  dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
})();
