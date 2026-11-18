import { ButtonHTMLAttributes, ForwardedRef, forwardRef } from "react";
import { tv, VariantProps } from "tailwind-variants";

const button = tv({
  base: "justify-center items-center cursor-pointer border inline-flex gap-1 py-2 px-4 hover:bg-raised font-bold h-10",
  variants: {
    variant: {
      primary: "bg-accent border-accent text-on-accent hover:bg-accent-hover",
      danger: "bg-danger border-danger text-on-danger hover:bg-danger-hover",
    },
    disabled: {
      true: "opacity-30 cursor-not-allowed pointer-events-none",
    },
    icon: {
      true: "aspect-square p-0",
    },
    size: {
      sm: "text-sm h-8",
    },
    appearance: {
      ghost: "border-transparent",
      outline: "bg-transparent border",
    },
  },
  compoundVariants: [
    {
      variant: "primary",
      appearance: "ghost",
      className: "bg-transparent text-accent hover:bg-accent/10",
    },
    {
      variant: "primary",
      appearance: "outline",
      className: "border-accent text-accent hover:bg-accent/10",
    },
  ],
});

export const Button = forwardRef(function Button(
  {
    children,
    variant,
    disabled,
    icon,
    size,
    appearance,
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
        disabled,
        icon,
        size,
        appearance,
        className,
      })}
      type={type}
      {...props}
    >
      {children}
    </button>
  );
});
