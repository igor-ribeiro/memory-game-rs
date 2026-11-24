import { useCallback, useMemo, useState } from "react";

export function pluralize(
  count: number,
  word: string,
  plural?: string,
): string {
  return `${count} ${count > 1 ? (plural ?? word + "s") : word}`;
}

export function invariant<T>(
  value: T | null | undefined,
  error: string,
): asserts value is Required<T> {
  if (value == null) throw new Error(error);
}

export async function imageDataToBlob(imageData: ImageData) {
  const canvas = new OffscreenCanvas(imageData.width, imageData.height);
  const ctx = canvas.getContext("2d");
  invariant(ctx, "[imageDataToBlob] unable to get 2d context");
  ctx.putImageData(imageData, 0, 0);

  return canvas.convertToBlob({
    type: "image/jpeg",
    quality: 1,
  });
}

type WorkerConstructor = {
  new (options?: { name?: string }): Worker;
};

export function useWorker<S extends any, L extends any>(
  InitWorker: WorkerConstructor,
) {
  const [worker] = useState(() => new InitWorker());

  const send = useCallback(
    (message: S) => {
      worker.postMessage(message);
    },
    [worker],
  );

  const listen = useCallback(
    (listener: (this: Worker, ev: MessageEvent<L>) => any) => {
      worker.addEventListener("message", listener);
      return () => worker.removeEventListener("message", listener);
    },
    [worker],
  );

  const onError = useCallback(
    (listener: (this: Worker, ev: ErrorEvent) => any) => {
      worker.addEventListener("error", listener);
      return () => worker.removeEventListener("error", listener);
    },
    [worker],
  );

  return useMemo(
    () => ({
      terminate: worker.terminate,
      onError,
      send,
      listen,
    }),
    [worker, send, listen, onError],
  );
}
