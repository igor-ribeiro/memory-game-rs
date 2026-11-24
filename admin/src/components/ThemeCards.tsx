import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { SubmitEvent, useMemo } from "react";
import { NavLink } from "react-router";
import { cn, tv } from "tailwind-variants";
import { SPRITE_SIZE } from "../config";
import {
  ThemeWithSprite,
  useCreateThemeAndOpen,
  useThemesWithSprite,
} from "../domain/theme";
import UploadIcon from "../icons/upload.svg?react";
import { pluralize } from "../utils";
import { Button } from "./Button";
import { ImportThemeDialog } from "./ImportThemeDialog";

const card = tv({
  slots: {
    base: "flex shrink-0 flex-col  border h-56",
    image: "bg-line h-32 shrink-0",
    info: "p-2 flex flex-col justify-between flex-1",
  },
});

export function ThemeCards() {
  const themes = useThemesWithSprite();
  const createThemeAndOpen = useCreateThemeAndOpen();

  return (
    <div className="m-[0_auto] w-full space-y-4 p-4 xl:max-w-7xl">
      <header className="flex items-center justify-between">
        <div className="flex h-10 items-baseline gap-4">
          <h1 className="text-2xl font-bold">Temas</h1>
          <span className="text-muted font-bold">{themes.length}</span>
        </div>

        <div className="flex items-center gap-2">
          <ImportThemeDialog>
            <Button>
              <UploadIcon />
              Importar
            </Button>
          </ImportThemeDialog>

          {themes.length > 0 && (
            <Button variant="primary" onClick={() => createThemeAndOpen()}>
              + Novo Tema
            </Button>
          )}
        </div>
      </header>
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {themes == null || themes.length < 1 ? (
          <EmptyState />
        ) : (
          themes.map((theme) => <ThemeCard key={theme.id} theme={theme} />)
        )}
      </div>
    </div>
  );
}

function ThemeCard({ theme }: { theme: ThemeWithSprite }) {
  const count = theme.sprite ? theme.sprite.width / SPRITE_SIZE : 0;
  const thumb = useMemo(() => {
    return theme.sprite ? window.URL.createObjectURL(theme.sprite.blob) : null;
  }, [theme.sprite]);

  return (
    <NavLink to={`/${theme.id}`} className={card.slots.base}>
      <div
        className={cn(card.slots.image, "bg-cover")}
        style={{
          backgroundImage: thumb ? `url(${thumb})` : undefined,
        }}
      />
      <div className={card.slots.info}>
        <h3 className="font-bold">{theme.name}</h3>
        <span className="text-muted">
          {count === 0
            ? "nenhuma imagem"
            : pluralize(count, "imagem", "imagens")}
        </span>
        <span className="text-muted text-sm">
          editado há{" "}
          {formatDistanceToNow(theme.updatedAt, {
            locale: ptBR,
          })}
        </span>
      </div>
    </NavLink>
  );
}

function CreateCard() {
  const createThemeAndOpen = useCreateThemeAndOpen();

  async function onSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const name = (form.theme_name as HTMLInputElement).value;

    try {
      await createThemeAndOpen(name);
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
      <Button variant="primary" className="w-full">
        + Criar primeiro tema
      </Button>
    </form>
  );
}

export function ThemesPlaceholder() {
  return (
    <div className="m-[0_auto] w-full space-y-4 p-4 xl:max-w-7xl">
      <header className="flex items-center justify-between">
        <div className="flex h-10 items-baseline gap-4">
          <h1 className="text-2xl font-bold">Temas</h1>
        </div>
      </header>
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <PlaceholderCard />
        <PlaceholderCard className="opacity-60" />
        <PlaceholderCard className="opacity-30" />
        <PlaceholderCard className="opacity-10" />
      </div>
    </div>
  );
}

function EmptyState() {
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
      <div className={card.slots.info}>
        <div className="bg-line h-4 w-2/3"></div>
        <div className="bg-line/50 h-3 w-1/4"></div>
        <div className="bg-line/50 h-3 w-1/3"></div>
      </div>
    </div>
  );
}
