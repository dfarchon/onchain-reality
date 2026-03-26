import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Home } from './routes/Home'
import { Philosophy } from './routes/Philosophy'
import { Projects } from './routes/Projects'
import { BlogIndex } from './routes/Blog/BlogIndex'
import { BlogPost } from './routes/Blog/BlogPost'
import { Ascii } from './routes/Ascii'
import { StarrySky } from './routes/StarrySky'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="philosophy" element={<Philosophy />} />
          <Route path="projects" element={<Projects />} />
          <Route path="blog" element={<BlogIndex />} />
          <Route path="blog/:slug" element={<BlogPost />} />
          <Route path="ascii" element={<Ascii />} />
          <Route path="starry-sky" element={<StarrySky />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
