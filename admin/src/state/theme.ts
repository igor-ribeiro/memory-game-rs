import { atom, getDefaultStore, useAtomValue } from "jotai";
import { focusAtom } from "jotai-optics";
import { db } from "../db";
import { getThemesWithImageCount, ThemeWithImageCount } from "../domain/theme";
import { router } from "../router";
import { invariant } from "../utils";

const cacheThemesAtom = atom<Promise<ThemeWithImageCount[]> | null>(null);

export const themesAtom = atom(
  (get) => get(cacheThemesAtom) ?? getThemesWithImageCount(),
  (_get, set, themes: Promise<ThemeWithImageCount[]> | ThemeWithImageCount[]) =>
    set(cacheThemesAtom, Promise.resolve(themes)),
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

  set(themesAtom, await getThemesWithImageCount());
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

    set(themesAtom, await getThemesWithImageCount());
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
  await router.navigate(`/${id}`);
});

export async function createThemeAndOpen(name?: string) {
  return getDefaultStore().set(createThemeAtom, name);
}

const makeThemeAtom = (id: number) =>
  focusAtom(themesAtom, (o) => o.find((t) => t.id === id));

// ponytail: never evicts, one small atom per theme id visited; fine for an admin tool
const themeAtomCache = new Map<number, ReturnType<typeof makeThemeAtom>>();

export function useTheme(id: number) {
  let themeAtom = themeAtomCache.get(id);
  if (!themeAtom) themeAtomCache.set(id, (themeAtom = makeThemeAtom(id)));
  return useAtomValue(themeAtom);
}

export function useThemeRequired(id: number) {
  const theme = useTheme(id);
  invariant(theme, "theme not found");
  return theme;
}
