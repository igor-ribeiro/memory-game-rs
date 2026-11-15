import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { SPRITE_SIZE } from "../../config";
import { CropEntity, db, ImageEntity, ThemeEntity } from "../../db";
import DropIcon from "../../icons/drop.svg?react";
import { Button } from "../Button";
import { UploadFiles } from "./UploadFiles";

export function Canvas({
  crop,
  image,
}: {
  crop: CropEntity;
  image: ImageEntity;
}) {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>();
  const ctxRef = useRef<CanvasRenderingContext2D>();
  const [scale, setScale] = useState(crop.scale);
  const [offsetX, setOffsetX] = useState(crop.offsetX);
  const [offsetY, setOffsetY] = useState(crop.offsetY);
  const timeoutId = useRef(-1);

  useEffect(() => {
    if (timeoutId) {
      clearTimeout(timeoutId.current);
    }

    timeoutId.current = setTimeout(() => {
      db.crops.update(crop.id, {
        scale,
        offsetX,
        offsetY,
      });
    }, 500);
  }, [crop.id, scale, offsetX, offsetY]);

  useEffect(() => {
    const ctx = ctxRef.current!;
    const c = canvasRef.current!;

    ctx.clearRect(0, 0, c.width, c.height);
    createImageBitmap(image.blob).then((img) => {
      const w = image.width * scale;
      const h = image.height * scale;
      const x = c.width / 2 - (image.width / 2 + offsetX) * scale;
      const y = c.height / 2 - (image.height / 2 + offsetY) * scale;
      ctx.drawImage(img, x, y, w, h);
    });
  }, [image.blob, image.width, image.height, scale, offsetX, offsetY]);

  return (
    <>
      <canvas
        key={crop.id}
        className="bg-checker-alt relative border"
        width={SPRITE_SIZE * 2}
        height={SPRITE_SIZE * 2}
        ref={(el) => {
          if (!el) return;
          canvasRef.current = el;
          const ctx = el.getContext("2d");
          if (!ctx) throw new Error("unable to get canvas context");
          ctxRef.current = ctx;
        }}
      ></canvas>
      <div
        style={{
          width: `${SPRITE_SIZE}px`,
          height: `${SPRITE_SIZE}px`,
        }}
        className="border-accent absolute top-1/2 left-1/2 z-10 aspect-square -translate-x-1/2 -translate-y-1/2 border"
      />

      <div className="bg-panel absolute bottom-0 flex h-20 w-full gap-4 p-4">
        <label className="inline-flex flex-1 items-center gap-2">
          <span>Tamanho:</span>
          <input
            type="range"
            className="w-full"
            min={0}
            max={1.5}
            step={0.01}
            value={scale}
            onChange={(e) => setScale(e.target.valueAsNumber)}
          />
        </label>
        <label className="inline-flex flex-1 items-center gap-2">
          <span>X:</span>
          <input
            type="range"
            className="w-full"
            min={-image.width / 2}
            max={image.width / 2}
            step={1}
            value={offsetX}
            onChange={(e) => setOffsetX(e.target.valueAsNumber)}
          />
        </label>
        <label className="inline-flex flex-1 items-center gap-2">
          <span>Y:</span>
          <input
            type="range"
            className="w-full"
            min={-image.height / 2}
            max={image.height / 2}
            step={1}
            value={offsetY}
            onChange={(e) => setOffsetY(e.target.valueAsNumber)}
          />
        </label>
        <Button
          onClick={() =>
            db.crops
              .add({
                themeId: crop.themeId,
                imageId: crop.imageId,
                offsetY: crop.offsetY,
                offsetX: crop.offsetX,
                scale: crop.scale,
                createdAt: new Date(),
                updatedAt: new Date(),
                order: crop.order + 1,
              })
              .then((id) => {
                navigate(`/${crop.themeId}/${id}`);
              })
          }
        >
          Duplicate
        </Button>
      </div>
    </>
  );
}

export function CanvasPlaceholder({ theme }: { theme: ThemeEntity }) {
  return (
    <div className="border-accent bg-bg absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center gap-4 border border-dashed px-12 py-16 text-center">
      <DropIcon />
      <h3 className="text-xl font-bold">Solte as imagens aqui</h3>
      <span className="text-muted text-sm">
        png · jpg · webp — uma imagem por carta
      </span>
      <UploadFiles themeId={theme.id}>
        <Button variant="primary">Escolher arquivos</Button>
      </UploadFiles>
      <span className="text-muted hidden text-sm">
        ou cole da área de transferência · ctrl/⌘ + v
      </span>
    </div>
  );
}
