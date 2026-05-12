import { describe, expect, it } from 'vitest';

import { makeParts } from './result.js';

describe('makeParts', () => {
  it('does not return empty prefix parts', () => {
    expect(makeParts('', 'kan')).toEqual(['kan']);
  });

  it('does not return empty last parts', () => {
    expect(makeParts('makan', '')).toEqual(['makan']);
  });

  it('returns no parts when both inputs are empty', () => {
    expect(makeParts('', '')).toEqual([]);
  });
});
