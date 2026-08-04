import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { PlayerBar } from './PlayerBar';

export function AppLayout() {
  const [open, setOpen] = useState(false);
  return (
    <div className="h-screen w-screen flex flex-col bg-background text-foreground overflow-hidden">
      <div className="flex flex-1 overflow-hidden">
        <Sidebar open={open} onClose={() => setOpen(false)} />
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <TopBar onMenu={() => setOpen(true)} />
          <main className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-5 md:px-8 md:py-6 pb-28">
            <AnimatePresence mode="wait">
              <Outlet />
            </AnimatePresence>
          </main>
        </div>
      </div>
      <PlayerBar />
    </div>
  );
}
