import { useCallback } from "react";
import { useNavigate } from "react-router";
import { ThemeEntity } from "../db";
import { deleteTheme } from "../domain/theme";
import DeleteIcon from "../icons/delete.svg?react";
import { Button } from "./Button";
import {
  Popover,
  PopoverActions,
  PopoverClose,
  PopoverContent,
  PopoverDescription,
  PopoverTitle,
  PopoverTrigger,
} from "./ui/Popover";
import { toast } from "./ui/Toast";

export function DeleteThemePopover({ theme }: { theme: ThemeEntity }) {
  const navigate = useNavigate();

  const onDelete = useCallback(async () => {
    if (!theme) return;

    navigate("/");

    toast.promise<void>(deleteTheme(theme.id), {
      loading: {
        title: "Excluindo tema...",
        data: {
          close: false,
        },
      },
      success() {
        return {
          timeout: 3000,
          data: { icon: "delete" },
          title: `Tema "${theme.name}" excluído`,
        };
      },
      error(e) {
        console.error("[delete-theme]:", e);
        return {
          type: "error",
          title: `Não foi possível excluir o tema "${theme.name}"`,
        };
      },
    });
  }, [theme]);

  return (
    <Popover>
      <PopoverTrigger render={<Button icon />}>
        <DeleteIcon />
      </PopoverTrigger>
      <PopoverContent align="end">
        <PopoverTitle>Excluir "{theme.name}"?</PopoverTitle>
        <PopoverDescription>
          As X imagens deste tema serão removidas. Não é possível desfazer essa
          ação.
        </PopoverDescription>
        <PopoverActions>
          <PopoverClose render={<Button>Cancelar</Button>} />
          <PopoverClose
            render={
              <Button variant="danger" onClick={onDelete}>
                Excluir
              </Button>
            }
          />
        </PopoverActions>
      </PopoverContent>
    </Popover>
  );
}
