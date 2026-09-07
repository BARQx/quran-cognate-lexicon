// ============================================================
// Comparative Script Educational Data
// Historical and linguistic reference data for Semitic scripts
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

if (typeof window !== 'undefined') {
  window.SCRIPT_INFO_DATA = SCRIPT_INFO_DATA;
}

