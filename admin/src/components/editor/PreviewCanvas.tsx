import { listenEvent } from "@ribeirolabs/events";
import { useEffect, useState } from "react";
import slug from "slug";
import { SPRITE_SIZE } from "../../config";
import { ThemeEntity } from "../../db";
import { CropEntityWithImage } from "../../domain/crop";
import { invariant } from "../../utils";

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
  useEffect(() => {
    const c = new OffscreenCanvas(SPRITE_SIZE * crops.length, SPRITE_SIZE);
    const ctx = c.getContext("2d");

    listenEvent("export", async () => {
      console.log("export");

      const a = document.createElement("a");
      a.href = window.URL.createObjectURL(
        await c.convertToBlob({
          quality: 1,
          type: "type/jpg",
        }),
      );
      a.download = `${slug(theme.name)}.jpg`;
      a.click();
    });

    async function run() {
      invariant(ctx, "failed to get offscree canvas ctx");
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

      const blob = await c.convertToBlob();
      setImage(window.URL.createObjectURL(blob));
    }

    if (crops.length) {
      run();
    }
  }, [crops]);

  return <div className="bg-bg h-50">{image && <img src={image} />}</div>;
}
