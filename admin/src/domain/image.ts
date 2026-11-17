import { useSuspendingLiveQuery } from "dexie-react-hooks";
import { db, ImageEntity } from "../db";

export async function getImagesGroupById(themeId: number) {
  const imagesById: Record<string, ImageEntity> = {};
  const images = await db.images.where("themeId").equals(themeId).toArray();
  images.forEach((image) => {
    imagesById[image.id] = image;
  });
  return imagesById;
}

export function useImagesGroupedById(themeId: number) {
  return useSuspendingLiveQuery(
    () => getImagesGroupById(themeId),
    ["images-by-theme", themeId],
  );
}

async function getImagesByTheme(themeId: number) {
  return (await db.images.where("themeId").equals(themeId).toArray()) ?? [];
}

export function useGetImages(themeId?: number) {
  return useSuspendingLiveQuery(
    () => (themeId ? getImagesByTheme(themeId) : []),
    ["images-by-theme", themeId],
  );
}
