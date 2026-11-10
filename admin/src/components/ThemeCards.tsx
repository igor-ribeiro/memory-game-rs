import { cn, tv } from "tailwind-variants";
import { Button } from "./Button";
import { FormEvent } from "react";
import { default as toSlug } from "slug";
import { db, ImageEntity, ThemeEntity } from "../db";
import { useLiveQuery } from "dexie-react-hooks";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { pluralize } from "../utils";

type ThemeWithImageCount = ThemeEntity & {
  imagesCount: number;
};

async function getThemesWithImages() {
  const themes = await db.themes.orderBy("updatedAt").toArray();
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

  return Object.values(result);
}

export function ThemeCards() {
  const themes = useLiveQuery(getThemesWithImages);
  const themesCount = themes?.length ?? 0;
  return (
    <div className="m-[0_auto] w-full space-y-4 p-4 xl:max-w-7xl">
      <header className="flex items-center justify-between">
        <div className="flex h-10 items-baseline gap-4">
          <h1 className="text-2xl font-bold">Temas</h1>
          <span className="text-muted font-bold">{themesCount}</span>
        </div>
        {themesCount > 0 && <Button variant="primary">+ Novo Tema</Button>}
      </header>
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {themes == null || themes.length < 1 ? (
          <Placeholder />
        ) : (
          themes.map((theme) => <ThemeCard key={theme.id} theme={theme} />)
        )}
      </div>
    </div>
  );
}

const card = tv({
  slots: {
    base: "flex shrink-0 flex-col  border h-56",
    image: "bg-line h-32 shrink-0",
    info: "p-2 flex flex-col justify-between flex-1",
  },
});

function ThemeCard({ theme }: { theme: ThemeWithImageCount }) {
  return (
    <div className={card.slots.base}>
      <div className={card.slots.image}></div>
      <div className={card.slots.info}>
        <h3 className="font-bold">{theme.name}</h3>
        <span className="text-muted">
          {theme.imagesCount === 0
            ? "nenhuma imagem"
            : pluralize(theme.imagesCount, "imagem", "imagens")}
        </span>
        <span className="text-muted text-sm">
          editado há{" "}
          {formatDistanceToNow(theme.updatedAt, {
            locale: ptBR,
          })}
        </span>
      </div>
    </div>
  );
}

function CreateCard() {
  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const name = (form.theme_name as HTMLInputElement).value;
    const slug = toSlug(name);

    try {
      const id = await db.themes.add({
        name,
        slug,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      console.info(`Theme "${name}" created, id=${id}`);

      form.reset();
    } catch (e) {
      console.error(`Unable to create theme: ${e}`);
    }
  }

  return (
    <form
      className={cn(
        card.slots.base,
        "border-accent flex-col justify-center gap-4 border-dashed p-4",
      )}
      onSubmit={onSubmit}
    >
      <label className="flex flex-col gap-2">
        <span className="label block">Nome do tema</span>
        <input
          name="theme_name"
          className="h-10 w-full border p-2"
          autoComplete="off"
          autoFocus
        />
      </label>
      <Button variant="primary" fill>
        + Criar primeiro tema
      </Button>
    </form>
  );
}

function Placeholder() {
  return (
    <>
      <CreateCard />
      <PlaceholderCard />
      <PlaceholderCard className="opacity-60" />
      <PlaceholderCard className="opacity-30" />
    </>
  );
}

function PlaceholderCard({ className }: { className?: string }) {
  return (
    <div className={cn(card.slots.base, className)}>
      <div className={card.slots.image}></div>
      <div className="h-32 space-y-2 p-4">
        <div className="bg-line h-4 w-2/3"></div>
        <div className="bg-line/50 h-3 w-1/3"></div>
      </div>
    </div>
  );
}
