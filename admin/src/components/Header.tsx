import { ReactNode } from "react";
import { cn } from "tailwind-variants";

export function Header({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <header
      className={cn("flex h-20 shrink-0 items-center border-b px-5", className)}
    >
      {children}
    </header>
  );
}
