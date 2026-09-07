// ============================================================
// Research History & Local Storage Shelf
// ============================================================

const RECENT_ROOTS_KEY = 'qcl-recent-roots';

function readRootList(key) {
  try {
    const roots = JSON.parse(localStorage.getItem(key));
    return Array.isArray(roots) ? roots.filter(root => typeof root === 'string') : [];
  } catch (e) {
    return [];
  }
}

function writeRootList(key, roots) {
  try {
    localStorage.setItem(key, JSON.stringify(roots));
  } catch (e) {
    /* storage unavailable */
  }
}

function renderRootChips(containerId, roots, emptyText) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';
  if (!roots.length) {
    const text = document.createElement('span');
    text.className = 'try-label';
    text.textContent = emptyText;
    container.appendChild(text);
    return;
  }
  roots.forEach(root => {
    const button = document.createElement('button');
    button.className = 'shelf-root';
    button.type = 'button';
    button.dir = 'rtl';
    button.textContent = root;
    button.addEventListener('click', () => trySampleRoot(root));
    container.appendChild(button);
  });
}

function renderResearchShelf() {
  const recent = readRootList(RECENT_ROOTS_KEY);
  const shelf = document.getElementById('researchShelf');
  if (!shelf) return;
  shelf.hidden = !recent.length;
  renderRootChips('recentRoots', recent, 'No recent roots yet.');
}

function recordRecentRoot(root) {
  const roots = readRootList(RECENT_ROOTS_KEY).filter(item => item !== root);
  roots.unshift(root);
  writeRootList(RECENT_ROOTS_KEY, roots.slice(0, 8));
  renderResearchShelf();
}

function exportResearchHistory() {
  const roots = readRootList(RECENT_ROOTS_KEY);
  if (!roots.length) {
    alert('Your research history is empty.');
    return;
  }
  const markdown = `# Recent Qur’anic Arabic Root Research\n\n${roots.map(root => `- ${root}`).join('\n')}\n`;
  navigator.clipboard.writeText(markdown).then(() => alert('Research history copied as Markdown.'));
}

function clearResearchHistory() {
  if (!confirm('Clear your local research history?')) return;
  writeRootList(RECENT_ROOTS_KEY, []);
  renderResearchShelf();
}
