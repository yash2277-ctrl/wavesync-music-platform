import { NavLink } from "react-router-dom";
import { Home, Search, Library, Plus, Heart, Music, X } from "lucide-react";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export function Sidebar({ sidebarOpen, setSidebarOpen }: SidebarProps) {
  const navItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: Search, label: "Search", path: "/search" },
    { icon: Library, label: "Your Library", path: "/library" },
  ];

  const playlists = [
    { name: "Chill Vibes", id: "1" },
    { name: "Workout Mix", id: "2" },
    { name: "Focus Flow", id: "3" },
    { name: "Night Drive", id: "4" },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-50
        w-64 bg-sidebar flex flex-col border-r border-sidebar-border
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-4 md:p-6 flex items-center justify-between">
          <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">WaveSync</h1>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors ${
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}

          <Button
            variant="ghost"
            className="w-full justify-start gap-3 px-3 py-2.5 text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground mt-4"
          >
            <Plus className="w-5 h-5" />
            <span className="font-medium">Create Playlist</span>
          </Button>

          <NavLink
            to="/liked"
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors ${
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
              }`
            }
          >
            <Heart className="w-5 h-5" />
            <span className="font-medium">Liked Songs</span>
          </NavLink>

          <Separator className="my-4 bg-sidebar-border" />

          <div className="space-y-1">
            {playlists.map((playlist) => (
              <NavLink
                key={playlist.id}
                to={`/playlist/${playlist.id}`}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors ${
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/50"
                  }`
                }
              >
                <Music className="w-4 h-4" />
                <span className="text-sm truncate">{playlist.name}</span>
              </NavLink>
            ))}
          </div>
        </nav>
      </aside>
    </>
  );
}
