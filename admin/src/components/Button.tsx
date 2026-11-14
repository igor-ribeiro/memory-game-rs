import { ButtonHTMLAttributes, ForwardedRef, forwardRef } from "react";
import { tv, VariantProps } from "tailwind-variants";

const button = tv({
  base: "justify-center items-center cursor-pointer border inline-flex gap-1 py-2 px-4 hover:bg-raised font-bold h-10",
  variants: {
    variant: {
      primary: "bg-accent border-accent text-on-accent hover:bg-accent-hover",
      danger: "bg-danger border-danger text-on-danger hover:bg-danger-hover",
    },
    fill: {
      true: "w-full",
    },
    disabled: {
      true: "text-fg/40 bg-line/50 cursor-not-allowed",
    },
    icon: {
      true: "aspect-square p-0",
    },
    size: {
      sm: "text-sm h-8",
    },
    ghost: {
      true: "border-transparent",
    },
  },
  compoundVariants: [
    {
      variant: "primary",
      ghost: true,
      className: "bg-transparent text-accent hover:bg-accent/10",
    },
  ],
});

export const Button = forwardRef(function Button(
  {
    children,
    variant,
    fill,
    disabled,
    icon,
    size,
    ghost,
    type = "button",
    className,
    ...props
  }: VariantProps<typeof button> & ButtonHTMLAttributes<HTMLButtonElement>,
  ref: ForwardedRef<HTMLButtonElement>,
) {
  return (
    <button
      ref={ref}
      disabled={disabled}
      className={button({
        variant,
        fill,
        disabled,
        icon,
        size,
        ghost,
        className,
      })}
      type={type}
      {...props}
    >
      {children}
    </button>
  );
});
