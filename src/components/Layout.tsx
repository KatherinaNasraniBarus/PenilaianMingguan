import { Outlet, Navigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import { useEffect, useState } from "react";
import { Menu } from "lucide-react";

export default function Layout() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const nim = localStorage.getItem("userNim");
    setIsAuthenticated(!!nim);
  }, []);

  if (isAuthenticated === null) return null;
  if (!isAuthenticated) return <Navigate to="/student-login" replace />;

  return (
    <div className="flex h-screen overflow-hidden bg-[#f6f6f8] text-slate-900 font-sans">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      {/* Kontainer Utama */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        
        {/* TOMBOL HAMBURGER (Absolute & Z-50) */}
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="lg:hidden absolute top-3 left-4 z-50 p-2 bg-white border border-emerald-100 rounded-xl shadow-sm text-emerald-600 hover:bg-emerald-50 transition-all active:scale-95"
        >
          <Menu size={20} />
        </button>

        {/* Area yang bisa di-scroll */}
        <main className="flex-1 overflow-y-auto relative">
          <Outlet />
        </main>

      </div>
    </div>
  );
}