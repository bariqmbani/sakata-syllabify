import type { SyllableEngineOptions, SyllableRule } from '../types.js';
import { isEndsWithVV, isVowel } from '../utils.js';
import { isKnownGameplayBaseWord } from '../gameplay-base-words.js';

function hasPossiblePrefixWithSuffix(
  word: string,
  isKnownBaseWord: (word: string) => boolean,
): boolean {
  let isWithSuffix = true;

  for (let prefixLength = 2; prefixLength <= 3; prefixLength += 1) {
    if (!isWithSuffix) break;
    const effectivePrefixLength = word.startsWith('meng') ? 4 : prefixLength;
    let withoutPrefix = word.substring(effectivePrefixLength);
    withoutPrefix = withoutPrefix.replaceAll('ny', 's');

    if (withoutPrefix.startsWith('n') && !withoutPrefix.startsWith('ng')) {
      withoutPrefix = withoutPrefix.replace('n', 't');
    }

    isWithSuffix = !isKnownBaseWord(withoutPrefix);
  }

  return isWithSuffix;
}

export const endsWithVVRule: SyllableRule = {
  id: 'ends-with-vv',
  description: 'Handles words ending with two vowels, including gameplay suffix behavior.',
  match: isEndsWithVV,
  apply: (word, options: SyllableEngineOptions = {}, identify) => {
    if (word.endsWith('iu') || word.endsWith('ae')) {
      return [word.substring(0, word.length - 1), word.substring(word.length - 1)];
    }

    if (word.startsWith('me') || word.startsWith('be') || word.startsWith('te')) {
      const isKnownBaseWord = options.isKnownBaseWord ?? isKnownGameplayBaseWord;

      // Gameplay suffix handling preserved from legacy behavior.
      if (hasPossiblePrefixWithSuffix(word, isKnownBaseWord)) {
        return [word.substring(0, word.length - 1), word.substring(word.length - 1)];
      }
    }

    if (['i', 'u', 'e', 'o'].includes(word.charAt(word.length - 2)) && word.endsWith('a')) {
      return [word.substring(0, word.length - 1), word.substring(word.length - 1)];
    }

    if (isVowel(word.charAt(word.length - 3))) {
      return [word.substring(0, word.length - 2), word.substring(word.length - 2)];
    }

    const lastVowel = word.charAt(word.length - 1);
    const withoutLastVowel = word.slice(0, -1);
    const parts = identify ? identify(withoutLastVowel, options) : [withoutLastVowel];
    const lastIndex = parts.length - 1;

    if (lastIndex < 0) return [lastVowel];

    return parts.map((part, index) => (index === lastIndex ? `${part}${lastVowel}` : part));
  },
};
