import { SPRITE_SIZE } from "../config";
import { CropEntity, db } from "../db";

export async function importTheme(name: string, file: File): Promise<number> {
  const bitmap = await createImageBitmap(file);
  const count = bitmap.width / SPRITE_SIZE;
  const crops: Omit<CropEntity, "id">[] = [];

  return db.transaction(
    "rw",
    db.themes,
    db.images,
    db.crops,
    db.sprites,
    async () => {
      const themeId = await db.themes.add({
        name,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const imageId = await db.images.add({
        name: file.name,
        themeId,
        blob: file,
        width: bitmap.width,
        height: bitmap.height,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await db.sprites.add({
        themeId,
        blob: file,
        width: bitmap.width,
        height: bitmap.height,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      for (let i = 0; i < count; i++) {
        crops.push({
          order: i,
          themeId,
          imageId,
          createdAt: new Date(),
          updatedAt: new Date(),
          scale: 1,
          offsetX: i * SPRITE_SIZE,
          offsetY: 0,
          blob: new Blob([]),
        });
      }

      await db.crops.bulkAdd(crops);
      return themeId;
    },
  );
}
