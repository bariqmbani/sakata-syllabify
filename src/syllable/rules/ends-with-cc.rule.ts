import type { SyllableEngineOptions, SyllableRule } from '../types.js';
import { isEndsWithCC } from '../utils.js';

export const endsWithCCRule: SyllableRule = {
  id: 'ends-with-cc',
  description: 'Handles words ending with two consonants by attaching the last consonant.',
  match: isEndsWithCC,
  apply: (word, options: SyllableEngineOptions = {}, identify) => {
    const lastConsonant = word.charAt(word.length - 1);
    const withoutLastConsonant = word.slice(0, -1);
    const parts = identify ? identify(withoutLastConsonant, options) : [withoutLastConsonant];
    const lastIndex = parts.length - 1;

    if (lastIndex < 0) return [lastConsonant];

    return parts.map((part, index) => (index === lastIndex ? `${part}${lastConsonant}` : part));
  },
};
