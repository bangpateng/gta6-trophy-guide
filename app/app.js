// Leonida Legend — GTA 6 trophy tracker.
// Loads app/data/trophies.json, renders one card per trophy, and keeps the
// earned ticks in localStorage. Filters (search, grade, kind, spoilers,
// missable-only, hide-earned) can also be set from the URL query string, so a
// filtered view is shareable: ?grade=silver&kind=robbery&spoilers=shown&q=bank
const KEY = 'gta6-trophy-guide-v1';
const DATA_URL = 'data/trophies.json';

const cardsEl = document.getElementById('cards');
const emptyEl = document.getElementById('empty');
const metaEl = document.getElementById('list-meta');
const progressText = document.getElementById('progress-text');
const progressPct = document.getElementById('progress-pct');
const progressFill = document.getElementById('progress-fill');
const progressSub = document.getElementById('progress-sub');
const searchInput = document.getElementById('search');
const kindSelect = document.getElementById('kind');
const spoilerBox = document.getElementById('hide-spoilers');
const missableBox = document.getElementById('missable-only');
const hideEarnedBox = document.getElementById('hide-earned');
const statusEl = document.getElementById('tool-status');

const params = new URLSearchParams(location.search);
const state = {
  grade: ['platinum', 'gold', 'silver', 'bronze'].includes(params.get('grade')) ? params.get('grade') : 'all',
  kind: params.get('kind') || 'all',
  query: params.get('q') || '',
  hideSpoilers: params.get('spoilers') === 'shown' ? false : params.get('spoilers') === 'hidden' ? true : true,
  missableOnly: params.get('missable') === '1',
  hideEarned: params.get('hide-earned') === '1',
};

let trophies = [];
let earned = new Set();

function loadEarned() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((id) => Number.isInteger(id)));
  } catch {
    return new Set();
  }
}

function saveEarned() {
  try {
    localStorage.setItem(KEY, JSON.stringify([...earned].sort((a, b) => a - b)));
  } catch {
    // Storage full or unavailable (private mode): ticks still work for this visit.
  }
}

function gradeLabel(grade) {
  return grade.charAt(0).toUpperCase() + grade.slice(1);
}

function statusLabel(status) {
  return status === 'confirmed' ? 'Confirmed' : status === 'partial' ? 'Partly confirmed' : 'Unconfirmed';
}

function kindLabel(kind) {
  const labels = {
    story: 'Story', character: 'Character strand', collectible: 'Collectible',
    activity: 'Activity', robbery: 'Robbery', combat: 'Combat',
    exploration: 'Exploration', completion: '100% completion', misc: 'Miscellaneous',
    platinum: 'Platinum',
  };
  return labels[kind] || kind;
}

function badge(text, cls) {
  const span = document.createElement('span');
  span.className = 'badge ' + cls;
  span.textContent = text;
  return span;
}

function guideSection(heading, text, cls) {
  const h = document.createElement('h4');
  h.textContent = heading;
  const p = document.createElement('p');
  if (cls) p.className = cls;
  p.textContent = text;
  return [h, p];
}

function renderCard(t) {
  const isEarned = earned.has(t.id);
  const hiddenNow = t.hidden && state.hideSpoilers && !isEarned;

  const card = document.createElement('article');
  card.className = 'card' + (isEarned ? ' earned' : '');
  card.dataset.id = String(t.id);

  const head = document.createElement('div');
  head.className = 'card-head';
  const box = document.createElement('input');
  box.type = 'checkbox';
  box.className = 'card-check';
  box.checked = isEarned;
  box.setAttribute('aria-label', 'Mark ' + t.name + ' as earned');
  box.addEventListener('change', () => {
    if (box.checked) earned.add(t.id); else earned.delete(t.id);
    saveEarned();
    if (state.hideEarned) { render(); return; }
    // Update this card in place: a full re-render would detach the node the
    // user just clicked (and drop focus/scroll), so only the progress and
    // this card's own state change here.
    card.classList.toggle('earned', box.checked);
    const badgesEl = card.querySelector('.badges');
    const earnedBadge = [...badgesEl.children].find((b) => b.textContent === 'Earned');
    if (box.checked && !earnedBadge) badgesEl.append(badge('Earned', 'status-confirmed'));
    if (!box.checked && earnedBadge) earnedBadge.remove();
    updateProgress();
  });
  const title = document.createElement('div');
  title.className = 'card-title';
  const name = document.createElement('h3');
  name.className = 'card-name';
  name.textContent = hiddenNow ? 'Hidden trophy #' + t.id : t.name;
  const desc = document.createElement('p');
  desc.className = 'card-desc';
  desc.textContent = hiddenNow ? 'Hidden until earned — the official description is a spoiler.' : t.description;
  title.append(name, desc);
  head.append(box, title);
  card.append(head);

  const badges = document.createElement('div');
  badges.className = 'badges';
  badges.append(badge(gradeLabel(t.grade), t.grade));
  if (t.kind !== 'platinum') badges.append(badge(kindLabel(t.kind), 'kind'));
  if (t.hidden) badges.append(badge('Hidden', 'hidden-badge'));
  if (t.missable) badges.append(badge('Missable', 'missable'));
  badges.append(badge(statusLabel(t.status), 'status-' + t.status));
  if (isEarned) badges.append(badge('Earned', 'status-confirmed'));
  card.append(badges);

  if (hiddenNow) {
    const note = document.createElement('p');
    note.className = 'spoiler-note';
    note.textContent = 'Spoiler hidden. Tick it earned — or turn off “Hide spoilers” above — to reveal the name, description and guide.';
    card.append(note);
    return card;
  }

  const guide = document.createElement('div');
  guide.className = 'guide';
  guide.append(...guideSection('What', t.guide.what));
  guide.append(...guideSection('How', t.guide.how));
  if (t.guide.tip) {
    const tipParts = guideSection('Tip', t.guide.tip, 'tip');
    guide.append(...tipParts);
  }
  card.append(guide);

  const src = document.createElement('p');
  src.className = 'card-sources';
  src.textContent = 'Sources: ' + t.sources.join(' · ');
  card.append(src);
  return card;
}

function matches(t) {
  if (state.grade !== 'all' && t.grade !== state.grade) return false;
  if (state.kind !== 'all' && t.kind !== state.kind) return false;
  if (state.missableOnly && !t.missable) return false;
  if (state.hideEarned && earned.has(t.id)) return false;
  if (state.query) {
    const q = state.query.toLowerCase();
    const hay = [t.name, t.description, t.guide.what, t.guide.how, t.guide.tip || '', kindLabel(t.kind)].join(' ').toLowerCase();
    if (!hay.includes(q)) return false;
  }
  return true;
}

function updateProgress() {
  const earnedCount = earned.size;
  const total = trophies.length;
  const pct = total ? Math.round((earnedCount / total) * 100) : 0;
  progressText.textContent = earnedCount + ' of ' + total + ' earned';
  progressPct.textContent = pct + '%';
  progressFill.style.width = pct + '%';
  const counts = {};
  for (const t of trophies) if (earned.has(t.id)) counts[t.grade] = (counts[t.grade] || 0) + 1;
  progressSub.textContent = 'Earned: ' + (counts.platinum || 0) + ' Platinum · ' + (counts.gold || 0) + ' Gold · ' + (counts.silver || 0) + ' Silver · ' + (counts.bronze || 0) + ' Bronze';
  metaEl.textContent = 'Showing ' + document.querySelectorAll('.card').length + ' of ' + total + ' trophies' +
    (state.hideSpoilers ? ' · spoilers hidden' : ' · spoilers shown') +
    (earnedCount ? ' · ' + earnedCount + ' ticked' : '');
}

function render() {
  const visible = trophies.filter(matches);
  cardsEl.replaceChildren(...visible.map(renderCard));
  emptyEl.hidden = visible.length > 0;
  updateProgress();
}

function syncControls() {
  document.querySelectorAll('.grade-pills button').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.grade === state.grade);
  });
  if ([...kindSelect.options].some((o) => o.value === state.kind)) kindSelect.value = state.kind;
  else kindSelect.value = 'all';
  searchInput.value = state.query;
  spoilerBox.checked = state.hideSpoilers;
  missableBox.checked = state.missableOnly;
  hideEarnedBox.checked = state.hideEarned;
}

function say(message) {
  statusEl.textContent = message;
}

function exportProgress() {
  const payload = {
    app: 'leonida-legend-gta6-trophy-guide',
    version: 1,
    exported: new Date().toISOString(),
    earned: [...earned].sort((a, b) => a - b),
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'gta6-trophy-progress.json';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  say('Exported ' + payload.earned.length + ' earned trophies.');
}

function importProgress(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(String(reader.result));
      const list = Array.isArray(parsed) ? parsed : parsed.earned;
      if (!Array.isArray(list)) throw new Error('expected a list of trophy ids');
      const validIds = new Set(trophies.map((t) => t.id));
      const good = list.filter((id) => Number.isInteger(id) && validIds.has(id));
      const bad = list.length - good.length;
      earned = new Set(good);
      saveEarned();
      render();
      say('Imported ' + good.length + ' earned trophies' + (bad ? ' (' + bad + ' entries ignored: not trophy ids)' : '') + '.');
    } catch (err) {
      say('Import failed: that file is not valid progress JSON (' + err.message + '). Nothing was changed.');
    }
  };
  reader.onerror = () => say('Import failed: the file could not be read. Nothing was changed.');
  reader.readAsText(file);
}

document.querySelectorAll('.grade-pills button').forEach((btn) => {
  btn.addEventListener('click', () => { state.grade = btn.dataset.grade; render(); syncControls(); });
});
kindSelect.addEventListener('change', () => { state.kind = kindSelect.value; render(); });
searchInput.addEventListener('input', () => { state.query = searchInput.value.trim(); render(); });
spoilerBox.addEventListener('change', () => { state.hideSpoilers = spoilerBox.checked; render(); });
missableBox.addEventListener('change', () => { state.missableOnly = missableBox.checked; render(); });
hideEarnedBox.addEventListener('change', () => { state.hideEarned = hideEarnedBox.checked; render(); });
document.getElementById('export').addEventListener('click', exportProgress);
document.getElementById('import').addEventListener('change', (event) => {
  importProgress(event.target.files[0]);
  event.target.value = '';
});
document.getElementById('reset').addEventListener('click', () => {
  if (earned.size === 0) { say('Nothing to reset — no trophies are ticked yet.'); return; }
  if (window.confirm('Clear all ' + earned.size + ' earned ticks?')) {
    earned = new Set();
    saveEarned();
    render();
    say('Progress reset.');
  }
});

earned = loadEarned();
try {
  const response = await fetch(DATA_URL);
  if (!response.ok) throw new Error('trophy data failed to load (' + response.status + ')');
  const doc = await response.json();
  if (!Array.isArray(doc.trophies) || doc.trophies.length !== 55) {
    throw new Error('trophy data is incomplete');
  }
  trophies = doc.trophies;
} catch (err) {
  cardsEl.replaceChildren();
  const p = document.createElement('p');
  p.className = 'empty';
  p.textContent = 'The trophy list could not be loaded: ' + err.message + '. Open this guide from its own folder so data/trophies.json loads.';
  cardsEl.append(p);
}
syncControls();
render();
// The browser's own jump to a #anchor fires before the trophy cards load
// and the page grows, so re-apply it once the list is rendered.
if (location.hash) {
  const target = document.querySelector(location.hash);
  if (target) {
    const top = target.getBoundingClientRect().top + window.scrollY;
    window.scrollTo(0, top);
  }
}
