import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../db";

async function getImagesByTheme(themeId: number) {
  return (
    (await db.images
      .where("themeId")
      .equals(themeId)
      .filter((image) => image.deletedAt == null)
      .toArray()) ?? []
  );
}

export function useGetImages(themeId?: number) {
  return (
    useLiveQuery(() => (themeId ? getImagesByTheme(themeId) : []), [themeId]) ??
    []
  );
}
