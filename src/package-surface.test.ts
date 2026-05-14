import { describe, expect, it } from 'vitest';

import {
  getLastSyllable,
  identifyLastSyllable,
  normalizeWord,
  splitLastSyllable,
} from './index.js';

describe('package surface', () => {
  it('exposes core syllable APIs from the root entrypoint', () => {
    expect(identifyLastSyllable('makan')).toEqual(['ma', 'kan']);
    expect(getLastSyllable('kandidat')).toBe('dat');
    expect(splitLastSyllable('makan')).toMatchObject({
      normalized: 'makan',
      prefix: 'ma',
      last: 'kan',
      parts: ['ma', 'kan'],
    });
    expect(normalizeWord('  MA-KAN!!  ')).toBe('ma-kan');
  });
});
