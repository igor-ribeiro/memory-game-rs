import { useLiveQuery } from "dexie-react-hooks";
import { FormEvent, useCallback } from "react";
import { NavLink, useNavigate, useParams } from "react-router";
import { AppLogo } from "../components/AppLogo";
import { Button } from "../components/Button";
import { ExportPanel } from "../components/ExportPanel";
import { Header } from "../components/Header";
import { ImagesPanel } from "../components/ImagesPanel";
import { ThemesPanel } from "../components/ThemesPanel";
import {
  Popover,
  PopoverActions,
  PopoverClose,
  PopoverContent,
  PopoverDescription,
  PopoverTitle,
  PopoverTrigger,
} from "../components/ui/Popover";
import { toast } from "../components/ui/Toast";
import {
  deleteTheme,
  getThemeById as getThemeBySlug,
  renameTheme,
} from "../domain/theme";
import DeleteIcon from "../icons/delete.svg?react";
import DropIcon from "../icons/drop.svg?react";

export function EditorPage() {
  const params = useParams();
  const theme = useLiveQuery(() => getThemeBySlug(params.slug!), [params.slug]);
  const navigate = useNavigate();

  async function onRename(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const name = form.theme_name.value;
    const id = form.theme_id.value;

    const theme = await renameTheme(Number(id), name);
    navigate(`/${theme.slug}`);
  }

  const onDelete = useCallback(async () => {
    if (!theme) return;

    navigate("/");

    toast.promise<void>(deleteTheme(theme.id), {
      loading: {
        description: "Excluíndo thema...",
        data: {
          close: false,
        },
      },
      success() {
        return {
          timeout: 3000,
          data: { icon: "delete" },
          description: `Tema "${theme.name}" excluído`,
          actionProps: {
            children: "Desfazer",
            onClick: () => console.log("undo"),
          },
        };
      },
      error(e) {
        console.error("[delete-theme]:", e);
        return {
          type: "error",
          title: `Não foi possível excluir o tema "${theme.name}"`,
        };
      },
    });
  }, [theme]);

  if (!theme) return null;

  return (
    <>
      <Header className="justify-between">
        <form className="flex items-center gap-4 text-lg" onSubmit={onRename}>
          <NavLink to="/">
            <AppLogo />
          </NavLink>
          <span className="text-muted">/</span>
          <input
            type="text"
            key={theme.id}
            name="theme_name"
            className="h-10 border p-2 font-bold"
            defaultValue={theme.name}
          />
          <input type="hidden" name="theme_id" value={theme.id} />
        </form>
        <Popover>
          <PopoverTrigger render={<Button icon />}>
            <DeleteIcon />
          </PopoverTrigger>
          <PopoverContent align="end">
            <PopoverTitle>Excluir "{theme.name}"?</PopoverTitle>
            <PopoverDescription>
              As X imagens deste tema serão removidas.
            </PopoverDescription>
            <PopoverActions>
              <PopoverClose render={<Button>Cancelar</Button>} />
              <PopoverClose
                render={
                  <Button variant="danger" onClick={onDelete}>
                    Excluir
                  </Button>
                }
              />
            </PopoverActions>
          </PopoverContent>
        </Popover>
      </Header>
      <main
        className="grid flex-1 grid-cols-2 grid-rows-2 overflow-hidden [grid-template-areas:var(--area-mobile)] xl:grid-cols-[minmax(250px,300px)_minmax(560px,1fr)_minmax(250px,300px)] xl:grid-rows-1 xl:[grid-template-areas:var(--area-desktop)]"
        style={{
          // @ts-ignore
          "--area-desktop": '"panel canvas export"',
          // @ts-ignore
          "--area-mobile":
            '"canvas canvas" \
          "panel export"',
        }}
      >
        <aside className="space-y-2 overflow-y-scroll border-r [grid-area:panel]">
          <ThemesPanel />
          <hr />
          <ImagesPanel />
        </aside>
        <div className="bg-checker relative [grid-area:canvas]">
          <CanvasPlaceholder />
        </div>
        <aside className="border-l p-4 [grid-area:export]">
          <ExportPanel />
        </aside>
      </main>
    </>
  );
}

function CanvasPlaceholder() {
  return (
    <div className="border-accent bg-bg absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center gap-4 border border-dashed px-12 py-16 text-center">
      <DropIcon />
      <h3 className="text-xl font-bold">Solte as imagens aqui</h3>
      <span className="text-muted text-sm">
        png · jpg · svg · webp — uma imagem por carta
      </span>
      <Button variant="primary">Escolher arquivos</Button>
      <span className="text-muted text-sm">
        ou cole da área de transferência · ctrl/⌘ + v
      </span>
    </div>
  );
}
