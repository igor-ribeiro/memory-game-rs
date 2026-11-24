import {
  ChangeEvent,
  ReactElement,
  cloneElement,
  useCallback,
  useRef,
} from "react";
import { useNavigate } from "react-router";
import { CropEntity, ImageEntity, db } from "../../db";
import { toast } from "../ui/Toast";

const ACCEPTED = ["image/png", "image/jpeg", "image/webp"];

export function UploadFiles({
  themeId,
  children,
}: {
  themeId: number;
  children: ReactElement<{ onClick: Function }>;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  async function onSelectFiles(e: ChangeEvent<HTMLInputElement>) {
    let files = e.target.files;
    if (files == null || files.length === 0) {
      toast.add({
        type: "error",
        title: "Nenhuma imagem selecionada",
      });
      return;
    }

    const images: File[] = [];

    for (const file of files) {
      if (ACCEPTED.includes(file.type)) {
        images.push(file);
      }
    }

    const imagesToCreate: Omit<ImageEntity, "id">[] = [];

    for (const image of images) {
      const bitmap = await createImageBitmap(image);
      imagesToCreate.push({
        name: image.name,
        themeId: themeId,
        height: bitmap.height,
        width: bitmap.width,
        blob: image,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      bitmap.close();
    }

    const [ids, order] = await Promise.all([
      db.images.bulkAdd(imagesToCreate, { allKeys: true }),
      db.crops.where("themeId").equals(themeId).count(),
    ]);

    const cropsToCreate: Omit<CropEntity, "id">[] = [];

    for (let i = 0; i < ids.length; i++) {
      const imageId = ids[i];
      cropsToCreate.push({
        themeId: themeId,
        imageId,
        scale: 1,
        offsetX: 0,
        offsetY: 0,
        order: order + i,
        createdAt: new Date(),
        updatedAt: new Date(),
        blob: new Blob([]),
      });
    }

    const cropId = await db.crops.bulkAdd(cropsToCreate);
    navigate(`/${themeId}/${cropId}`);
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
