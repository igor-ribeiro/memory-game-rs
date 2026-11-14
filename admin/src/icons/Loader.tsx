import { cn } from "tailwind-variants";

export function LoaderIcon({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-block aspect-square w-8 animate-spin rounded-full border-2 border-t-transparent [animation-duration:500ms]",
        className,
      )}
    >
      &nbsp;
    </span>
  );
}
