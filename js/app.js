// ============================================================
// Main Application Controller: Root Analysis & Lexicon Engine
// Coordinates Semitic script conversion, live lexicon API calls,
// and dictionary card rendering.
// ============================================================

var lastAnalysis = null;

function trySampleRoot(root) {
  const input = document.getElementById('arabicInput');
  if (input) input.value = root;
  const folio = document.querySelector('.card-folio');
  if (folio) folio.scrollIntoView({ behavior: 'smooth', block: 'start' });
  convertAndFetch();
}

function renderLexiconSkeleton(statusText) {
  return `
    <div class="dict-skeleton" aria-hidden="true">
      <div class="dict-skeleton-header">
        <div class="skeleton-bar skeleton-bar-title"></div>
        <div class="skeleton-bar skeleton-bar-tag"></div>
      </div>
      <div class="dict-skeleton-body">
        <div class="skeleton-bar skeleton-bar-medium"></div>
        <div class="skeleton-bar skeleton-bar-full"></div>
        <div class="skeleton-bar skeleton-bar-short"></div>
      </div>
    </div>
    <div class="dict-skeleton" aria-hidden="true">
      <div class="dict-skeleton-header">
        <div class="skeleton-bar skeleton-bar-title" style="width:24%;"></div>
        <div class="skeleton-bar skeleton-bar-tag"></div>
      </div>
      <div class="dict-skeleton-body">
        <div class="skeleton-bar skeleton-bar-full"></div>
        <div class="skeleton-bar skeleton-bar-medium"></div>
      </div>
    </div>
    <div class="lexicon-loading-status" role="status" aria-live="polite">
      <span class="loading-pulse-dot" aria-hidden="true"></span>
      <span id="lexiconStatusText">${statusText}</span>
    </div>
  `;
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
  const analyzeBtn = document.getElementById('analyzeBtn');

  errorDisplay.innerText = '';
  alternativesDisplay.innerHTML = '';

  if (!rawInput) {
    errorDisplay.innerText = 'Please enter an Arabic root or word.';
    return;
  }

  if (analyzeBtn) {
    analyzeBtn.disabled = true;
    analyzeBtn.textContent = 'Analyzing...';
  }

  try {
    const cleanInput = normalizeInput(rawInput);
    if (typeof recordRecentRoot === 'function') recordRecentRoot(cleanInput);
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
    
    lastAnalysis = {
      root: cleanInput,
      hebrew: activeHebrew,
      matchedHebrew: activeHebrew,
      usedAlternate: false,
      syriac,
      nabataean,
      musnad,
      geez,
      sefaria: {},
      wiktionary: null,
      tags: morphTags
    };

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

    resultsContainer.innerHTML = renderLexiconSkeleton('Consulting Sefaria classical lexicons &amp; Wiktionary...');

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

      if (candidates.length > 0) {
        const statusEl = document.getElementById('lexiconStatusText');
        if (statusEl) {
          statusEl.textContent = 'Primary spelling not in lexicons — checking attested historical variants...';
        }
      }

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
  } finally {
    if (analyzeBtn) {
      analyzeBtn.disabled = false;
      analyzeBtn.textContent = 'Analyze Root';
    }
  }
}

// Initialize research shelf on startup
if (typeof renderResearchShelf === 'function') {
  renderResearchShelf();
}
