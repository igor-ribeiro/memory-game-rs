import { SubmitEvent } from "react";
import { NavLink } from "react-router";
import { ThemeEntity } from "../../db";
import { createThemeAndOpen } from "../../domain/theme";
import { router } from "../../router";
import { renameTheme } from "../../state/theme";
import { AppLogo } from "../AppLogo";
import { Button } from "../Button";
import { DeleteThemePopover } from "../DeleteThemePopover";
import { Header } from "../Header";

export function EditorHeader({ theme }: { theme: ThemeEntity }) {
  async function onRename(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    const name = e.target.theme_name.value;
    const id = e.target.theme_id.value;
    await renameTheme(Number(id), name);
    router.navigate(`/${id}`);
  }

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
        <Button
          variant="primary"
          appearance="outline"
          onClick={() => createThemeAndOpen()}
        >
          + Novo tema
        </Button>
        <DeleteThemePopover theme={theme} />
      </div>
    </Header>
  );
}
