import { Suspense, useEffect, useMemo } from "react";
import { Navigate, useParams } from "react-router";
import { AppLogo } from "../components/AppLogo";
import { Canvas, CanvasEmptyState } from "../components/editor/EditorCanvas";
import { EditorHeader } from "../components/editor/EditorHeader";
import {
  ImagesPanel,
  ImagesPanelPlaceholder,
} from "../components/editor/ImagesPanel";
import { PreviewCanvas } from "../components/editor/PreviewCanvas";
import { Header } from "../components/Header";
import { ThemeEntity } from "../db";
import { useCropsWithImage } from "../domain/crop";
import { generateSpriteDebounced } from "../domain/sprite";
import { useThemeById } from "../domain/theme";

export function EditorPage() {
  const { themeId } = useParams();
  return (
    <Suspense fallback={<EditorPlaceholder />}>
      <Editor themeId={Number(themeId)} />
    </Suspense>
  );
}

export function Editor({ themeId }: { themeId: number }) {
  const theme = useThemeById(themeId);
  if (!theme) return <Navigate to="/" />;

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
  const crops = useCropsWithImage(theme.id);

  const { cropId } = useParams();
  const crop = useMemo(() => {
    return crops.find((crop) => crop.id === Number(cropId));
  }, [crops, cropId]);

  useEffect(() => {
    generateSpriteDebounced(theme.id, crops);
  }, [theme.id, crops]);

  return (
    <main className="grid flex-1 grid-cols-[minmax(720px,1fr)_minmax(200px,350px)] overflow-hidden">
      <div className="bg-checker relative flex flex-col items-center justify-between">
        {crop?.image ? (
          <Canvas key={crop.id} crop={crop} image={crop.image} />
        ) : (
          <CanvasEmptyState theme={theme} />
        )}

        <PreviewCanvas theme={theme} />
      </div>
      <aside className="border-l">
        <ImagesPanel themeId={theme.id} crops={crops} />
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
      <div className="bg-checker flex flex-col items-center justify-center">
        <CanvasEmptyState />
        <div className="bg-panel h-40 w-full border-t">&nbsp;</div>
      </div>
      <aside className="border-l">
        <ImagesPanelPlaceholder />
      </aside>
    </main>
  );
}
