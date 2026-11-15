import { listenEvent } from "@ribeirolabs/events";
import { useEffect, useState } from "react";
import { SPRITE_SIZE } from "../../config";
import { ImageEntity, ThemeEntity } from "../../db";
import { invariant } from "../../utils";

declare global {
  interface CustomEvents {
    export: {};
  }
}

export function PreviewCanvas({
  theme,
  images,
}: {
  theme: ThemeEntity;
  images: ImageEntity[];
}) {
  const [image, setImage] = useState("");
  useEffect(() => {
    const c = new OffscreenCanvas(SPRITE_SIZE * images.length, SPRITE_SIZE);
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
      a.download = `${theme.slug}.jpg`;
      a.click();
    });

    async function run() {
      invariant(ctx, "failed to get offscree canvas ctx");
      ctx.clearRect(0, 0, c.width, c.height);
      for (let i = 0; i < images.length; i++) {
        const image = images[i];
        const bitmap = await createImageBitmap(image.blob);

        const w = SPRITE_SIZE / image.scale;

        ctx.drawImage(
          bitmap,
          image.width / 2 + image.offsetX - w / 2,
          image.height / 2 + image.offsetY - w / 2,
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

    if (images.length) {
      run();
    }
  }, [images]);

  return <div className="bg-bg h-50">{image && <img src={image} />}</div>;
}
