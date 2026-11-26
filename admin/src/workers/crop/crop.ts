import Worker from "./crop.worker?worker";

const worker = new Worker();

export function generateThemeCrops(themeId: number) {
  worker.postMessage({
    type: "generate-theme-crops/request",
    themeId,
  });
}

export function generateCrop(cropId: number, imageData?: ImageData) {
  worker.postMessage({
    type: "generate-crop-from-image",
    cropId,
    imageData,
  });
}
