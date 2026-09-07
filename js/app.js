// ============================================================
// Main Application Controller: Root Analysis & Lexicon Links
// ============================================================

let lastAnalysis = null;

function trySampleRoot(root) {
  const input = document.getElementById('arabicInput');
  input.value = root;
  document.querySelector('.card-folio').scrollIntoView({ behavior: 'smooth', block: 'start' });
  convertAndFetch();
}

function tryLexiconSample(root) {
  const input = document.getElementById('lexiconInput');
  input.value = root;
  generateLexiconLinks();
}

function openArabicLookupForCurrentRoot() {
  if (!lastAnalysis) return;
  const input = document.getElementById('lexiconInput');
  input.value = lastAnalysis.root;
  generateLexiconLinks();
  document.querySelector('.card-ledger').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function copyAnalysisLink() {
  if (!lastAnalysis) return;
  const url = new URL(window.location.href);
  url.searchParams.set('root', lastAnalysis.root);
  navigator.clipboard.writeText(url.toString()).then(() => alert('Analysis link copied to clipboard.'));
}

async function convertAndFetch() {
  const rawInput = document.getElementById('arabicInput').value.trim();
  const resultBox = document.getElementById('resultBox');
  const rootTagBar = document.getElementById('rootTagBar');
  const arabicDisplay = document.getElementById('arabicRoot');
  const nabataeanDisplay = document.getElementById('nabataeanRoot');
  const hebrewDisplay = document.getElementById('hebrewRoot');
  const syriacDisplay = document.getElementById('syriacRoot');
  const musnadDisplay = document.getElementById('musnadRoot');
  const geezDisplay = document.getElementById('geezRoot');
  const alternativesDisplay = document.getElementById('alternatives');
  const breakdownBody = document.getElementById('breakdownBody');
  const errorDisplay = document.getElementById('error');
  const resultsContainer = document.getElementById('resultsContainer');
  const analysisContext = document.getElementById('analysisContext');

  errorDisplay.innerText = '';
  alternativesDisplay.innerHTML = '';

  if (!rawInput) {
    errorDisplay.innerText = 'Please enter an Arabic root or word.';
    return;
  }

  const cleanInput = normalizeInput(rawInput);
  recordRecentRoot(cleanInput);
  const morphTags = detectRootMorphology(cleanInput);
  const { primaryHebrew, syriac, nabataean, musnad, geez, breakdown } = convertArabicCognates(cleanInput);
  const activeHebrew = primaryHebrew;

  try {
    const url = new URL(window.location.href);
    url.searchParams.set('root', rawInput);
    window.history.replaceState(null, '', url);
  } catch (e) {
    /* URL API unavailable — deep-linking degrades silently */
  }

  if (morphTags.length > 0) {
    rootTagBar.innerHTML = morphTags.map(t => 
      `<button type="button" class="root-type-badge" onclick="openRootMorphologyDialog('${t.replace(/'/g, "\\'")}')" title="Click to learn what '${t}' means in plain English">
        ${t}
        <span class="badge-info-icon" aria-hidden="true">ⓘ</span>
      </button>`
    ).join('') + `<button type="button" class="root-type-help-btn" onclick="openRootMorphologyDialog()" title="Learn what these root classifications mean">What do these mean?</button>`;
  } else {
    rootTagBar.innerHTML = '';
  }
  arabicDisplay.innerText = formatSurrogateAwareString(cleanInput);
  nabataeanDisplay.innerText = formatSurrogateAwareString(nabataean);
  hebrewDisplay.innerText = formatSurrogateAwareString(activeHebrew);
  syriacDisplay.innerText = formatSurrogateAwareString(syriac);
  musnadDisplay.innerText = formatSurrogateAwareString(musnad);
  geezDisplay.innerText = formatSurrogateAwareString(geez);
  analysisContext.hidden = false;
  analysisContext.innerHTML = '<strong>Proposed Hebrew cognate:</strong> generated from regular sound correspondences; live dictionary evidence is loading.';
  
  resultBox.style.display = 'block';

  // Motion signature: replay the "ink settling" animation on each new analysis.
  const scriptBoxes = document.querySelectorAll('.script-box');
  scriptBoxes.forEach(el => el.classList.remove('ink-settle'));
  void document.body.offsetWidth; // force reflow so the animation restarts even on repeat searches

  scriptBoxes.forEach(el => el.classList.add('ink-settle'));

  breakdownBody.innerHTML = breakdown.map((item, index) => {
    let displayHe = item.he;
    if (index === breakdown.length - 1 && FINAL_LETTERS[displayHe]) {
      displayHe = FINAL_LETTERS[displayHe];
    }
    return `<tr>
      <td><strong>${item.ar}</strong></td>
      <td class="nabataean-cell nabataean-font">${item.nab}</td>
      <td class="hebrew-cell">${displayHe}</td>
      <td class="syriac-cell">${item.syr}</td>
      <td class="musnad-cell musnad-font">${item.msn}</td>
      <td class="geez-cell">${item.gz}</td>
      <td class="law-note">${item.note}</td>
    </tr>`;
  }).join('');

  resultsContainer.innerHTML = '<div style="text-align: center; color: #64748b; padding: 20px;">Fetching lexicons across Semitic databases...</div>';

  let [sefariaDicts, wikiRes] = await Promise.all([
    fetchSefariaDefinitionsGrouped(activeHebrew),
    fetchWiktionaryDefinition(activeHebrew)
  ]);

  // If the primary cognate spelling returned nothing, retry with attested
  // alternate spellings (س/ظ/ذ variants, weak-letter position shifts) before
  // giving up. Stops at the first candidate that returns real results.
  let matchedHebrew = activeHebrew;
  let usedAlternate = false;
  const hadPrimaryResults = Object.keys(sefariaDicts).length > 0 || !!wikiRes;

  if (!hadPrimaryResults) {
    const candidates = generateHebrewRootCandidates(cleanInput).filter(c => c !== activeHebrew);

    // Phase 1: Prioritize classical Sefaria lexicon entries across candidate spellings
    for (const candidate of candidates) {
      const altSefaria = await fetchSefariaDefinitionsGrouped(candidate);
      if (Object.keys(altSefaria).length > 0) {
        const altWiki = await fetchWiktionaryDefinition(candidate);
        sefariaDicts = altSefaria;
        wikiRes = altWiki;
        matchedHebrew = candidate;
        usedAlternate = true;
        break;
      }
    }

    // Phase 2: Fall back to modern Wiktionary ONLY if classical Sefaria yielded no matches
    if (!usedAlternate) {
      for (const candidate of candidates) {
        const altWiki = await fetchWiktionaryDefinition(candidate);
        if (altWiki) {
          wikiRes = altWiki;
          matchedHebrew = candidate;
          usedAlternate = true;
          break;
        }
      }
    }
  }

  lastAnalysis = {
    root: cleanInput,
    hebrew: activeHebrew,
    matchedHebrew,
    usedAlternate,
    syriac,
    nabataean,
    musnad,
    geez,
    sefaria: sefariaDicts,
    wiktionary: wikiRes,
    tags: morphTags
  };

  resultsContainer.innerHTML = '';

  // Update top script card with side-by-side display when an alternate root was used
  if (usedAlternate) {
    hebrewDisplay.innerHTML = `
      <div style="display:inline-flex; flex-direction:column; align-items:center; line-height:1.2;">
        <div style="display:inline-flex; align-items:baseline; gap:8px;">
          <span class="hebrew-font" title="Attested root verified in lexicons">${matchedHebrew}</span>
          <span style="font-size:0.85rem; color:var(--muted); text-decoration:line-through;" title="Primary sound-correspondence formula">${activeHebrew}</span>
        </div>
        <span style="font-size:0.62rem; color:var(--accent); font-weight:600; text-transform:none; letter-spacing:0.02em;">attested alternate</span>
      </div>
    `;
  } else {
    hebrewDisplay.innerText = formatSurrogateAwareString(activeHebrew);
  }

  if (usedAlternate) {
    resultsContainer.innerHTML += `
      <div class="alert-info alert-clickable" role="button" tabindex="0" onclick="openAlternateSpellingDialog()" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();openAlternateSpellingDialog();}" title="Click to learn what this alternate spelling means">
        <div class="alert-info-text">
          No entries found for "${activeHebrew}" — showing results for the attested alternate spelling "<strong>${matchedHebrew}</strong>" instead.
        </div>
        <span class="alert-info-badge">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
          What does this mean?
        </span>
      </div>
    `;
  }

  let hasResults = false;

  for (const [dictName, entries] of Object.entries(sefariaDicts)) {
    hasResults = true;
    resultsContainer.innerHTML += `
      <div class="dict-card">
        <div class="dict-header">
          <span>${dictName}</span>
          <span class="dict-source-tag">Sefaria Semitic Data</span>
        </div>
        <div class="dict-content">
          ${formatHomonymsLocally(entries)}
        </div>
      </div>
    `;
  }

  if (wikiRes) {
    hasResults = true;
    const wiktionaryUrl = `https://en.wiktionary.org/wiki/${encodeURIComponent(matchedHebrew)}`;
    resultsContainer.innerHTML += `
      <div class="dict-card">
        <div class="dict-header">
          <span>Wiktionary</span>
          <span><span class="dict-source-tag">Modern Hebrew</span> <a class="dict-source-link" href="${wiktionaryUrl}" target="_blank" rel="noopener">View source ↗</a></span>
        </div>
        <div class="dict-content">${wikiRes}</div>
      </div>
    `;
  }

  if (!hasResults) {
    const triedNote = generateHebrewRootCandidates(cleanInput).length > 1
      ? ' Alternate spellings were also checked with no match.'
      : '';
    resultsContainer.innerHTML += `<div class="alert-info">No direct Hebrew/Aramaic entries found for "${activeHebrew}".${triedNote} This does not rule out a relationship: spelling, lexical survival, and source coverage can all affect results.<br><button class="research-action" type="button" style="margin-top:8px;" onclick="openArabicLookupForCurrentRoot()">Continue in Arabic lexicons</button></div>`;
  }
  if (usedAlternate) {
    analysisContext.hidden = false;
    analysisContext.innerHTML = `<strong>Primary reconstructed cognate:</strong> <span class="hebrew-font">${activeHebrew}</span> &nbsp;✦&nbsp; <strong>Attested lexicon root:</strong> <span class="hebrew-font" style="color:var(--accent); font-weight:bold;">${matchedHebrew}</span> (verified live in dictionaries below).`;
  } else if (!hasResults) {
    analysisContext.hidden = true;
  } else {
    analysisContext.innerHTML = `<strong>Proposed Hebrew cognate with live evidence:</strong> ${activeHebrew}. Review the dictionary entries below and the correspondence table before drawing conclusions.`;
  }
}

function copyResearchBrief() {
  if (!lastAnalysis) {
    alert("Please perform an analysis first!");
    return;
  }

  // Helper to strip HTML, normalize spaces, and collapse whitespace cleanly
  const cleanText = (str) => {
    if (!str) return '';
    return str
      .replace(/<[^>]*>/g, '')                 // Remove HTML tags
      .replace(/\u00A0/g, ' ')                 // Replace non-breaking spaces
      .replace(/[ \t]+/g, ' ')                 // Collapse multiple spaces/tabs
      .replace(/\n\s*\n/g, '\n')               // Remove empty blank lines 
      .trim();
  };

  let markdown = `### Semitic Comparative Brief: Root [ ${lastAnalysis.root} ]\n\n`;
  markdown += `**Cognate Breakdown**\n`;
  markdown += `* **Arabic Root:** ${lastAnalysis.root}\n`;
  markdown += `* **Nabataean:** ${lastAnalysis.nabataean}\n`;
  if (lastAnalysis.usedAlternate) {
    markdown += `* **Hebrew (Reconstructed):** ${lastAnalysis.hebrew}\n`;
    markdown += `* **Hebrew (Attested in Lexicons):** ${lastAnalysis.matchedHebrew}\n`;
  } else {
    markdown += `* **Hebrew:** ${lastAnalysis.hebrew}\n`;
  }
  markdown += `* **Syriac:** ${lastAnalysis.syriac}\n`;
  markdown += `* **Musnad (Sabaic):** ${lastAnalysis.musnad}\n`;
  markdown += `* **Ge'ez:** ${lastAnalysis.geez}\n`;
  if (lastAnalysis.tags.length > 0) {
    markdown += `* **Morphology:** ${lastAnalysis.tags.join(', ')}\n`;
  }
  markdown += `\n`;

  const hasSefaria = Object.keys(lastAnalysis.sefaria).length > 0;
  const hasWiki = !!lastAnalysis.wiktionary;

  if (hasSefaria || hasWiki) {
    markdown += `--- \n\n### Lexicon Definitions\n\n`;

    // 1. Process Sefaria Entries with strict "Sense X: Headword" matching UI
    if (hasSefaria) {
      markdown += `#### Sefaria Classical Lexicons\n`;
      for (const [dict, entries] of Object.entries(lastAnalysis.sefaria)) {
        markdown += `**${dict}**\n`;
        entries.forEach((group, index) => {
          const hw = cleanText(group.headword);
          const senseTitle = hw ? `Sense ${index + 1}: ${hw}` : `Sense ${index + 1}`;
          
          markdown += `* **${senseTitle}**\n`;

          group.defs.forEach(d => {
            const sanitized = cleanText(d);
            if (sanitized) {
              markdown += `  * ${sanitized}\n`;
            }
          });
        });
        markdown += `\n`;
      }
    }

    // 2. Process Wiktionary Entries with strict Sense retention
    if (hasWiki) {
      markdown += `#### Wiktionary (Modern Hebrew)\n`;
      
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = lastAnalysis.wiktionary;
      
      const groups = tempDiv.querySelectorAll('.homonym-group');
      if (groups.length > 0) {
        groups.forEach(g => {
          const title = cleanText(g.querySelector('.homonym-title')?.textContent || '');
          if (title) {
            markdown += `**${title}**\n`;
          }
          g.querySelectorAll('li').forEach(li => {
            const itemText = cleanText(li.textContent);
            if (itemText) {
              markdown += `* ${itemText}\n`;
            }
          });
          markdown += `\n`;
        });
      } else {
        const sanitizedWiki = cleanText(lastAnalysis.wiktionary);
        markdown += `${sanitizedWiki}\n`;
      }
    }
  }

  navigator.clipboard.writeText(markdown).then(() => {
    alert("Research brief copied to clipboard in clean Markdown format!");
  });
}

function openCalLexicon() {
  if (!lastAnalysis) {
    alert("Please perform an analysis first!");
    return;
  }
  // matchedHebrew defaults to the primary derived cognate, and is only
  // swapped for an attested alternate spelling when that's what actually
  // returned dictionary results — so it's always the "best" root to use.
  const root = lastAnalysis.matchedHebrew || lastAnalysis.hebrew;
  const url = `https://cal.huc.edu/browseSKEYheaders.php?tools=on&first3=${encodeURIComponent(root)}`;
  window.open(url, '_blank');
}

function buildShiftExplanationHtml(root, activeHebrew, matchedHebrew) {
  const notes = [];
  if (activeHebrew.startsWith('ו') && matchedHebrew.startsWith('י')) {
    notes.push('<strong>Initial Waw &rarr; Yodh:</strong> Words beginning with <strong>و</strong> (wāw) in Arabic regularly shift to <strong>י</strong> (yodh) in Hebrew (e.g., Arabic <em>walad</em> &rarr; Hebrew <em>yeled</em>). The engine automatically searched under the Yodh form.');
  }
  if (activeHebrew.includes('ש') && matchedHebrew.includes('ס') && root.includes('س')) {
    notes.push('<strong>The Sibilant Split (س &rarr; ש vs. ס):</strong> Arabic <strong>س</strong> (Seen) covers two ancestral Semitic sounds that Hebrew kept apart as <strong>ש</strong> (Shin/Sin) and <strong>ס</strong> (Samekh). While standard mapping tests Shin first, this root survived in Hebrew under <strong>ס</strong> (e.g., סגד).');
  }
  if (activeHebrew.includes('צ') && matchedHebrew.includes('ט') && root.includes('ظ')) {
    notes.push('<strong>Sound Shift (ظ &rarr; צ vs. ט):</strong> Arabic <strong>ظ</strong> primarily maps to Hebrew <strong>צ</strong>, but roots influenced by Aramaic traditions often appear under <strong>ט</strong>.');
  }
  if (activeHebrew.includes('ז') && matchedHebrew.includes('ד') && root.includes('ذ')) {
    notes.push('<strong>Sound Shift (ذ &rarr; ז vs. ד):</strong> Arabic <strong>ذ</strong> primarily maps to Hebrew <strong>ז</strong>, but sister dialects and Aramaic-influenced forms regularly use <strong>ד</strong>.');
  }
  if (matchedHebrew.endsWith('ה') && !activeHebrew.endsWith('ה')) {
    notes.push('<strong>Weak Final Radical (&rarr; ה):</strong> Hebrew roots ending in a weak radical (like Arabic <strong>ي</strong> or <strong>و</strong>) frequently surface with <strong>ה</strong> (He).');
  }
  if (!notes.length) {
    notes.push('The initial reconstructed spelling had no live entries in classical Hebrew dictionaries, but the attested alternate spelling <strong>' + matchedHebrew + '</strong> was found in verified lexicons.');
  }

  return `
    <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; margin-bottom:8px; border-bottom:1px solid var(--border); padding-bottom:6px;">
      <span><strong>Arabic Root:</strong> <span dir="rtl" style="font-weight:700; font-size:1.05rem;">${root}</span></span>
      <span>
        <span style="color:var(--muted); text-decoration:line-through;">${activeHebrew}</span>
        &rarr;
        <strong style="color:var(--accent); font-size:1.05rem;">${matchedHebrew}</strong>
      </span>
    </div>
    <div style="font-size:0.84rem; line-height:1.45; color:var(--text);">${notes.join('<br><br>')}</div>
  `;
}

function openAlternateSpellingDialog() {
  const dialog = document.getElementById('alt-spelling-dialog');
  if (!dialog) return;

  const dynamicBox = document.getElementById('alt-dialog-dynamic');
  if (dynamicBox) {
    if (lastAnalysis && lastAnalysis.usedAlternate) {
      dynamicBox.innerHTML = buildShiftExplanationHtml(lastAnalysis.root, lastAnalysis.hebrew, lastAnalysis.matchedHebrew);
    } else {
      dynamicBox.innerHTML = buildShiftExplanationHtml('سجد', 'שגד', 'סגד');
    }
  }

  dialog.showModal();
  dialog.scrollTop = 0;
}

function openRootMorphologyDialog(highlightTag) {
  const dialog = document.getElementById('root-morphology-dialog');
  if (!dialog) return;

  const dynamicBox = document.getElementById('root-dialog-dynamic');
  if (dynamicBox) {
    if (lastAnalysis && lastAnalysis.root) {
      const tags = detectRootMorphology(lastAnalysis.root);
      if (tags.length > 0) {
        dynamicBox.style.display = 'block';
        dynamicBox.innerHTML = `
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:6px; margin-bottom:4px;">
            <span><strong>Active Root:</strong> <span dir="rtl" style="font-weight:700; font-size:1.05rem;">${lastAnalysis.root}</span></span>
            <span style="font-size:0.8rem; color:var(--accent); font-weight:600;">${tags.join(' · ')}</span>
          </div>
          <div style="font-size:0.82rem; line-height:1.4; color:var(--text);">
            This root contains flexible letters. See highlighted classification(s) below for how they affect pronunciations and cognate matches across sister languages.
          </div>
        `;
      } else {
        dynamicBox.style.display = 'none';
      }
    } else {
      dynamicBox.style.display = 'none';
    }
  }

  // Clear previous highlights
  const allItems = ['morph-item-weak', 'morph-item-assimilating', 'morph-item-hollow', 'morph-item-defective', 'morph-item-geminate'];
  allItems.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.remove('dialog-highlight-item');
  });

  // Highlight specific item if clicked directly or if detected for current root
  const tagsToHighlight = [];
  if (highlightTag) {
    tagsToHighlight.push(highlightTag);
  } else if (lastAnalysis && lastAnalysis.tags) {
    tagsToHighlight.push(...lastAnalysis.tags);
  }

  tagsToHighlight.forEach(tag => {
    let targetId = '';
    if (tag.includes('Weak') || tag.includes('معتل')) targetId = 'morph-item-weak';
    else if (tag.includes('Assimilating') || tag.includes('مثال')) targetId = 'morph-item-assimilating';
    else if (tag.includes('Hollow') || tag.includes('جوف')) targetId = 'morph-item-hollow';
    else if (tag.includes('Defective') || tag.includes('ناقص')) targetId = 'morph-item-defective';
    else if (tag.includes('Geminate') || tag.includes('مضاعف')) targetId = 'morph-item-geminate';

    if (targetId) {
      const targetEl = document.getElementById(targetId);
      if (targetEl) targetEl.classList.add('dialog-highlight-item');
    }
  });

  dialog.showModal();
  dialog.scrollTop = 0;
}

function linkTile(url, title, desc, categoryClass = '') {
  return `
    <a class="link-tile ${categoryClass}" href="${url}" target="_blank">
      <div>${title}<span class="desc">${desc}</span></div> &rarr;
    </a>
  `;
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

// Initialize research shelf
renderResearchShelf();

// Manage background scroll lock without hiding the main page scrollbar (prevents layout shift)
let lockedScrollY = 0;
let isModalOpen = false;

function isPointInsideDialog(clientX, clientY, dialog) {
  if (!dialog || !dialog.open) return false;
  const rect = dialog.getBoundingClientRect();
  return (
    clientX >= rect.left &&
    clientX <= rect.right &&
    clientY >= rect.top &&
    clientY <= rect.bottom
  );
}

function updateModalState() {
  const openDialogs = Array.from(document.querySelectorAll('dialog')).filter(d => d.open);
  if (openDialogs.length > 0) {
    if (!isModalOpen) {
      lockedScrollY = window.scrollY || window.pageYOffset || 0;
      isModalOpen = true;

      // Compensate for scrollbar width so the page layout never shifts
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      if (scrollbarWidth > 0) {
        const computedPadding = parseFloat(getComputedStyle(document.body).paddingRight) || 20;
        document.body.style.paddingRight = `${computedPadding + scrollbarWidth}px`;
      }
      document.documentElement.classList.add('modal-open');
      document.body.classList.add('modal-open');
    }
    openDialogs.forEach(d => {
      if (!d.dataset.modalInit) {
        d.scrollTop = 0;
        d.dataset.modalInit = 'true';
      }
    });
  } else {
    if (isModalOpen) {
      isModalOpen = false;
      document.body.style.paddingRight = '';
      document.documentElement.classList.remove('modal-open');
      document.body.classList.remove('modal-open');
      window.scrollTo(window.scrollX || 0, lockedScrollY);
      document.querySelectorAll('dialog').forEach(d => {
        delete d.dataset.modalInit;
      });
    }
  }
}

const dialogObserver = new MutationObserver(() => {
  updateModalState();
});

document.querySelectorAll('dialog').forEach(dialog => {
  dialogObserver.observe(dialog, { attributes: true, attributeFilter: ['open'] });
  dialog.addEventListener('close', updateModalState);
});

// Prevent wheel scrolling on the background page while a dialog is visible
window.addEventListener('wheel', (e) => {
  const openDialog = document.querySelector('dialog[open]');
  if (!openDialog) return;
  if (!isPointInsideDialog(e.clientX, e.clientY, openDialog)) {
    e.preventDefault();
  }
}, { passive: false });

// Prevent touch swiping on the background page while a dialog is visible
window.addEventListener('touchmove', (e) => {
  const openDialog = document.querySelector('dialog[open]');
  if (!openDialog) return;
  if (e.touches && e.touches[0]) {
    if (!isPointInsideDialog(e.touches[0].clientX, e.touches[0].clientY, openDialog)) {
      e.preventDefault();
    }
  }
}, { passive: false });

// Prevent navigation keys from scrolling the background page while a dialog is visible
window.addEventListener('keydown', (e) => {
  const openDialog = document.querySelector('dialog[open]');
  if (!openDialog) return;
  const navKeys = ['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '];
  if (navKeys.includes(e.key) && !openDialog.contains(document.activeElement)) {
    e.preventDefault();
  }
}, { passive: false });

// Pin background window scroll position so the page never moves while a modal is visible
window.addEventListener('scroll', () => {
  if (isModalOpen) {
    const currentY = window.scrollY || window.pageYOffset || 0;
    if (Math.abs(currentY - lockedScrollY) > 1) {
      window.scrollTo(window.scrollX || 0, lockedScrollY);
    }
  }
}, { passive: false });
