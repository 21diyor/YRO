import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ScrollToTop } from './components/ScrollToTop.tsx';
import App from './App.tsx';
import { PostDetail } from './pages/PostDetail.tsx';
import { Archive } from './pages/Archive.tsx';
import { About } from './pages/About.tsx';
import { Subscribe } from './pages/Subscribe.tsx';
import { AdminPosts } from './pages/admin/AdminPosts.tsx';
import { AdminPostEditor } from './pages/admin/AdminPostEditor.tsx';
import { Unsubscribe } from './pages/Unsubscribe.tsx';
import { AuthProvider } from './providers/AuthProvider.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/archive" element={<Archive />} />
          <Route path="/about" element={<About />} />
          <Route path="/subscribe" element={<Subscribe />} />
          <Route path="/admin" element={<AdminPosts />} />
          <Route path="/admin/posts/:id" element={<AdminPostEditor />} />
          <Route path="/unsubscribe" element={<Unsubscribe />} />
          <Route path="/post/:id" element={<PostDetail />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>,
);
