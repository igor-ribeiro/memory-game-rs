import { tv } from "tailwind-variants";
import { Button } from "./Button";

export function ThemePanel() {
  return (
    <aside className="border-r p-6">
      <header className="flex items-center justify-between">
        <span className="label uppercase">Temas</span>
        <Button>+</Button>
      </header>
    </aside>
  );
}
