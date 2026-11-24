import slug from "slug";
import { SPRITE_SIZE } from "../config";
import { db } from "../db";
import { invariant } from "../utils";
import { generateSpriteRequest, generateSpriteResponse } from "./message";

self.addEventListener("message", async (e) => {
  const data = generateSpriteRequest.parse(e.data);

  if (data.type === "generate-sprite/request") {
    const [theme, crops] = await Promise.all([
      db.themes.get(data.themeId),
      db.crops
        .where("themeId")
        .equals(data.themeId)
        .filter((c) => c.blob.size > 0)
        .toArray(),
    ]);

    invariant(theme, "theme not found");

    const c = new OffscreenCanvas(SPRITE_SIZE * crops.length, SPRITE_SIZE);
    const ctx = c.getContext("2d");
    invariant(ctx, "unable to get 2d context");
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, c.width, c.height);
    for (let i = 0; i < crops.length; i++) {
      const crop = crops[i];
      const bitmap = await createImageBitmap(crop.blob);

      ctx.drawImage(
        bitmap,
        0,
        0,
        bitmap.width,
        bitmap.height,
        SPRITE_SIZE * i,
        0,
        SPRITE_SIZE,
        SPRITE_SIZE,
      );
    }

    const blob = await c.convertToBlob({
      quality: 1,
      type: "image/jpeg",
    });

    self.postMessage(
      generateSpriteResponse.parse({
        type: "generate-sprite/response",
        blob,
        filename: `theme-${slug(theme.name)}.jpeg`,
      }),
    );
  }
});

self.addEventListener("unhandledrejection", (e) => {
  setTimeout(() => {
    throw e.reason?.message ?? e.reason;
  });
});
