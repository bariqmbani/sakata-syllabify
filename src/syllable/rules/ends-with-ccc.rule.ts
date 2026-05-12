import { makeParts } from '../result.js';
import type { SyllableRule } from '../types.js';
import { isEndsWithCCC, isVowel } from '../utils.js';

export const endsWithCCCRule: SyllableRule = {
  id: 'ends-with-ccc',
  description: 'Handles words ending with three consonants.',
  match: isEndsWithCCC,
  apply: (word) => {
    let firstPart = word.substring(0, word.length - 5);
    let lastPart = word.substring(word.length - 5);

    if (!firstPart) return [word];

    if (isVowel(lastPart.charAt(0))) {
      firstPart += lastPart.charAt(0);
      lastPart = lastPart.substring(1);
    }

    return makeParts(firstPart, lastPart);
  },
};
