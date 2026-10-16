/* ==========================================================================
   BEN SKY TECH — Constructeur de devis (liste enregistrée dans le navigateur)
   ========================================================================== */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const BST = (window.BST = window.BST || {});
  const KEY = 'bst-quote';

  const drawer = $('#drawer');
  const list = $('#q-list');
  const empty = $('#q-empty');
  const foot = $('#q-foot');
  const badge = $('#qcount');
  if (!drawer || !list) return;

  let items = [];
  try { items = JSON.parse(localStorage.getItem(KEY) || '[]').filter((i) => i && i.name); } catch { items = []; }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(items)); } catch { /* ignoré */ } };
  const total = () => items.reduce((n, i) => n + i.qty, 0);

  const text = () => {
    if (!items.length) return '';
    return ['Équipements et services souhaités :', ...items.map((i) => `- ${i.qty} × ${i.name} (${i.cat})`)].join('\n');
  };

  const render = () => {
    const n = total();
    badge.hidden = n === 0;
    badge.textContent = n;
    empty.hidden = items.length > 0;
    foot.hidden = items.length === 0;
    list.replaceChildren(...items.map((it, idx) => {
      const li = document.createElement('li'); li.className = 'q-item';
      const info = document.createElement('div');
      const b = Object.assign(document.createElement('b'), { textContent: it.name });
      const sm = Object.assign(document.createElement('small'), { textContent: it.cat });
      info.append(b, sm);
      const step = document.createElement('div'); step.className = 'q-step';
      const minus = Object.assign(document.createElement('button'), { type: 'button', ariaLabel: `Retirer une unité de ${it.name}` });
      minus.innerHTML = '<svg class="ico" aria-hidden="true"><use href="#i-minus"/></svg>';
      const qty = Object.assign(document.createElement('span'), { textContent: it.qty });
      const plus = Object.assign(document.createElement('button'), { type: 'button', ariaLabel: `Ajouter une unité de ${it.name}` });
      plus.innerHTML = '<svg class="ico" aria-hidden="true"><use href="#i-plus"/></svg>';
      minus.addEventListener('click', () => change(idx, -1));
      plus.addEventListener('click', () => change(idx, +1));
      step.append(minus, qty, plus);
      const rm = Object.assign(document.createElement('button'), { type: 'button', className: 'q-rm', ariaLabel: `Supprimer ${it.name}` });
      rm.innerHTML = '<svg class="ico" aria-hidden="true"><use href="#i-trash"/></svg>';
      rm.addEventListener('click', () => { items.splice(idx, 1); save(); render(); });
      li.append(info, step, rm);
      return li;
    }));
    syncFormNote();
  };

  const change = (idx, d) => {
    items[idx].qty = Math.min(999, items[idx].qty + d);
    if (items[idx].qty <= 0) items.splice(idx, 1);
    save(); render();
  };

  const add = (name, cat) => {
    const found = items.find((i) => i.name === name);
    found ? found.qty++ : items.push({ name, cat: cat || 'Divers', qty: 1 });
    save(); render();
    badge.classList.remove('bump'); void badge.offsetWidth; badge.classList.add('bump');
    BST.toast?.(`Ajouté au devis : ${name}`);
  };

  const open = () => { if (!drawer.open) drawer.showModal(); };
  const close = () => drawer.open && drawer.close();

  /* ---------- Événements ---------- */
  document.addEventListener('click', (e) => {
    const a = e.target.closest('[data-add]');
    if (a) { add(a.dataset.add, a.dataset.cat); }
  });
  $('#open-quote')?.addEventListener('click', open);
  $('#drawer-close')?.addEventListener('click', close);
  drawer.addEventListener('click', (e) => { if (e.target === drawer) close(); });

  $('#q-clear')?.addEventListener('click', () => { items = []; save(); render(); BST.toast?.('Liste vidée'); });
  $('#q-copy')?.addEventListener('click', async () => {
    BST.toast?.((await BST.copy?.(text())) ? 'Liste copiée' : 'Copie impossible');
  });
  $('#q-send')?.addEventListener('click', () => {
    const body = `Bonjour l’équipe Ben Sky Tech,\n\nJe souhaite recevoir un devis.\n\n${text()}\n\nMerci de me contacter.`;
    location.href = `mailto:support@benskytech.com?subject=${encodeURIComponent('Demande de devis')}&body=${encodeURIComponent(body)}`;
  });
  $('#q-form')?.addEventListener('click', () => {
    const msg = $('#form textarea[name="msg"]');
    if (msg && !msg.value.includes('Équipements et services souhaités')) msg.value = (msg.value ? msg.value + '\n\n' : '') + text();
    close();
    $('#contact')?.scrollIntoView({ behavior: 'smooth' });
  });

  /* Rappel du devis au-dessus du formulaire */
  const note = $('#form-quote');
  function syncFormNote() {
    if (!note) return;
    note.hidden = items.length === 0;
    if (!items.length) return;
    note.textContent = `Votre devis contient ${total()} article${total() > 1 ? 's' : ''} : il sera ajouté automatiquement à votre message.`;
    const b = Object.assign(document.createElement('button'), { type: 'button', textContent: 'Modifier' });
    b.addEventListener('click', open);
    note.append(b);
  }

  BST.quote = { text, open, add };
  render();
})();
