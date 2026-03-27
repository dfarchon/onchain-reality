import { Outlet } from 'react-router-dom'
import { ButtonSounds } from './ButtonSounds'
import { Header } from './Header'
import { Footer } from './Footer'
import { MusicPlayer } from './MusicPlayer'

export function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <MusicPlayer />
      <ButtonSounds />
      <main
        className="main-scroll flex-1 overflow-y-auto"
        style={{ paddingTop: 'var(--banner-height)', paddingBottom: 'var(--banner-height)' }}
      >
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
