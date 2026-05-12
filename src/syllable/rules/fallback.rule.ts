import { makeParts } from '../result.js';
import type { SyllableRule } from '../types.js';

export const fallbackRule: SyllableRule = {
  id: 'fallback',
  description: 'Falls back to the final two characters.',
  match: () => true,
  apply: (word) => makeParts(word.substring(0, word.length - 2), word.substring(word.length - 2)),
};
