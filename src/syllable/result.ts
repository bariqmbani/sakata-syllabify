import type { LastSyllableResult, LastSyllableSource } from './types.js';

export function makeParts(prefix: string, last: string): string[] {
  if (!prefix) return last ? [last] : [];
  if (!last) return [prefix];
  return [prefix, last];
}

export function createLastSyllableResult(input: {
  original: string;
  normalized: string;
  parts: string[];
  ruleId: string;
  source: LastSyllableSource;
}): LastSyllableResult {
  const last = input.parts.at(-1) ?? '';
  const prefix = input.parts.length > 1 ? input.parts.slice(0, -1).join('') : '';

  return {
    original: input.original,
    normalized: input.normalized,
    prefix,
    last,
    parts: input.parts,
    ruleId: input.ruleId,
    source: input.source,
  };
}
