import { cn } from "tailwind-variants";
import { Button } from "./Button";
import { FormEvent } from "react";
import slug from "slug";

export function ThemeCards() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-4 p-4">
      <CreateCard />
      <Placeholder />
      <Placeholder className="opacity-60" />
      <Placeholder className="opacity-30" />
    </div>
  );
}

function CreateCard() {
  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const name = form.theme_name as HTMLInputElement;
    console.log(slug(form.theme_name.value));
  }

  return (
    <form
      className="border-accent flex h-64 w-80 shrink-0 flex-col justify-center gap-2 border border-dashed p-4"
      onSubmit={onSubmit}
    >
      <label className="flex flex-col gap-2">
        <span className="label block">Nome do tema</span>
        <input
          name="theme_name"
          className="w-full border p-2"
          autoComplete="off"
        />
      </label>
      <Button variant="primary" fill>
        + Criar primeiro tema
      </Button>
    </form>
  );
}

function Placeholder({ className }: { className?: string }) {
  return (
    <div className={cn("flex w-80 shrink-0 flex-col border", className)}>
      <div className="bg-line h-32"></div>
      <div className="h-32 space-y-2 p-4">
        <div className="bg-line h-4 w-2/3"></div>
        <div className="bg-line/50 h-3 w-1/3"></div>
      </div>
    </div>
  );
}
