export { getLastSyllable, identifyLastSyllable, splitLastSyllable } from './syllable/engine.js';
export { handleSyllableRequest } from './syllable/edge.js';
export { CONSONANT_DIGRAPHS, DIPHTHONGS, VOWELS } from './syllable/constants.js';
export { normalizeWord } from './syllable/normalize.js';
export { makeParts } from './syllable/result.js';
export type {
  LastSyllableResult,
  LastSyllableSource,
  SyllableErrorCode,
  SyllableEngineOptions,
  SyllableMode,
  SyllableRule,
} from './syllable/types.js';
export type { SyllableEdgeResponse } from './syllable/edge.js';
