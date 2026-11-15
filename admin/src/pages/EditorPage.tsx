import { useLiveQuery } from "dexie-react-hooks";
import { useMemo } from "react";
import { NavLink, useParams, useSearchParams } from "react-router";
import { Canvas, CanvasPlaceholder } from "../components/editor/EditorCanvas";
import { EditorHeader } from "../components/editor/EditorHeader";
import { ExportPanel } from "../components/editor/ExportPanel";
import { ImagesPanel } from "../components/editor/ImagesPanel";
import { PreviewCanvas } from "../components/editor/PreviewCanvas";
import { ThemesPanel } from "../components/editor/ThemesPanel";
import { useCrops } from "../domain/crop";
import { useImagesGroupedById } from "../domain/image";
import { getThemeById } from "../domain/theme";

export function EditorPage() {
  const params = useParams();
  const [search] = useSearchParams();

  const themeId = Number(params.themeId);
  const cropId = Number(params.cropId);

  const crops = useCrops(themeId);
  const crop = useMemo(() => {
    return crops.find((crop) => crop.id === cropId);
  }, [crops, cropId]);

  const imageIds = useMemo(() => crops.map((crop) => crop.imageId), [crops]);
  const imagesById = useImagesGroupedById(imageIds);

  const theme = useLiveQuery(() => getThemeById(themeId), [themeId]);

  if (!theme) return null;

  const image = crop ? imagesById[crop.imageId] : null;

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
          <ImagesPanel themeId={theme.id} crops={crops} images={imagesById} />
        </aside>
        <div className="bg-checker relative flex items-center justify-center [grid-area:canvas]">
          <div className="bg-panel absolute top-2 right-2 flex gap-4 border p-2">
            <NavLink to="?mode=edit">Edit</NavLink>
            <NavLink to="?mode=preview">Preview</NavLink>
          </div>

          {search.get("mode") === "preview" ? (
            <PreviewCanvas theme={theme} crops={crops} images={imagesById} />
          ) : crop && image ? (
            <Canvas key={crop.id} crop={crop} image={image} />
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
