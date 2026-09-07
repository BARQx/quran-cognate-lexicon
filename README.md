# Qur'anic Arabic Cognate & Lexicon Portal

An open-source comparative root analyzer and multi-dictionary portal for Qur'anic Arabic, Hebrew, Aramaic, Syriac, Sabaic, and ancient epigraphic scripts.

This tool helps you explore the original, concrete meanings of Qur'anic words by comparing them with sister Semitic languages. Because Arabic, Hebrew, Aramaic, Sabaic, and Ge'ez come from the same ancient family tree, they share thousands of words with identical roots. Classical Arabic dictionaries often focused on later poetic uses or theological definitions, while sister languages frequently preserved older, everyday physical meanings (such as agricultural, pastoral, or craftsmen terms) that shed fresh light on the sacred text.

Instead of spending hours searching through heavy printed books, this tool does the heavy lifting for you: type in an Arabic root, and it immediately calculates its historical sound shifts, displays how the letters looked in ancient scripts, pulls real definitions from live lexicons, and gives you one-click links to all major classical dictionaries.

![sc1.png](_attachments/sc1.png)
![sc2.png](_attachments/sc2.png)

---

## Live Website

Use the portal directly in your web browser with zero installation:  
**[https://qcl.barqx.me](https://qcl.barqx.me)**

---

## What It Does

### 1. Comparative Root Engine across 6 Ancient Scripts
Type in any Arabic root or word (such as كتب, سلم, شمس, or ملك) and the engine calculates the corresponding form in:
- **Classical Arabic:** The baseline Qur'anic form.
- **Nabataean:** The ancient cursive script carved by Arab traders in Petra, which is the direct visual ancestor of the Arabic alphabet.
- **Hebrew:** The closest major literary sister language to Arabic.
- **Syriac (Aramaic):** The trade and scholarly lingua franca of the Near East in late antiquity.
- **Musnad (Ancient South Arabian / Sabaic):** The monumental stone script of ancient Yemen that preserved all 29 original Semitic consonants.
- **Ge'ez (Classical Ethiopic):** The ancient South Semitic tongue from across the Red Sea, famous for words shared with pre-Islamic Arabia.

### 2. Live Hebrew Lexicons & Academic Dictionaries
- Fetches real definitions from trusted classical Hebrew lexicons via Sefaria (including Brown-Driver-Briggs, Klein, and Jastrow) as well as Wiktionary.
- Groups results clearly by distinct senses, homonyms, and historical eras (Biblical, Mishnaic, and Talmudic).
- Shows Strong's Concordance reference numbers (like `#H7965`) for exact cross-referencing with biblical texts.

### 3. Layman Grammar Explanations (Click-to-Learn)
Ancient grammar terms can be confusing. The app translates academic jargon into plain English:
- **Verbal Stems (Binyanim):** Click on tags like *Qal*, *Pi'el*, *Hif'il*, or *Hitpa'el* to see what they mean in simple terms, complete with their direct Arabic counterparts (Form I فَعَلَ, Form II فَعَّلَ, Form IV أَفْعَلَ, Form V تَفَعَّلَ) and clear examples.
- **Parts of Speech:** Click on terms like *proper noun*, *transitive verb*, or *substantive* for quick, plain-language summaries.
- **Strong's Numbers:** Click any Strong's tag to learn how the biblical numbering system works.

### 4. Automatic Smart Fallback for Alternate Spellings
Sometimes an ancient word did not survive under the textbook sound-shift rule. Rather than showing a dead-end "no results" page:
- The engine automatically tests attested historical variants (such as words where Arabic Seen س maps to Hebrew Samekh ס instead of Shin ש, or where initial Waw و shifts to Yodh י).
- When a variant finds live dictionary proof, the app highlights it as an "attested alternate" and provides a "What does this mean?" explainer popup with the linguistic history.

### 5. Automatic Root Morphology & Weak Letter Detection
- Automatically detects if your root is **Weak (معتل)**, **Assimilating (مثال)**, **Hollow (جوف)**, **Defective (ناقص)**, or **Geminate / Doubled (مضاعف)**.
- Displays interactive classification badges. Clicking them opens a guide explaining how flexible letters change across languages and why certain letters disappear in verb conjugations.

### 6. Interactive Ancient Script History Popups
Click on any of the script cards at the top of the results to open an in-depth educational panel:
- **Historical Background:** Who spoke it, where it flourished, and how it was written.
- **Relation to the Qur'an:** Historical ties, trade routes, and scribal connections.
- **Real Archaeological Examples:** Concrete historical examples such as the Namara Inscription (328 CE), the Sabaic monotheistic *Rahmanan* inscriptions in Yemen, and classical Arabic words acknowledged by early exegetes as Ethiopic or Aramaic cognates (such as *al-Mishkat*, *al-Ma'idah*, and *al-Hawariyyun*).

### 7. Letter-by-Letter Phonetic Breakdown Table
- An interactive table breaks your root down letter by letter across Arabic, Nabataean, Hebrew, Syriac, Musnad, and Ge'ez.
- Includes clear notes explaining the exact phonetic law governing each letter (for example, why Arabic Dhad ض merged with Tsade צ in Hebrew, but stayed distinct in Sabaic).

### 8. Arabic Multi-Dictionary & Corpus Directory
The lower section provides a direct search portal across the most respected Arabic lexicons and Qur'anic databases in one click:
- **Classical Lexicons:** Lane's Lexicon and Hans Wehr (via Ejtaal), plus Hawramani Classical Arabic Lexicon search.
- **Bilingual Dictionaries:** Al-Ma'any (Arabic-Arabic, Arabic-English, Arabic-Urdu), Arabdict, and Reverso Context.
- **Qur'an Corpus Tools:** The Quranic Arabic Corpus (root and word level), Quran.com, and Quran Morphology.
- **Copy All Links:** A single button copies every dictionary link formatted with titles and URLs for easy saving.

### 9. Research Brief Markdown Exporter
- Click **"Copy Research Brief (Markdown)"** to generate a clean, professionally formatted summary of your findings.
- Includes the root, all six script forms, morphology tags, and full dictionary definitions with sense numbers, ready to paste directly into Obsidian, Notion, Google Docs, or study notes.

### 10. Comprehensive Aramaic Lexicon (CAL) Integration
- Click **"Look up in CAL"** to launch Johns Hopkins University's Comprehensive Aramaic Lexicon with your active root already loaded.

### 11. Recent Search Shelf & History Export
- Automatically remembers your recently analyzed roots right on your device.
- Click any past root to run it again instantly.
- Includes buttons to **"Export history"** (download your search history as a JSON file) or **"Clear history"** at any time.

### 12. Instant Shareable Deep Links
- Every analysis updates the web address (e.g. `?root=كتب` or `?lex=كتب`).
- Click **"Copy Analysis Link"** to send a direct link to a friend or student that automatically opens and analyzes that exact root.

### 13. Smart Keyboard & Dialect Input Support
- Automatically strips Arabic vowel marks (tashkeel), tanween, spaces, and punctuation so messy text does not break your search.
- Recognizes Persian and Urdu keyboard characters (such as ی, ے, ک, and ہ) and normalizes them to their standard Arabic equivalents automatically.

### 14. Thoughtful Reader Experience
- Light mode by default, styled like an ancient manuscript page.
- Dark mode toggle in the top-right corner that remembers your choice.
- Custom slim scrollbars designed to match the theme on Windows, Mac, and Linux.
- Modal dialogs stay locked in place with zero screen jumping, and only close when you deliberately click the "Got it" button so you never lose your spot.
- Works smoothly on desktop computers, tablets, and smartphones.

---

## Technical Details

- Built with standard HTML5, CSS3, and modern modular vanilla JavaScript.
- No build tools, no compilers, no node_modules required to run.
- Completely static: fast page loads, private (your searches stay in your browser), and easy to deploy on any static hosting.
- Lexicon data is retrieved live from the public Sefaria API and Wiktionary API.

---

## Contributing & Corrections

Comparative linguistics is a nuanced field. If you notice a sound-shift rule that needs refinement or a dictionary link that can be improved:
- Open an issue on GitHub: [https://github.com/BARQx/quran-cognate-lexicon/issues](https://github.com/BARQx/quran-cognate-lexicon/issues)

---

## License

MIT License. See [LICENSE](LICENSE) for full details. Dictionary content belongs to Sefaria and Wiktionary under their respective open licenses.
