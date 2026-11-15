import { Outlet } from "react-router";
import { Toaster } from "./components/ui/Toast";

function App() {
  return (
    <div className="flex h-full flex-col">
      <Outlet />
      <Toaster />
    </div>
  );
}

export default App;
