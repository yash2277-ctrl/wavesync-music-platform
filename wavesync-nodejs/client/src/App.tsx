import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "./components/Layout";
import { AuthProvider } from "./contexts/AuthContext";
import { LibraryProvider } from "./contexts/LibraryContext";
import { PlayerProvider } from "./contexts/PlayerContext";
import { QueueProvider } from "./contexts/QueueContext";
import Home from "./pages/Home";
import Search from "./pages/Search";
import Library from "./pages/Library";
import LikedSongs from "./pages/LikedSongs";
import Playlist from "./pages/Playlist";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Queue from "./pages/Queue";
import Podcasts from "./pages/Podcasts";
import Artist from "./pages/Artist";
import Album from "./pages/Album";
import Browse from "./pages/Browse";
import AIRadio from "./pages/AIRadio";
import Studio from "./pages/Studio";
import Create from "./pages/Create";
import Charts from "./pages/Charts";
import Artists from "./pages/Artists";
import { useEffect, useState } from "react";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const token = localStorage.getItem("wavesync-token");
  
  useEffect(() => {
    // If no token, immediately redirect to login
    if (!token) {
      setIsAuthenticated(false);
      return;
    }

    // Verify token with backend
    fetch("/api/auth/me", {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    })
    .then(res => {
      if (res.ok) {
        setIsAuthenticated(true);
      } else {
        // Invalid token, clear it
        localStorage.removeItem("wavesync-token");
        localStorage.removeItem("wavesync-user");
        setIsAuthenticated(false);
      }
    })
    .catch(() => {
      // Network error or invalid response
      localStorage.removeItem("wavesync-token");
      localStorage.removeItem("wavesync-user");
      setIsAuthenticated(false);
    });
  }, [token]);

  // Show loading state while checking authentication
  if (isAuthenticated === null) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }
  
  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem("wavesync-token");
  
  // Clear any existing tokens when accessing login page
  // This ensures a fresh start
  useEffect(() => {
    if (!token) {
      localStorage.removeItem("wavesync-token");
      localStorage.removeItem("wavesync-user");
    }
  }, [token]);
  
  return <>{children}</>;
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <PlayerProvider>
          <QueueProvider>
            <LibraryProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  {/* Public route - redirects to home if already logged in */}
                  <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
                  
                  {/* Protected routes - requires authentication */}
                  <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                    <Route index element={<Home />} />
                    <Route path="create" element={<Create />} />
                    <Route path="search" element={<Search />} />
                    <Route path="browse" element={<Browse />} />
                    <Route path="charts" element={<Charts />} />
                    <Route path="library" element={<Library />} />
                    <Route path="liked" element={<LikedSongs />} />
                    <Route path="playlist/:id" element={<Playlist />} />
                    <Route path="queue" element={<Queue />} />
                    <Route path="podcasts" element={<Podcasts />} />
                    <Route path="ai-radio" element={<AIRadio />} />
                    <Route path="studio" element={<Studio />} />
                    <Route path="artists" element={<Artists />} />
                    <Route path="artist/:id" element={<Artist />} />
                    <Route path="album/:id" element={<Album />} />
                    <Route path="settings" element={<Settings />} />
                  </Route>
                  
                  {/* 404 - Not Found */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
            </LibraryProvider>
          </QueueProvider>
        </PlayerProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
