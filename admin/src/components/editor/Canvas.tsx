import { Button } from "../Button";
import DropIcon from "../../icons/drop.svg?react";
import { db, ImageEntity, ThemeEntity } from "../../db";
import { ChangeEvent, useCallback, useEffect, useRef } from "react";
import { toast } from "../ui/Toast";

type ThemeImageEdit = {
  width: number;
  height: number;
  x: number;
  y: number;
};

type State = {
  edits: Record<string, ThemeImageEdit>;
};

const ACCEPTED = ["image/png", "image/jpeg", "image/webp"];

export function Canvas({ image }: { image: ImageEntity }) {
  const canvasRef = useRef<HTMLCanvasElement>();
  const ctxRef = useRef<CanvasRenderingContext2D>();

  useEffect(() => {
    const ctx = ctxRef.current!;
    const c = canvasRef.current!;

    ctx.clearRect(0, 0, c.width, c.height);
    createImageBitmap(image.blob).then((img) => {
      ctx.drawImage(img, 0, 0);
    });
  }, [image]);

  return (
    <canvas
      key={image.id}
      width={image.width}
      height={image.height}
      ref={(el) => {
        if (!el) return;
        canvasRef.current = el;
        const ctx = el.getContext("2d");
        if (!ctx) throw new Error("unable to get canvas context");
        ctxRef.current = ctx;
      }}
    ></canvas>
  );
}

export function CanvasPlaceholder({ theme }: { theme: ThemeEntity }) {
  const inputRef = useRef<HTMLInputElement>(null);

  async function onSelectFiles(e: ChangeEvent<HTMLInputElement>) {
    let files = e.target.files;
    if (files == null || files.length === 0) {
      toast.add({
        type: "error",
        description: "Nenhuma imagem selecionada",
      });
      return;
    }

    const toCreate: Omit<ImageEntity, "id">[] = [];
    const images: File[] = [];

    for (const file of files) {
      if (ACCEPTED.includes(file.type)) {
        images.push(file);
      }
    }

    const order = await db.images.where("themeId").equals(theme.id).count();

    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      const bitmap = await createImageBitmap(image);
      toCreate.push({
        name: image.name,
        themeId: theme.id,
        height: bitmap.height,
        width: bitmap.width,
        offsetX: 0,
        offsetY: 0,
        blob: image,
        order: order + i,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      bitmap.close();
    }

    await db.images.bulkAdd(toCreate);
  }

  const onOpenFiles = useCallback(() => {
    inputRef.current?.click();
  }, []);

  return (
    <div className="border-accent bg-bg absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center gap-4 border border-dashed px-12 py-16 text-center">
      <DropIcon />
      <h3 className="text-xl font-bold">Solte as imagens aqui</h3>
      <span className="text-muted text-sm">
        png · jpg · webp — uma imagem por carta
      </span>
      <input
        type="file"
        className="hidden"
        accept={ACCEPTED.join(",")}
        ref={inputRef}
        onChange={onSelectFiles}
      />
      <Button variant="primary" onClick={onOpenFiles}>
        Escolher arquivos
      </Button>
      <span className="text-muted hidden text-sm">
        ou cole da área de transferência · ctrl/⌘ + v
      </span>
    </div>
  );
}
