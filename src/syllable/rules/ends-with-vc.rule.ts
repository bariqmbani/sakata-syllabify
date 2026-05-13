import { makeParts } from '../result.js';
import type { SyllableRule } from '../types.js';
import {
  isConsonant,
  isEndsWithVC,
  restoreConsonantUnits,
  tokenizeConsonantUnits,
} from '../utils.js';

export const endsWithVCRule: SyllableRule = {
  id: 'ends-with-vc',
  description: 'Handles words ending with vowel + consonant.',
  match: isEndsWithVC,
  apply: (word) => {
    const simplified = tokenizeConsonantUnits(word);
    let firstPart = simplified.substring(0, simplified.length - 2);
    let lastPart = simplified.substring(simplified.length - 2);

    if (
      firstPart.length === 2 &&
      isConsonant(firstPart.charAt(firstPart.length - 1)) &&
      isConsonant(firstPart.charAt(firstPart.length - 2))
    ) {
      return [restoreConsonantUnits(simplified)];
    }

    if (
      isConsonant(firstPart.charAt(firstPart.length - 1)) &&
      isConsonant(firstPart.charAt(firstPart.length - 2)) &&
      isConsonant(firstPart.charAt(firstPart.length - 3))
    ) {
      firstPart = simplified.substring(0, simplified.length - 4);
      lastPart = simplified.substring(simplified.length - 4);
      return makeParts(restoreConsonantUnits(firstPart), restoreConsonantUnits(lastPart));
    }

    if (isConsonant(firstPart.charAt(firstPart.length - 1))) {
      firstPart = simplified.substring(0, simplified.length - 3);
      lastPart = simplified.substring(simplified.length - 3);
    }

    return makeParts(restoreConsonantUnits(firstPart), restoreConsonantUnits(lastPart));
  },
};
