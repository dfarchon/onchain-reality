import { Outlet } from "react-router-dom";
import { ButtonSounds } from "./ButtonSounds";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { MusicPlayer } from "./MusicPlayer";

export function Layout() {
  return (
    <div className="flex min-h-[var(--app-height)] min-w-0 flex-col">
      <Header />
      <MusicPlayer />
      <ButtonSounds />
      <main
        className="main-scroll min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto"
        style={{
          paddingTop:
            "calc(var(--layout-chrome-top) + var(--layout-main-below-header))",
          paddingBottom: "var(--layout-chrome-bottom)",
        }}
      >
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
