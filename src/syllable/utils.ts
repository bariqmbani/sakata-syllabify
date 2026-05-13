import { CONSONANT_DIGRAPHS, VOWELS } from './constants.js';

const CONSONANT_DIGRAPH_TOKEN_BY_VALUE: Record<(typeof CONSONANT_DIGRAPHS)[number], string> = {
  ng: '5',
  ny: '6',
  sy: '7',
  kh: '8',
};

const CONSONANT_DIGRAPH_VALUE_BY_TOKEN: Record<string, string> = {
  '5': 'ng',
  '6': 'ny',
  '7': 'sy',
  '8': 'kh',
};

// Legacy loanword clusters are tokenized for compatibility but are not public consonant digraphs.
const LEGACY_CLUSTER_TOKEN_BY_VALUE: Record<string, string> = {
  sh: '9',
  dh: '0',
};

const LEGACY_CLUSTER_VALUE_BY_TOKEN: Record<string, string> = {
  '9': 'sh',
  '0': 'dh',
};

export function tokenizeConsonantUnits(word: string): string {
  const withConsonantDigraphs = CONSONANT_DIGRAPHS.reduce(
    (current, digraph) => current.replaceAll(digraph, CONSONANT_DIGRAPH_TOKEN_BY_VALUE[digraph]),
    word,
  );

  return Object.entries(LEGACY_CLUSTER_TOKEN_BY_VALUE).reduce(
    (current, [cluster, token]) => current.replaceAll(cluster, token),
    withConsonantDigraphs,
  );
}

export function restoreConsonantUnits(word: string): string {
  const withConsonantDigraphs = Object.entries(CONSONANT_DIGRAPH_VALUE_BY_TOKEN).reduce(
    (current, [token, digraph]) => current.replaceAll(token, digraph),
    word,
  );

  return Object.entries(LEGACY_CLUSTER_VALUE_BY_TOKEN).reduce(
    (current, [token, cluster]) => current.replaceAll(token, cluster),
    withConsonantDigraphs,
  );
}

export function isVowel(char: string): boolean {
  return VOWELS.includes(char as (typeof VOWELS)[number]);
}

function isConsonantDigraphToken(char: string): boolean {
  return (
    Object.hasOwn(CONSONANT_DIGRAPH_VALUE_BY_TOKEN, char) ||
    Object.hasOwn(LEGACY_CLUSTER_VALUE_BY_TOKEN, char)
  );
}

export function isConsonant(char: string): boolean {
  return isConsonantDigraphToken(char) || (/^[a-z]$/.test(char) && !isVowel(char));
}

export function isEndsWithCV(word: string): boolean {
  return isConsonant(word.charAt(word.length - 2)) && isVowel(word.charAt(word.length - 1));
}

export function isEndsWithVC(word: string): boolean {
  return isVowel(word.charAt(word.length - 2)) && isConsonant(word.charAt(word.length - 1));
}

export function isEndsWithVV(word: string): boolean {
  return isVowel(word.charAt(word.length - 2)) && isVowel(word.charAt(word.length - 1));
}

export function isEndsWithVVV(word: string): boolean {
  return (
    isVowel(word.charAt(word.length - 3)) &&
    isVowel(word.charAt(word.length - 2)) &&
    isVowel(word.charAt(word.length - 1))
  );
}

export function isEndsWithCC(word: string): boolean {
  return isConsonant(word.charAt(word.length - 2)) && isConsonant(word.charAt(word.length - 1));
}

export function isEndsWithCCC(word: string): boolean {
  return (
    isConsonant(word.charAt(word.length - 3)) &&
    isConsonant(word.charAt(word.length - 2)) &&
    isConsonant(word.charAt(word.length - 1))
  );
}
