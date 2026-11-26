import { UpdateSpec } from "dexie";
import { SPRITE_SIZE } from "../../config";
import { CropEntity, db, ImageEntity } from "../../db";
import { invariant } from "../../utils";
import {
  generateCropFromImage,
  generateCropRequest,
  generateThemeCropsRequest,
} from "./message";

const c = new OffscreenCanvas(SPRITE_SIZE, SPRITE_SIZE);
const ctx = c.getContext("2d");

async function generateCrop(
  crop: CropEntity,
  image: ImageBitmap,
): Promise<Blob> {
  invariant(ctx, "MISSING_2D_CONTEXT");
  ctx.clearRect(0, 0, c.width, c.height);
  ctx.drawImage(
    image,

    crop.offsetX,
    crop.offsetY,
    SPRITE_SIZE,
    SPRITE_SIZE,

    0,
    0,
    SPRITE_SIZE,
    SPRITE_SIZE,
  );

  return c.convertToBlob({
    type: "image/jpeg",
    quality: 1,
  });
}

self.addEventListener("message", async (e) => {
  if (e.data.type === "generate-theme-crops/request") {
    const data = generateThemeCropsRequest.parse(e.data);
    const theme = await db.themes.get(data.themeId);
    invariant(theme, "THEME_NOT_FOUND");

    const [images, crops] = await Promise.all([
      db.images
        .where("themeId")
        .equals(data.themeId)
        .filter((i) => i.blob.size > 0)
        .toArray(),
      db.crops.where("themeId").equals(data.themeId).toArray(),
    ]);

    const imagesById: Record<
      number,
      ImageEntity & {
        bitmap: ImageBitmap;
      }
    > = {};

    for (const image of images) {
      imagesById[image.id] = {
        ...image,
        bitmap: await createImageBitmap(image.blob),
      };
    }

    const cropsToUpdate: { key: number; changes: UpdateSpec<CropEntity> }[] =
      [];

    for (const crop of crops) {
      const image = imagesById[crop.imageId];
      if (!image) continue;

      const blob = await generateCrop(crop, image.bitmap);

      cropsToUpdate.push({
        key: crop.id,
        changes: {
          blob,
          updatedAt: new Date(),
        },
      });
    }

    await db.crops.bulkUpdate(cropsToUpdate);
  }

  if (e.data.type === "generate-crop/request") {
    const data = generateCropRequest.parse(e.data);
    const crop = await db.crops.get(data.cropId);
    invariant(crop, "CROP_NOT_FOUND");
    const image = await db.images.get(crop.imageId);
    invariant(image, "IMAGE_NOT_FOUND");
    const bitmap = await createImageBitmap(image.blob);
    const blob = await generateCrop(crop, bitmap);
    await db.crops.update(crop.id, { blob, updatedAt: new Date() });
  }

  if (e.data.type === "generate-crop-from-image") {
    const data = generateCropFromImage.parse(e.data);
    invariant(ctx, "MISSING_2D_CONTEXT");
    ctx.putImageData(data.imageData, 0, 0);
    const blob = await c.convertToBlob({
      type: "image/jpeg",
      quality: 1,
    });
    await db.crops.update(data.cropId, { blob, updatedAt: new Date() });
  }
});

self.addEventListener("unhandledrejection", (e) => {
  setTimeout(() => {
    throw e.reason?.message ?? e.reason;
  });
});
