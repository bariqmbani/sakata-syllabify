export { getLastSyllable, identifyLastSyllable, splitLastSyllable } from './syllable/engine.js';
export { CONSONANT_DIGRAPHS, DIPHTHONGS, VOWELS } from './syllable/constants.js';
export { normalizeWord } from './syllable/normalize.js';
export { makeParts } from './syllable/result.js';
export type {
  LastSyllableResult,
  LastSyllableSource,
  SyllableEngineOptions,
  SyllableMode,
  SyllableRule,
} from './syllable/types.js';
