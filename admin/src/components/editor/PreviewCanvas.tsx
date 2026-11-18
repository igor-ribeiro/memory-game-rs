import { useCallback, useEffect, useState } from "react";
import slug from "slug";
import { SPRITE_SIZE } from "../../config";
import { ThemeEntity } from "../../db";
import { CropEntityWithImage } from "../../domain/crop";
import { invariant } from "../../utils";
import { Button } from "../Button";

declare global {
  interface CustomEvents {
    export: {};
  }
}

export function PreviewCanvas({
  theme,
  crops,
}: {
  theme: ThemeEntity;
  crops: CropEntityWithImage[];
}) {
  const [image, setImage] = useState("");
  const exportName = `theme-${slug(theme.name)}.jpg`;

  const onExport = useCallback(async () => {
    const a = document.createElement("a");
    a.href = image;
    a.download = exportName;
    a.click();
  }, [exportName, image]);

  useEffect(() => {
    const c = new OffscreenCanvas(SPRITE_SIZE * crops.length, SPRITE_SIZE);
    const ctx = c.getContext("2d");

    async function run() {
      invariant(ctx, "failed to get offscreen canvas ctx");
      ctx.clearRect(0, 0, c.width, c.height);
      for (let i = 0; i < crops.length; i++) {
        const crop = crops[i];
        const image = crop.image;
        const bitmap = await createImageBitmap(image.blob);

        const w = SPRITE_SIZE / crop.scale;

        ctx.drawImage(
          bitmap,
          image.width / 2 + crop.offsetX - w / 2,
          image.height / 2 + crop.offsetY - w / 2,
          w,
          w,
          SPRITE_SIZE * i,
          0,
          SPRITE_SIZE,
          SPRITE_SIZE,
        );
        bitmap.close();
      }

      const blob = await c.convertToBlob({
        type: "image/jpeg",
        quality: 1,
      });

      setImage(window.URL.createObjectURL(blob));
    }

    if (crops.length) {
      run();
    }
  }, [crops]);

  return (
    <div className="bg-panel overflow-x-[overlay] flex h-50 w-full flex-col overflow-y-hidden border-t">
      <header className="text-muted flex h-14 w-full items-center gap-6 px-2 text-sm lowercase">
        <span>{exportName}</span>
        <span>{crops.length} imagens</span>
        <span>
          {SPRITE_SIZE * crops.length}x{SPRITE_SIZE}
        </span>
        <Button variant="primary" className="ml-auto" onClick={onExport}>
          Exportar
        </Button>
      </header>
      <div>{image && <img src={image} className="h-36" />}</div>
    </div>
  );
}
