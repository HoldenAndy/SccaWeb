import { Outlet } from "react-router";
import { useState } from "react";
import { Header } from "./layout/Header";
import { Sidebar } from "./layout/Sidebar";
import { useAuth } from "../contexts/AuthContext";
import { CommandPalette } from "./shared/CommandPalette";

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[var(--scca-bg)] flex">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} user={user} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} sidebarOpen={sidebarOpen} />
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
      <CommandPalette />
    </div>
  );
}
