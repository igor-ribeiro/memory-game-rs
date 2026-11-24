import {
  atom,
  PrimitiveAtom,
  useAtomValue,
  useSetAtom,
  WritableAtom,
} from "jotai";
import { useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { SPRITE_SIZE } from "../../config";
import { CropEntity, db, ImageEntity, ThemeEntity } from "../../db";
import DeleteIcon from "../../icons/delete.svg?react";
import DropIcon from "../../icons/drop.svg?react";
import { Button } from "../Button";
import { UploadFiles } from "./UploadFiles";

type CacheAtoms = {
  value: PrimitiveAtom<Controls> & { init: Controls };
  set: WritableAtom<null, [update: Partial<Controls>], void> & {
    init: null;
  };
};

type Key = string | number;

type Controls = Pick<CropEntity, "scale" | "offsetX" | "offsetY">;

const CACHE_CAPACITY = 5;
const cache: Map<string, CacheAtoms> = new Map();

function createControlsAtom(key: Key, controls?: Controls) {
  const cacheKey = String(key);

  if (cache.has(cacheKey)) {
    return cache.get(cacheKey)!;
  }

  const valueAtom = atom(
    controls ?? {
      scale: 0,
      offsetY: 0,
      offsetX: 0,
    },
  );

  const updateAtom = atom(null, (_get, set, update: Partial<Controls>) => {
    set(valueAtom, (controls) => ({
      ...controls,
      ...update,
    }));
  });
  const atoms: CacheAtoms = { value: valueAtom, set: updateAtom };
  const keys = Array.from(cache.keys());
  if (keys.length === CACHE_CAPACITY) {
    cache.delete(keys[0]);
  }
  cache.set(cacheKey, atoms);
  return atoms;
}

function useControls(key: Key, initial?: Controls) {
  const atoms = createControlsAtom(key, initial);
  return [useAtomValue(atoms.value), useSetAtom(atoms.set)] as const;
}

function useControlsValue(key: Key, initial?: Controls) {
  const atoms = createControlsAtom(key, initial);
  return useAtomValue(atoms.value);
}

export function Canvas({
  crop,
  image,
}: {
  crop: CropEntity;
  image: ImageEntity;
}) {
  const controls = useControlsValue(crop.id, {
    scale: crop.scale,
    offsetX: crop.offsetX,
    offsetY: crop.offsetY,
  });
  const canvasRef = useRef<HTMLCanvasElement | undefined>(undefined);
  const ctxRef = useRef<CanvasRenderingContext2D | undefined>(undefined);
  const timeoutId = useRef(-1);

  useEffect(() => {
    if (timeoutId) {
      clearTimeout(timeoutId.current);
    }

    timeoutId.current = setTimeout(() => {
      db.crops.update(crop.id, controls);
    }, 500);
  }, [crop.id, controls]);

  useEffect(() => {
    const ctx = ctxRef.current!;
    const c = canvasRef.current!;

    ctx.clearRect(0, 0, c.width, c.height);
    createImageBitmap(image.blob).then((img) => {
      const w = image.width * controls.scale;
      const h = image.height * controls.scale;
      const x =
        c.width / 2 - (image.width / 2 + controls.offsetX) * controls.scale;
      const y =
        c.height / 2 - (image.height / 2 + controls.offsetY) * controls.scale;
      ctx.drawImage(img, x, y, w, h);
    });
  }, [image.blob, image.width, image.height, controls]);

  return (
    <div className="relative flex w-full flex-1 items-center justify-center">
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

      <CanvasControls crop={crop} image={image} />
    </div>
  );
}

function CanvasControls({
  crop,
  image,
}: {
  crop: CropEntity;
  image: ImageEntity;
}) {
  const [controls, setControls] = useControls(crop.id);
  const navigate = useNavigate();

  const onDelete = useCallback(async () => {
    db.transaction("rw", db.crops, db.images, async () => {
      await db.crops.delete(crop.id);

      const cropsWithSameImage = await db.crops
        .where("imageId")
        .equals(image.id)
        .count();
      if (cropsWithSameImage === 0) {
        await db.images.delete(image.id);
      }

      const all = db.crops.where("themeId").equals(crop.themeId);

      let order = 0;
      all.modify((c) => {
        c.order = order++;
      });

      return all.first();
    }).then((next) => {
      if (next) {
        navigate(`/${crop.themeId}/${next.id}`);
      } else {
        navigate(`/${crop.themeId}`);
      }
    });
  }, [crop.id, crop.themeId, image.id]);

  const onDuplicate = useCallback(async () => {
    const count = await db.crops.where("themeId").equals(crop.themeId).count();

    await db.crops
      .add({
        themeId: crop.themeId,
        imageId: crop.imageId,
        offsetY: crop.offsetY,
        offsetX: crop.offsetX,
        scale: crop.scale,
        createdAt: new Date(),
        updatedAt: new Date(),
        order: count,
      })
      .then((id) => {
        navigate(`/${crop.themeId}/${id}`);
      });
  }, [crop.themeId]);

  return (
    <div className="bg-panel absolute top-0 flex h-18 w-full gap-4 border-b p-4">
      <label className="inline-flex flex-1 items-center gap-2">
        <span>Tamanho:</span>
        <input
          type="range"
          className="w-full"
          min={0}
          max={1.5}
          step={0.01}
          value={controls.scale}
          onChange={(e) => setControls({ scale: e.target.valueAsNumber })}
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
          value={controls.offsetX}
          onChange={(e) => setControls({ offsetX: e.target.valueAsNumber })}
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
          value={controls.offsetY}
          onChange={(e) => setControls({ offsetY: e.target.valueAsNumber })}
        />
      </label>
      <Button onClick={onDuplicate}>Duplicate</Button>
      <Button icon onClick={onDelete}>
        <DeleteIcon />
      </Button>
    </div>
  );
}

export function CanvasEmptyState({ theme }: { theme?: ThemeEntity }) {
  return (
    <div className="relative flex w-full flex-1 items-center justify-center">
      <div
        data-disabled={theme == null}
        className="border-accent bg-bg absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center gap-4 border border-dashed px-12 py-16 text-center data-[disabled=true]:border-transparent"
      >
        <DropIcon />
        <h3 className="text-xl font-bold">Solte as imagens aqui</h3>
        <span className="text-muted text-sm">
          png · jpg · webp — uma imagem por carta
        </span>
        {theme ? (
          <UploadFiles themeId={theme.id}>
            <Button variant="primary">Escolher arquivos</Button>
          </UploadFiles>
        ) : (
          <Button disabled>Escolher arquivos</Button>
        )}
        <span className="text-muted hidden text-sm">
          ou cole da área de transferência · ctrl/⌘ + v
        </span>
      </div>
    </div>
  );
}
