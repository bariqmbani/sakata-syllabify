import { describe, expect, it } from 'vitest';

import { getLastSyllable, identifyLastSyllable, splitLastSyllable } from './engine.js';
import { legacyRegressionCases, legacyRegressionGroups } from './legacy-regression.test-data.js';
import { normalizeWord } from './normalize.js';
import { VERIFIED_OVERRIDES } from './overrides.js';

describe('identifyLastSyllable', () => {
  for (const group of legacyRegressionGroups) {
    describe(group.name, () => {
      for (const [word, expected] of Object.entries(group.cases)) {
        it(`splits ${word}`, () => {
          expect(identifyLastSyllable(word)).toEqual(expected);
        });
      }
    });
  }
});

describe('public API', () => {
  it('keeps the documented legacy API examples', () => {
    expect(identifyLastSyllable('makan')).toEqual(['ma', 'kan']);
    expect(identifyLastSyllable('kandidat')).toEqual(['kandi', 'dat']);
  });

  it('returns a structured result', () => {
    expect(splitLastSyllable('makan')).toEqual({
      original: 'makan',
      normalized: 'makan',
      prefix: 'ma',
      last: 'kan',
      parts: ['ma', 'kan'],
      ruleId: 'ends-with-vc',
      source: 'rule',
    });
  });

  it('returns only the last syllable', () => {
    expect(getLastSyllable('kandidat')).toBe('dat');
  });

  it('handles empty normalized input without throwing', () => {
    expect(splitLastSyllable('!!!')).toEqual({
      original: '!!!',
      normalized: '',
      prefix: '',
      last: '',
      parts: [],
      ruleId: 'empty-input',
      source: 'fallback',
    });
  });

  it('normalizes uppercase, whitespace, and punctuation before splitting', () => {
    expect(splitLastSyllable('  MAKAN!!  ')).toMatchObject({
      normalized: 'makan',
      parts: ['ma', 'kan'],
      last: 'kan',
    });
  });

  it('handles short words without empty syllable parts', () => {
    expect(identifyLastSyllable('a')).toEqual(['a']);
    expect(identifyLastSyllable('di')).toEqual(['di']);
    expect(identifyLastSyllable('kan')).toEqual(['kan']);
  });
});

describe('result metadata', () => {
  it('marks verified overrides', () => {
    expect(splitLastSyllable('bau')).toMatchObject({
      parts: ['ba', 'u'],
      ruleId: 'verified-override',
      source: 'override',
    });
  });

  it('marks hyphenated final-segment rules', () => {
    expect(splitLastSyllable('berkata-kata')).toMatchObject({
      parts: ['berkata-ka', 'ta'],
      ruleId: 'hyphenated:ends-with-cv',
      source: 'rule',
    });
  });

  it('marks fallback results', () => {
    expect(splitLastSyllable('a')).toMatchObject({
      parts: ['a'],
      ruleId: 'fallback',
      source: 'fallback',
    });
  });
});

describe('verified overrides', () => {
  for (const [word, override] of Object.entries(VERIFIED_OVERRIDES)) {
    it(`documents and applies the override for ${word}`, () => {
      expect(override.reason.length).toBeGreaterThan(0);
      expect(identifyLastSyllable(word)).toEqual(override.parts);
      expect(splitLastSyllable(word).source).toBe('override');
    });
  }
});

describe('isKnownBaseWord injection', () => {
  it('allows callers to override the built-in gameplay stem lookup', () => {
    expect(identifyLastSyllable('merangkai')).toEqual(['merang', 'kai']);
    expect(
      identifyLastSyllable('memulai', { isKnownBaseWord: (word) => word === 'mulai' }),
    ).toEqual(['memu', 'lai']);
    expect(identifyLastSyllable('mewarnai', { isKnownBaseWord: () => false })).toEqual([
      'mewarna',
      'i',
    ]);
  });
});

describe('invariants', () => {
  for (const { group, word } of legacyRegressionCases) {
    it(`keeps non-empty parts and rejoins normalized input for ${group}: ${word}`, () => {
      const normalized = normalizeWord(word);
      const parts = identifyLastSyllable(word);

      expect(parts.every(Boolean)).toBe(true);
      expect(parts.at(-1)?.length ?? 0).toBeGreaterThan(0);
      expect(parts.join('')).toBe(normalized);
    });
  }

  for (const word of ['berkata-kata', 'berangan-angan', 'bercakap-cakap']) {
    it(`preserves the full normalized hyphenated word for ${word}`, () => {
      const parts = identifyLastSyllable(word);

      expect(parts.every(Boolean)).toBe(true);
      expect(parts.join('')).toBe(normalizeWord(word));
    });
  }
});
