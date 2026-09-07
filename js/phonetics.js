// ============================================================
// Phonetics, Transliteration, and Morphological Analysis
// ============================================================

function normalizeInput(text) {
  if (!text) return '';
  return text
    .replace(/[\u064B-\u065F\u0670\u0652\s\-_،۔]/g, '')
    .replace(/[\u06CC\u06D2\u0649]/g, 'ي') 
    .replace(/[\u06A9\u06AA]/g, 'ك')
    .replace(/[\u06C1\u06BE\u06D5]/g, 'ه')
    .replace(/[\u06C3]/g, 'ة')
    // NOTE: أ/إ/آ/ء/ؤ/ئ are intentionally left distinct here (not collapsed to
    // ا). SEMITIC_MATRIX already maps every hamza form to the same Hebrew/
    // Syriac/Nabataean/Musnad/Ge'ez cognate, but each needs its own distinct
    // Buckwalter code (>, <, |, ', &, }) for a working Ejtaal lookup — collapsing
    // them here before the matrix lookup silently threw that away.
    .replace(/[\u0660-\u0669\u06F0-\u06F9]/g, '');
}

function getBuckwalter(text) {
  let clean = normalizeInput(text);
  let bw = '';
  for (let char of Array.from(clean)) {
    bw += SEMITIC_MATRIX[char] ? SEMITIC_MATRIX[char].bw : char;
  }
  return bw;
}

function applyHebrewSofit(hebrewStr) {
  if (!hebrewStr) return hebrewStr;
  const chars = Array.from(hebrewStr);
  const lastChar = chars[chars.length - 1];
  if (FINAL_LETTERS[lastChar]) {
    chars[chars.length - 1] = FINAL_LETTERS[lastChar];
  }
  return chars.join('');
}

function formatSurrogateAwareString(str) {
  return Array.from(str).join('-');
}

function detectRootMorphology(cleanInput) {
  const tags = [];
  if (cleanInput.includes('و') || cleanInput.includes('ي') || cleanInput.includes('ا')) {
    tags.push('Weak Root (معتل)');
    if (cleanInput.startsWith('و') || cleanInput.startsWith('ي')) tags.push('Assimilating Initial (مثال)');
    if (cleanInput.length >= 2 && (cleanInput[1] === 'و' || cleanInput[1] === 'ي')) tags.push('Hollow Medial (جوف)');
    if (cleanInput.endsWith('و') || cleanInput.endsWith('ي') || cleanInput.endsWith('ا')) tags.push('Defective Final (ناقص)');
  }
  if (cleanInput.length === 2 || (cleanInput.length === 3 && cleanInput[1] === cleanInput[2])) {
    tags.push('Geminate / Doubled (مضاعف)');
  }
  return tags;
}

function convertArabicCognates(cleanInput) {
  let hebResult = '', syrResult = '', nabResult = '', msnResult = '', gzResult = '', bwResult = '';
  let breakdown = [];

  for (let char of Array.from(cleanInput)) {
    let matrix = SEMITIC_MATRIX[char];
    if (!matrix) {
      matrix = { he: char, syr: char, nab: char, msn: char, gz: char, bw: char, note: 'Direct match (fallback)' };
    }
    
    hebResult += matrix.he;
    syrResult += matrix.syr;
    nabResult += matrix.nab;
    msnResult += matrix.msn || char;
    gzResult += matrix.gz;
    bwResult += matrix.bw;

    breakdown.push({
      ar: char,
      he: matrix.he,
      syr: matrix.syr,
      nab: matrix.nab,
      msn: matrix.msn || char,
      gz: matrix.gz,
      note: matrix.note
    });
  }

  return { 
    primaryHebrew: applyHebrewSofit(hebResult), 
    syriac: syrResult,
    nabataean: nabResult,
    musnad: msnResult,
    geez: gzResult,
    buckwalter: bwResult,
    breakdown 
  };
}

// Builds historically-plausible Hebrew root spellings ordered by phonetic
// likelihood (single regular sound shifts prioritized ahead of multi-shift combinations).
function generateHebrewRootCandidates(cleanInput) {
  const chars = Array.from(cleanInput);
  const n = chars.length;
  if (n === 0) return [];

  const perPosition = chars.map((char, idx) => {
    const matrix = SEMITIC_MATRIX[char];
    const primaryHe = matrix ? matrix.he : char;
    const opts = [{ char: primaryHe, cost: 0 }];

    // Initial Waw (و) -> Yodh (י) is regular in Northwest Semitic / Hebrew (highest probability)
    if (idx === 0 && char === 'و') {
      opts.push({ char: 'י', cost: 1 });
    }

    // Sibilants and regular consonantal variation
    if (HEBREW_ALT_LETTERS[char]) {
      // Arabic س -> Hebrew ס is a very regular split correspondence
      const cost = char === 'س' ? 2 : 4;
      opts.push({ char: HEBREW_ALT_LETTERS[char], cost });
    }

    // Final weak radical (ي / ى / و) commonly surfaces as He (ה) in Hebrew
    if (idx === n - 1 && (char === 'ي' || char === 'ى' || char === 'و')) {
      opts.push({ char: 'ה', cost: 3 });
    }

    // Deduplicate per position keeping lowest cost
    const seen = new Map();
    opts.forEach(o => {
      if (!seen.has(o.char) || seen.get(o.char).cost > o.cost) {
        seen.set(o.char, o);
      }
    });
    return Array.from(seen.values());
  });

  let combos = [{ text: '', totalCost: 0 }];
  perPosition.forEach(posOpts => {
    combos = combos.flatMap(c => posOpts.map(o => ({
      text: c.text + o.char,
      totalCost: c.totalCost + o.cost
    })));
  });

  // Order by total historical mutation cost (single, high-probability shifts first)
  combos.sort((a, b) => a.totalCost - b.totalCost);

  const unique = [];
  const seenTexts = new Set();
  for (const c of combos) {
    const finalized = applyHebrewSofit(c.text);
    if (!seenTexts.has(finalized)) {
      seenTexts.add(finalized);
      unique.push(finalized);
    }
  }
  return unique;
}
