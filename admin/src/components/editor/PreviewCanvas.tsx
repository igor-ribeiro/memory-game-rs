import { useSuspendingLiveQuery } from "dexie-react-hooks";
import { useCallback, useMemo } from "react";
import slug from "slug";
import { db, ThemeEntity } from "../../db";
import { Button } from "../Button";

declare global {
  interface CustomEvents {
    export: {};
  }
}

export function PreviewCanvas({ theme }: { theme: ThemeEntity }) {
  const sprite = useSuspendingLiveQuery(
    () => db.sprites.get(theme.id),
    ["sprite", theme.id],
  );
  const exportName = `theme-${slug(theme.name)}.jpg`;

  const image = useMemo(() => {
    if (sprite) {
      return window.URL.createObjectURL(sprite.blob);
    }
    return "";
  }, [sprite]);

  const onExport = useCallback(async () => {
    const a = document.createElement("a");
    a.href = image;
    a.download = exportName;
    a.click();
  }, [exportName, image]);

  return (
    <div className="bg-panel overflow-x-[overlay] flex h-40 w-full flex-col overflow-y-hidden border-t">
      <header className="text-muted flex h-14 w-full items-center gap-6 px-2 text-sm lowercase">
        <span>{exportName}</span>
        {sprite && (
          <span>
            {sprite.width}x{sprite.height}
          </span>
        )}
        <Button
          variant="primary"
          className="ml-auto"
          onClick={onExport}
          disabled={sprite == null}
        >
          Exportar
        </Button>
      </header>
      <div>
        {image && <img src={image} className="h-auto max-h-27 w-auto" />}
      </div>
    </div>
  );
}
