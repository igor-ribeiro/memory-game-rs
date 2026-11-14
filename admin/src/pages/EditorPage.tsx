import { useLiveQuery } from "dexie-react-hooks";
import { useParams } from "react-router";
import { Canvas, CanvasPlaceholder } from "../components/editor/Canvas";
import { EditorHeader } from "../components/editor/EditorHeader";
import { ExportPanel } from "../components/editor/ExportPanel";
import { ImagesPanel } from "../components/editor/ImagesPanel";
import { ThemesPanel } from "../components/editor/ThemesPanel";
import { getThemeById as getThemeBySlug } from "../domain/theme";
import { useGetImages } from "../domain/image";
import { useMemo } from "react";

export function EditorPage() {
  const { slug, imageId } = useParams();
  const theme = useLiveQuery(() => getThemeBySlug(slug!), [slug]);
  const images = useGetImages(theme?.id);
  const image = useMemo(() => {
    return images.find((image) => image.id === Number(imageId));
  }, [images, imageId]);

  if (!theme) return null;

  return (
    <>
      <EditorHeader theme={theme} />
      <main
        className="grid flex-1 grid-cols-2 grid-rows-2 overflow-hidden [grid-template-areas:var(--area-mobile)] xl:grid-cols-[minmax(250px,350px)_minmax(560px,1fr)_minmax(250px,300px)] xl:grid-rows-1 xl:[grid-template-areas:var(--area-desktop)]"

        style={{
          // @ts-ignore
          "--area-desktop": '"panel canvas export"',
          // @ts-ignore
          "--area-mobile":
            '"canvas canvas" \
            "panel export"',
        }}
      >
        <aside className="space-y-2 border-r [grid-area:panel]">
          <ThemesPanel />
          <hr />
          <ImagesPanel themeId={theme.id} images={images} />
        </aside>
        <div className="bg-checker relative flex items-center justify-center [grid-area:canvas]">
          {image ? (
            <Canvas key={image.id} image={image} />
          ) : (
            <CanvasPlaceholder theme={theme} />
          )}
        </div>
        <aside className="border-l p-4 [grid-area:export]">
          <ExportPanel />
        </aside>
      </main>
    </>
  );
}
