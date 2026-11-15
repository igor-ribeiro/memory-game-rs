export function pluralize(
  count: number,
  word: string,
  plural?: string,
): string {
  return `${count} ${count > 1 ? (plural ?? word + "s") : word}`;
}

export function invariant<T>(
  value: T | null | undefined,
  error: string,
): asserts value is Required<T> {
  if (value == null) throw new Error(error);
}
