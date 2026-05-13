import { makeParts } from '../result.js';
import type { SyllableRule } from '../types.js';
import { isEndsWithCV, restoreConsonantUnits, tokenizeConsonantUnits } from '../utils.js';

export const endsWithCVRule: SyllableRule = {
  id: 'ends-with-cv',
  description: 'Handles words ending with consonant + vowel.',
  match: isEndsWithCV,
  apply: (word) => {
    const simplified = tokenizeConsonantUnits(word);
    const firstPart = simplified.substring(0, simplified.length - 2);
    const lastPart = simplified.substring(simplified.length - 2);

    if (!firstPart) return [restoreConsonantUnits(simplified)];

    return makeParts(restoreConsonantUnits(firstPart), restoreConsonantUnits(lastPart));
  },
};
