import Logo from "../icons/cardsprite.svg?react";

export function AppLogo() {
  return (
    <div className="flex items-center gap-4">
      <Logo />
      <span className="font-bold">cardsprite</span>
    </div>
  );
}
