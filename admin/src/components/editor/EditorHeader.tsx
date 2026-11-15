import { FormEvent } from "react";
import { NavLink, useNavigate } from "react-router";
import { ThemeEntity } from "../../db";
import { AppLogo } from "../AppLogo";
import { DeleteThemePopover } from "../DeleteThemePopover";
import { Header } from "../Header";
import { renameTheme } from "../../state/theme";

export function EditorHeader({ theme }: { theme: ThemeEntity }) {
  const navigate = useNavigate();

  async function onRename(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const name = form.theme_name.value;
    const id = form.theme_id.value;
    await renameTheme(Number(id), name);
    navigate(`/${id}`);
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
          className="h-10 border p-2 font-bold"
          defaultValue={theme.name}
        />
        <input type="hidden" name="theme_id" value={theme.id} />
      </form>
      <DeleteThemePopover theme={theme} />
    </Header>
  );
}
