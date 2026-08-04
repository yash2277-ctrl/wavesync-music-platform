import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { PlayerBar } from "./PlayerBar";
import { useState } from "react";

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="h-screen flex flex-col bg-background text-foreground overflow-hidden relative">
      {/* Animated Ocean Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Wave Layer 1 */}
        <div className="absolute bottom-0 left-0 right-0 h-64 md:h-96 opacity-10">
          <svg className="absolute bottom-0 w-full h-full ocean-wave" viewBox="0 0 1200 320" preserveAspectRatio="none">
            <path fill="url(#wave-gradient-1)" d="M0,160L48,144C96,128,192,96,288,96C384,96,480,128,576,138.7C672,149,768,139,864,122.7C960,107,1056,85,1152,85.3C1248,85,1344,107,1392,117.3L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
            <defs>
              <linearGradient id="wave-gradient-1" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgb(103, 213, 232)" />
                <stop offset="50%" stopColor="rgb(59, 130, 246)" />
                <stop offset="100%" stopColor="rgb(103, 213, 232)" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Wave Layer 2 */}
        <div className="absolute bottom-0 left-0 right-0 h-48 md:h-80 opacity-5">
          <svg className="absolute bottom-0 w-full h-full ocean-wave-slow" viewBox="0 0 1200 320" preserveAspectRatio="none">
            <path fill="url(#wave-gradient-2)" d="M0,96L48,112C96,128,192,160,288,165.3C384,171,480,149,576,133.3C672,117,768,107,864,112C960,117,1056,139,1152,149.3C1248,160,1344,160,1392,160L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
            <defs>
              <linearGradient id="wave-gradient-2" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgb(59, 130, 246)" />
                <stop offset="50%" stopColor="rgb(103, 213, 232)" />
                <stop offset="100%" stopColor="rgb(59, 130, 246)" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Floating Particles - Hidden on mobile for performance */}
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-cyan-400/10 float-animation hidden md:block"
            style={{
              width: Math.random() * 100 + 50 + 'px',
              height: Math.random() * 100 + 50 + 'px',
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
              animationDelay: Math.random() * 6 + 's',
              animationDuration: Math.random() * 4 + 8 + 's'
            }}
          />
        ))}

        {/* Radial Gradients - Optimized for mobile */}
        <div className="absolute top-0 left-1/4 w-64 h-64 md:w-96 md:h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 md:w-80 md:h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="flex flex-1 overflow-hidden relative z-10">
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <TopBar setSidebarOpen={setSidebarOpen} />
          <main className="flex-1 overflow-y-auto bg-gradient-to-b from-muted/20 to-background px-3 py-3 sm:px-4 sm:py-4 md:px-6 md:py-6">
            <Outlet />
          </main>
        </div>
      </div>
      <PlayerBar />
    </div>
  );
}
