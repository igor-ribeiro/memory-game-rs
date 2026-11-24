import { SPRITE_SIZE } from "../config";
import { db } from "../db";
import { invariant } from "../utils";
import { CropEntityWithImage } from "./crop";

const CAPACITY = 3;
const canvasCache = new Map<number, OffscreenCanvas>();

function canvasOr(themeId: number, fallback: OffscreenCanvas) {
  const canvas = canvasCache.get(themeId);
  if (canvas) {
    return canvas;
  }

  const keys = Array.from(canvasCache.keys());
  if (keys.length === CAPACITY) {
    canvasCache.delete(keys[0]);
  }
  canvasCache.set(themeId, fallback);
  return fallback;
}

export async function generateSprite(
  themeId: number,
  crops: CropEntityWithImage[],
) {
  const c = canvasOr(themeId, new OffscreenCanvas(0, 0));
  c.width = Math.max(SPRITE_SIZE * crops.length, SPRITE_SIZE);
  c.height = SPRITE_SIZE;

  const ctx = c.getContext("2d");
  invariant(ctx, "failed to get offscreen canvas ctx");

  const imagesById: Record<number, ImageBitmap> = {};
  for (const crop of crops) {
    if (crop.imageId in imagesById) {
      continue;
    }

    imagesById[crop.imageId] = await createImageBitmap(crop.image.blob);
  }

  ctx.clearRect(0, 0, c.width, c.height);
  for (let i = 0; i < crops.length; i++) {
    const crop = crops[i];
    const size = SPRITE_SIZE / crop.scale;

    ctx.drawImage(
      imagesById[crop.imageId],
      crop.offsetX / crop.scale,
      crop.offsetY / crop.scale,
      size,
      size,
      SPRITE_SIZE * i,
      0,
      SPRITE_SIZE,
      SPRITE_SIZE,
    );
  }

  for (const id in imagesById) {
    imagesById[id].close();
  }

  const blob = await c.convertToBlob({
    type: "image/jpeg",
    quality: 1,
  });

  await db.sprites.upsert(themeId, {
    blob,
    themeId,
    height: SPRITE_SIZE,
    width: SPRITE_SIZE * crops.length,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

let timeout = 0;

export function generateSpriteDebounced(
  ...params: Parameters<typeof generateSprite>
) {
  if (timeout) {
    clearTimeout(timeout);
  }

  timeout = setTimeout(() => generateSprite(...params), 1000);
}
