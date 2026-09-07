// ============================================================
// Lexicon Term Educational Explanations (Layman Language)
// Hebrew binyanim, morphology tags, and linguistic concepts
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

if (typeof window !== 'undefined') {
  window.LEXICON_TERMS_DATA = LEXICON_TERMS_DATA;
}

