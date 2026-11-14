import { useLiveQuery } from "dexie-react-hooks";
import { NavLink } from "react-router";
import { tv, VariantProps } from "tailwind-variants";
import { getThemesWithImageCount, useNewThemeNavigate } from "../domain/theme";
import { Button } from "./Button";
import { ThemeEntity } from "../db";

export function ThemesPanel() {
  const themes = useLiveQuery(getThemesWithImageCount);
  const newTheme = useNewThemeNavigate();

  return (
    <div className="space-y-4 p-4">
      <header className="flex h-10 items-center justify-between">
        <span className="label uppercase">Temas</span>
        <Button onClick={() => newTheme()}>+</Button>
      </header>
      <div>
        {themes?.map((theme) => (
          <ThemeItem key={theme.id} theme={theme} />
        ))}
      </div>
    </div>
  );
}

const themeItem = tv({
  base: "border border-transparent flex justify-between items-center gap-1 p-2 hover:bg-raised",
  variants: {
    selected: {
      true: "border-accent bg-raised",
    },
  },
});

function ThemeItem({
  theme,
}: VariantProps<typeof themeItem> & {
  theme: ThemeEntity & { imagesCount: number };
}) {
  return (
    <NavLink
      to={`/${theme.slug}`}
      className={({ isActive }) => themeItem({ selected: isActive })}
    >
      <span>{theme.name}</span>
      <span className="text-muted">{theme.imagesCount}</span>
    </NavLink>
  );
}
