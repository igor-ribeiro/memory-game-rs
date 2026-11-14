import { useLiveQuery } from "dexie-react-hooks";
import { useParams } from "react-router";
import { Button } from "../components/Button";
import { EditorHeader } from "../components/editor/EditorHeader";
import { ExportPanel } from "../components/editor/ExportPanel";
import { ImagesPanel } from "../components/editor/ImagesPanel";
import { ThemesPanel } from "../components/editor/ThemesPanel";
import { getThemeById as getThemeBySlug } from "../domain/theme";
import DropIcon from "../icons/drop.svg?react";

export function EditorPage() {
  const params = useParams();
  const theme = useLiveQuery(() => getThemeBySlug(params.slug!), [params.slug]);

  if (!theme) return null;

  return (
    <>
      <EditorHeader theme={theme} />
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
