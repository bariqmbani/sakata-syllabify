export function normalizeWord(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .normalize('NFC')
    .replace(/[^a-z-]/g, '');
}
