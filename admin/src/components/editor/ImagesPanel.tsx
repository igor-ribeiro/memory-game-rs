import { useMemo } from "react";
import { NavLink, useParams } from "react-router";
import { cn } from "tailwind-variants";
import { CropEntity, ImageEntity } from "../../db";
import { Button } from "../Button";
import { UploadFiles } from "./UploadFiles";

export function ImagesPanel({
  themeId,
  crops,
  images,
}: {
  themeId: number;
  crops: CropEntity[];
  images: Record<string, ImageEntity>;
}) {
  return (
    <div className="space-y-4 p-4">
      <header className="flex items-center justify-between">
        <div className="space-x-2">
          <span className="label">Imagens</span>
          <span className="label">{crops.length}</span>
        </div>
        <UploadFiles themeId={themeId}>
          <Button>+</Button>
        </UploadFiles>
      </header>
      <div className="grid grid-cols-3 gap-4">
        {crops.length === 0 || Object.keys(images).length === 0 ? (
          <ImagesPlaceholder />
        ) : (
          crops.map((crop) => (
            <ImageCard key={crop.id} crop={crop} image={images[crop.imageId]} />
          ))
        )}
      </div>
    </div>
  );
}

function ImageCard({ crop, image }: { crop: CropEntity; image: ImageEntity }) {
  const { themeId } = useParams();
  const url = useMemo(
    () => window.URL.createObjectURL(image.blob),
    [image.blob],
  );

  return (
    <NavLink
      to={`/${themeId}/${crop.id}`}
      className={({ isActive }) =>
        cn(
          "relative aspect-square w-full border bg-cover bg-center",
          isActive && "border-accent",
        )
      }
      style={{
        backgroundImage: `url(${url})`,
      }}
    >
      {({ isActive }) => (
        <span
          data-active={isActive}
          className="bg-bg data-[active=true]:bg-accent text-line-strong absolute h-fit w-fit px-2"
        >
          {String(crop.order + 1).padStart(2, "0")}
        </span>
      )}
    </NavLink>
  );
}

function ImagesPlaceholder() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="text-muted/50 aspect-square w-full border border-dashed p-1"
          style={{
            opacity: `${100 - i * 15}%`,
          }}
        >
          <span>{String(i + 1).padStart(2, "0")}</span>
        </div>
      ))}
    </>
  );
}
