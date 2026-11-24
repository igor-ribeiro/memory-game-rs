import { createBrowserRouter } from "react-router";
import App from "./App.tsx";
import { EditorPage } from "./pages/EditorPage";
import { HomePage } from "./pages/HomePage";

export const router = createBrowserRouter([
  {
    element: <App />,
    children: [
      { index: true, element: <HomePage /> },
      {
        path: "/:themeId/:cropId?",
        element: <EditorPage />,
      },
    ],
  },
]);
