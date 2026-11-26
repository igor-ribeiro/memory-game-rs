import { SubmitEvent, useCallback } from "react";
import { NavLink, useNavigate } from "react-router";
import { ThemeEntity } from "../../db";
import { renameTheme, useCreateThemeAndOpen } from "../../domain/theme";
import { LoaderIcon } from "../../icons/Loader";
import UploadIcon from "../../icons/upload.svg?react";
import { useSpriteWorker } from "../../workers/sprite/sprite";
import { AppLogo } from "../AppLogo";
import { Button } from "../Button";
import { DeleteThemePopover } from "../DeleteThemePopover";
import { Header } from "../Header";
import { toast } from "../ui/Toast";
import { generateThemeCrops } from "../../workers/crop/crop";

export function EditorHeader({ theme }: { theme: ThemeEntity }) {
  const createThemeAndOpen = useCreateThemeAndOpen();
  const navigate = useNavigate();
  const worker = useSpriteWorker();

  async function onRename(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    const name = e.target.theme_name.value;
    const id = e.target.theme_id.value;
    await renameTheme(Number(id), name);
    navigate(`/${id}`);
  }

  const onExport = useCallback(async () => {
    try {
      const data = await worker.generate(theme.id);
      const a = document.createElement("a");
      a.href = window.URL.createObjectURL(data.blob);
      a.download = data.filename;
      a.click();
      setTimeout(() => window.URL.revokeObjectURL(a.href), 1000);
    } catch (e) {
      console.error("[sprite-worker/generate]", e);
      toast.add({
        type: "error",
        title: "Não foi possível gerar a sprite",
      });
    }
  }, [theme.id]);

  return (
    <Header className="justify-between">
      <form className="flex items-center gap-4 text-lg" onSubmit={onRename}>
        <NavLink to="/">
          <AppLogo />
        </NavLink>
        <span className="text-muted">/</span>
        <input
          type="text"
          key={theme.id}
          name="theme_name"
          autoComplete="off"
          className="focus:bg-raised hover:bg-raised h-10 p-2 font-bold"
          defaultValue={theme.name}
        />
        <input type="hidden" name="theme_id" value={theme.id} />
      </form>
      <div className="flex items-center gap-2">
        <Button appearance="outline" onClick={() => createThemeAndOpen()}>
          + Novo tema
        </Button>
        <Button
          appearance="outline"
          onClick={() => generateThemeCrops(theme.id)}
        >
          Generate crops
        </Button>
        <Button variant="primary" onClick={onExport} disabled={worker.loading}>
          {worker.loading ? (
            <LoaderIcon className="size-5" />
          ) : (
            <UploadIcon className="rotate-180" />
          )}
          Exportar
        </Button>
        <DeleteThemePopover theme={theme} />
      </div>
    </Header>
  );
}
