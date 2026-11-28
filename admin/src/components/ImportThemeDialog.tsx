import {
  ChangeEvent,
  Fragment,
  ReactElement,
  SubmitEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router";
import { cn } from "tailwind-variants";
import { SPRITE_SIZE } from "../config";
import { importTheme } from "../domain/import";
import AIIcon from "../icons/ai.svg?react";
import UploadIcon from "../icons/upload.svg?react";
import { invariant } from "../utils";
import Worker from "./../workers/ai/theme-name-suggestion.worker?worker";
import { Button } from "./Button";
import { InputImage } from "./InputImage";
import {
  createDialogHandle,
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "./ui/Dialog";
import { toast } from "./ui/Toast";
import { LoaderIcon } from "../icons/Loader";

const handle = createDialogHandle();

type Suggestion = {
  id: number;
  value: string;
};

export function ImportThemeDialog({ children }: { children: ReactElement }) {
  const [file, setFile] = useState<File | null>(null);
  const [images, setImages] = useState(0);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const suggestions = useAISuggestions();

  const onSelectImage = useCallback(
    async (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      invariant(file, "missing file");
      const image = await createImageBitmap(file);
      if (image.height > SPRITE_SIZE) {
        toast.add({
          type: "error",
          title: "Invalid sprite",
          description: `it's height must be ${SPRITE_SIZE}px`,
        });
        return;
      }
      setLoading(true);
      setName("");
      setFile(null);
      setTimeout(() => {
        setLoading(false);
        setImages(image.width / SPRITE_SIZE);
        setFile(file);
        image.close();
      }, 1500);

      suggestions.requestSuggestions(file);
      nameRef.current?.focus();
    },
    [suggestions.requestSuggestions],
  );

  const imageUrl = useMemo(
    () => (file ? window.URL.createObjectURL(file) : null),
    [file],
  );

  const onImport = useCallback(
    async (e: SubmitEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!file) {
        toast.add({
          type: "error",
          title: "Nenhum arquivo selecionado",
        });
        return;
      }

      try {
        const themeId = await importTheme(name, file);
        handle.close();
        navigate(`/${themeId}`);
      } catch (e) {
        console.error("[import-theme]", e);
        toast.add({
          type: "error",
          title: "Não foi possível importar o tema",
        });
      }
    },
    [name, file],
  );

  return (
    <Dialog handle={handle}>
      <DialogTrigger handle={handle} render={children} />
      <DialogContent>
        <form className="grid gap-6" onSubmit={onImport}>
          <DialogTitle>Importar tema</DialogTitle>
          <p className="text-muted">
            Crie um tema a partir de um sprite existente. Cada célula de{" "}
            {SPRITE_SIZE}&times;{SPRITE_SIZE} vira uma imagem.
          </p>

          {file ? (
            <div className="bg-bg flex h-24 flex-col gap-2 overflow-hidden border p-2">
              <div className="flex items-start gap-2">
                <span className="truncate text-sm font-bold">{file.name}</span>

                <span className="text-muted shrink-0 text-sm">
                  {images} imagens encontradas
                </span>

                <InputImage onChange={onSelectImage} className="ml-auto">
                  <div className="text-muted cursor-pointer px-2 text-sm font-bold underline">
                    trocar
                  </div>
                </InputImage>
              </div>
              <div
                className="bg-start flex flex-1 bg-cover bg-no-repeat"
                style={{
                  backgroundImage: `url(${imageUrl})`,
                }}
              />
            </div>
          ) : (
            <InputImage onChange={onSelectImage}>
              <div className="bg-bg flex h-24 cursor-pointer flex-col items-center justify-center gap-2 border border-dashed p-4">
                {loading ? (
                  <LoaderIcon />
                ) : (
                  <>
                    <UploadIcon className="text-accent text-xl" />
                    <span className="font-bold">Escolha um arquivo</span>
                  </>
                )}
              </div>
            </InputImage>
          )}

          <label className="relative flex flex-col gap-1">
            <span className="label">Nome do tema</span>
            <input
              ref={nameRef}
              type="text"
              autoComplete="off"
              className="bg-bg ring-line h-10 p-2 ring"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            {suggestions.enabled && (
              <AISuggestions
                suggestions={suggestions.values}
                loading={suggestions.loading}
                onSelect={(name) => setName(name)}
              />
            )}
          </label>

          <DialogFooter>
            <DialogClose render={<Button />}>Cancelar</DialogClose>
            <Button type="submit" variant="primary" disabled={!file || !name}>
              Importar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function useAISuggestions() {
  const [worker] = useState(() => new Worker());
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const enabled =
    import.meta.env.VITE_LLM_API && import.meta.env.VITE_LLM_MODEL;

  useEffect(() => {
    function listener(e: MessageEvent<any>) {
      if (e.data.type === "theme-name-suggestion/response") {
        if (Array.isArray(e.data.names)) {
          setSuggestions(
            e.data.names.map((value: string, i: number) => ({
              id: i + 1,
              value,
            })),
          );
        } else {
          setSuggestions([]);
        }

        setLoading(false);
      }
    }

    worker.addEventListener("message", listener);
    return () => {
      worker.removeEventListener("message", listener);
    };
  }, [worker]);

  const requestSuggestions = useCallback(
    async (file: File) => {
      if (!enabled) return;
      setSuggestions([]);
      setLoading(true);
      worker.postMessage({
        type: "theme-name-suggestion/request",
        image: new Blob([await file.arrayBuffer()], {
          type: file.type,
        }),
      });
    },
    [worker, enabled],
  );

  return {
    enabled,
    values: suggestions,
    loading,
    requestSuggestions,
  };
}

function AISuggestions({
  loading,
  suggestions,
  onSelect,
}: {
  loading: boolean;
  suggestions: Suggestion[];
  onSelect: (value: string) => void;
}) {
  return (
    <div className="text-muted flex items-center gap-4 py-1 text-sm">
      <AIIcon className={cn("size-3", loading && "animate-spin")} />
      {suggestions.map((suggestion, i) => (
        <Fragment key={suggestion.id}>
          <button
            onClick={() => onSelect(suggestion.value)}
            type="button"
            className="cursor-pointer hover:underline"
          >
            {suggestion.value}
          </button>

          {i < suggestions.length - 1 && <span>&bull;</span>}
        </Fragment>
      ))}
    </div>
  );
}
