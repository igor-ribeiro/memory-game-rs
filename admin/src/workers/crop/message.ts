import * as z from "zod";

export const generateThemeCropsRequest = z.object({
  type: z.literal("generate-theme-crops/request"),
  themeId: z.number(),
});

export const generateCropRequest = z.object({
  type: z.literal("generate-crop/request"),
  cropId: z.number(),
});

export type GenerateThemeCropsRequest = z.infer<
  typeof generateThemeCropsRequest
>;
export type GenerateCropRequest = z.infer<typeof generateCropRequest>;
