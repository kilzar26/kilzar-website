(() => {
  'use strict';
  const KEY = 'krai-casebook-v1';
  const form = document.querySelector('#case-form');
  const list = document.querySelector('#case-list');
  const count = document.querySelector('#count');
  const status = document.querySelector('#save-status');
  const pilotForm = document.querySelector('form[name="casebook-pilot"]');
  const referral = new URLSearchParams(location.search).get('source');
  const knownReferrals = ['after-repair-guide', 'repair-history-guide', 'intermittent-guide'];
  if (pilotForm && knownReferrals.includes(referral)) pilotForm.elements.referral_source.value = referral;
  const allowedSources = ['Owner observation', 'Scan tool reading', 'Technician observation', 'Service record'];
  const fields = ['year', 'make', 'model', 'mileage', 'concern', 'beforeNote', 'beforeCodes', 'source', 'action', 'afterCodes', 'afterNote'];
  let cases = [];

  function load() {
    try {
      const data = JSON.parse(localStorage.getItem(KEY) || '[]');
      cases = Array.isArray(data) ? data.filter(validCase).slice(0, 200) : [];
    } catch (_) { cases = []; }
  }
  function validCase(c) {
    return c && typeof c.id === 'string' && c.id.length < 100 &&
      typeof c.concern === 'string' && c.concern.length <= 180 &&
      typeof c.make === 'string' && c.make.length <= 80 &&
      typeof c.model === 'string' && c.model.length <= 80 &&
      fields.every(k => typeof c[k] === 'string' && c[k].length <= 3000) &&
      typeof c.verified === 'boolean' && typeof c.afterScan === 'boolean';
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(cases)); return true; }
    catch (_) { status.textContent = 'Storage is full or blocked. Export your records now.'; return false; }
  }
  const text = (tag, value, className) => {
    const el = document.createElement(tag);
    el.textContent = value || '';
    if (className) el.className = className;
    return el;
  };
  function codes(raw) {
    return [...new Set((raw.toUpperCase().match(/\b[PBCU][0-3][0-9A-F]{3}\b/g) || []))].sort();
  }
  function comparison(c) {
    const before = codes(c.beforeCodes);
    const after = codes(c.afterCodes);
    if (!c.afterScan) return {pending: true, lines: ['Follow-up code scan not documented.']};
    return {pending: !c.verified, lines: [
      before.filter(x => !after.includes(x)).length ? 'Previously recorded, absent on follow-up scan: ' + before.filter(x => !after.includes(x)).join(', ') : 'No previously recorded codes shown as absent.',
      after.filter(x => !before.includes(x)).length ? 'Newly recorded on follow-up scan: ' + after.filter(x => !before.includes(x)).join(', ') : 'No newly recorded codes.',
      before.filter(x => after.includes(x)).length ? 'Still recorded: ' + before.filter(x => after.includes(x)).join(', ') : 'No matching codes still recorded.',
      c.verified ? 'Follow-up check documented by user. Review the observation and conditions.' : 'Repair outcome not verified. A code comparison is not proof of repair.'
    ]};
  }
  function caseButton(label, action, id) {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'quiet'; b.textContent = label;
    b.dataset.action = action; b.dataset.id = id;
    return b;
  }
  function render() {
    count.textContent = String(cases.length);
    list.replaceChildren();
    if (!cases.length) {
      list.append(text('p', 'No cases yet. Record one on the left to see the before and after comparison.', 'empty'));
      return;
    }
    [...cases].reverse().forEach(c => {
      const item = document.createElement('article');
      item.className = 'case-item'; item.dataset.id = c.id;
      item.append(text('span', new Date(c.createdAt).toLocaleDateString() + (c.mileage ? ' · ' + c.mileage + ' mi' : ''), 'meta'));
      item.append(text('h3', [c.year, c.make, c.model].filter(Boolean).join(' ')));
      item.append(text('p', c.concern));
      const chips = document.createElement('div'); chips.className = 'chips';
      chips.append(text('span', c.source, 'chip'));
      chips.append(text('span', c.verified ? 'Follow-up documented' : 'Verification pending', 'chip' + (c.verified ? '' : ' pending')));
      item.append(chips);
      const detail = document.createElement('div'); detail.className = 'comparison';
      detail.append(text('strong', 'Before → after'));
      detail.append(text('p', 'Before: ' + (c.beforeNote || 'No observation recorded') + (c.beforeCodes ? ' · Codes: ' + c.beforeCodes : '')));
      detail.append(text('p', 'Action: ' + (c.action || 'Not recorded')));
      detail.append(text('p', 'After: ' + (c.afterNote || 'No observation recorded') + (c.afterScan ? ' · Codes: ' + (c.afterCodes || 'none recorded') : '')));
      const diff = comparison(c), ul = document.createElement('ul');
      diff.lines.forEach(line => ul.append(text('li', line)));
      detail.append(ul); item.append(detail);
      const actions = document.createElement('div'); actions.className = 'case-actions';
      actions.append(caseButton('Edit', 'edit', c.id), caseButton('Print case', 'print', c.id), caseButton('Delete', 'delete', c.id));
      item.append(actions); list.append(item);
    });
  }
  function readForm() {
    const data = new FormData(form), c = {};
    fields.forEach(k => c[k] = String(data.get(k) || '').trim());
    c.verified = data.has('verified'); c.afterScan = data.has('afterScan');
    return c;
  }
  form.addEventListener('submit', event => {
    event.preventDefault();
    const c = readForm();
    if (!allowedSources.includes(c.source)) return;
    if (c.afterCodes && !c.afterScan) { status.textContent = 'Mark that a follow-up scan was performed.'; return; }
    if (c.verified && !c.afterNote) { status.textContent = 'Describe the follow-up conditions before marking verified.'; return; }
    if (c.year.length !== 4 || +c.year < 1900 || +c.year > new Date().getFullYear() + 1) { status.textContent = 'Enter a valid vehicle year.'; return; }
    const existing = cases.find(x => x.id === form.dataset.editId);
    c.id = existing ? existing.id : (crypto.randomUUID ? crypto.randomUUID() : Date.now() + '-' + Math.random());
    c.createdAt = existing ? existing.createdAt : new Date().toISOString();
    c.updatedAt = new Date().toISOString();
    if (!validCase(c)) { status.textContent = 'A field is too long. Shorten the note and try again.'; return; }
    if (existing) cases[cases.indexOf(existing)] = c;
    else if (cases.length < 200) cases.push(c);
    else { status.textContent = '200-case local limit reached. Export your backup.'; return; }
    if (save()) { form.reset(); delete form.dataset.editId; document.querySelector('#editor-title').textContent = 'New vehicle case'; status.textContent = 'Saved on this device'; render(); }
  });
  document.querySelector('#new-case').addEventListener('click', () => {
    form.reset(); delete form.dataset.editId;
    document.querySelector('#editor-title').textContent = 'New vehicle case';
    status.textContent = 'Form cleared. Saved cases remain below.';
  });
  list.addEventListener('click', e => {
    const b = e.target.closest('button[data-action]');
    if (!b) return;
    const c = cases.find(x => x.id === b.dataset.id);
    if (!c) return;
    if (b.dataset.action === 'edit') {
      fields.forEach(k => form.elements[k].value = c[k]);
      form.elements.verified.checked = c.verified; form.elements.afterScan.checked = c.afterScan;
      form.dataset.editId = c.id;
      document.querySelector('#editor-title').textContent = 'Edit vehicle case';
      form.scrollIntoView({behavior: 'smooth', block: 'start'});
    } else if (b.dataset.action === 'delete') {
      if (!confirm('Delete this case from this device? Export a backup first if needed.')) return;
      cases = cases.filter(x => x.id !== c.id);
      if (save()) render();
    } else if (b.dataset.action === 'print') {
      const item = b.closest('.case-item');
      item.classList.add('selected'); document.body.classList.add('print-one');
      const clean = () => { item.classList.remove('selected'); document.body.classList.remove('print-one'); };
      window.addEventListener('afterprint', clean, {once: true});
      window.print();
      setTimeout(clean, 30000);
    }
  });
  document.querySelector('#export-all').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify({format: KEY, exportedAt: new Date().toISOString(), cases}, null, 2)], {type: 'application/json'});
    const url = URL.createObjectURL(blob), a = document.createElement('a');
    a.href = url; a.download = 'KRAI-Casebook-backup-' + new Date().toISOString().slice(0, 10) + '.json';
    a.click(); setTimeout(() => URL.revokeObjectURL(url), 2000);
  });
  document.querySelector('#import-open').addEventListener('click', () => document.querySelector('#import-file').click());
  document.querySelector('#import-file').addEventListener('change', async e => {
    const file = e.target.files[0]; e.target.value = '';
    if (!file) return;
    if (file.size > 1500000) { alert('Backup is too large.'); return; }
    try {
      const data = JSON.parse(await file.text());
      if (data.format !== KEY || !Array.isArray(data.cases) || data.cases.length > 200 || !data.cases.every(validCase)) throw Error('Invalid or unsupported backup');
      if (!confirm('Replace all cases on this device with ' + data.cases.length + ' imported cases? Export first if needed.')) return;
      const old = cases; cases = data.cases;
      if (!save()) cases = old;
      render();
    } catch (err) { alert('Could not import: ' + err.message); }
  });
  load(); render();
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(() => {});
})();
