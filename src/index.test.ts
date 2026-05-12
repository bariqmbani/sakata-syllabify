import { describe, expect, it } from 'vitest';

import { engineStatus } from './index.js';

describe('engineStatus', () => {
  it('exposes an initialized status', () => {
    expect(engineStatus).toBe('initialized');
  });
});
