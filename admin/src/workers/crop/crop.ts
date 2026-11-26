import Worker from "./crop.worker?worker";

const worker = new Worker();

export function generateThemeCrops(themeId: number) {
  worker.postMessage({
    type: "generate-theme-crops/request",
    themeId,
  });
}
