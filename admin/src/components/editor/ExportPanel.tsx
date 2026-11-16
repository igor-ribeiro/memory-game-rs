import { dispatchCustomEvent } from "@ribeirolabs/events";
import { FormEvent } from "react";
import { Button } from "../Button";

export function ExportPanel() {
  function onExport(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
  }

  return (
    <div className="p-4">
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
          className="w-full"
          onClick={() => dispatchCustomEvent("export", {})}
        >
          Exportar
        </Button>
      </form>
    </div>
  );
}
