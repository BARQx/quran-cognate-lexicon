// ============================================================
// SEMITIC MATRIX — Verified historical correspondences
// ============================================================

const SEMITIC_MATRIX = {
  'ا': { he: 'א', syr: 'ܐ', nab: '𐢁', msn: '𐩱', gz: 'አ', bw: 'A', note: 'Glottal stop (ʾ) — like the catch in "uh-oh"' },
  'أ': { he: 'א', syr: 'ܐ', nab: '𐢁', msn: '𐩱', gz: 'አ', bw: '>', note: 'Glottal stop with a' },
  'إ': { he: 'א', syr: 'ܐ', nab: '𐢁', msn: '𐩱', gz: 'አ', bw: '<', note: 'Glottal stop with i' },
  'آ': { he: 'א', syr: 'ܐ', nab: '𐢁', msn: '𐩱', gz: 'አ', bw: '|', note: 'Glottal stop with ā' },
  'ء': { he: 'א', syr: 'ܐ', nab: '𐢁', msn: '𐩱', gz: 'አ', bw: '\'', note: 'Glottal stop (hamza)' },
  'ؤ': { he: 'א', syr: 'ܐ', nab: '𐢁', msn: '𐩱', gz: 'አ', bw: '&', note: 'Hamza seated on wāw (ؤ) — still a glottal stop' },
  'ئ': { he: 'א', syr: 'ܐ', nab: '𐢁', msn: '𐩱', gz: 'አ', bw: '}', note: 'Hamza seated on yā\' (ئ) — still a glottal stop' },
  'ب': { he: 'ב', syr: 'ܒ', nab: '𐢃', msn: '𐩨', gz: 'በ', bw: 'b', note: 'Voiced bilabial plosive (b) — lips together, vocal cords vibrate' },
  'ت': { he: 'ת', syr: 'ܬ', nab: '𐢞', msn: '𐩩', gz: 'ተ', bw: 't', note: 'Voiceless dental plosive (t) — tongue against teeth, no vocal cord vibration' },
  'ث': { he: 'ת', syr: 'ܬ', nab: '𐢞', msn: '𐩻', gz: 'ተ', bw: 'v', note: 'Voiceless interdental fricative (th) — merged with t in Ge\'ez' },
  'ج': { he: 'ג', syr: 'ܓ', nab: '𐢄', msn: '𐩴', gz: 'ገ', bw: 'j', note: 'Voiced velar plosive (g) — back of tongue against soft palate' },
  'ح': { he: 'ח', syr: 'ܚ', nab: '𐢊', msn: '𐩢', gz: 'ሐ', bw: 'H', note: 'Voiceless pharyngeal fricative (ḥ) — deep throat sound, like heavy "h"' },
  'خ': { he: 'ח', syr: 'ܚ', nab: '𐢊', msn: '𐩭', gz: 'ኀ', bw: 'x', note: 'Voiceless velar fricative (kh) — merged with ḥ in Hebrew/Syriac/Nabataean' },
  'د': { he: 'ד', syr: 'ܕ', nab: '𐢅', msn: '𐩵', gz: 'ደ', bw: 'd', note: 'Voiced dental plosive (d) — tongue against teeth, vocal cords vibrate' },
  'ذ': { he: 'ז', syr: 'ܕ', nab: '𐢅', msn: '𐩹', gz: 'ዘ', bw: '*', note: 'Voiced interdental fricative (dh) — merged with z in Hebrew, d in Syriac/Nabataean' },
  'ر': { he: 'ר', syr: 'ܪ', nab: '𐢛', msn: '𐩧', gz: 'ረ', bw: 'r', note: 'Voiced alveolar trill (r) — rolled "r" with tongue vibrating' },
  'ز': { he: 'ז', syr: 'ܙ', nab: '𐢉', msn: '𐩸', gz: 'ዘ', bw: 'z', note: 'Voiced alveolar fricative (z) — tongue near ridge, vocal cords vibrate' },
  'س': { he: 'ש', syr: 'ܣ', nab: '𐢖', msn: '𐩪', gz: 'ሰ', bw: 's', note: 'Voiceless alveolar fricative (s) — Proto-Semitic *s3' },
  'ش': { he: 'ש', syr: 'ܫ', nab: '𐢝', msn: '𐩦', gz: 'ሠ', bw: '$', note: 'Voiceless palato-alveolar fricative (sh) — cognate to Śawt (ሠ) in Ge\'ez' },
  'ص': { he: 'צ', syr: 'ܨ', nab: '𐢙', msn: '𐩮', gz: 'ጸ', bw: 'S', note: 'Emphatic voiceless alveolar fricative (ṣ) — "s" with pharyngeal constriction' },
  'ض': { he: 'צ', syr: 'ܨ', nab: '𐢙', msn: '𐩳', gz: 'ፀ', bw: 'D', note: 'Emphatic voiced alveolar lateral fricative (ḍ) — merged with ṣ in Hebrew/Syriac' },
  'ط': { he: 'ט', syr: 'ܛ', nab: '𐢋', msn: '𐩷', gz: 'ጠ', bw: 'T', note: 'Emphatic voiceless dental plosive (ṭ) — emphatic "t" with pharyngeal constriction' },
  'ظ': { he: 'צ', syr: 'ܛ', nab: '𐢋', msn: '𐩼', gz: 'ፀ', bw: 'Z', note: 'Emphatic voiced interdental fricative (ẓ) — merged with ṣ in Hebrew, with ṭ in Syriac/Nabataean' },
  'ع': { he: 'ע', syr: 'ܥ', nab: '𐢗', msn: '𐩲', gz: 'ዐ', bw: 'E', note: 'Voiced pharyngeal fricative (ʿ) — deep "a" sound from the throat' },
  'غ': { he: 'ע', syr: 'ܥ', nab: '𐢗', msn: '𐩶', gz: 'ዐ', bw: 'g', note: 'Voiced velar fricative (gh) — merged with ʿ in Hebrew/Syriac/Nabataean/Ge\'ez' },
  'ف': { he: 'פ', syr: 'ܦ', nab: '𐢘', msn: '𐩰', gz: 'ፈ', bw: 'f', note: 'Voiceless labiodental fricative (f) — Proto-Semitic *p, became f in Arabic' },
  'ق': { he: 'ק', syr: 'ܩ', nab: '𐢚', msn: '𐩤', gz: 'ቀ', bw: 'q', note: 'Voiceless uvular plosive (q) — deep "k" from the back of the throat' },
  'ك': { he: 'כ', syr: 'ܟ', nab: '𐢏', msn: '𐩫', gz: 'ከ', bw: 'k', note: 'Voiceless velar plosive (k) — back of tongue against soft palate' },
  'ل': { he: 'ל', syr: 'ܠ', nab: '𐢑', msn: '𐩡', gz: 'ለ', bw: 'l', note: 'Voiced alveolar lateral approximant (l) — air flows around sides of tongue' },
  'م': { he: 'מ', syr: 'ܡ', nab: '𐢓', msn: '𐩣', gz: 'መ', bw: 'm', note: 'Voiced bilabial nasal (m) — lips together, air through nose' },
  'ن': { he: 'נ', syr: 'ܢ', nab: '𐢕', msn: '𐩬', gz: 'ነ', bw: 'n', note: 'Voiced alveolar nasal (n) — tongue on ridge, air through nose' },
  'ه': { he: 'ה', syr: 'ܗ', nab: '𐢇', msn: '𐩠', gz: 'ሀ', bw: 'h', note: 'Voiceless glottal fricative (h) — breathy sound from the throat' },
  'و': { he: 'ו', syr: 'ܘ', nab: '𐢈', msn: '𐩥', gz: 'ወ', bw: 'w', note: 'Voiced labiovelar approximant (w) — like English "w"' },
  'ي': { he: 'י', syr: 'ܝ', nab: '𐢍', msn: '𐩺', gz: 'የ', bw: 'y', note: 'Voiced palatal approximant (y) — like English "y"' },
  'ى': { he: 'י', syr: 'ܝ', nab: '𐢍', msn: '𐩺', gz: 'የ', bw: 'Y', note: 'Alif maqsurah (long ā)' },
  'ة': { he: 'ת', syr: 'ܬ', nab: '𐢞', msn: '𐩩', gz: 'ተ', bw: 'p', note: 'Ta marbuta (feminine ending)' }
};

// Dialectal and keyboard character aliases
SEMITIC_MATRIX['ی'] = SEMITIC_MATRIX['ي'];
SEMITIC_MATRIX['ے'] = SEMITIC_MATRIX['ي'];
SEMITIC_MATRIX['ک'] = SEMITIC_MATRIX['ك'];
SEMITIC_MATRIX['ڪ'] = SEMITIC_MATRIX['ك'];
SEMITIC_MATRIX['ہ'] = SEMITIC_MATRIX['ه'];
SEMITIC_MATRIX['ھ'] = SEMITIC_MATRIX['ه'];
SEMITIC_MATRIX['ۃ'] = SEMITIC_MATRIX['ة'];

const FINAL_LETTERS = { 'כ': 'ך', 'מ': 'ם', 'נ': 'ן', 'פ': 'ף', 'צ': 'ץ' };

// Secondary Hebrew alternates for letters with attested historical variation.
// The primary mapping in SEMITIC_MATRIX stays the canonical display cognate;
// these are only used to widen the dictionary SEARCH when the primary spelling
// returns no results.
const HEBREW_ALT_LETTERS = {
  'س': 'ס', // Arabic س covers two Proto-Semitic sibilants; Hebrew kept them separate (ש vs ס)
  'ظ': 'ט', // Primary ẓ > צ, but some entries reflect the later/Aramaic-influenced ט form
  'ذ': 'ד'  // Primary ḏ > ז, but Aramaic-influenced words show ד instead
};
