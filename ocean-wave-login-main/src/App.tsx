import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';

import { MusicPlayerProvider } from './contexts/MusicPlayerContext';
import { PlaylistProvider } from './contexts/PlaylistContext';
import { Layout } from './components/Layout';
import { isAuthenticated } from './lib/auth';

import Login    from './pages/Login';
import Home     from './pages/Home';
import Search   from './pages/Search';
import Browse   from './pages/Browse';
import Library  from './pages/Library';
import Playlist from './pages/Playlist';
import LikedSongs from './pages/LikedSongs';
import AIRadio  from './pages/AIRadio';
import Queue    from './pages/Queue';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';

const queryClient = new QueryClient();

// ─── Route guards ─────────────────────────────────────────────────────────────

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  return isAuthenticated() ? <>{children}</> : <Navigate to="/login" replace />;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  return isAuthenticated() ? <Navigate to="/" replace /> : <>{children}</>;
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MusicPlayerProvider>
        <PlaylistProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                {/* Public */}
                <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />

                {/* Protected — all share the Layout shell */}
                <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                  <Route index        element={<Home />} />
                  <Route path="search"          element={<Search />} />
                  <Route path="browse"          element={<Browse />} />
                  <Route path="library"         element={<Library />} />
                  <Route path="playlist/:id"    element={<Playlist />} />
                  <Route path="liked"           element={<LikedSongs />} />
                  <Route path="ai-radio"        element={<AIRadio />} />
                  <Route path="queue"           element={<Queue />} />
                  <Route path="settings"        element={<Settings />} />
                </Route>

                {/* 404 */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </PlaylistProvider>
      </MusicPlayerProvider>
    </QueryClientProvider>
  );
}
