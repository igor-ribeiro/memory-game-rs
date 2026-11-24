import {
  ChangeEvent,
  ReactElement,
  SubmitEvent,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import { SPRITE_SIZE } from "../config";
import { importTheme } from "../domain/import";
import UploadIcon from "../icons/upload.svg?react";
import { invariant } from "../utils";
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
import { useNavigate } from "react-router";

const handle = createDialogHandle();

export function ImportThemeDialog({ children }: { children: ReactElement }) {
  const [file, setFile] = useState<File | null>(null);
  const [images, setImages] = useState(0);
  const [name, setName] = useState("");
  const nameRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

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
      setImages(image.width / SPRITE_SIZE);
      setFile(file);
      nameRef.current?.focus();
      image.close();
    },
    [],
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
                <UploadIcon className="text-accent text-xl" />
                <span className="font-bold">Escolha um arquivo</span>
              </div>
            </InputImage>
          )}

          <label className="flex flex-col gap-1">
            <span className="label">Nome do tema</span>
            <input
              ref={nameRef}
              type="text"
              autoComplete="off"
              className="bg-bg ring-line h-10 p-2 ring"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
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
