import { makeParts } from '../result.js';
import type { SyllableRule } from '../types.js';
import { isEndsWithCV, restoreDiphthongs, simplifyDiphthongs } from '../utils.js';

export const endsWithCVRule: SyllableRule = {
  id: 'ends-with-cv',
  description: 'Handles words ending with consonant + vowel.',
  match: isEndsWithCV,
  apply: (word) => {
    const simplified = simplifyDiphthongs(word);
    const firstPart = simplified.substring(0, simplified.length - 2);
    const lastPart = simplified.substring(simplified.length - 2);

    if (!firstPart) return [restoreDiphthongs(simplified)];

    return makeParts(restoreDiphthongs(firstPart), restoreDiphthongs(lastPart));
  },
};
