import { memo, Suspense, useMemo } from "react";
import { NavLink, useParams, useSearchParams } from "react-router";
import { AppLogo } from "../components/AppLogo";
import { Canvas, CanvasEmptyState } from "../components/editor/EditorCanvas";
import { EditorHeader } from "../components/editor/EditorHeader";
import { ExportPanel } from "../components/editor/ExportPanel";
import {
  ImagesPanel,
  ImagesPanelPlaceholder,
} from "../components/editor/ImagesPanel";
import { PreviewCanvas } from "../components/editor/PreviewCanvas";
import { Header } from "../components/Header";
import { CropEntity, ThemeEntity } from "../db";
import { useCrops } from "../domain/crop";
import { useImagesGroupedById } from "../domain/image";
import { useThemeRequired } from "../state/theme";

export function EditorPage() {
  return (
    <Suspense fallback={<EditorPlaceholder />}>
      <Editor />
    </Suspense>
  );
}

export function Editor() {
  const { themeId } = useParams();

  const theme = useThemeRequired(Number(themeId));

  return (
    <>
      <EditorHeader theme={theme} />
      <Suspense fallback={<EditorMainPlaceholder />}>
        <EditorCanvas theme={theme} />
      </Suspense>
    </>
  );
}

function EditorCanvas({ theme }: { theme: ThemeEntity }) {
  const [search] = useSearchParams();
  const mode = search.get("mode") ?? "edit";

  const crops = useCrops(theme.id);

  const { cropId } = useParams();
  const crop = useMemo(() => {
    return crops.find((crop) => crop.id === Number(cropId));
  }, [crops, cropId]);

  const imageIds = useMemo(() => {
    return crops.map((crop) => crop.imageId);
  }, [crops]);
  const imagesById = useImagesGroupedById(imageIds);

  const image = crop ? imagesById[crop.imageId] : null;

  return (
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
          <CanvasEmptyState theme={theme} />
        )}
      </div>
      <aside>
        {mode === "preview" ? (
          <ExportPanel />
        ) : (
          <ImagesPanel themeId={theme.id} crops={crops} images={imagesById} />
        )}
      </aside>
    </main>
  );
}

function EditorPlaceholder() {
  return (
    <>
      <Header>
        <AppLogo />
      </Header>
      <EditorMainPlaceholder />
    </>
  );
}

function EditorMainPlaceholder() {
  return (
    <main className="grid flex-1 grid-cols-[minmax(720px,1fr)_minmax(200px,350px)] overflow-hidden">
      <div className="bg-checker relative flex items-center justify-center">
        <CanvasEmptyState />
      </div>
      <aside>
        <ImagesPanelPlaceholder />
      </aside>
    </main>
  );
}
