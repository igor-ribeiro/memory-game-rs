import { atom, getDefaultStore } from "jotai";
import { db } from "../db";
import { getThemesWithImageCount, ThemeWithImageCount } from "../domain/theme";
import { invariant } from "../utils";

const cacheThemesAtom = atom<ThemeWithImageCount[] | null>(null);

export const themesAtom = atom(
  async (get) => {
    return get(cacheThemesAtom) ?? getThemesWithImageCount();
  },
  (_get, set, themes: ThemeWithImageCount[]) => set(cacheThemesAtom, themes),
);

const deleteThemeAtom = atom(null, async (get, set, id: number) => {
  const [cropsToDelete, imagesToDelete, spritesToDelete] = await Promise.all([
    db.crops.where("themeId").equals(id).toArray(),
    db.images.where("themeId").equals(id).toArray(),
    db.sprites.where("themeId").equals(id).toArray(),
  ]);

  await db.transaction("rw", db.themes, db.crops, db.images, db.sprites, () => {
    return Promise.all([
      db.themes.delete(id),
      db.crops.bulkDelete(cropsToDelete.map((i) => i.id)),
      db.images.bulkDelete(imagesToDelete.map((i) => i.id)),
      db.sprites.bulkDelete(spritesToDelete.map((i) => i.id)),
    ]);
  });

  const themes = await get(themesAtom);
  set(
    themesAtom,
    themes.filter((theme) => theme.id !== id),
  );
});

export function deleteTheme(id: number) {
  return getDefaultStore().set(deleteThemeAtom, id);
}

const renameThemeAtom = atom(
  null,
  async (get, set, id: number, name: string) => {
    const themes = await get(themesAtom);
    const partial = {
      name,
      updatedAt: new Date(),
    };
    await db.themes.update(id, partial);
    set(
      themesAtom,
      themes.map((t) => {
        if (t.id === id) {
          return {
            ...t,
            ...partial,
          };
        }
        return t;
      }),
    );
  },
);

export function renameTheme(id: number, name: string) {
  return getDefaultStore().set(renameThemeAtom, id, name);
}

const createThemeAtom = atom(null, async (get, set, name?: string) => {
  const id = await db.themes.add({
    name: name ?? "Sem Nome",
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  const theme = await db.themes.get(id);
  invariant(theme, "theme not created");
  const themes = await get(themesAtom);
  set(themesAtom, [{ ...theme, imagesCount: 0 }].concat(themes));
  window.location.hash = `/${id}`;
});

export async function createThemeAndOpen(name?: string) {
  return getDefaultStore().set(createThemeAtom, name);
}
