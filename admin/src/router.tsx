import { createHashRouter } from "react-router";
import App from "./App.tsx";
import { EditorPage } from "./pages/EditorPage";
import { HomePage } from "./pages/HomePage";
import { Suspense } from "react";

export const router = createHashRouter([
  {
    element: <App />,
    children: [
      { index: true, element: <HomePage /> },
      {
        path: "/:themeId/:cropId?",
        element: (
          <Suspense>
            <EditorPage />
          </Suspense>
        ),
      },
    ],
  },
]);
