import { PropsWithChildren } from "react";
import { tv, VariantProps } from "tailwind-variants";

const button = tv({
  base: "justify-center items-center cursor-pointer border inline-flex gap-1 py-2 px-4 hover:bg-raised font-bold uppercase h-10",
  variants: {
    variant: {
      primary: "bg-accent border-accent text-on-accent hover:bg-accent-hover",
    },
    fill: {
      true: "w-full",
    },
  },
});

export function Button({
  children,
  variant,
  fill,
}: PropsWithChildren<VariantProps<typeof button>>) {
  return <button className={button({ variant, fill })}>{children}</button>;
}
