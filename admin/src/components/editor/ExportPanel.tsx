import { FormEvent } from "react";
import { Button } from "../Button";
import { dispatchCustomEvent } from "@ribeirolabs/events";

export function ExportPanel() {
  function onExport(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
  }

  return (
    <div>
      <header className="h-10">
        <span className="label">Exportar</span>
      </header>
      <form className="space-y-4" onSubmit={onExport}>
        <label className="flex flex-col gap-1">
          <span className="label">Nome do arquivo</span>
          <input
            type="text"
            className="border p-2"
            name="file_name"
            autoComplete="off"
          />
        </label>
        <Button
          type="submit"
          variant="primary"
          fill
          onClick={() => dispatchCustomEvent("export", {})}
        >
          Exportar
        </Button>
      </form>
    </div>
  );
}
