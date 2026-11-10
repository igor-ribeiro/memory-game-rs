export function pluralize(
  count: number,
  word: string,
  plural?: string,
): string {
  return `${count} ${count > 1 ? (plural ?? word + "s") : word}`;
}
