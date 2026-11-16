import { useMemo } from "react";
import { NavLink, useParams, useSearchParams } from "react-router";
import { Canvas, CanvasPlaceholder } from "../components/editor/EditorCanvas";
import { EditorHeader } from "../components/editor/EditorHeader";
import { ExportPanel } from "../components/editor/ExportPanel";
import { ImagesPanel } from "../components/editor/ImagesPanel";
import { PreviewCanvas } from "../components/editor/PreviewCanvas";
import { useCrops } from "../domain/crop";
import { useImagesGroupedById } from "../domain/image";
import { useTheme, useThemeRequired } from "../state/theme";

export function EditorPage() {
  const params = useParams();
  const [search] = useSearchParams();
  const mode = search.get("mode") ?? "edit";

  const themeId = Number(params.themeId);
  const cropId = Number(params.cropId);

  const theme = useTheme(themeId);

  const crops = useCrops(themeId);
  const crop = useMemo(() => {
    return crops.find((crop) => crop.id === cropId);
  }, [crops, cropId]);

  const imageIds = useMemo(() => crops.map((crop) => crop.imageId), [crops]);
  const imagesById = useImagesGroupedById(imageIds);

  const image = crop ? imagesById[crop.imageId] : null;

  if (!theme) return null;

  return (
    <>
      <EditorHeader theme={theme} />
      <main className="grid flex-1 grid-cols-[minmax(720px,1fr)_minmax(200px,350px)] overflow-hidden">
        <div className="bg-checker relative flex items-center justify-center">
          <div className="bg-panel absolute top-2 right-2 flex gap-4 border p-2">
            <NavLink to="?mode=edit">Edit</NavLink>
            <NavLink to="?mode=preview">Preview</NavLink>
          </div>

          {mode === "preview" ? (
            <PreviewCanvas theme={theme} crops={crops} images={imagesById} />
          ) : crop && image ? (
            <Canvas key={crop.id} crop={crop} image={image} />
          ) : (
            <CanvasPlaceholder theme={theme} />
          )}
        </div>
        <aside className="border-r">
          {mode === "preview" ? (
            <ExportPanel />
          ) : (
            <ImagesPanel themeId={theme.id} crops={crops} images={imagesById} />
          )}
        </aside>
      </main>
    </>
  );
}
