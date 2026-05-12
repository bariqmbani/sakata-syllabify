import type { SyllableRule } from '../types.js';
import { isEndsWithVVV } from '../utils.js';
import { endsWithVVRule } from './ends-with-vv.rule.js';

export const endsWithVVVRule: SyllableRule = {
  id: 'ends-with-vvv',
  description: 'Handles words ending with three vowels through VV gameplay behavior.',
  match: isEndsWithVVV,
  apply: endsWithVVRule.apply,
};
