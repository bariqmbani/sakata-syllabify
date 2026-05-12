import { normalizeWord } from './normalize.js';
import { createLastSyllableResult } from './result.js';
import type { LastSyllableResult, SyllableEngineOptions } from './types.js';

export function identifyLastSyllable(
  input: string,
  _options: SyllableEngineOptions = {},
): string[] {
  const normalized = normalizeWord(input);
  return normalized ? [normalized] : [];
}

export function splitLastSyllable(
  input: string,
  options: SyllableEngineOptions = {},
): LastSyllableResult {
  const normalized = normalizeWord(input);
  const parts = identifyLastSyllable(input, options);

  return createLastSyllableResult({
    original: input,
    normalized,
    parts,
    ruleId: normalized ? 'foundation' : 'empty-input',
    source: normalized ? 'fallback' : 'fallback',
  });
}

export function getLastSyllable(input: string, options: SyllableEngineOptions = {}): string {
  return splitLastSyllable(input, options).last;
}
