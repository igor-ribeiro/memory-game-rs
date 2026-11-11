import { ButtonHTMLAttributes } from "react";
import { tv, VariantProps } from "tailwind-variants";

const button = tv({
  base: "justify-center items-center cursor-pointer border inline-flex gap-1 py-2 px-4 hover:bg-raised font-bold uppercase h-10 tracking-wider",
  variants: {
    variant: {
      primary: "bg-accent border-accent text-on-accent hover:bg-accent-hover",
    },
    fill: {
      true: "w-full",
    },
    disabled: {
      true: "text-fg/40 bg-line/50 cursor-not-allowed",
    },
  },
});

export function Button({
  children,
  variant,
  fill,
  disabled,
  ...props
}: VariantProps<typeof button> & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      disabled={disabled}
      className={button({ variant, fill, disabled })}
      {...props}
    >
      {children}
    </button>
  );
}
