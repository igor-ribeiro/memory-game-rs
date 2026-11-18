import { ChangeEventHandler, ReactNode, useRef } from "react";

const ACCEPTED = ["image/png", "image/jpeg", "image/webp"];

export function InputImage({
  onChange,
  children,
  className,
}: {
  onChange?: ChangeEventHandler<HTMLInputElement, HTMLInputElement>;
  children: ReactNode;
  className?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <label className={className}>
      <input
        type="file"
        hidden
        accept={ACCEPTED.join(",")}
        ref={inputRef}
        onChange={onChange}
        className="border"
      />
      {children}
    </label>
  );
}
