import { useCallback } from "react";
import { useNavigate } from "react-router";
import slug from "slug";
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

  await db.images
    .where("themeId")
    .anyOf(ids)
    .each((image) => {
      if (image.themeId in result) {
        result[image.themeId].imagesCount++;
      }
    });

  return ids.map((id) => result[id]);
}

export async function findThemeById(id: number) {
  return db.themes.get(id);
}

export async function renameTheme(id: number, name: string) {
  await db.themes.update(id, {
    name,
    slug: slug(name),
    updatedAt: new Date(),
  });
}

export function useNewThemeNavigate() {
  const navigate = useNavigate();
  return useCallback(
    async (name?: string) => {
      try {
        const id = await db.themes.add({
          name: name ?? "Sem Nome",
          slug: name ? slug(name) : "sem-nome",
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        navigate(`/${id}`);
      } catch (e) {
        alert(`Não foi possível criar o tema`);
        console.error(`[new-empty-theme]: ${e}`);
      }
    },
    [navigate],
  );
}
