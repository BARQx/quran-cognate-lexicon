// ============================================================
// Lexicon API Services (Sefaria & Wiktionary)
// ============================================================

/**
 * Strips Hebrew cantillation marks, niqqud (points), dagesh, and
 * lexicographical numeral annotations (e.g. ᴵ, ᴵᴵ, *, 1, 2)
 */
function stripHebrewDiacritics(str) {
  if (!str) return '';
  return str
    .replace(/[\u0591-\u05C7]/g, '') // Hebrew cantillation and vowels
    .replace(/[\u002A\u00B9\u00B2\u00B3\u2070-\u2079\u1D2C-\u1D61\u2160-\u216B]/g, '') // Superscripts & Roman numerals
    .replace(/[^\u05D0-\u05EA\s]/g, '') // Retain Hebrew letters and spaces
    .trim();
}

/**
 * Normalizes Hebrew final forms (sofit) to standard consonant forms for comparison
 */
function normalizeHebrewSofit(str) {
  if (!str) return '';
  return str
    .replace(/ך/g, 'כ')
    .replace(/ם/g, 'מ')
    .replace(/ן/g, 'נ')
    .replace(/ף/g, 'פ')
    .replace(/ץ/g, 'צ');
}

/**
 * Checks if a Sefaria entry headword is genuinely relevant to the requested Hebrew root.
 * Filters out biblical collocations, proper noun compounds, and unrelated words
 * (e.g., eliminates לֵבָב / "heart" when querying root שלם).
 */
function isRelevantHebrewHeadword(headword, targetRoot) {
  if (!headword || !targetRoot) return false;
  const normHw = normalizeHebrewSofit(stripHebrewDiacritics(headword));
  const normRoot = normalizeHebrewSofit(stripHebrewDiacritics(targetRoot));
  if (!normHw || !normRoot) return false;

  // Direct consonant match
  if (normHw === normRoot) return true;

  // Reject multi-word compounds (e.g. "רגם מלך") unless target itself has spaces
  if (normHw.includes(' ') && !normRoot.includes(' ')) {
    const firstWord = normHw.split(/\s+/)[0];
    return firstWord === normRoot;
  }

  // Ensure root consonants appear in exact relative order (accommodating matres lectionis / prefixes)
  let rIdx = 0;
  for (let i = 0; i < normHw.length && rIdx < normRoot.length; i++) {
    if (normHw[i] === normRoot[rIdx]) {
      rIdx++;
    }
  }
  if (rIdx !== normRoot.length) return false;

  // Ensure headword is not an excessively distant derivative
  if (normHw.length > normRoot.length + 3) return false;

  return true;
}

/**
 * Decodes common HTML entities
 */
function decodeHtmlEntities(str) {
  if (!str) return '';
  return str
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')
    .replace(/&#x27;/g, "'");
}

/**
 * Sanitizes and cleans raw dictionary HTML while preserving scholarly emphasis
 * and converting Sefaria internal links into clean external references.
 */
function sanitizeLexiconHtml(raw) {
  if (!raw) return '';
  let html = raw;

  // 1. Fix malformed nested <a> tags in raw Sefaria OCR data (e.g. <a ...><a ...>word</a>)</a>)
  html = html.replace(/<a\b[^>]*>(?=\s*<a\b)/gi, '');
  html = html.replace(/<\/a>(?=\s*\)?[^<]*<\/a>)/gi, '');

  // 2. Globally rewrite any relative Sefaria internal hrefs (/...) to absolute https://www.sefaria.org URLs
  // This prevents local browsers from resolving relative links to file:///C:/...
  html = html.replace(/href=["']\/([^"']+)["']/gi, 'href="https://www.sefaria.org/$1" target="_blank" rel="noopener"');

  // 3. Move accidental trailing parentheses outside of link tags
  html = html.replace(/\)\s*<\/a>/gi, '</a>)');

  // 4. Ensure inline RTL spans are properly isolated with <bdi>
  html = html.replace(/<span\s+dir=["']rtl["']>(.*?)<\/span>/gi, ' <bdi dir="rtl" class="hebrew-inline">$1</bdi> ');
  
  // 5. Transform citation links to clean external links with proper class
  html = html.replace(/<a\b([^>]*)>/gi, (m, attrs) => {
    let cleanAttrs = attrs;
    if (!cleanAttrs.includes('class=')) {
      cleanAttrs += ' class="lex-cite-link"';
    } else {
      cleanAttrs = cleanAttrs.replace(/class=["'][^"']*["']/gi, 'class="lex-cite-link"');
    }
    if (!cleanAttrs.includes('target=')) {
      cleanAttrs += ' target="_blank" rel="noopener"';
    }
    return `<a${cleanAttrs}>`;
  });

  // 6. Strip unneeded styling tags but preserve emphasis, bolding, and links
  html = html.replace(/<\/?(?!strong\b|b\b|em\b|i\b|a\b|bdi\b)[a-z0-9]+[^>]*>/gi, ' ');
  html = decodeHtmlEntities(html);

  // Normalize spacing and clean up stray OCR punctuation
  html = html.replace(/[ \t]+/g, ' ');
  html = html.replace(/\s*\(\s*\)/g, '');
  html = html.replace(/\(\s*<\/strong>/gi, '</strong> (');
  html = html.replace(/\s+([,;:?.])/g, '$1');

  return html.trim();
}

/**
 * Renders entries into structured, beautiful HTML cards
 */
function formatHomonymsLocally(entries) {
  if (!Array.isArray(entries) || entries.length === 0) return '';
  let html = '';

  entries.forEach((group, index) => {
    const isWiktionary = !group.stems && !group.etymology && !group.strongNumber && !group.transliteration;
    
    // Header components
    let headerHtml = '';
    if (isWiktionary) {
      const pos = group.headword || `Sense ${index + 1}`;
      const escapedPos = pos.replace(/'/g, "\\'");
      headerHtml = `
        <div class="lex-entry-header">
          <div class="lex-entry-meta">
            <span class="lex-badge part-of-speech clickable-term" onclick="openLexiconTermDialog('pos', '${escapedPos}')" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();openLexiconTermDialog('pos', '${escapedPos}');}" role="button" tabindex="0" title="Click to learn about '${pos}' in simple terms">${pos}</span>
          </div>
        </div>`;
    } else {
      const hw = group.headword ? `<span class="lex-hw hebrew-font" dir="rtl">${group.headword}</span>` : '';
      const translit = group.transliteration ? `<span class="lex-translit">${group.transliteration}</span>` : '';
      const pronun = group.pronunciation ? `<span class="lex-pronun">/${group.pronunciation}/</span>` : '';
      
      const morphVal = group.morphology || '';
      const escapedMorph = morphVal.replace(/'/g, "\\'");
      const morph = morphVal ? `<span class="lex-badge morph-badge clickable-term" onclick="openLexiconTermDialog('morph', '${escapedMorph}')" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();openLexiconTermDialog('morph', '${escapedMorph}');}" role="button" tabindex="0" title="Click to learn what '${morphVal}' means in simple terms">${morphVal}</span>` : '';
      
      const strongNum = group.strongNumber || '';
      const strong = strongNum ? `<span class="lex-badge strong-badge clickable-term" onclick="openLexiconTermDialog('strong', '${strongNum}')" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();openLexiconTermDialog('strong', '${strongNum}');}" role="button" tabindex="0" title="Click to learn about Strong's Concordance #${strongNum}">Strong #${strongNum}</span>` : '';
      
      headerHtml = `
        <div class="lex-entry-header">
          <div class="lex-entry-meta">
            <span class="lex-sense-pill">Sense ${index + 1}</span>
            ${hw}
            ${translit}
            ${pronun}
          </div>
          <div class="lex-entry-tags">
            ${morph}
            ${strong}
          </div>
        </div>`;
    }

    // Primary definitions
    let defsHtml = '';
    const cleanDefs = (group.defs || []).filter(Boolean);
    if (cleanDefs.length > 0) {
      defsHtml = `
        <ul class="def-list">
          ${cleanDefs.map(d => `<li class="def-item">${d}</li>`).join('')}
        </ul>`;
    }

    // Verbal Stems (Binyanim from Klein / BDB)
    let stemsHtml = '';
    if (group.stems && group.stems.length > 0) {
      const stemItems = group.stems.map(s => {
        const stemClean = (s.stem || '').replace(/^—\s*/, '').trim();
        const escapedStem = stemClean.replace(/'/g, "\\'");
        const stemBadge = stemClean ? `<span class="stem-badge clickable-term" onclick="openLexiconTermDialog('stem', '${escapedStem}')" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();openLexiconTermDialog('stem', '${escapedStem}');}" role="button" tabindex="0" title="Click to learn what the '${stemClean}' verbal stem means">${stemClean}</span>` : '';
        const stemForm = s.form ? `<span class="stem-form hebrew-font" dir="rtl">${s.form}</span>` : '';
        const stemDef = s.defs && s.defs.length > 0 ? `<span class="stem-def">${s.defs.join('; ')}</span>` : '';
        return `<div class="stem-row">${stemBadge}${stemForm}${stemDef}</div>`;
      }).join('');

      stemsHtml = `
        <div class="lex-stems-container">
          <div class="lex-subhead">Verbal Stems (Binyanim):</div>
          <div class="stem-grid">${stemItems}</div>
        </div>`;
    }

    // Comparative Semitic Etymology (Klein / BDB)
    let etymologyHtml = '';
    if (group.etymology) {
      etymologyHtml = `
        <details class="lex-etymology-details" open>
          <summary class="lex-etymology-summary">
            <span class="etym-icon">📜</span>
            <span class="etym-title">Comparative Semitic Etymology</span>
          </summary>
          <div class="lex-etymology-content">
            ${group.etymology}
          </div>
        </details>`;
    }

    // Attested Derivatives (Klein)
    let derivativesHtml = '';
    if (group.derivatives) {
      derivativesHtml = `
        <details class="lex-derivatives-details">
          <summary class="lex-derivatives-summary">
            <span class="deriv-icon">✦</span>
            <span class="deriv-title">Attested Hebrew Derivatives</span>
          </summary>
          <div class="lex-derivatives-content">
            ${group.derivatives}
          </div>
        </details>`;
    }

    if (defsHtml || stemsHtml || etymologyHtml) {
      html += `
        <div class="homonym-group lex-entry-card">
          ${headerHtml}
          ${defsHtml}
          ${stemsHtml}
          ${etymologyHtml}
          ${derivativesHtml}
        </div>`;
    }
  });

  return html;
}

/**
 * Fetches classical lexicon entries from Sefaria, groups them by dictionary name,
 * extracts verbal stems and comparative etymology, and rejects irrelevant matches.
 */
async function fetchSefariaDefinitionsGrouped(hebrewStr) {
  try {
    const response = await fetch(`https://www.sefaria.org/api/words/${encodeURIComponent(hebrewStr)}`);
    if (!response.ok) return {};
    const data = await response.json();
    
    const dictionaries = {};
    if (Array.isArray(data)) {
      data.forEach(entry => {
        const headword = entry.headword || "";
        
        // Strict root relevance filtering: eliminate collocations and spurious words
        if (!isRelevantHebrewHeadword(headword, hebrewStr)) {
          return;
        }

        const dictName = entry.parent_lexicon || entry.parent_lexicon_details?.name || "BDB Lexicon";
        let defs = [];
        let stems = [];
        let etymology = entry.notes ? sanitizeLexiconHtml(entry.notes) : null;
        let derivatives = entry.derivatives ? sanitizeLexiconHtml(entry.derivatives) : null;
        const transliteration = entry.transliteration || "";
        const pronunciation = entry.pronunciation || "";
        const strongNumber = entry.strong_number || "";
        const morphology = entry.content?.morphology || "";

        if (entry.parent_lexicon_details && entry.parent_lexicon_details.defs) {
          defs = entry.parent_lexicon_details.defs.map(d => sanitizeLexiconHtml(d)).filter(Boolean);
        } else if (entry.content && entry.content.senses) {
          entry.content.senses.forEach(s => {
            if (s.definition && s.definition.trim()) {
              defs.push(sanitizeLexiconHtml(s.definition));
            }

            // Extract Klein verbal stems (Binyanim)
            if (s.grammar && (s.grammar.verbal_stem || s.grammar.binyan_form)) {
              const stemName = s.grammar.verbal_stem ? s.grammar.verbal_stem.replace(/^—\s*/, '').trim() : '';
              const binyanForm = Array.isArray(s.grammar.binyan_form) ? s.grammar.binyan_form.join(', ') : (s.grammar.binyan_form || '');
              const stemDefs = [];
              if (Array.isArray(s.senses)) {
                s.senses.forEach(sub => {
                  if (sub.definition && sub.definition.trim() && sub.definition.trim() !== '.') {
                    stemDefs.push(sanitizeLexiconHtml(sub.definition));
                  }
                });
              }
              if (stemDefs.length > 0 || binyanForm) {
                stems.push({
                  stem: stemName,
                  form: binyanForm,
                  defs: stemDefs
                });
              }
            }
          });
        }

        if (defs.length > 0 || stems.length > 0 || etymology) {
          if (!dictionaries[dictName]) dictionaries[dictName] = [];
          dictionaries[dictName].push({
            headword,
            transliteration,
            pronunciation,
            strongNumber,
            morphology,
            defs,
            stems,
            etymology,
            derivatives
          });
        }
      });
    }
    return dictionaries;
  } catch (e) {
    return {};
  }
}

/**
 * Fetches modern Hebrew definitions from Wiktionary
 */
async function fetchWiktionaryDefinition(hebrewStr) {
  try {
    const url = `https://en.wiktionary.org/api/rest_v1/page/definition/${encodeURIComponent(hebrewStr)}`;
    const response = await fetch(url);
    if (!response.ok) return null;
    
    const data = await response.json();
    if (!data.he) return null;

    let entryGroups = [];
    data.he.forEach(entry => {
      let pos = entry.partOfSpeech || "Definition";
      let defs = (entry.definitions || []).map(d => sanitizeLexiconHtml(d.definition)).filter(Boolean);
      if (defs.length > 0) {
        entryGroups.push({ headword: pos, defs });
      }
    });

    return entryGroups.length > 0 ? formatHomonymsLocally(entryGroups) : null;
  } catch (e) {
    return null;
  }
}
