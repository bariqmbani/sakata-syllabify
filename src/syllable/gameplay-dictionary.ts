const GAMEPLAY_WORDS = new Set([
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

export function isKnownGameplayWord(word: string): boolean {
  return GAMEPLAY_WORDS.has(word);
}
