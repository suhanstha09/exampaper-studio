/**
 * ExamPaper Studio - Nepali Conversion Mapping & Rules (Single Editable File)
 * --------------------------------------------------------------------------
 * Preeti is a legacy non-Unicode ASCII-mapped font.
 * IMPORTANT: Never run Preeti text through Unicode normalization (NFC/NFD)!
 * Edit the tables below to customize or refine any key mappings.
 */

window.PREETI_MAPPING = {
  // 1. Preeti character -> Unicode Devanagari (for reading/decoding Preeti)
  preetiToUnicodeChar: {
    // Vowels & Independent forms
    'c': 'अ', 'cf': 'आ', 'O': 'इ', 'O{': 'ई', 'p': 'उ', 'pm': 'ऊ',
    'C': 'ऋ', 'P': 'ए', 'P]': 'ऐ', 'cf]': 'ओ', 'cf}': 'औ',
    'c+': 'अं', 'cM': 'अः',

    // Consonants (Full forms with inherent 'a' / or base Preeti strokes)
    's': 'क', 'v': 'ख', 'u': 'ग', '3': 'घ', 'ª': 'ङ',
    'r': 'च', '5': 'छ', 'h': 'ज', 'em': 'झ', '`': 'ञ',
    '6': 'ट', '7': 'ठ', '8': 'ड', '9': 'ढ', '0f': 'ण',
    't': 'त', 'y': 'थ', 'b': 'द', 'w': 'ध', 'g': 'न',
    'k': 'प', 'km': 'फ', 'a': 'ब', 'e': 'भ', 'd': 'म',
    'o': 'य', '/': 'र', 'n': 'ल', 'j': 'व',
    'z': 'श', 'if': 'ष', ';': 'स', 'x': 'ह',
    'If': 'क्ष', 'q': 'त्र', '1': 'ज्ञ',

    // Half Consonants (Preeti has dedicated half-glyph keys)
    'S': 'क्', 'V': 'ख्', 'U': 'ग्', '#': 'घ्',
    'R': 'च्', 'H': 'ज्', '´': 'झ्', '~': 'ञ्',
    '0': 'ण्',
    'T': 'त्', 'Y': 'थ्', 'W': 'ध्', 'G': 'न्',
    'K': 'प्', 'A': 'ब्', 'E': 'भ्', 'D': 'म्',
    'O': 'य्', 'N': 'ल्', 'J': 'व्',
    'Z': 'श्', 'i': 'ष्', ':': 'स्', 'X': 'ह्',
    'I': 'क्ष्', 'Q': 'त्र्',

    // Matras (Vowel signs) & Modifiers
    'f': 'ा',
    'l': 'ि',   // Short i matra (appears BEFORE consonant in Preeti!)
    'L': 'ी',
    "'": 'ु',
    '"': 'ू',
    '[': 'ृ',
    ']': 'े',
    '}': 'ै',
    'f]': 'ो',
    'f}': 'ौ',
    '+': 'ं',
    'F': 'ँ',
    'M': 'ः',
    '\\': '्',  // Virama / Halant
    '{': 'र्',  // Reph (appears AFTER consonant in Preeti, BEFORE in Unicode!)
    '|': '्र',  // Rakar (subjoined ra, e.g., प्र = k|)
    '.': '।',   // Danda (full stop)

    // Nepali Digits
    ')': '०', '!': '१', '@': '२', '#': '३', '$': '४',
    '%': '५', '^': '६', '&': '७', '*': '८', '(': '९',

    // Punctuation & Symbols
    '=': '.', '-': '(', '_': ')', '?': '?', ',': ',', ' ': ' '
  },

  // 2. Unicode Devanagari -> Preeti character (for encoding Unicode to Preeti)
  unicodeToPreetiMap: {
    // Independent Vowels
    'अ': 'c', 'आ': 'cf', 'इ': 'O', 'ई': 'O{', 'उ': 'p', 'ऊ': 'pm',
    'ऋ': 'C', 'ए': 'P', 'ऐ': 'P]', 'ओ': 'cf]', 'औ': 'cf}',

    // Consonants
    'क': 's', 'ख': 'v', 'ग': 'u', 'घ': '3', 'ङ': 'ª',
    'च': 'r', 'छ': '5', 'ज': 'h', 'झ': 'em', 'ञ': '`',
    'ट': '6', 'ठ': '7', 'ड': '8', 'ढ': '9', 'ण': '0f',
    'त': 't', 'थ': 'y', 'द': 'b', 'ध': 'w', 'न': 'g',
    'प': 'k', 'फ': 'km', 'ब': 'a', 'भ': 'e', 'म': 'd',
    'य': 'o', 'र': '/', 'ल': 'n', 'व': 'j',
    'श': 'z', 'ष': 'if', 'स': ';', 'ह': 'x',

    // Special Conjuncts
    'क्ष': 'If', 'त्र': 'q', 'ज्ञ': '1',
    'श्र': '>f', 'द्य': 'B', 'द्ध': '4', 'त्त': 'Qf', 'क्त': 'St',

    // Dedicated Half-Consonants (when followed by Virama ्)
    'क्': 'S', 'ख्': 'V', 'ग्': 'U', 'घ्': '#',
    'च्': 'R', 'ज्': 'H', 'झ्': '´', 'ञ्': '~',
    'ण्': '0',
    'त्': 'T', 'थ्': 'Y', 'ध्': 'W', 'न्': 'G',
    'प्': 'K', 'ब्': 'A', 'भ्': 'E', 'म्': 'D',
    'ल्': 'N', 'व्': 'J',
    'श्': 'Z', 'ष्': 'i', 'स्': ':', 'ह्': 'X',
    'क्ष्': 'I', 'त्र्': 'Q',

    // Matras
    'ा': 'f',
    'ि': 'l',   // Handled specially to reorder BEFORE consonant cluster
    'ी': 'L',
    'ु': "'",
    'ू': '"',
    'ृ': '[',
    'े': ']',
    'ै': '}',
    'ो': 'f]',
    'ौ': 'f}',

    // Modifiers & Signs
    'ं': '+',
    'ँ': 'F',
    'ः': 'M',
    '्': '\\',
    '।': '.',
    '॥': '..',

    // Digits
    '०': ')', '१': '!', '२': '@', '३': '#', '४': '$',
    '५': '%', '६': '^', '७': '&', '८': '*', '९': '('
  },

  // 3. Romanized Phonetic -> Unicode Devanagari Dictionary & Rules
  // Common Nepali school/exam words for instant accurate expansion
  romanWordOverrides: {
    'namaste': 'नमस्ते',
    'nepal': 'नेपाल',
    'nepali': 'नेपाली',
    'vidyalaya': 'विद्यालय',
    'bidyalaya': 'विद्यालय',
    'pariksha': 'परीक्षा',
    'parikshya': 'परीक्षा',
    'prashna': 'प्रश्न',
    'prashnaharu': 'प्रश्नहरू',
    'uttar': 'उत्तर',
    'ank': 'अङ्क',
    'anka': 'अङ्क',
    'purnanka': 'पूर्णाङ्क',
    'uttirnanka': 'उत्तीर्णाङ्क',
    'samaya': 'समय',
    'kaksha': 'कक्षा',
    'vishaya': 'विषय',
    'bisaya': 'विषय',
    'miti': 'मिति',
    'samuha': 'समूह',
    'khanda': 'खण्ड',
    'sabai': 'सबै',
    'anivarya': 'अनिवार्य',
    'anibarya': 'अनिवार्य',
    'chhan': 'छन्',
    'chha': 'छ',
    'lekhnuhos': 'लेख्नुहोस्',
    'garnuhos': 'गर्नुहोस्',
    'bhanne': 'भन्ने',
    'kya': 'क्या',
    'gyan': 'ज्ञान',
    'kshama': 'क्षमा',
    'patra': 'पत्र',
    'karma': 'कर्म',
    'dharma': 'धर्म',
    'surya': 'सूर्य',
    'karyalaya': 'कार्यालय',
    'pratham': 'प्रथम',
    'dwitiya': 'द्वितीय',
    'tritiya': 'तृतीय',
    'varshik': 'वार्षिक',
    'traimasik': 'त्रैमासिक'
  },

  // 4. On-screen Preeti Virtual Keyboard Layout (Standard Preeti Key Map)
  keyboardRows: [
    [
      { key: '`', normal: 'ञ', shift: 'ॐ', preetiNorm: '`', preetiShift: '~' },
      { key: '1', normal: 'ज्ञ', shift: '१', preetiNorm: '1', preetiShift: '!' },
      { key: '2', normal: 'द्द', shift: '२', preetiNorm: '2', preetiShift: '@' },
      { key: '3', normal: 'घ', shift: '३', preetiNorm: '3', preetiShift: '#' },
      { key: '4', normal: 'द्ध', shift: '४', preetiNorm: '4', preetiShift: '$' },
      { key: '5', normal: 'छ', shift: '५', preetiNorm: '5', preetiShift: '%' },
      { key: '6', normal: 'ट', shift: '६', preetiNorm: '6', preetiShift: '^' },
      { key: '7', normal: 'ठ', shift: '७', preetiNorm: '7', preetiShift: '&' },
      { key: '8', normal: 'ड', shift: '८', preetiNorm: '8', preetiShift: '*' },
      { key: '9', normal: 'ढ', shift: '९', preetiNorm: '9', preetiShift: '(' },
      { key: '0', normal: 'ण्', shift: '०', preetiNorm: '0', preetiShift: ')' },
      { key: '-', normal: '(', shift: ')', preetiNorm: '-', preetiShift: '_' },
      { key: '=', normal: '.', shift: 'ं', preetiNorm: '=', preetiShift: '+' }
    ],
    [
      { key: 'q', normal: 'त्र', shift: 'त्र्', preetiNorm: 'q', preetiShift: 'Q' },
      { key: 'w', normal: 'ध', shift: 'ध्', preetiNorm: 'w', preetiShift: 'W' },
      { key: 'e', normal: 'भ', shift: 'भ्', preetiNorm: 'e', preetiShift: 'E' },
      { key: 'r', normal: 'च', shift: 'च्', preetiNorm: 'r', preetiShift: 'R' },
      { key: 't', normal: 'त', shift: 'त्', preetiNorm: 't', preetiShift: 'T' },
      { key: 'y', normal: 'थ', shift: 'थ्', preetiNorm: 'y', preetiShift: 'Y' },
      { key: 'u', normal: 'ग', shift: 'ग्', preetiNorm: 'u', preetiShift: 'U' },
      { key: 'i', normal: 'ष्', shift: 'क्ष्', preetiNorm: 'i', preetiShift: 'I' },
      { key: 'o', normal: 'य', shift: 'इ', preetiNorm: 'o', preetiShift: 'O' },
      { key: 'p', normal: 'उ', shift: 'ए', preetiNorm: 'p', preetiShift: 'P' },
      { key: '[', normal: 'ृ', shift: 'र्', preetiNorm: '[', preetiShift: '{' },
      { key: ']', normal: 'े', shift: 'ै', preetiNorm: ']', preetiShift: '}' },
      { key: '\\', normal: '्', shift: '्र', preetiNorm: '\\', preetiShift: '|' }
    ],
    [
      { key: 'a', normal: 'ब', shift: 'ब्', preetiNorm: 'a', preetiShift: 'A' },
      { key: 's', normal: 'क', shift: 'क्', preetiNorm: 's', preetiShift: 'S' },
      { key: 'd', normal: 'म', shift: 'म्', preetiNorm: 'd', preetiShift: 'D' },
      { key: 'f', normal: 'ा', shift: 'ँ', preetiNorm: 'f', preetiShift: 'F' },
      { key: 'g', normal: 'न', shift: 'न्', preetiNorm: 'g', preetiShift: 'G' },
      { key: 'h', normal: 'ज', shift: 'ज्', preetiNorm: 'h', preetiShift: 'H' },
      { key: 'j', normal: 'व', shift: 'व्', preetiNorm: 'j', preetiShift: 'J' },
      { key: 'k', normal: 'प', shift: 'प्', preetiNorm: 'k', preetiShift: 'K' },
      { key: 'l', normal: 'ि', shift: 'ी', preetiNorm: 'l', preetiShift: 'L' },
      { key: ';', normal: 'स', shift: 'स्', preetiNorm: ';', preetiShift: ':' },
      { key: "'", normal: 'ु', shift: 'ू', preetiNorm: "'", preetiShift: '"' }
    ],
    [
      { key: 'z', normal: 'श', shift: 'श्', preetiNorm: 'z', preetiShift: 'Z' },
      { key: 'x', normal: 'ह', shift: 'ह्', preetiNorm: 'x', preetiShift: 'X' },
      { key: 'c', normal: 'अ', shift: 'ऋ', preetiNorm: 'c', preetiShift: 'C' },
      { key: 'v', normal: 'ख', shift: 'ख्', preetiNorm: 'v', preetiShift: 'V' },
      { key: 'b', normal: 'द', shift: 'द्य', preetiNorm: 'b', preetiShift: 'B' },
      { key: 'n', normal: 'ल', shift: 'ल्', preetiNorm: 'n', preetiShift: 'N' },
      { key: 'm', normal: 'ः', shift: 'फ', preetiNorm: 'm', preetiShift: 'M' },
      { key: ',', normal: ',', shift: '?', preetiNorm: ',', preetiShift: '?' },
      { key: '.', normal: '।', shift: 'श्र', preetiNorm: '.', preetiShift: '>' }
    ]
  ],

  // 5. Built-in Verification Test Words
  sampleTestWords: [
    { label: 'नमस्ते (Namaste)', unicode: 'नमस्ते', expectedPreeti: 'gd:t]' },
    { label: 'नेपाल (Nepal)', unicode: 'नेपाल', expectedPreeti: 'g]kfn' },
    { label: 'किताब (Short ि)', unicode: 'किताब', expectedPreeti: 'lstfa' },
    { label: 'क्षत्रिय (Conjuncts + ि)', unicode: 'क्षत्रिय', expectedPreeti: 'Iflqmo' },
    { label: 'ज्ञान (ज्ञ)', unicode: 'ज्ञान', expectedPreeti: '1fg' },
    { label: 'सूर्य (Reph र्)', unicode: 'सूर्य', expectedPreeti: ';\"o{' },
    { label: 'प्रश्न (Rakar + Half)', unicode: 'प्रश्न', expectedPreeti: 'k|Zg' },
    { label: 'पूर्णाङ्क (Full Marks)', unicode: 'पूर्णाङ्क', expectedPreeti: 'k\"0ff{ª\\s' }
  ]
};
