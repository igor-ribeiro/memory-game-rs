import { ThemeEntity, db } from "../db";

export type ThemeWithImageCount = ThemeEntity & {
  imagesCount: number;
};

export async function getThemesWithImageCount() {
  const themes = await db.themes.orderBy("updatedAt").reverse().toArray();

  const result: Record<number, ThemeWithImageCount> = {};
  const ids: number[] = [];
  for (const theme of themes) {
    ids.push(theme.id);
    result[theme.id] = {
      ...theme,
      imagesCount: 0,
    };
  }

  await db.crops
    .where("themeId")
    .anyOf(ids)
    .each((image) => {
      if (image.themeId in result) {
        result[image.themeId].imagesCount++;
      }
    });

  return ids.map((id) => result[id]);
}

export async function getThemeById(id: number) {
  return db.themes.where("id").equals(id).first();
}
