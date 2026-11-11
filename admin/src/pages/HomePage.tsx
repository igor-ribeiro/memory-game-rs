import { AppLogo } from "../components/AppLogo";
import { Header } from "../components/Header";
import { ThemeCards } from "../components/ThemeCards";

export function HomePage() {
  return (
    <>
      <Header>
        <AppLogo />
      </Header>
      <div className="flex-1">
        <ThemeCards />
      </div>
    </>
  );
}
