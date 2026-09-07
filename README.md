# Qur'anic Arabic Cognate & Lexicon Portal

A comparative root analyzer and multi-dictionary portal for Qur'anic Arabic and its sister language Hebrew, featuring ancient script reconstruction and classical Arabic lexicon lookups.

This tool helps you explore the deeper, original meanings of Qur'anic words along two distinct research paths:

1. **The Hebrew Cognate Path:** Connect any Qur'anic Arabic root to its sister language, Hebrew, and immediately search live classical Hebrew dictionaries. Because Arabic and Hebrew are direct linguistic sisters sharing the same Semitic family tree, thousands of words share identical origins. Classical Arabic dictionaries often narrowed words down to later poetry or theological terms, while Hebrew frequently preserved older, concrete physical meanings (like agricultural or craftsmanship terms) that illuminate the sacred text.
2. **The Classical Arabic Path:** Open the exact same Arabic root or word across major classical dictionaries (like Lane's Lexicon and Hans Wehr) and Qur'anic corpus databases with a single click.

In addition to Hebrew dictionary lookups, the tool reconstructs how your root's letters looked and sounded across related ancient scripts (Nabataean, Syriac, Sabaic/Musnad, and Ge'ez) using historical sound-change rules, complete with educational notes on ancient writing systems.

![sc1.png](_attachments/sc1.png)
![sc2.png](_attachments/sc2.png)

---

## Live Website

Use the portal directly in your web browser with zero installation:  
**[https://qcl.barqx.me](https://qcl.barqx.me)**

---

## What It Does

The portal is organized into two main sections:

---

### Path 1: Root Analyzer & Live Hebrew Lexicon Lookup

#### 1. Live Hebrew Dictionary Evidence
When you analyze an Arabic root, the portal derives its corresponding Hebrew cognate and immediately searches live Hebrew dictionaries via the Sefaria API and Wiktionary:
- **Brown-Driver-Briggs (BDB):** The gold standard lexicon for Biblical Hebrew.
- **Klein Comprehensive Etymological Dictionary:** Traces words back through comparative Semitic roots.
- **Jastrow Dictionary:** Covers Talmudic, Targumic, and Midrashic literature.
- **Wiktionary:** Modern and historical Hebrew usage notes.
- Results are organized by homonym groups, distinct senses, and Strong's Concordance numbers (such as `#H7965`).

*(Please note: Live dictionary lookups in Section 1 are specifically for Hebrew. The other scripts are reconstructed via historical sound shifts for visual and phonetic comparison, as explained below).*

#### 2. Visual Script Reconstruction across 6 Ancient Alphabets
See how your root transforms across ancient Semitic scripts based on historical sound-shift laws:
- **Arabic:** The baseline Qur'anic form.
- **Nabataean:** The ancient cursive script carved in stone by Arab merchants in Petra, which evolved directly into the Arabic alphabet.
- **Hebrew:** Written in traditional Hebrew square script.
- **Syriac (Aramaic):** The trade and scholarly script of late antiquity.
- **Musnad (Ancient South Arabian / Sabaic):** The monumental stone script of ancient Yemen that preserved 29 consonants.
- **Ge'ez (Classical Ethiopic):** The ancient South Semitic script from across the Red Sea.

#### 3. Automatic Alternate Spelling Fallback
Sometimes an ancient word did not survive in Hebrew under the standard sound-shift formula. Rather than showing a dead-end "no entries found" message:
- The engine automatically searches attested historical variants (such as words where Arabic Seen س survived in Hebrew under Samekh ס instead of Shin ש, or where initial Waw و shifted to Yodh י).
- When an alternate spelling finds live dictionary proof, the app presents it as an "attested alternate" and provides a "What does this mean?" popup explaining the historical shift.

#### 4. Layman Grammar Explanations (Click-to-Learn)
Grammar abbreviations can be difficult to understand. The app translates technical jargon into plain English:
- **Verbal Stems (Binyanim):** Click on tags like *Qal*, *Pi'el*, *Hif'il*, or *Hitpa'el* to see what they mean in everyday language, complete with their direct Arabic counterparts (Form I فَعَلَ, Form II فَعَّلَ, Form IV أَفْعَلَ, Form V تَفَعَّلَ) and concrete examples.
- **Parts of Speech:** Click on terms like *proper noun* or *transitive verb* for quick summaries.
- **Strong's Numbers:** Click any Strong's badge to learn how biblical indexing works.

#### 5. Automatic Root Morphology & Weak Letter Detection
- Automatically identifies if an Arabic root is **Weak (معتل)**, **Assimilating (مثال)**, **Hollow (جوف)**, **Defective (ناقص)**, or **Geminate / Doubled (مضاعف)**.
- Clicking any classification badge opens a guide explaining how flexible letters change across languages and why certain letters disappear during conjugation.

#### 6. Educational Ancient Script Cards
Click on any of the script boxes above the results to open an in-depth educational panel:
- **Linguistic Background:** Where the script was used, who spoke it, and its reading direction.
- **Connection to the Qur'an:** Historical trade routes, cultural contacts, and scribal traditions.
- **Archaeological Examples:** Concrete examples such as the Namara Inscription (328 CE), the Sabaic monotheistic *Rahmanan* inscriptions in Yemen, and classical Arabic words documented by early exegetes as Ethiopic or Aramaic cognates (such as *al-Mishkat*, *al-Ma'idah*, and *al-Hawariyyun*).

#### 7. Letter-by-Letter Phonetic Breakdown Table
- An interactive table breaks your root down letter by letter across all six scripts.
- Explains the exact phonetic rule governing each letter (for example, why Arabic Dhad ض merged with Tsade צ in Hebrew, but remained distinct in Sabaic).

#### 8. Comprehensive Aramaic Lexicon (CAL) Integration
- For researchers looking to examine Aramaic definitions, clicking **"Look up in CAL"** launches Johns Hopkins University's Comprehensive Aramaic Lexicon with your active root already pre-filled.

#### 9. Research Brief Markdown Exporter
- Click **"Copy Research Brief (Markdown)"** to generate a clean, formatted document containing the root, all six script forms, morphology tags, and full Hebrew dictionary definitions with sense numbers, ready to paste into Obsidian, Notion, or study notes.

#### 10. Recent Search Shelf & History Export
- Automatically saves recently analyzed roots locally on your device for quick re-use.
- Includes options to **"Export history"** (downloads a JSON file) or **"Clear history"** at any time.

#### 11. Shareable Deep Links
- Every search updates the URL in your address bar.
- Click **"Copy Analysis Link"** to create a direct link that opens that exact root automatically on another device.

---

### Path 2: Classical Arabic Lexicons & Qur'an Corpus Portal

Type any Arabic root or word in the lower section to query major classical Arabic dictionaries and Qur'anic databases without searching each one individually:

- **Classical Dictionaries:** Direct search in Lane's Lexicon and Hans Wehr (via Ejtaal), plus Hawramani Classical Arabic Lexicon search.
- **Bilingual & Modern Dictionaries:** Al-Ma'any (Arabic-Arabic, Arabic-English, Arabic-Urdu), Arabdict, and Reverso Context.
- **Qur'an Linguistic Corpora:** The Quranic Arabic Corpus (root level and word level), Quran.com, and Quran Morphology.
- **Copy All Source Links:** A single button copies every formatted dictionary URL to your clipboard for quick citations.

---

## User Experience

- **Manuscript & Ledger Design:** Thoughtfully crafted layout featuring a soft manuscript folio for comparative root analysis and a crisp ledger for Arabic reference lookups.
- **Light & Dark Theme:** Clean light mode by default with an instant dark mode toggle that remembers your preference.
- **Focused Modals:** Educational dialog boxes lock the background scroll without any screen jumping, and only close when you deliberately click the "Got it" button so you never lose your place.
- **Dialect & Keyboard Normalization:** Automatically strips tashkeel, tanween, and spaces, and converts Persian/Urdu keyboard letters (ی, ے, ک, and ہ) to standard Arabic automatically.
- **Responsive:** Optimized for phones, tablets, and desktop computers.

---

## Technical Details

- Built with HTML5, CSS3, and modular vanilla JavaScript.
- No build steps, no compilers, no node_modules required.
- Completely static: fast page loads, private (all your searches stay in your browser), and easy to deploy on any static hosting.
- Live Hebrew lexicon definitions are fetched directly from the public Sefaria and Wiktionary APIs.

---

## Contributing & Corrections

Comparative Semitic linguistics is a nuanced field. If you notice a sound-shift correspondence that needs refinement or a dictionary link that can be improved:
- Open an issue on GitHub: [https://github.com/BARQx/quran-cognate-lexicon/issues](https://github.com/BARQx/quran-cognate-lexicon/issues)

---

## License

MIT License. See [LICENSE](LICENSE) for full details. Dictionary content belongs to Sefaria and Wiktionary under their respective open licenses.
