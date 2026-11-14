import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../db";

export function useGetImages(themeId?: number) {
  return (
    useLiveQuery(
      () =>
        themeId ? db.images.where("themeId").equals(themeId).toArray() : [],
      [themeId],
    ) ?? []
  );
}
