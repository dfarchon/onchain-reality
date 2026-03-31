import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AnalyticsConsentBanner } from "./components/AnalyticsConsentBanner";
import { GoogleAnalytics } from "./components/GoogleAnalytics";
import { AnalyticsConsentProvider } from "./contexts/AnalyticsConsentContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { Layout } from "./components/Layout";
import { Home } from "./routes/Home";
import { Philosophy } from "./routes/Philosophy";
import { Projects } from "./routes/Projects";
import { BlogIndex } from "./routes/Blog/BlogIndex";
import { BlogPost } from "./routes/Blog/BlogPost";
import { Privacy } from "./routes/Privacy";

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
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
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
