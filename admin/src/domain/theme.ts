import { useCallback } from "react";
import { useNavigate } from "react-router";
import slug from "slug";
import { ThemeEntity, db } from "../db";

export type ThemeWithImageCount = ThemeEntity & {
  imagesCount: number;
};

export async function getThemesWithImageCount() {
  const themes = await db.themes
    .orderBy("updatedAt")
    .reverse()
    .filter((theme) => theme.deletedAt == null)
    .toArray();

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
    .filter((image) => ids.includes(image.themeId) && image.deletedAt == null)
    .each((image) => {
      if (image.themeId in result) {
        result[image.themeId].imagesCount++;
      }
    });

  return ids.map((id) => result[id]);
}

export async function getThemeById(slug: string) {
  return db.themes
    .filter((theme) => theme.slug === slug && theme.deletedAt == null)
    .first();
}

export async function renameTheme(
  id: number,
  name: string,
): Promise<ThemeEntity> {
  await db.themes.update(id, {
    name,
    slug: slug(name),
    updatedAt: new Date(),
  });
  const theme = await db.themes.get(id);
  if (!theme) throw new Error(`theme not found ${id}`);
  return theme;
}

export function useNewThemeNavigate() {
  const navigate = useNavigate();
  return useCallback(
    async (name?: string) => {
      try {
        const theme = {
          name: name ?? "Sem Nome",
          slug: name ? slug(name) : "sem-nome",
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        await db.themes.add(theme);

        navigate(`/${theme.slug}`);
      } catch (e) {
        alert(`Não foi possível criar o tema`);
        console.error(`[new-empty-theme]: ${e}`);
      }
    },
    [navigate],
  );
}

export async function deleteTheme(id: number) {
  await db.transaction("rw", db.themes, db.images, db.sprites, () => {
    return Promise.all([
      db.themes.update(id, {
        deletedAt: new Date(),
      }),
      db.images.where("themeId").equals(id).modify({
        deletedAt: new Date(),
      }),
      db.sprites.where("themeId").equals(id).modify({
        deletedAt: new Date(),
      }),
    ]);
  });
}
