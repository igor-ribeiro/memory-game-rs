import { useCallback, useMemo, useState } from "react";
import { useWorker } from "../utils";
import {
  GenerateSpriteRequest,
  generateSpriteResponse,
  GenerateSpriteResponse,
} from "./message";
import SpriteWorker from "./sprite.worker?worker";

export function useSpriteWorker() {
  const worker = useWorker<GenerateSpriteRequest, GenerateSpriteResponse>(
    SpriteWorker,
  );
  const [loading, setLoading] = useState(false);

  const generate = useCallback(
    async (themeId: number) => {
      setLoading(true);

      try {
        worker.send({ type: "generate-sprite/request", themeId });

        const data = await Promise.race([
          new Promise<GenerateSpriteResponse>((resolve) => {
            const unlisten = worker.listen((e) => {
              if (e.data.type === "generate-sprite/response") {
                resolve(generateSpriteResponse.parse(e.data));
                unlisten();
                return;
              }
            });
          }),
          new Promise<GenerateSpriteResponse>((_, reject) => {
            let timeout = setTimeout(() => reject("TIMEOUT"), 3000);

            worker.onError((e) => {
              clearTimeout(timeout);
              reject(e.message);
            });
          }),
        ]);

        return data;
      } finally {
        setLoading(false);
      }
    },
    [worker],
  );

  return useMemo(
    () => ({
      loading,
      generate,
    }),
    [loading, generate],
  );
}
