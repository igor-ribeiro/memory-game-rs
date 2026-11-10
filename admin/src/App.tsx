import {
  ChangeEventHandler,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { Header } from "./components/Header";
import { ThemeCards } from "./components/ThemeCards";
import { Route, Routes } from "react-router";
import { HomePage } from "./pages/HomePage";
import { EditorPage } from "./pages/EditorPage";

type Size = { width: number; height: number };

const DEFAULT_SIZE: Size = {
  width: 0,
  height: 0,
};

type Position = { x: number; y: number };
const DEFAULT_POSITION: Position = {
  x: 0,
  y: 0,
};

function App() {
  return (
    <div className="flex h-full flex-col">
      <Routes>
        <Route index element={<HomePage />} />
        <Route path="/:id" element={<EditorPage />} />
      </Routes>
    </div>
  );
}

function _App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [image, setImage] = useState<ImageBitmap | null>(null);
  const [size, setSize] = useState(1);
  const [position, setPosition] = useState<Position>(DEFAULT_POSITION);
  const [src, setSrc] = useState("");

  const onChange = useCallback<ChangeEventHandler<HTMLInputElement>>(
    async (e) => {
      const file = e.target.files?.[0];
      if (!file) {
        alert("Missing file");
        return;
      }

      const data = await file.arrayBuffer();
      const blob = new Blob([data]);
      const image = await createImageBitmap(blob);
      setImage(image);
      setSize(1);
    },
    [],
  );

  useEffect(() => {
    if (!image) {
      return;
    }

    if (!canvasRef.current) {
      alert("Missing canvas element");
      return;
    }

    const c = canvasRef.current;
    const ctx = c.getContext("2d");
    if (!ctx) {
      alert("Missing canvas context");
      return;
    }

    const resized = resize(image, size);
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.drawImage(image, position.x, position.y, resized.width, resized.height);
  }, [image, size, position]);

  const exportImage = useCallback(async () => {
    const c = canvasRef.current;
    if (!c) {
      alert("Missing canvas element");
      return;
    }

    const ctx = c.getContext("2d");
    if (!ctx) {
      alert("Missing canvas context");
      return;
    }

    const image = ctx.getImageData(
      c.width / 2 - 100,
      c.height / 2 - 100,
      200,
      200,
    );

    const off = new OffscreenCanvas(400, 200);
    const offCtx = off.getContext("2d");
    offCtx?.putImageData(image, 0, 0);
    const b = await off.convertToBlob();
    setSrc(window.URL.createObjectURL(b));
  }, []);

  return (
    <div className="flex h-full flex-col">
      <Header />
      <div className="flex-1">
        <ThemeCards />
        <div className="hidden p-6">
          <h1 className="text-3xl font-bold">Memory Game Admin</h1>
          <input type="file" ref={inputRef} onChange={onChange} />
          <div className="relative flex aspect-square w-[500px] gap-2">
            <canvas
              ref={canvasRef}
              className="border"
              width={500}
              height={500}
            ></canvas>
            <div className="absolute top-1/2 left-1/2 aspect-square w-[200px] -translate-x-1/2 -translate-y-1/2 border-2 border-green-300"></div>
            <img src={src} className="shrink-0 grow-0" />
          </div>
          <button onClick={exportImage}>Export</button>
          <div>
            <span className="block">Size ({size * 100}%)</span>
            <input
              type="range"
              min={0}
              max={2}
              step={0.01}
              value={size}
              onChange={(e) => {
                setSize(e.target.valueAsNumber);
              }}
            />
          </div>
          <div>
            <span className="block">X ({position.x})</span>
            <input
              type="range"
              min={0}
              max={canvasRef.current?.width}
              value={position.x}
              onChange={(e) => {
                setPosition((pos) => ({
                  ...pos,
                  x: e.target.valueAsNumber,
                }));
              }}
            />
          </div>
          <div>
            <span className="block">Y ({position.y})</span>
            <input
              type="range"
              min={0}
              max={0}
              value={position.y}
              onChange={(e) => {
                setPosition((pos) => ({
                  ...pos,
                  y: e.target.valueAsNumber,
                }));
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function resize(source: Size, amount: number): Size {
  return {
    width: source.width * amount,
    height: source.height * amount,
  };
}

function _resize(source: Size, target: Partial<Size>): Size {
  if (target.width && target.height) {
    return target as Size;
  }
  const aspectRatio = source.width / source.height;

  if (target.width) {
    return {
      width: target.width,
      height: Math.round(target.width / aspectRatio),
    };
  }

  if (target.height) {
    return {
      width: Math.round(target.height * aspectRatio),
      height: target.height,
    };
  }

  return source;
}

export default App;
