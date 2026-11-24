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

export async function imageDataToBlob(imageData: ImageData) {
  const canvas = new OffscreenCanvas(imageData.width, imageData.height);
  const ctx = canvas.getContext("2d");
  invariant(ctx, "[imageDataToBlob] unable to get 2d context");
  ctx.putImageData(imageData, 0, 0);

  return canvas.convertToBlob({
    type: "image/jpeg",
    quality: 1,
  });
}
