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

db.version(2).stores({
  themes: "++id, &name, &slug, createdAt, updatedAt, deletedAt",
  images: "++id, name, themeId, createdAt, updatedAt, deletedAt",
  sprites: "++id, themeId, createdAt, updatedAt, deletedAt",
});

export { db };
