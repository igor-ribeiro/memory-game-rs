import * as z from "zod";

export const generateThemeCropsRequest = z.object({
  type: z.literal("generate-theme-crops/request"),
  themeId: z.number(),
});

export const generateCropRequest = z.object({
  type: z.literal("generate-crop/request"),
  cropId: z.number(),
});

// export const generateCropResponse = z.object({
//   type: z.literal("generate-crop/response"),
//   blob: z.instanceof(Blob),
//   filename: z.string(),
// });

export type GenerateThemeCropsRequest = z.infer<typeof generateCropRequest>;
export type GenerateCropRequest = z.infer<typeof generateCropRequest>;
// export type GenerateCropResponse = z.infer<typeof generateCropResponse>;
