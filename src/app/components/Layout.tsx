import { Outlet } from "react-router";
import { useState } from "react";
import { Header } from "./layout/Header";
import { Sidebar } from "./layout/Sidebar";
import { useAuth } from "../contexts/AuthContext";

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[#f0f6ff] flex flex-col">
      <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} sidebarOpen={sidebarOpen} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} user={user} />
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
