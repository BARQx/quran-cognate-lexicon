// ============================================================
// Theme Toggle & Deep-Linking Initialization
// ============================================================

(function () {
  const root = document.documentElement;
  const knob = document.getElementById('themeKnob');
  const STORAGE_KEY = 'semitic-explorer-theme';

  function applyTheme(isDark) {
    root.setAttribute('data-theme', isDark ? 'dark' : 'light');
    if (knob) knob.textContent = isDark ? '☾' : '☀';
  }

  let saved = null;
  try {
    saved = localStorage.getItem(STORAGE_KEY);
  } catch (e) {
    saved = null;
  }

  applyTheme(saved === 'dark');

  window.toggleTheme = function () {
    const isDark = root.getAttribute('data-theme') === 'dark';
    const next = !isDark;
    applyTheme(next);
    try {
      localStorage.setItem(STORAGE_KEY, next ? 'dark' : 'light');
    } catch (e) {
      /* storage unavailable */
    }
  };
})();

// Deep-link support: if a ?root=<word> and/or ?lex=<word> param is present, prefill and run automatically.
(function () {
  try {
    const params = new URLSearchParams(window.location.search);

    const sharedRoot = params.get('root');
    if (sharedRoot) {
      const input = document.getElementById('arabicInput');
      if (input) {
        input.value = sharedRoot;
        if (typeof convertAndFetch === 'function') convertAndFetch();
      }
    }

    const sharedLex = params.get('lex');
    if (sharedLex) {
      const lexInput = document.getElementById('lexiconInput');
      if (lexInput) {
        lexInput.value = sharedLex;
        if (typeof generateLexiconLinks === 'function') generateLexiconLinks();
      }
    }
  } catch (e) {
    /* URLSearchParams unavailable — ignore, page still works manually */
  }
})();
