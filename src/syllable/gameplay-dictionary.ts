const GAMEPLAY_BASE_WORDS = new Set([
  'damai',
  'gapai',
  'geragai',
  'i',
  'ilai',
  'kwei',
  'rangkai',
  'rui',
  'sangai',
  'seringai',
  'suplai',
  'survei',
  'tilai',
  'tuai',
  'uai',
  'ulai',
  'usai',
]);

export function isKnownGameplayBaseWord(word: string): boolean {
  return GAMEPLAY_BASE_WORDS.has(word);
}
