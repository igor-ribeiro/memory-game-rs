import { useSuspendingLiveQuery } from "dexie-react-hooks";
import { db, ImageEntity } from "../db";

export async function getImagesGroupById(imageIds: number[]) {
  const imagesById: Record<string, ImageEntity> = {};
  const images = await db.images.where("id").anyOf(imageIds).toArray();
  images.forEach((image) => {
    imagesById[image.id] = image;
  });
  return imagesById;
}

export function useImagesGroupedById(imageIds: number[]) {
  return useSuspendingLiveQuery(() => getImagesGroupById(imageIds), imageIds);
}

async function getImagesByTheme(themeId: number) {
  return (await db.images.where("themeId").equals(themeId).toArray()) ?? [];
}

export function useGetImages(themeId?: number) {
  return useSuspendingLiveQuery(
    () => (themeId ? getImagesByTheme(themeId) : []),
    [themeId],
  );
}
