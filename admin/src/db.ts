import Dexie, { EntityTable } from "dexie";

export type ThemeEntity = {
  id: number;
  name: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
};

export type ImageEntity = {
  id: number;
  name: string;
  themeId: number;
  order: number;
  width: number;
  height: number;
  scale: number;
  offsetX: number;
  offsetY: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  blob: Blob;
};

export type SpriteEntity = {
  id: number;
  themeId: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  blob: Blob;
};

const db = new Dexie("cardsprite") as Dexie & {
  themes: EntityTable<ThemeEntity, "id">;
  images: EntityTable<ImageEntity, "id">;
  sprites: EntityTable<SpriteEntity, "id">;
};

db.version(3).stores({
  themes: "++id, &name, &slug, updatedAt",
  images: "++id, themeId, order",
  sprites: "++id, themeId",
});

export { db };
