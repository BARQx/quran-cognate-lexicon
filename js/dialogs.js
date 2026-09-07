// ============================================================
// Interactive Dialog Controllers
// Script information, lexicon terms, morphology, and sound shifts
// ============================================================

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
    if (typeof lastAnalysis !== 'undefined' && lastAnalysis && lastAnalysis.usedAlternate) {
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
    if (typeof lastAnalysis !== 'undefined' && lastAnalysis && lastAnalysis.root) {
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
  } else if (typeof lastAnalysis !== 'undefined' && lastAnalysis && lastAnalysis.tags) {
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
  if (typeof lastAnalysis !== 'undefined' && lastAnalysis && lastAnalysis.root) {
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

  dialog.showModal();
}
