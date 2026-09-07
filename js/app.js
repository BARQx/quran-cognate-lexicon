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
          let senseTitle = hw ? `Sense ${index + 1}: ${hw}` : `Sense ${index + 1}`;
          if (group.transliteration) senseTitle += ` [${group.transliteration}]`;
          if (group.strongNumber) senseTitle += ` (#${group.strongNumber})`;
          
          markdown += `* **${senseTitle}**\n`;

          (group.defs || []).forEach(d => {
            const sanitized = cleanText(d);
            if (sanitized) {
              markdown += `  * ${sanitized}\n`;
            }
          });

          if (group.stems && group.stems.length > 0) {
            group.stems.forEach(s => {
              const stemParts = [s.stem, s.form ? `(${s.form})` : '', s.defs ? s.defs.join('; ') : ''].filter(Boolean).join(' ');
              if (stemParts) {
                markdown += `  * *Verbal Stem:* ${cleanText(stemParts)}\n`;
              }
            });
          }

          if (group.etymology) {
            const etymText = cleanText(group.etymology);
            if (etymText) {
              markdown += `  * *Comparative Etymology:* ${etymText}\n`;
            }
          }
        });
        markdown += `\n`;
      }
    }

    // 2. Process Wiktionary Entries with strict Sense retention
    if (hasWiki) {
      markdown += `#### Wiktionary (Modern Hebrew)\n`;
      
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = lastAnalysis.wiktionary;
      
      const groups = tempDiv.querySelectorAll('.homonym-group, .lex-entry-card');
      if (groups.length > 0) {
        groups.forEach(g => {
          const title = cleanText(
            g.querySelector('.part-of-speech')?.textContent || 
            g.querySelector('.homonym-title')?.textContent || 
            g.querySelector('.lex-entry-meta')?.textContent || ''
          );
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

// ============================================================
// Comparative Script Educational Data & Dialog Controller
// ============================================================

const SCRIPT_INFO_DATA = {
  arabic: {
    name: "Arabic",
    nativeName: "العربية",
    subtitle: "Classical / Qur'anic Arabic",
    branch: "Central Semitic",
    branchMeaning: "In the Semitic family tree, 'Central Semitic' is the intermediate branch that groups Arabic directly together with Northwest Semitic (Hebrew, Aramaic, and Phoenician). In layman's terms, linguists group them together because Arabic, Hebrew, and Aramaic share revolutionary grammar innovations not found in older Semitic branches—most notably the prefix verb tense (such as <em>yaktub / yiktov</em>) and the definite article. Think of Arabic, Hebrew, and Aramaic as first cousins sharing a common ancestor within the larger Semitic family.",
    direction: "Right-to-Left (RTL)",
    directionArrow: "←",
    directionDetail: "Written and read from right to left (RTL · من اليمين إلى اليسار)",
    dir: "rtl",
    fontClass: "",
    colorVar: "var(--script-arb)",
    whatIsIt: "Classical Arabic is the sacred language of the Qur'an and pre-Islamic poetry, preserved with extraordinary fidelity since the 7th century CE. It serves as the baseline reference standard of our entire portal.",
    relationToProject: "Traditional Arabic lexicons (such as <em>Lisān al-ʿArab</em> or <em>Tāj al-ʿArūs</em>) were documented centuries after the revelation, often defining words through later bedouin idioms. By starting with the Qur'anic Arabic root and comparing it to older sister languages, this project helps you peel back centuries of grammatical shifts to uncover the most ancient, primal meanings of Qur'anic vocabulary.",
    influenceTitle: "Scholarly Context: The Consonantal Root Matrix",
    influenceText: "Classical Arab linguists (such as al-Khalīl ibn Aḥmad and Sībawayh) recognized that Arabic was anchored in a consonantal root matrix (<em>al-judhūr al-thulāthiyyah</em>). Nearly every concept is built on a 3-consonant foundation (like ك-ت-ب for writing, or س-ل-م for wholeness). Because consonants carry the core semantic idea while vowels only supply grammatical inflection, tracking consonants across sister languages reveals how foundational concepts evolved across ancient Semitic civilizations."
  },
  nabataean: {
    name: "Nabataean",
    nativeName: "الخط النبطي",
    subtitle: "Aramaic Cursive of the Ancient Arab Traders",
    branch: "Northwest Semitic · Aramaic Branch",
    branchMeaning: "'Northwest Semitic' describes the ancient language family of the Fertile Crescent and Levant (Syria, Jordan, Lebanon, and Palestine), while 'Aramaic' was its premier trade and diplomatic tongue. In layman's terms, this explains a fascinating historical bridge: the Nabataeans were ethnically Arabs who spoke an early dialect of Arabic at home, but because Aramaic was the regional prestige business language, they wrote their monumental records and contracts in the Northwest Semitic Aramaic cursive alphabet, which directly evolved into the Arabic alphabet.",
    direction: "Right-to-Left (RTL)",
    directionArrow: "←",
    directionDetail: "Written and read from right to left (RTL), continuing the Imperial Aramaic tradition",
    dir: "rtl",
    fontClass: "nabataean-font",
    colorVar: "var(--script-nab)",
    whatIsIt: "The script developed by the Nabataeans, the ancient Arab merchants who carved the desert wonder of Petra (Jordan) and Hegra / Mada'in Salih (Saudi Arabia). While they spoke an early dialect of Arabic in daily life, they wrote official trade and monument records using an Aramaic cursive alphabet.",
    whyShown: "The modern Arabic alphabet didn't appear out of thin air—<strong>it evolved directly out of cursive Nabataean writing</strong>! Famous pre-Islamic inscriptions (like the 4th-century CE Namara Inscription in Syria) were written in the Arabic language using Nabataean letters.",
    relationToProject: "This card shows the <strong>calligraphic ancestor</strong> of the Qur'an's visual script. It allows you to see how the letters of your Qur'anic root looked at the very dawn of Arabic writing, connecting the sacred text directly to its archaeological roots in northern Arabia.",
    influenceTitle: "Scholarly Insight: The Birth of the Arabic Alphabet",
    influenceText: "Epigraphers and historians (such as Robert Hoyland, Laïla Nehmé, and Ahmad Al-Jallad) have conclusively traced how late Nabataean cursive gradually transitioned into the earliest Arabic script between the 3rd and 6th centuries CE. Pre-Islamic inscriptions across northwest Arabia demonstrate the exact developmental stages where Nabataean letterforms morphed into the Hijazi and Kufic scripts used in the earliest Qur'an manuscripts.",
    examplesTitle: "Concrete Archaeological & Epigraphic Examples",
    examples: [
      {
        title: "The Namara Inscription (328 CE)",
        badge: "Epigraphic Missing Link",
        desc: "The royal epitaph of Imru' al-Qays ('King of all Arabs'), discovered in the Syrian desert, is composed entirely in Classical Arabic syntax and vocabulary, but carved in Nabataean Aramaic letters. It is definitive archaeological proof that pre-Islamic Arabs adopted the Nabataean alphabet to write their own mother tongue."
      },
      {
        title: "Continuous Cursive Ligatures",
        badge: "Script Evolution",
        desc: "Unlike Hebrew and Musnad where stone-carved letters stood isolated, Nabataean scribes wrote rapidly on papyrus, connecting letters together. This running cursive style gave Arabic its signature joined script (such as the shared base curve that joins ب, ت, and ث)."
      }
    ]
  },
  hebrew: {
    name: "Hebrew",
    nativeName: "עִבְרִית",
    subtitle: "Biblical & Classical Sister Language",
    branch: "Northwest Semitic · Canaanite Branch",
    branchMeaning: "'Northwest Semitic' covers the ancient tongues of the Levant, and 'Canaanite' is the coastal branch comprising Hebrew, Phoenician, Moabite, and Ugaritic. In layman's terms, while Aramaic was the northern inland lingua franca, Canaanite languages were their coastal sisters. Because Hebrew and Arabic are both Central Semitic languages, Hebrew is Arabic's closest major literary relative, preserving thousands of identical root words and concrete agricultural metaphors from prehistoric times.",
    direction: "Right-to-Left (RTL)",
    directionArrow: "←",
    directionDetail: "Written and read from right to left (RTL · מִיָּמִין לִשְׂמֹאל)",
    dir: "rtl",
    fontClass: "hebrew-font",
    colorVar: "var(--script-heb)",
    whatIsIt: "The classical sister language of Biblical and Rabbinic texts, spoken across the ancient Levant. Arabic and Hebrew are as closely related as Spanish and Italian—direct linguistic sisters sharing thousands of identical vocabulary roots from their common ancestor (Proto-Semitic).",
    whyShown: "Because of regular historical sound shifts (for example, Arabic <em>س</em> usually corresponds systematically to Hebrew <em>ש</em> or <em>ס</em>, and <em>ذ</em> shifts to <em>ז</em>), an Arabic root can be reliably mapped into its corresponding Hebrew cognate.",
    relationToProject: "<strong>This is the core discovery engine of our portal.</strong> While classical Arabic dictionaries often narrowed words to specialized, abstract, or late theological senses, Hebrew lexicons (such as Brown-Driver-Briggs, Klein, and Jastrow) preserved early, concrete, and agricultural meanings. When you analyze a root, this portal converts it and immediately searches live Hebrew dictionaries to help you uncover forgotten physical shades of meaning in Qur'anic vocabulary.",
    influenceTitle: "Scholarly Insight: Recovering Ancient Concrete Metaphors",
    influenceText: "Pre-Islamic Arabia was home to long-established Jewish communities in Yathrib (Medina), Khaybar, and Yemen. Both classical commentators (such as al-Ṭabarī) and modern comparative linguists document that the close genetic kinship between Arabic and Hebrew meant religious concepts and biblical narratives resonated naturally with pre-Islamic Arabs, who recognized their shared Semitic linguistic ancestry.",
    examplesTitle: "Concrete Qur'anic & Linguistic Examples",
    examples: [
      {
        title: "Root ك-ف-ر vs. Hebrew כָּפַר (kāpar)",
        badge: "Primal Concrete Meaning",
        desc: "While Arabic <em>kafara</em> primarily means 'to disbelieve' or 'cover the truth', Biblical Hebrew <em>kāpar</em> specifically preserves the original physical root sense: <strong>'to spread a coating over / wipe clean / atone'</strong> (the source of <em>Yom Kippur</em>, Day of Atonement, and <em>kōpher</em>, the waterproof pitch coating of Noah's Ark in Genesis 6:14). This reveals the ancient physical metaphor behind the theological concept."
      },
      {
        title: "Root ف-ط-ر vs. Hebrew פָּתַר (pātar)",
        badge: "Revealing Hidden Nuance",
        desc: "Arabic <em>faṭara</em> is used in the Qur'an for divine creation (<em>Fāṭir as-samāwāt</em>) and breaking a fast (<em>ifṭār</em>). In Hebrew, <em>pātar</em> means <strong>'to unlock / unravel a riddle or dream'</strong> (as Joseph interprets Pharaoh's dream in Genesis). The shared Semitic root idea is <em>splitting open what was previously sealed or concealed</em>, portraying creation as unsealing the cosmos."
      },
      {
        title: "Root ق-د-س vs. Hebrew קָדַשׁ (qādash)",
        badge: "Theological Depth",
        desc: "In Arabic, <em>quddūs</em> denotes purity and sanctity. In Hebrew, <em>qādash</em> explicitly means <strong>'to set apart exclusively for divine use'</strong>. This adds vital nuance to Qur'anic verses mentioning <em>Rūḥ al-Qudus</em> (the Holy Spirit) and <em>al-Arḍ al-Muqaddasah</em> (the Holy Land)—it is not merely 'clean', but territory separated and dedicated for God."
      }
    ]
  },
  syriac: {
    name: "Syriac",
    nativeName: "ܣܘܪܝܝܐ",
    subtitle: "Lingua Franca of Late Antiquity",
    branch: "Northwest Semitic · Classical Aramaic",
    branchMeaning: "'Classical Aramaic' was the premier literary and liturgical dialect of Northwest Semitic centered in Edessa (modern southeast Turkey). In layman's terms, during the centuries immediately preceding the rise of Islam, Syriac was the intellectual language of philosophy, medicine, theology, and monastic scholarship throughout Syria and Mesopotamia. Classical Arabic borrowed heavily from this prestigious scribal tradition, making Syriac an indispensable key for understanding religious and philosophical vocabulary in the Qur'an.",
    direction: "Right-to-Left (RTL)",
    directionArrow: "←",
    directionDetail: "Written and read horizontally from right to left (RTL · ܡܢ ܝܡܝܢܐ ܠܣܡܠܐ)",
    dir: "rtl",
    fontClass: "syriac-font",
    colorVar: "var(--script-syr)",
    whatIsIt: "The classical literary and liturgical dialect of Aramaic that served as the primary scholarly, cultural, and spiritual lingua franca across the Fertile Crescent, Syria, and Mesopotamia for nearly a thousand years leading up to the Qur'anic era.",
    whyShown: "During late antiquity, Aramaic was the common international language of theology, philosophy, and commerce. Pre-Islamic Arabian poets and merchants along the northern trade routes were in continuous contact with Syriac-speaking communities.",
    relationToProject: "Many key Qur'anic spiritual and ethical terms—such as <em>Furqān</em>, <em>Ṣalāh</em>, <em>Zakāh</em>, and <em>Malakūt</em>—have direct cognates in Syriac. Showing this card allows you to cross-reference the Comprehensive Aramaic Lexicon (CAL) and explore the shared theological vocabulary of the pre-Islamic Near East.",
    influenceTitle: "Scholarly Insight: Late Antique Aramaic Horizon",
    influenceText: "Historians and Semiticists (such as Arthur Jeffery, Sidney Griffith, and Joseph Witztum) emphasize that pre-Islamic Arabia was deeply integrated with the overarching Aramaic cultural sphere. Classical Muslim scholars also recognized the intimate bond with Aramaic (<em>as-Suryāniyyah</em>), noting that early Arabic orthography directly inherited Aramaic scribal traditions.",
    examplesTitle: "Concrete Qur'anic & Linguistic Examples",
    examples: [
      {
        title: "Al-Furqān (فُرْقَان) vs. Syriac ܦܘܪܩܢܐ (purqānā)",
        badge: "Liturgical Double Meaning",
        desc: "Classical Arabic dictionaries explain <em>al-Furqān</em> as 'that which separates (<em>faraqa</em>) truth from falsehood'. But in Syriac liturgical texts, <em>purqānā</em> is the ubiquitous term for <strong>'salvation, deliverance, redemption'</strong>. In the Qur'an, such as calling the victory of Badr <em>Yawm al-Furqān</em> (Surah 8:41), the word powerfully carries both dimensions: divine deliverance and the decisive separation between truth and falsehood."
      },
      {
        title: "The Wāw in Ṣalāh (صلوة) and Zakāh (زكوة)",
        badge: "Scribal Orthography",
        desc: "In the Qur'anic Uthmanic script, <em>Ṣalāh</em> (prayer) and <em>Zakāh</em> (almsgiving) are famously written with a <em>Wāw</em> (صلوة and زكوة). This directly mirrors the Aramaic/Syriac spellings <em>ṣlōtā</em> (ܨܠܘܬܐ) and <em>zākūṯā</em> (ܙܟܘܬܐ), demonstrating how early Arabic scribes preserved the sacred Aramaic spelling tradition."
      },
      {
        title: "Malakūt (مَلَكُوت) vs. Syriac ܡܠܟܘܬܐ (malkūṯā)",
        badge: "Intensive Suffix",
        desc: "The intensive noun suffix <em>-ūt</em> in Qur'anic Arabic (<em>Malakūt</em> 'celestial dominion', <em>Jabarūt</em> 'divine omnipotence') is an authentic cognate of the Aramaic/Syriac abstract ending <em>-ūṯā</em>, used across late antiquity to express supreme cosmic sovereignty."
      }
    ]
  },
  musnad: {
    name: "Musnad (Sabaic)",
    nativeName: "خط المسند",
    subtitle: "Monumental Epigraphy of Ancient South Arabia",
    branch: "South Semitic · Ancient South Arabian (Sayhadic)",
    branchMeaning: "'South Semitic' is the southern branch of the Semitic family tree, and 'Sayhadic' (Ancient South Arabian) refers specifically to the grand monumental languages of ancient Yemen (Saba, Himyar, Qataban, and Ma'in). In layman's terms, while northern languages like Hebrew and Aramaic pruned their alphabets down to 22 letters, South Semitic preserved nearly all original consonants from the ancient mother tongue (Proto-Semitic). This proves that uniquely Arabian sounds like <em>Ḍād</em> (ض) and <em>Ẓā</em> (ظ) were native to the southern peninsula millennia before Islam.",
    direction: "Right-to-Left (RTL)",
    directionArrow: "←",
    directionDetail: "Standard monumental inscriptions read right to left (RTL); archaic texts were boustrophedon",
    dir: "rtl",
    fontClass: "musnad-font",
    colorVar: "var(--script-msn)",
    whatIsIt: "The monumental, geometric script carved into towering temple stones and bronze tablets across ancient Yemen by the kingdoms of Saba (Sheba), Himyar, Qataban, and Ma'in, flourishing from 1000 BCE until the 6th century CE.",
    whyShown: "Unlike northern Semitic languages (like Hebrew and Syriac) which dropped multiple consonants over time and shrank to 22 letters, Musnad preserved all 29 original Proto-Semitic consonants—almost an exact 1-to-1 match with Arabic's 28 letters.",
    relationToProject: "Musnad anchors the Qur'an within its indigenous Arabian homeland. It provides concrete stone-carved proof that distinctively Arabic consonants like <em>Ḍād</em> (ض), <em>Ẓā</em> (ظ), and <em>Thā</em> (ث) were not late innovations, but ancient sounds inscribed on rock across the Arabian peninsula for millennia before the Qur'an.",
    influenceTitle: "Scholarly Insight: South Arabian Monotheism & Influence on Arabic",
    influenceText: "<strong>Did South Arabia influence Qur'anic Arabic?</strong> Absolutely. Ancient Yemen was home to the most advanced urban civilizations in Arabia. In modern epigraphy, scholars (such as Christian Robin, Norbert Nebes, and Peter Stein) uncovered a transformative historical reality: around 380 CE, the Himyarite Kingdom officially unified Yemen and discarded polytheism in favor of an indigenous Abrahamic monotheism. In their stone inscriptions, they invoked God exclusively as <strong>Rahmānān</strong> (<em>R-ḥ-m-n-n</em>, 'The Merciful, Lord of Heaven and Earth'). South Arabian monotheistic religious vocabulary circulated extensively across pre-Islamic Arabia, directly shaping the theological landscape in which the Qur'an was revealed.",
    examplesTitle: "Concrete Qur'anic & Epigraphic Examples",
    examples: [
      {
        title: "The Divine Name ar-Raḥmān (الرَّحْمَٰن) vs. Sabaic 𐩧𐩢𐩣𐩬𐩬 (Rahmānān)",
        badge: "Pre-Islamic Monotheism",
        desc: "For over 200 years before the Prophet Muhammad, South Arabian monotheistic inscriptions invoked <em>Rahmānān</em> (The Merciful) as the supreme and only God. When the Qur'an was revealed, the polytheists of Mecca reacted with bewilderment: <em>'And what is ar-Rahmān?'</em> (Surah 25:60), reflecting the integration of this long-standing South Arabian monotheistic title into Hijazi Arabic."
      },
      {
        title: "Al-Miḥrāb (مِحْرَاب) vs. Sabaic 𐩣𐩢𐩧𐩨 (m-ḥ-r-b)",
        badge: "Sanctuary Chamber",
        desc: "In ancient Sabaic and Himyaritic inscriptions, <em>m-ḥ-r-b</em> specifically designated the elevated, honored audience chambers of palaces and temples. This sheds immediate light on Qur'anic verses, such as Zechariah entering upon Maryam in the <em>miḥrāb</em> (Surah Ali 'Imran 3:37), referring to an elevated, protected sanctuary chamber."
      },
      {
        title: "Phonetic Preservation of Ḍād (ض) and Ẓā (ظ)",
        badge: "Ancient Phonology",
        desc: "Arabic is famous as <em>Lughat al-Ḍād</em> (the language of Ḍād). While Hebrew and Aramaic merged Ḍād into Ṣādē (צ), Musnad stone inscriptions prove that Ḍād (𐩳), Ẓā (𐩼), and Ghayn (𐩶) were distinct, everyday consonants across the Arabian peninsula for over 1,500 years before the Qur'an."
      }
    ]
  },
  geez: {
    name: "Ge'ez",
    nativeName: "ግዕዝ",
    subtitle: "Classical Ethiopic · Horn of Africa",
    branch: "South Semitic · Ethiosemitic Branch",
    branchMeaning: "'Ethiosemitic' represents South Semitic languages that migrated across the southern Red Sea to the Horn of Africa (modern Ethiopia and Eritrea) thousands of years ago. In layman's terms, Ge'ez developed in geographic separation from the northern empires of the Levant, which allowed it to preserve archaic South Semitic grammar and vocabulary in an untainted state. Because pre-Islamic Hijaz maintained vigorous maritime trade with the Kingdom of Aksum, Ethiosemitic words naturally crossed the Red Sea and entered the speech of Quraysh.",
    direction: "Left-to-Right (LTR)",
    directionArrow: "→",
    directionDetail: "Written and read from left to right (LTR) — unique among ancient Semitic scripts!",
    dir: "ltr",
    fontClass: "",
    colorVar: "var(--script-gez)",
    whatIsIt: "The classical literary and liturgical language of the ancient Kingdom of Aksum (modern Ethiopia and Eritrea), situated directly across the Red Sea from Mecca and Medina.",
    whyShown: "Ge'ez is an ancient South Semitic sister language that developed independently on the African side of the Red Sea, preserving archaic grammar and vocabulary untainted by the linguistic shifts of the northern Fertile Crescent.",
    relationToProject: "Pre-Islamic Arabia maintained intimate trade, diplomatic, and cultural ties with Aksum (including the first migration of early Muslims to Abyssinia). Classical Qur'anic exegetes like al-Suyūtī (in <em>al-Itqān</em>) famously documented Ethiopic cognates in the Qur'an. Ge'ez gives our portal an independent southern cross-check to verify how ancient and widespread a root truly is.",
    influenceTitle: "Scholarly Insight: Classical Muslim Recognition of Ethiopic Words",
    influenceText: "<strong>Did Ethiopic influence Arabic and the Qur'an?</strong> Yes, and classical Muslim scholars openly documented it! <strong>Imam Jalāl al-Dīn al-Suyūtī</strong> (in his masterwork <em>al-Itqān fī ʿUlūm al-Qurʾān</em> and <em>al-Muhadhdhab</em>) and <strong>Ibn Jarīr al-Ṭabarī</strong> explicitly listed dozens of words in the Qur'an as being of <em>Habashi</em> (Ethiopic/Ge'ez) origin. Classical scholars explained that centuries of Red Sea maritime trade and the 6th-century Aksumite presence in Arabia (including the era of Abraha, referenced in Surah al-Fīl) caused these Ethiopic terms to become naturalized into the speech of Quraysh before the revelation.",
    examplesTitle: "Concrete Qur'anic & Lexical Examples",
    examples: [
      {
        title: "Al-Hawāriyyūn (حَوَارِيُّون - Disciples of Jesus) vs. Ge'ez ሐዋርያት (ḥawāryāt)",
        badge: "Apostles Sent Forth",
        desc: "Classical Arabic lexicographers struggled to explain <em>Hawāriyyūn</em> (often speculating it came from <em>ḥawār</em> 'whiteness' because the disciples wore white robes). But early Muslim exegetes and comparative philologists confirm it directly corresponds to Ge'ez <em>ḥawāryā</em> (from the verb <em>ḥ-w-r</em> 'to journey / go on mission'), which was the standard ecclesiastical term for <strong>'apostles / emissaries sent forth'</strong>."
      },
      {
        title: "Al-Mishkāt (مِشْكَاة - The Lamp Niche in Surah an-Nur 24:35)",
        badge: "Classical Tafsīr Attribution",
        desc: "In their commentary on the famous 'Light Verse', early authorities—including Mujāhid, al-Suddī, and al-Suyūtī—explicitly stated: <em>'Al-Mishkāt is the wall-niche in the language of the Abyssinians (al-Ḥabashah).'</em> Ge'ez preserved this term for the hollow wall recess that sheltered an oil lamp from the wind."
      },
      {
        title: "Al-Mā'idah (مَائِدَة - The Table Spread / Surah 5) vs. Ge'ez ማዕድ (mā'əd)",
        badge: "Sacred Banquet Table",
        desc: "In Ge'ez, <em>mā'əd</em> is the standard term for a festive dining table or consecrated communion table. Early Muslim scholars noted that this culinary and sacred term entered the speech of Hijazi merchants through Red Sea commerce with the ancient port of Adulis in the Kingdom of Aksum."
      },
      {
        title: "Jibt (جِبْت - Sorcery / False Deities in Surah 4:51)",
        badge: "Archaic Borrowing",
        desc: "Frequently cited by classical exegetes like al-Ṭabarī as an ancient loanword from Ethiopic (<em>gəbt</em>), meaning sorcery, divination, or phantom delusions, demonstrating how pre-Islamic Arabs embraced cross-Red Sea terminology."
      }
    ]
  }
};

function handleScriptBoxKey(event, scriptKey) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    openScriptInfoDialog(scriptKey);
  }
}

function openScriptInfoDialog(scriptKey) {
  const dialog = document.getElementById('script-info-dialog');
  if (!dialog) return;

  const info = SCRIPT_INFO_DATA[scriptKey];
  if (!info) return;

  const headerEl = document.getElementById('script-dialog-header');
  const bannerEl = document.getElementById('script-dialog-banner') || document.getElementById('script-dialog-root-banner');
  const bodyEl = document.getElementById('script-dialog-body');

  if (!headerEl || !bannerEl || !bodyEl) {
    console.error('Missing dialog elements:', { headerEl, bannerEl, bodyEl });
    return;
  }

  // Header
  headerEl.innerHTML = `
    <div class="script-dialog-topline">
      <h3 id="script-dialog-title" style="color:${info.colorVar};">
        ${info.name} <span dir="rtl" style="font-size:0.98rem; opacity:0.85;">(${info.nativeName})</span>
      </h3>
      <span class="script-dialog-tag" style="background:${info.colorVar}18; color:${info.colorVar};">${info.branch}</span>
    </div>
    <p class="script-dialog-subtitle">${info.subtitle}</p>
    <div class="script-dialog-direction">
      <span class="script-dialog-direction-badge">
        <span aria-hidden="true">${info.directionArrow}</span> ${info.direction}
      </span>
      <span class="script-dialog-direction-text">${info.directionDetail}</span>
    </div>
  `;

  // Dynamic Root Display
  let currentForm = '';
  let arabicRef = '';
  if (lastAnalysis && lastAnalysis.root) {
    arabicRef = lastAnalysis.root;
    switch (scriptKey) {
      case 'arabic': currentForm = lastAnalysis.root; break;
      case 'nabataean': currentForm = lastAnalysis.nabataean; break;
      case 'hebrew': currentForm = lastAnalysis.matchedHebrew || lastAnalysis.hebrew; break;
      case 'syriac': currentForm = lastAnalysis.syriac; break;
      case 'musnad': currentForm = lastAnalysis.musnad; break;
      case 'geez': currentForm = lastAnalysis.geez; break;
    }
  }

  if (scriptKey === 'arabic') {
    bannerEl.style.display = 'flex';
    if (currentForm) {
      bannerEl.innerHTML = `
        <div class="script-dialog-banner-left">
          <span class="script-dialog-banner-label">Baseline Qur'anic Root</span>
          <span class="script-dialog-banner-sub">Anchor for all comparative Semitic derivations</span>
        </div>
        <div class="script-dialog-banner-root" style="color:${info.colorVar};" dir="rtl">
          ${formatSurrogateAwareString(arabicRef)}
        </div>
      `;
    } else {
      bannerEl.innerHTML = `
        <div class="script-dialog-banner-left">
          <span class="script-dialog-banner-label">Baseline Script</span>
          <span class="script-dialog-banner-sub">Enter any Arabic root above to begin comparative analysis</span>
        </div>
        <div class="script-dialog-banner-root" style="color:${info.colorVar}; font-size:1.3rem;" dir="rtl">
          العربية
        </div>
      `;
    }
  } else if (currentForm) {
    bannerEl.style.display = 'flex';
    bannerEl.innerHTML = `
      <div class="script-dialog-banner-left">
        <span class="script-dialog-banner-label">Active Root in This Script</span>
        <span class="script-dialog-banner-sub">Arabic input: <strong dir="rtl">${formatSurrogateAwareString(arabicRef)}</strong></span>
      </div>
      <div class="script-dialog-banner-root ${info.fontClass}" style="color:${info.colorVar};" dir="${info.dir || 'rtl'}">
        ${formatSurrogateAwareString(currentForm)}
      </div>
    `;
  } else {
    bannerEl.style.display = 'flex';
    bannerEl.innerHTML = `
      <div class="script-dialog-banner-left">
        <span class="script-dialog-banner-label">Comparative Script</span>
        <span class="script-dialog-banner-sub">Enter any Arabic root above to see its live form here</span>
      </div>
      <div class="script-dialog-banner-root ${info.fontClass}" style="color:${info.colorVar}; font-size:1.3rem;" dir="${info.dir || 'rtl'}">
        ${info.nativeName}
      </div>
    `;
  }

  // Body content
  let bodyHtml = `
    <div class="script-dialog-section">
      <div class="script-dialog-section-title">
        <span>📖</span> What is this script / language?
      </div>
      <p class="script-dialog-section-p">${info.whatIsIt}</p>
    </div>
  `;

  if (info.branchMeaning) {
    bodyHtml += `
      <div class="script-dialog-section">
        <div class="script-dialog-section-title">
          <span>🌿</span> Linguistic Branch: What does "${info.branch}" mean?
        </div>
        <p class="script-dialog-section-p">${info.branchMeaning}</p>
      </div>
    `;
  }

  // Omit "Why is it shown for your root?" for Arabic since Arabic IS the core source root
  if (scriptKey !== 'arabic' && info.whyShown) {
    bodyHtml += `
      <div class="script-dialog-section">
        <div class="script-dialog-section-title">
          <span>🔍</span> Why is it shown for your root?
        </div>
        <p class="script-dialog-section-p">${info.whyShown}</p>
      </div>
    `;
  }

  if (info.influenceText) {
    bodyHtml += `
      <div class="script-dialog-influence" style="border-left-color:${info.colorVar};">
        <div class="script-dialog-section-title" style="color:${info.colorVar}; margin-bottom:6px;">
          <span>🏛️</span> ${info.influenceTitle || "Scholarly Insight: Historical Connection & Influence"}
        </div>
        <p class="script-dialog-influence-text">${info.influenceText}</p>
      </div>
    `;
  }

  if (info.examples && info.examples.length > 0) {
    bodyHtml += `
      <div class="script-dialog-section" style="margin-top:14px;">
        <div class="script-dialog-section-title">
          <span>✨</span> ${info.examplesTitle || "Concrete Qur'anic & Linguistic Examples"}
        </div>
        <div class="script-dialog-examples">
          ${info.examples.map(ex => `
            <div class="script-dialog-example-item">
              <div class="script-dialog-example-head">
                <span class="script-dialog-example-title">${ex.title}</span>
                ${ex.badge ? `<span class="script-dialog-example-badge">${ex.badge}</span>` : ''}
              </div>
              <p class="script-dialog-example-desc">${ex.desc}</p>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  bodyHtml += `
    <div class="script-dialog-callout" style="border-left-color:${info.colorVar}; background:${info.colorVar}12;">
      <div class="script-dialog-section-title" style="color:${info.colorVar}; margin-bottom:6px;">
        <span>🎯</span> Relation to our overall project
      </div>
      <p class="script-dialog-callout-text">${info.relationToProject}</p>
    </div>
  `;

  bodyEl.innerHTML = bodyHtml;

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

// ============================================================
// Lexicon Term Educational Explanations (Layman Language)
// ============================================================

const LEXICON_TERMS_DATA = {
  stems: {
    'Qal': {
      title: 'Qal (קַל) — Form I Verb',
      category: 'Hebrew Verbal Stem (Binyan)',
      arabic: 'Form I: فَعَلَ (الفِعْل المُجَرَّد)',
      summary: 'The basic, simple active form of a Semitic verb. It has no prefixes, no doubled consonants, and no added causative sounds.',
      whatItDoes: 'Represents the straightforward, primary action (e.g. "he wrote", "he sent", "he was complete"). In Hebrew grammar, the word <em>Qal</em> literally means <strong>"light"</strong> or <strong>"simple"</strong> because the root is in its purest state.',
      example: 'Root <strong>ש-ג-ר</strong> (*sh-g-r*) in Qal = <strong>שָׁגַר</strong> (*shāgar*) → <em>"he sent, sent off; it flowed"</em> (cognate to Arabic سَجَرَ).'
    },
    'Niph.': {
      title: 'Niphal (נִפְעַל) — Form VII Verb',
      category: 'Hebrew Verbal Stem (Binyan)',
      arabic: 'Form VII: اِنْفَعَلَ (المُطاوَعَة / المَبْنِيّ لِلْمَجْهُول)',
      summary: 'The passive or reflexive partner of the simple Qal stem. It is formed by prefixing the letter Nun (נ).',
      whatItDoes: 'Indicates that the action was received by the subject ("was written", "was done") or happened automatically ("flowed forth", "became visible").',
      example: 'From <strong>כָּתַב</strong> (*katav*, "he wrote") → <strong>נִכְתַּב</strong> (*nikhtav*, <em>"was written down / recorded"</em>, exact parallel to Arabic اِنْكَتَبَ).'
    },
    'Pi.': {
      title: "Pi'el (פִּעֵל) — Form II Verb (Intensive / Causative)",
      category: 'Hebrew Verbal Stem (Binyan)',
      arabic: 'Form II: فَعَّلَ (التَّكْثِير والتَّعْدِيَة بالتَّضْعِيف)',
      summary: 'An intensive, causative, or thorough action formed by doubling the middle consonant (dagesh / shaddah).',
      whatItDoes: 'In Semitic linguistics, doubling the middle letter deepens the action or makes it causative. For instance, while simple Qal <em>shalam</em> means "to be at peace", the Pi\'el <em>shillem</em> means "to repay in full, to make completely whole" (exact cognate of Arabic سَلَّمَ).',
      example: 'From <strong>שָׁלֵם</strong> (*shalem*, "complete") → <strong>שִׁלֵּם</strong> (*shillem*, <em>"he repaid / settled in full"</em>, Ar. سَلَّمَ).'
    },
    'Pu.': {
      title: "Pu'al (פֻּעַל) — Form II Passive",
      category: 'Hebrew Verbal Stem (Binyan)',
      arabic: 'Form II Passive: فُعِّلَ',
      summary: 'The passive voice of the intensive Pi\'el stem.',
      whatItDoes: 'Shows that the intensive or thorough action was received by the subject ("was repaid", "was taught", "was completely settled").',
      example: '<strong>שֻׁלַּם</strong> (*shullam*) → <em>"was paid off / settled in full"</em> (cognate to Arabic سُلِّمَ).'
    },
    'Hiph.': {
      title: "Hiph'il (הִפְעִיל) — Form IV Verb (Causative)",
      category: 'Hebrew Verbal Stem (Binyan)',
      arabic: 'Form IV: أَفْعَلَ (التَّعْدِيَة بِالهَمْزَة)',
      summary: 'The causative stem: "to cause or make someone else perform the action".',
      whatItDoes: 'Hebrew uses a prefixed "H" (הִ־) for causation where Arabic uses an "Alif/Hamza" (أَـ). For example, if the simple verb means "he wrote", the causative Hiph\'il means "he caused someone to write" → "he dictated"!',
      example: '<strong>הִכְתִּיב</strong> (*hikhtiv*) → <em>"he dictated / caused to write"</em> (Ar. أَكْتَبَ); <strong>הִשְׁלִים</strong> (*hishlim*) → <em>"he made peace / submitted"</em> (exact cognate to Arabic أَسْلَمَ).'
    },
    'Hoph.': {
      title: "Hoph'al (הָפְעַל) — Form IV Causative Passive",
      category: 'Hebrew Verbal Stem (Binyan)',
      arabic: 'Form IV Passive: أُفْعِلَ',
      summary: 'The passive voice of the causative Hiph\'il stem ("was made to happen").',
      whatItDoes: 'Shows that a caused action was experienced by the subject (e.g. "it was dictated", "was caused to surrender").',
      example: '<strong>הֻכְתַּב</strong> (*hukhtav*) → <em>"was dictated / recorded"</em> (cognate to Arabic أُكْتِبَ).'
    },
    'Hith.': {
      title: "Hithpa'el (הִתְפַּעֵל) — Form V Verb (Reflexive / Reciprocal)",
      category: 'Hebrew Verbal Stem (Binyan)',
      arabic: 'Form V / VI: تَفَعَّلَ / تَفَاعَلَ (المُطاوَعَة والمُشَارَكَة)',
      summary: 'The reflexive, reciprocal, or back-and-forth stem, formed with a prefixed "Hit-" (הִתְ־).',
      whatItDoes: 'Describes an action done to oneself, with each other, or repeatedly over time (e.g. "they corresponded together", "he pretended to be X").',
      example: '<strong>הִתְכַּתֵּב</strong> (*hitkattev*) → <em>"he corresponded with / wrote back and forth"</em> (cognate to Arabic تَكَاتَبَ).'
    },
    'Nith.': {
      title: "Nithpa'el (נִתְפַּעֵל) — Rabbinic Passive-Reflexive",
      category: 'Hebrew Verbal Stem (Binyan)',
      arabic: 'Form V Passive: تُفُعِّلَ',
      summary: 'A Mishnaic / Talmudic Hebrew stem blending Niphal (נ) and Hithpa\'el (ת).',
      whatItDoes: 'Serves as the everyday passive of Hithpa\'el in classical Rabbinic literature (e.g. "became reconciled", "was appeased").',
      example: '<strong>נִתְפַּיֵּס</strong> (*nitpayyes*) → <em>"was pacified / reconciled"</em>.'
    },
    'Shiph.': {
      title: "Shiph'el (שִׁפְעֵל) — Archaic Causative",
      category: 'Hebrew Verbal Stem (Binyan)',
      arabic: 'Form X: اِسْتَفْعَلَ / Sabaic Causative (s¹- stem)',
      summary: 'An ancient Semitic causative stem formed with an initial "Sh" (ש) prefix.',
      whatItDoes: 'Preserved in ancient Aramaic, Akkadian, and South Arabian (Sabaic) inscriptions, functioning as an archaic causative prefix.',
      example: '<strong>שַׁעְבֵּד</strong> (*sha\'bed*) → <em>"he subjugated / caused to serve"</em> (from root ע-ב-ד "servant/worship", Ar. ع-ب-د).'
    }
  },

  morph: {
    'pr. n. m.': {
      title: 'Proper Noun, Masculine (pr. n. m.)',
      category: 'Part of Speech',
      arabic: 'اِسْمُ عَلَمٍ مُذَكَّر',
      summary: 'A specific personal name of a man (e.g. Shallum, David, Solomon).',
      whatItDoes: 'Identifies an individual historical or biblical person rather than a common vocabulary word.'
    },
    'pr. n. f.': {
      title: 'Proper Noun, Feminine (pr. n. f.)',
      category: 'Part of Speech',
      arabic: 'اِسْمُ عَلَمٍ مُؤَنَّث',
      summary: 'A specific personal name of a woman (e.g. Sarah, Miriam).',
      whatItDoes: 'Identifies a named female historical or biblical figure.'
    },
    'pr. n. loc.': {
      title: 'Proper Noun, Location (pr. n. loc.)',
      category: 'Part of Speech',
      arabic: 'اِسْمُ مَكَانٍ / بَلَد',
      summary: 'A geographical proper name (city, mountain, river, or territory).',
      whatItDoes: 'Designates a specific place (e.g. Jerusalem, Sinai, Salem).'
    },
    'n-m': {
      title: 'Noun, Masculine (n-m / m.)',
      category: 'Part of Speech',
      arabic: 'اِسْمٌ مُذَكَّر',
      summary: 'A noun of masculine grammatical gender.',
      whatItDoes: 'Represents a person, object, or concept treated grammatically as masculine (e.g. <em>shalom</em> = peace, <em>melekh</em> = king).'
    },
    'n-f': {
      title: 'Noun, Feminine (n-f / f.)',
      category: 'Part of Speech',
      arabic: 'اِسْمٌ مُؤَنَّث',
      summary: 'A noun of feminine grammatical gender.',
      whatItDoes: 'Represents a person, object, or abstract concept treated grammatically as feminine (e.g. <em>malkah</em> = queen, <em>shalvah</em> = tranquility).'
    },
    'v': {
      title: 'Verb (v. / vb.)',
      category: 'Part of Speech',
      arabic: 'فِعْل',
      summary: 'An action, process, or state of being.',
      whatItDoes: 'Describes what someone did, does, or is experiencing.'
    },
    'adj': {
      title: 'Adjective (adj.)',
      category: 'Part of Speech',
      arabic: 'صِفَة / نَعْت',
      summary: 'A descriptive word modifying a noun.',
      whatItDoes: 'Describes a quality or property (e.g. <em>shalem</em> = whole, sound, complete).'
    },
    'adv': {
      title: 'Adverb (adv.)',
      category: 'Part of Speech',
      arabic: 'ظَرْف / حَال',
      summary: 'A word describing how, when, or where an action took place.',
      whatItDoes: 'Modifies a verb, adjective, or clause.'
    },
    'prep': {
      title: 'Preposition (prep.)',
      category: 'Part of Speech',
      arabic: 'حَرْفُ جَرّ',
      summary: 'A relational connecting word (e.g. in, with, from, upon).',
      whatItDoes: 'Links a noun or pronoun to the rest of the sentence.'
    },
    'intr. v.': {
      title: 'Intransitive Verb (intr. v.)',
      category: 'Part of Speech',
      arabic: 'فِعْلٌ لَازِم',
      summary: 'A verb that does not take a direct object.',
      whatItDoes: 'The action stays with the subject (e.g. "it flowed", "he slept", "it ended").'
    },
    'tr. v.': {
      title: 'Transitive Verb (tr. v.)',
      category: 'Part of Speech',
      arabic: 'فِعْلٌ مُتَعَدٍّ',
      summary: 'A verb that acts directly on an object.',
      whatItDoes: 'Requires a receiver of the action (e.g. "he wrote a letter", "he sent a messenger").'
    }
  }
};

function openLexiconTermDialog(type, code, extraData) {
  const dialog = document.getElementById('lexicon-term-dialog');
  if (!dialog) return;

  const titleEl = document.getElementById('lex-dialog-title');
  const catEl = document.getElementById('lex-dialog-category');
  const arabicWrap = document.getElementById('lex-dialog-arabic-wrap');
  const arabicBadge = document.getElementById('lex-dialog-arabic-badge');
  const bodyEl = document.getElementById('lex-dialog-body');
  const actionArea = document.getElementById('lex-dialog-action-area');

  let title = code || 'Grammar Term';
  let category = 'Hebrew Lexicon';
  let arabic = '';
  let summary = '';
  let whatItDoes = '';
  let example = '';
  let actionHtml = '';

  const cleanCode = (code || '').trim().replace(/^—\s*/, '').trim();

  if (type === 'stem') {
    category = 'Verbal Stem (Binyan)';
    let found = null;
    for (const [k, v] of Object.entries(LEXICON_TERMS_DATA.stems)) {
      if (cleanCode.toLowerCase().startsWith(k.toLowerCase().replace(/\./g, ''))) {
        found = v;
        break;
      }
    }
    if (found) {
      title = found.title;
      category = found.category;
      arabic = found.arabic;
      summary = found.summary;
      whatItDoes = found.whatItDoes;
      example = found.example;
    } else {
      title = `${cleanCode} (Verbal Stem)`;
      summary = `A derived verbal conjugation pattern (Binyan) in Hebrew modifying the root's meaning.`;
    }
  } else if (type === 'morph' || type === 'pos') {
    category = 'Part of Speech';
    const lower = cleanCode.toLowerCase();
    let found = null;

    if (lower.includes('pr') && lower.includes('loc')) found = LEXICON_TERMS_DATA.morph['pr. n. loc.'];
    else if (lower.includes('pr') && lower.includes('f')) found = LEXICON_TERMS_DATA.morph['pr. n. f.'];
    else if (lower.includes('pr') && lower.includes('m')) found = LEXICON_TERMS_DATA.morph['pr. n. m.'];
    else if (lower === 'n-m' || lower === 'm.' || lower === 'm' || lower === 'noun') found = LEXICON_TERMS_DATA.morph['n-m'];
    else if (lower === 'n-f' || lower === 'f.' || lower === 'f') found = LEXICON_TERMS_DATA.morph['n-f'];
    else if (lower.startsWith('intr')) found = LEXICON_TERMS_DATA.morph['intr. v.'];
    else if (lower.startsWith('tr')) found = LEXICON_TERMS_DATA.morph['tr. v.'];
    else if (lower.startsWith('v')) found = LEXICON_TERMS_DATA.morph['v'];
    else if (lower.startsWith('adj')) found = LEXICON_TERMS_DATA.morph['adj'];
    else if (lower.startsWith('adv')) found = LEXICON_TERMS_DATA.morph['adv'];
    else if (lower.startsWith('prep')) found = LEXICON_TERMS_DATA.morph['prep'];

    if (found) {
      title = found.title;
      category = found.category;
      arabic = found.arabic;
      summary = found.summary;
      whatItDoes = found.whatItDoes;
    } else {
      title = cleanCode;
      summary = `Grammatical classification indicating how this word functions in a sentence.`;
    }
  } else if (type === 'strong') {
    title = `Strong's Concordance #${cleanCode}`;
    category = 'Biblical Lexical Index';
    arabic = '';
    summary = `Strong's Concordance is a universal indexing system created by Dr. James Strong in 1890. Every unique root and vocabulary word in the Hebrew Bible was assigned a permanent index number from #1 to #8674.`;
    whatItDoes = `Because Hebrew words can appear with different prefixes, vowel points, or spelling variations across manuscripts and translations, scholars use <strong>Strong's Numbers</strong> as an unambiguous index ID. When a dictionary lists <em>#${cleanCode}</em>, it points directly to that exact biblical Hebrew entry regardless of how it is translated or vocalized.`;
    example = '';
    actionHtml = '';
  }

  titleEl.textContent = title;
  catEl.textContent = category;

  if (arabic) {
    arabicWrap.style.display = 'flex';
    arabicBadge.textContent = arabic;
  } else {
    arabicWrap.style.display = 'none';
  }

  let bodyHtml = `<p><strong>Summary:</strong> ${summary}</p>`;
  if (whatItDoes) {
    bodyHtml += `<p><strong>How it works:</strong> ${whatItDoes}</p>`;
  }
  if (example) {
    bodyHtml += `
      <div class="lex-dialog-example-card">
        <div class="lex-dialog-example-title">Concrete Example:</div>
        <div>${example}</div>
      </div>`;
  }
  bodyEl.innerHTML = bodyHtml;

  if (actionHtml) {
    actionArea.innerHTML = actionHtml;
    actionArea.style.display = 'block';
  } else {
    actionArea.style.display = 'none';
    actionArea.innerHTML = '';
  }

  // Backdrop click listener to close
  dialog.onclick = (e) => {
    if (e.target === dialog) dialog.close();
  };

  dialog.showModal();
}

// Initialize research shelf
renderResearchShelf();

// Synchronous modal scroll lock with exact CSS scrollbar compensation (zero layout shift)
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

function lockModalState(targetDialog) {
  if (!isModalOpen) {
    lockedScrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;

    // Measure exact scrollbar width before locking
    const scrollbarWidth = Math.max(0, window.innerWidth - document.documentElement.clientWidth);
    document.documentElement.style.setProperty('--scrollbar-compensation', `${scrollbarWidth}px`);

    document.documentElement.classList.add('modal-open');
    document.body.classList.add('modal-open');
    isModalOpen = true;
  }
  if (targetDialog) {
    targetDialog.scrollTop = 0;
  }
}

function unlockModalState(closingDialog) {
  queueMicrotask(() => {
    const openDialogs = Array.from(document.querySelectorAll('dialog')).filter(d => d.open && d !== closingDialog);
    if (openDialogs.length === 0 && isModalOpen) {
      isModalOpen = false;
      document.documentElement.classList.remove('modal-open');
      document.body.classList.remove('modal-open');
      document.documentElement.style.setProperty('--scrollbar-compensation', '0px');
      window.scrollTo(window.scrollX || 0, lockedScrollY);
      document.querySelectorAll('dialog').forEach(d => {
        delete d.dataset.modalInit;
      });
    }
  });
}

// Hook native showModal & close for instantaneous synchronous lock without microtask flicker
if (typeof HTMLDialogElement !== 'undefined' && HTMLDialogElement.prototype) {
  const originalShowModal = HTMLDialogElement.prototype.showModal;
  const originalClose = HTMLDialogElement.prototype.close;

  HTMLDialogElement.prototype.showModal = function() {
    lockModalState(this);
    try {
      return originalShowModal.call(this);
    } finally {
      this.scrollTop = 0;
    }
  };

  HTMLDialogElement.prototype.close = function(returnValue) {
    const res = originalClose.call(this, returnValue);
    unlockModalState(this);
    return res;
  };
}

const dialogObserver = new MutationObserver(() => {
  const anyOpen = Array.from(document.querySelectorAll('dialog')).some(d => d.open);
  if (anyOpen && !isModalOpen) {
    lockModalState();
  } else if (!anyOpen && isModalOpen) {
    unlockModalState();
  }
});

document.querySelectorAll('dialog').forEach(dialog => {
  dialogObserver.observe(dialog, { attributes: true, attributeFilter: ['open'] });
  dialog.addEventListener('close', () => unlockModalState(dialog));
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
