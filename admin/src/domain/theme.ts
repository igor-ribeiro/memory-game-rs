import { useSuspendingLiveQuery } from "dexie-react-hooks";
import { useCallback } from "react";
import { useNavigate } from "react-router";
import { SpriteEntity, ThemeEntity, db } from "../db";

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

export type ThemeWithSprite = ThemeEntity & {
  sprite?: SpriteEntity;
};

async function getThemesWithSprite() {
  const [themes, sprites] = await Promise.all([
    db.themes.orderBy("updatedAt").reverse().toArray(),
    db.sprites.toArray(),
  ]);
  const spritesByTheme = sprites.reduce(
    (result, sprite) => {
      result[sprite.themeId] = sprite;
      return result;
    },
    {} as Record<string, SpriteEntity>,
  );

  return themes.map((theme) => ({
    ...theme,
    sprite: spritesByTheme[theme.id],
  }));
}

export function useThemesWithSprite() {
  return useSuspendingLiveQuery(getThemesWithSprite, ["themes-with-sprite"]);
}

export async function getThemeById(id: number) {
  return db.themes.get(id);
}

export function useThemeById(id: number) {
  return useSuspendingLiveQuery(() => getThemeById(id), ["theme", id]);
}

export function useThemes() {
  return useSuspendingLiveQuery(getThemesWithImageCount, ["themes"]);
}

export async function deleteTheme(id: number) {
  const [cropsToDelete, imagesToDelete] = await Promise.all([
    db.crops.where("themeId").equals(id).toArray(),
    db.images.where("themeId").equals(id).toArray(),
  ]);

  await db.transaction("rw", db.themes, db.crops, db.images, db.sprites, () => {
    return Promise.all([
      db.themes.delete(id),
      db.crops.bulkDelete(cropsToDelete.map((i) => i.id)),
      db.images.bulkDelete(imagesToDelete.map((i) => i.id)),
      db.sprites.delete(id),
    ]);
  });
}

async function createTheme(name?: string) {
  return db.themes.add({
    name: name ?? "Sem Nome",
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

export function useCreateThemeAndOpen() {
  const navigate = useNavigate();

  return useCallback(async (name?: string) => {
    const id = await createTheme(name);
    navigate(`/${id}`);
  }, []);
}

export async function renameTheme(id: number, name: string) {
  await db.themes.update(id, {
    name,
    updatedAt: new Date(),
  });
}
