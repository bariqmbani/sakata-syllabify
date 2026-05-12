import { describe, expect, it } from 'vitest';

import { normalizeWord } from './normalize.js';

describe('normalizeWord', () => {
  it('trims, lowercases, normalizes, and removes unsupported characters', () => {
    expect(normalizeWord('  Ma-Kan!!  ')).toBe('ma-kan');
  });

  it('keeps hyphens for explicit hyphenated-word handling', () => {
    expect(normalizeWord('Berkata-Kata')).toBe('berkata-kata');
  });
});
