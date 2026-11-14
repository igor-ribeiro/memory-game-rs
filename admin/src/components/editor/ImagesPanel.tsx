import { useMemo } from "react";
import { ImageEntity } from "../../db";
import { Button } from "../Button";
import { NavLink, useParams } from "react-router";
import { cn } from "tailwind-variants";
import { UploadImages } from "./UploadImages";

export function ImagesPanel({
  themeId,
  images,
}: {
  themeId: number;
  images: ImageEntity[];
}) {
  return (
    <div className="space-y-4 p-4">
      <header className="flex items-center justify-between">
        <div className="space-x-2">
          <span className="label">Imagens</span>
          <span className="label">{images.length}</span>
        </div>
        <UploadImages themeId={themeId}>
          <Button>+</Button>
        </UploadImages>
      </header>
      <div className="grid grid-cols-3 gap-4">
        {images.length === 0 ? (
          <ImagesPlaceholder />
        ) : (
          images.map((image) => <ImageCard key={image.id} image={image} />)
        )}
      </div>
    </div>
  );
}

function ImageCard({ image }: { image: ImageEntity }) {
  const { slug } = useParams();
  const url = useMemo(
    () => window.URL.createObjectURL(image.blob),
    [image.blob],
  );

  return (
    <NavLink
      to={`/${slug}/${image.id}`}
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
          {String(image.order + 1).padStart(2, "0")}
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
