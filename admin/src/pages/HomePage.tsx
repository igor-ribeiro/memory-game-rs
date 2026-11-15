import { Suspense } from "react";
import { AppLogo } from "../components/AppLogo";
import { Header } from "../components/Header";
import { ThemeCards, ThemesPlaceholder } from "../components/ThemeCards";

export function HomePage() {
  return (
    <>
      <Header>
        <AppLogo />
      </Header>
      <div className="flex-1">
        <Suspense fallback={<ThemesPlaceholder />}>
          <ThemeCards />
        </Suspense>
      </div>
    </>
  );
}
