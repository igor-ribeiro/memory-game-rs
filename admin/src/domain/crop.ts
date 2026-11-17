import { useSuspendingLiveQuery } from "dexie-react-hooks";
import { CropEntity, db, ImageEntity } from "../db";
import { getImagesGroupById } from "./image";

export type CropEntityWithImage = CropEntity & {
  image: ImageEntity;
};

export async function getCropsWithImage(
  themeId: number,
): Promise<CropEntityWithImage[]> {
  const crops = await db.crops.where("themeId").equals(themeId).toArray();
  const imagesById = await getImagesGroupById(themeId);
  return crops.map((crop) => ({
    ...crop,
    image: imagesById[crop.imageId],
  }));
}

export function useCropsWithImage(themeId: number) {
  return useSuspendingLiveQuery(
    () => getCropsWithImage(themeId),
    ["crops-image", themeId],
  );
}

function getCrops(themeId: number) {
  return db.crops.where("themeId").equals(themeId).toArray();
}

export function useCrops(themeId: number) {
  return useSuspendingLiveQuery(() => getCrops(themeId), ["crops", themeId]);
}
