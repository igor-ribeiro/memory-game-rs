import * as z from "zod";

export const generateSpriteRequest = z.object({
  type: z.literal("generate-sprite/request"),
  themeId: z.number(),
});

export const generateSpriteResponse = z.object({
  type: z.literal("generate-sprite/response"),
  blob: z.instanceof(Blob),
  filename: z.string(),
});

export type GenerateSpriteRequest = z.infer<typeof generateSpriteRequest>;
export type GenerateSpriteResponse = z.infer<typeof generateSpriteResponse>;
