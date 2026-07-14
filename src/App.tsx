import {
  BrowserRouter,
  Navigate,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { AnalyticsConsentBanner } from "./components/AnalyticsConsentBanner";
import { GoogleAnalytics } from "./components/GoogleAnalytics";
import { AnalyticsConsentProvider } from "./contexts/AnalyticsConsentContext";
import { SoundProvider } from "./contexts/SoundContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { Layout } from "./components/Layout";
import { Home } from "./routes/Home";
import { Philosophy } from "./routes/Philosophy";
import { Projects } from "./routes/Projects";
import { BlogIndex } from "./routes/Blog/BlogIndex";
import { BlogPost } from "./routes/Blog/BlogPost";
import { Privacy } from "./routes/Privacy";

/** Normalize /philosophy/ → /philosophy so path checks and SEO stay consistent. */
function TrailingSlashRedirect() {
  const { pathname, search, hash } = useLocation();
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return (
      <Navigate to={pathname.replace(/\/+$/, "") + search + hash} replace />
    );
  }
  return null;
}

function App() {
  return (
    <BrowserRouter>
      <TrailingSlashRedirect />
      <ThemeProvider>
        <SoundProvider>
          <AnalyticsConsentProvider>
            <GoogleAnalytics />
            <AnalyticsConsentBanner />
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="philosophy" element={<Philosophy />} />
                <Route path="projects" element={<Projects />} />
                <Route path="blog" element={<BlogIndex />} />
                <Route path="blog/:slug" element={<BlogPost />} />
                <Route path="privacy" element={<Privacy />} />
              </Route>
            </Routes>
          </AnalyticsConsentProvider>
        </SoundProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
