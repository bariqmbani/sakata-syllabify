import { makeParts } from '../result.js';
import type { SyllableRule } from '../types.js';

export const endsWithGramRule: SyllableRule = {
  id: 'ends-with-gram',
  description: 'Handles longer words ending with gram as a gameplay syllable.',
  match: (word) => word.endsWith('gram') && word.length > 4,
  apply: (word) => makeParts(word.substring(0, word.length - 4), 'gram'),
};
