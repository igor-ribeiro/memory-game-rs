import { tv, VariantProps } from "tailwind-variants";
import { Button } from "./Button";
import { useParams } from "react-router";

const THEMES = ["NBA", "Harry Potter"].map((name, i) => ({
  id: i + 1,
  name,
  imagesCount: 5,
}));

export function ThemesPanel() {
  const params = useParams();

  return (
    <div className="space-y-4 p-4">
      <header className="flex h-10 items-center justify-between">
        <span className="label uppercase">Temas</span>
        <Button>+</Button>
      </header>
      <div>
        {THEMES.map((theme) => (
          <ThemeItem
            key={theme.id}
            selected={String(theme.id) === params.id}
            theme={theme}
          />
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
  selected,
}: VariantProps<typeof themeItem> & {
  theme: { id: number; name: string; imagesCount: number };
}) {
  return (
    <a href={`/#/${theme.id}`} className={themeItem({ selected })}>
      <span>{theme.name}</span>
      <span className="text-muted">{theme.imagesCount}</span>
    </a>
  );
}
