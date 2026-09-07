// ============================================================
// Arabic Lexicon Links & Dictionary Directory
// Direct linking to Lane's, Hans Wehr, Al-Ma'any, and Qur'anic corpora
// ============================================================

function linkTile(url, title, desc, categoryClass = '') {
  return `
    <a class="link-tile ${categoryClass}" href="${url}" target="_blank" rel="noopener">
      <div>${title}<span class="desc">${desc}</span></div> &rarr;
    </a>
  `;
}

function tryLexiconSample(root) {
  const input = document.getElementById('lexiconInput');
  if (input) input.value = root;
  generateLexiconLinks();
}

function openArabicLookupForCurrentRoot() {
  if (typeof lastAnalysis === 'undefined' || !lastAnalysis) return;
  const input = document.getElementById('lexiconInput');
  if (input) input.value = lastAnalysis.root;
  generateLexiconLinks();
  const ledger = document.querySelector('.card-ledger');
  if (ledger) ledger.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function generateLexiconLinks() {
  const rawInput = document.getElementById('lexiconInput').value.trim();
  const resultBox = document.getElementById('lexiconResultBox');
  const classicalContainer = document.getElementById('classicalLinks');
  const bilingualContainer = document.getElementById('bilingualLinks');
  const corpusContainer = document.getElementById('corpusLinks');

  if (!rawInput) {
    resultBox.style.display = 'none';
    return;
  }

  const cleanInput = normalizeInput(rawInput);
  const bwInput = getBuckwalter(cleanInput);
  const encInput = encodeURIComponent(cleanInput);

  // NOTE: bwInput is intentionally NOT URI-encoded below. Ejtaal's #bwq= hash
  // expects the literal, unescaped Buckwalter ASCII string (see their own API
  // docs: #bwq=xf, #bwq=khf). encodeURIComponent would turn '$' (ش) into '%24',
  // '<' (hamza forms) into '%3C', '&' into '%26', etc., silently breaking the
  // lookup for any root containing those letters.
  //
  // Ejtaal's live site also does NOT implement the strict-Buckwalter hamza
  // codes (>, <, |, ', &, }) despite their docs claiming full compliance —
  // their own published letter table (github.com/ejtaal/mr) only ever
  // mapped plain a/A to alif, with no hamza variants at all. Verified by
  // testing: sending those codes gets mangled by their basic substitution
  // table (and/or the browser's own auto-encoding of < and > in URLs).
  // So for the Ejtaal link specifically, flatten every hamza form to 'A',
  // matching what their real implementation actually accepts.
  const ejtaalBw = bwInput.replace(/[><|'&}]/g, 'A');

  try {
    const url = new URL(window.location.href);
    url.searchParams.set('lex', rawInput);
    window.history.replaceState(null, '', url);
  } catch (e) {
    /* URL API unavailable — deep-linking degrades silently */
  }

  resultBox.style.display = 'block';

  classicalContainer.innerHTML =
    linkTile(
      `https://ejtaal.net/aa#bwq=${ejtaalBw}`,
      'Ejtaal',
      `Lane's / Hans Wehr (#bwq=${ejtaalBw})`,
      'tile-classical'
    ) +
    linkTile(
      `https://arabiclexicon.hawramani.com/search/${encInput}`,
      'Hawramani Arabic Lexicon',
      'Classical dictionaries search',
      'tile-classical'
    );

  bilingualContainer.innerHTML =
    linkTile(`https://www.almaany.com/ar/dict/ar-ar/${encInput}/`, "Al-Ma'any (ar-ar)", 'Arabic-Arabic Dictionary', 'tile-bilingual') +
    linkTile(`https://www.almaany.com/ar/dict/ar-en/${encInput}/`, "Al-Ma'any (ar-en)", 'Arabic-English Lexicon', 'tile-bilingual') +
    linkTile(`https://www.almaany.com/ar/dict/ar-ur/${encInput}/`, "Al-Ma'any (ar-ur)", 'Arabic-Urdu Dictionary', 'tile-bilingual') +
    linkTile(`https://www.arabdict.com/en/english-arabic/${encInput}`, 'Arabdict (ar-en)', 'Comprehensive Modern Lexicon', 'tile-bilingual') +
    linkTile(`https://dictionary.reverso.net/arabic-english/${encInput}`, 'Reverso Dictionary', 'Arabic-English Definitions', 'tile-bilingual') +
    linkTile(`https://context.reverso.net/translation/arabic-english/${encInput}`, 'Reverso Translation', 'Contextual Sentence Examples', 'tile-bilingual');

  corpusContainer.innerHTML =
    linkTile(`https://corpus.quran.com/search.jsp?q=root%3A${encInput}`, 'Quranic Corpus (Root)', 'Root concordance & verse list', 'tile-corpus') +
    linkTile(`https://quranmorphology.com/root/${encInput}`, 'Quran Morphology (Root)', 'Quick root search', 'tile-corpus') +
    linkTile(`https://quran.com/search?q=${encInput}`, 'Quran.com Search', 'Verse occurrences', 'tile-corpus') +
    linkTile(`https://corpus.quran.com/search.jsp?q=${encInput}`, 'Quranic Corpus (Word)', 'Exact token concordance', 'tile-corpus') +
    linkTile(`https://quranmorphology.com/textsearch/ar/${encInput}`, 'Quran Morphology (Word)', 'Segmented word-level analysis', 'tile-corpus');
}

function copyArabicSourceLinks() {
  const links = [...document.querySelectorAll('#classicalLinks a, #bilingualLinks a, #corpusLinks a')]
    .map(link => `${link.textContent.trim().replace(/\s+/g, ' ')}\n${link.href}`);
  if (!links.length) return;
  navigator.clipboard.writeText(links.join('\n\n')).then(() => alert('Arabic source links copied to clipboard.'));
}
