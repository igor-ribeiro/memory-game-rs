import {
  ChangeEvent,
  ReactElement,
  cloneElement,
  useCallback,
  useRef,
} from "react";
import { SPRITE_SIZE } from "../../config";
import { ImageEntity, db } from "../../db";
import { toast } from "../ui/Toast";

const ACCEPTED = ["image/png", "image/jpeg", "image/webp"];

export function UploadImages({
  themeId,
  children,
}: {
  themeId: number;
  children: ReactElement;
}) {
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

    const order = await db.images.where("themeId").equals(themeId).count();

    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      const bitmap = await createImageBitmap(image);
      toCreate.push({
        name: image.name,
        themeId: themeId,
        height: bitmap.height,
        width: bitmap.width,
        scale: SPRITE_SIZE / Math.max(bitmap.width, bitmap.height),
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
    <>
      <input
        type="file"
        className="hidden"
        accept={ACCEPTED.join(",")}
        ref={inputRef}
        onChange={onSelectFiles}
      />
      {cloneElement(children, {
        onClick: onOpenFiles,
      })}
    </>
  );
}
