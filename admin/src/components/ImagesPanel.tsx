import { Button } from "./Button";

export function ImagesPanel() {
  return (
    <div className="space-y-4 p-4">
      <header className="flex items-center justify-between">
        <div className="space-x-2">
          <span className="label">Imagens</span>
          <span className="label">0</span>
        </div>
        <Button>+</Button>
      </header>
      <div className="grid grid-cols-3 gap-2">
        <ImagesPlaceholder />
      </div>
    </div>
  );
}

function ImagesPlaceholder() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="text-muted/50 aspect-square w-full border border-dashed p-1"
          style={{
            opacity: `${100 - i * 15}%`,
          }}
        >
          <span>{String(i + 1).padStart(2, "0")}</span>
        </div>
      ))}
    </>
  );
}
