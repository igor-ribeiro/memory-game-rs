import Logo from "../cardsprite-icon.svg?react";

export function Header() {
  return (
    <header className="flex items-center gap-4 border-b p-5">
      <Logo />
      <span className="text-xl font-bold">cardsprite</span>
    </header>
  );
}
