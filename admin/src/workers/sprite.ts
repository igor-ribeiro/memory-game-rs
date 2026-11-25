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
      const cleanup: (() => any)[] = [];
      let timeout = 0;

      try {
        worker.send({ type: "generate-sprite/request", themeId });

        const data = await Promise.race([
          new Promise<GenerateSpriteResponse>((resolve) => {
            cleanup.push(
              worker.listen((e) => {
                if (e.data.type === "generate-sprite/response") {
                  resolve(generateSpriteResponse.parse(e.data));
                }
              }),
            );
          }),
          new Promise<GenerateSpriteResponse>((_, reject) => {
            timeout = setTimeout(() => reject("TIMEOUT"), 5000);

            cleanup.push(
              () => clearTimeout(timeout),
              worker.onError((e) => {
                reject(e.message);
              }),
            );
          }),
        ]);

        return data;
      } finally {
        cleanup.map((c) => c());
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
