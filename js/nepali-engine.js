/**
 * ExamPaper Studio - Nepali Transliteration & Preeti Conversion Engine
 * Handles:
 *  - Romanized phonetic English -> Unicode Devanagari
 *  - Unicode Devanagari -> Preeti (short 'ि' reordering, Reph 'र्', Rakar '्र', half-letters, conjuncts क्ष/त्र/ज्ञ, halant ्)
 *  - Preeti -> Unicode Devanagari (reverse decoding)
 * CRITICAL: Never runs Unicode normalization (NFC/NFD) on Preeti strings!
 */

window.NepaliEngine = (function () {
  const MAP = window.PREETI_MAPPING;

  // Helper: Check if a character is a Devanagari consonant (क-ह)
  function isDevanagariConsonant(ch) {
    if (!ch) return false;
    const code = ch.charCodeAt(0);
    return code >= 0x0915 && code <= 0x0939;
  }

  /**
   * 1. Romanized Phonetic -> Unicode Devanagari
   */
  function romanToUnicode(input) {
    if (!input) return '';
    return input.split(/(\s+)/).map(token => {
      if (/^\s+$/.test(token)) return token;
      const lower = token.toLowerCase();
      // Preserve trailing punctuation
      const matchPunct = lower.match(/^([a-z]+)([^a-z]*)$/);
      const word = matchPunct ? matchPunct[1] : lower;
      const punct = matchPunct ? matchPunct[2] : '';

      if (MAP.romanWordOverrides[word]) {
        return MAP.romanWordOverrides[word] + transliteratePunct(punct);
      }
      return transliterateWord(word) + transliteratePunct(punct);
    }).join('');
  }

  function transliteratePunct(p) {
    return p.replace(/\./g, '।');
  }

  function transliterateWord(w) {
    if (!w) return '';
    const vowels = {
      'aa': ['आ', 'ा'], 'a': ['अ', ''],
      'ii': ['ई', 'ी'], 'ee': ['ई', 'ी'], 'i': ['इ', 'ि'],
      'uu': ['ऊ', 'ू'], 'oo': ['ऊ', 'ू'], 'u': ['उ', 'ु'],
      'ri': ['ऋ', 'ृ'],
      'ai': ['ऐ', 'ै'], 'e': ['ए', 'े'],
      'au': ['औ', 'ौ'], 'o': ['ओ', 'ो']
    };

    const consonants = [
      ['ksh', 'क्ष'], ['chh', 'छ'], ['gya', 'ज्ञ'], ['gy', 'ज्ञ'],
      ['kh', 'ख'], ['gh', 'घ'], ['ng', 'ङ'],
      ['ch', 'च'], ['jh', 'झ'], ['ny', 'ञ'],
      ['th', 'थ'], ['dh', 'ध'], ['ph', 'फ'], ['bh', 'भ'],
      ['sh', 'श'], ['tr', 'त्र'],
      ['k', 'क'], ['g', 'ग'], ['c', 'च'], ['j', 'ज'],
      ['t', 'त'], ['d', 'द'], ['n', 'न'],
      ['p', 'प'], ['f', 'फ'], ['b', 'ब'], ['m', 'म'],
      ['y', 'य'], ['r', 'र'], ['l', 'ल'], ['v', 'व'], ['w', 'व'],
      ['s', 'स'], ['h', 'ह']
    ];

    let out = '';
    let i = 0;
    let prevWasConsonant = false;

    while (i < w.length) {
      // Check nasal 'n' before consonant -> anusvara if followed by g/k/t/d/p/b
      if (w[i] === 'n' && i > 0 && prevWasConsonant === false && i + 1 < w.length && /[kgtdpbj]/.test(w[i + 1])) {
        out += 'ं';
        i++;
        continue;
      }

      // Try matching consonant
      let matchedCons = null;
      for (const [lat, dev] of consonants) {
        if (w.startsWith(lat, i)) {
          matchedCons = [lat, dev];
          break;
        }
      }

      if (matchedCons) {
        if (prevWasConsonant) {
          out += '्'; // Halant between adjacent consonants
        }
        out += matchedCons[1];
        i += matchedCons[0].length;
        prevWasConsonant = true;
        continue;
      }

      // Try matching vowel (longest first: 2 chars then 1 char)
      let matchedVowel = null;
      const two = w.slice(i, i + 2);
      const one = w.slice(i, i + 1);
      if (vowels[two]) {
        matchedVowel = [two, vowels[two]];
      } else if (vowels[one]) {
        matchedVowel = [one, vowels[one]];
      }

      if (matchedVowel) {
        if (prevWasConsonant) {
          out += matchedVowel[1][1]; // Matra
        } else {
          out += matchedVowel[1][0]; // Independent vowel
        }
        i += matchedVowel[0].length;
        prevWasConsonant = false;
        continue;
      }

      // Fallback character
      out += w[i];
      i++;
      prevWasConsonant = false;
    }

    return out;
  }

  /**
   * 2. Unicode Devanagari -> Preeti
   * Handles:
   *  - Conjuncts: क्ष, त्र, ज्ञ, श्र, द्य, द्ध, क्त, त्त
   *  - Reph (र् + Consonant -> Consonant + {)
   *  - Rakar (Consonant + ् + र -> Consonant + |)
   *  - Short i matra (ConsonantCluster + ि -> l + PreetiCluster)
   *  - Dedicated Half Consonants (क् -> S, न् -> G, etc.) & fallback halant (\)
   */
  function unicodeToPreeti(unicodeText) {
    if (!unicodeText) return '';
    // DO NOT call .normalize() on output!
    const uMap = MAP.unicodeToPreetiMap;
    let text = unicodeText;

    // Pre-pass: Replace multi-char special conjuncts with private markers so cluster logic keeps them intact
    const specialConjuncts = [
      { u: 'क्ष्', p: 'I' },
      { u: 'क्ष', p: 'If' },
      { u: 'त्र्', p: 'Q' },
      { u: 'त्र', p: 'q' },
      { u: 'ज्ञ', p: '1' },
      { u: 'श्र', p: '>f' },
      { u: 'द्ध', p: '4' },
      { u: 'द्य', p: 'B' },
      { u: 'त्त', p: 'Qf' },
      { u: 'क्त', p: 'St' }
    ];

    // Tokenize into Devanagari syllables/clusters vs non-Devanagari
    let result = '';
    let i = 0;

    while (i < text.length) {
      // Check if Reph starts here: 'र्' followed by a consonant (and not another र)
      let hasReph = false;
      if (text[i] === 'र' && text[i + 1] === '्' && isDevanagariConsonant(text[i + 2])) {
        hasReph = true;
        i += 2; // consume 'र्'
      }

      // Check if current position starts a consonant cluster
      if (isDevanagariConsonant(text[i])) {
        let clusterPreeti = '';
        let hasShortI = false;

        // Parse consonant chain (e.g., half consonants + base consonant + rakar)
        while (i < text.length && isDevanagariConsonant(text[i])) {
          // Check special conjuncts at current index first
          let matchedSpecial = null;
          for (const sc of specialConjuncts) {
            if (text.startsWith(sc.u, i)) {
              matchedSpecial = sc;
              break;
            }
          }

          if (matchedSpecial) {
            clusterPreeti += matchedSpecial.p;
            i += matchedSpecial.u.length;
            // If special ended with halant (like क्ष्), continue cluster
            if (matchedSpecial.u.endsWith('्')) {
              continue;
            } else {
              break;
            }
          }

          const cons = text[i];
          const next = text[i + 1];

          // Case A: Consonant + ् + र (Rakar, e.g., प्र = k|)
          if (next === '्' && text[i + 2] === 'र' && text[i + 3] !== '्') {
            clusterPreeti += (uMap[cons] || cons) + '|';
            i += 3;
            break;
          }

          // Case B: Half consonant (Consonant + ् followed by another consonant)
          if (next === '्' && isDevanagariConsonant(text[i + 2])) {
            const halfKey = cons + '्';
            if (uMap[halfKey]) {
              clusterPreeti += uMap[halfKey];
            } else {
              clusterPreeti += (uMap[cons] || cons) + '\\';
            }
            i += 2;
            continue;
          }

          // Case C: Explicit trailing halant (Consonant + ् at end of word)
          if (next === '्') {
            clusterPreeti += (uMap[cons] || cons) + '\\';
            i += 2;
            break;
          }

          // Case D: Full consonant
          clusterPreeti += (uMap[cons] || cons);
          i += 1;
          break;
        }

        // Now parse trailing vowel matras and modifiers attached to this cluster
        let matraPreeti = '';
        while (i < text.length) {
          const ch = text[i];
          if (ch === 'ि') {
            hasShortI = true;
            i++;
          } else if (uMap[ch] && 'ाीुूृेैोौंँः'.includes(ch)) {
            matraPreeti += uMap[ch];
            i++;
          } else {
            break;
          }
        }

        // Assemble cluster in visual Preeti order:
        // [Short 'l' if present] + [Consonant/Half-Consonants] + [Matras] + [Reph '{' if present]
        result += (hasShortI ? 'l' : '') + clusterPreeti + matraPreeti + (hasReph ? '{' : '');
      } else {
        // Non-consonant character (independent vowel, digit, punctuation, space)
        const twoChar = text.slice(i, i + 2);
        if (uMap[twoChar]) {
          result += uMap[twoChar];
          i += 2;
        } else if (uMap[text[i]]) {
          result += uMap[text[i]];
          i += 1;
        } else {
          result += text[i];
          i += 1;
        }
      }
    }

    return result;
  }

  /**
   * 3. Preeti -> Unicode Devanagari (Reverse decoder so user can read existing Preeti text)
   */
  function preetiToUnicode(preetiText) {
    if (!preetiText) return '';
    const pMap = MAP.preetiToUnicodeChar;
    let tokens = [];
    let i = 0;

    // First tokenize Preeti into logical units
    while (i < preetiText.length) {
      const three = preetiText.slice(i, i + 3);
      const two = preetiText.slice(i, i + 2);
      const one = preetiText[i];

      if (pMap[three]) {
        tokens.push({ p: three, u: pMap[three], type: 'unit' });
        i += 3;
      } else if (pMap[two]) {
        tokens.push({ p: two, u: pMap[two], type: 'unit' });
        i += 2;
      } else if (one === 'l') {
        tokens.push({ p: 'l', u: 'ि', type: 'shortI' });
        i += 1;
      } else if (one === '{') {
        tokens.push({ p: '{', u: 'र्', type: 'reph' });
        i += 1;
      } else if (pMap[one]) {
        tokens.push({ p: one, u: pMap[one], type: 'unit' });
        i += 1;
      } else {
        tokens.push({ p: one, u: one, type: 'raw' });
        i += 1;
      }
    }

    // Reorder short 'ि' (l) to come AFTER the consonant cluster, and Reph '{' (र्) BEFORE
    let out = '';
    for (let t = 0; t < tokens.length; t++) {
      const tok = tokens[t];
      if (tok.type === 'shortI') {
        // Gather following half-consonants + full consonant
        let cluster = '';
        let k = t + 1;
        while (k < tokens.length && tokens[k].u.endsWith('्')) {
          cluster += tokens[k].u;
          k++;
        }
        if (k < tokens.length) {
          cluster += tokens[k].u;
          out += cluster + 'ि';
          t = k;
        } else {
          out += 'ि';
        }
      } else if (tok.type === 'reph') {
        // Reph applies to the preceding syllable in out
        out = insertRephBeforeLastSyllable(out);
      } else {
        out += tok.u;
      }
    }

    return out;
  }

  function insertRephBeforeLastSyllable(str) {
    if (!str) return 'र्';
    // Find start of last Devanagari syllable (optional matras at end, base consonant, optional half consonants)
    let idx = str.length - 1;
    // Skip trailing matras/modifiers
    while (idx >= 0 && 'ािीुूृेैोौंँः'.includes(str[idx])) {
      idx--;
    }
    // Base consonant
    if (idx >= 0 && isDevanagariConsonant(str[idx])) {
      idx--;
      // Preceding half consonants (Consonant + ्)
      while (idx >= 1 && str[idx] === '्' && isDevanagariConsonant(str[idx - 1])) {
        idx -= 2;
      }
      const insertPos = idx + 1;
      return str.slice(0, insertPos) + 'र्' + str.slice(insertPos);
    }
    return str + 'र्';
  }

  return {
    romanToUnicode,
    unicodeToPreeti,
    preetiToUnicode
  };
})();
