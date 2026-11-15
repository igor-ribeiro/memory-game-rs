import { useLiveQuery } from "dexie-react-hooks";
import { CropEntity, db, ImageEntity } from "../db";
import { getImagesGroupById } from "./image";

export type CropEntityWithImage = CropEntity & {
  image: ImageEntity;
};

export async function getCropsWithImage(
  themeId: number,
): Promise<CropEntityWithImage[]> {
  const crops = await db.crops.where("themeId").equals(themeId).toArray();
  const imageIds = Array.from(new Set(crops.map((crop) => crop.imageId)));
  const imagesById = await getImagesGroupById(imageIds);
  return crops.map((crop) => ({
    ...crop,
    image: imagesById[crop.imageId],
  }));
}

export function useCropsWithImage(themeId: number) {
  return useLiveQuery(() => getCropsWithImage(themeId), [themeId]) ?? [];
}

export function useCrops(themeId: number) {
  return (
    useLiveQuery(
      () => db.crops.where("themeId").equals(themeId).toArray(),
      [themeId],
    ) ?? []
  );
}
