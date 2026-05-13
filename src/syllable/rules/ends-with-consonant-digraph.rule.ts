import { CONSONANT_DIGRAPHS } from '../constants.js';
import { makeParts } from '../result.js';
import type { SyllableRule } from '../types.js';
import { isConsonant, isVowel, restoreConsonantUnits, tokenizeConsonantUnits } from '../utils.js';

export const endsWithConsonantDigraphRule: SyllableRule = {
  id: 'ends-with-consonant-digraph',
  description: 'Handles words ending with ng, ny, sy, or kh consonant digraphs.',
  match: (word) => CONSONANT_DIGRAPHS.some((digraph) => word.endsWith(digraph)),
  apply: (word) => {
    const simplified = tokenizeConsonantUnits(word);
    let firstPart = simplified.substring(0, simplified.length - 3);
    let lastPart = simplified.substring(simplified.length - 3);

    if (firstPart.length === 1 && isConsonant(firstPart) && isConsonant(lastPart.charAt(0))) {
      return [restoreConsonantUnits(simplified)];
    }

    if (
      isConsonant(firstPart.charAt(firstPart.length - 1)) &&
      isConsonant(firstPart.charAt(firstPart.length - 2)) &&
      /[rl]/.test(lastPart)
    ) {
      lastPart = firstPart.charAt(firstPart.length - 1) + lastPart;
      firstPart = firstPart.substring(0, firstPart.length - 1);
    }

    if (isVowel(lastPart.charAt(0))) {
      firstPart += lastPart.charAt(0);
      lastPart = lastPart.substring(1);
    }

    return makeParts(restoreConsonantUnits(firstPart), restoreConsonantUnits(lastPart));
  },
};
