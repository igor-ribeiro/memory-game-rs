import { atom, getDefaultStore, useAtomValue } from "jotai";
import { focusAtom } from "jotai-optics";
import { db } from "../db";
import { getThemesWithImageCount, ThemeWithImageCount } from "../domain/theme";
import { invariant } from "../utils";

const cacheThemesAtom = atom<Promise<ThemeWithImageCount[]> | null>(null);

export const themesAtom = atom(
  (get) => get(cacheThemesAtom) ?? getThemesWithImageCount(),
  (_get, set, themes: Promise<ThemeWithImageCount[]> | ThemeWithImageCount[]) =>
    set(cacheThemesAtom, Promise.resolve(themes)),
);

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
