import { Outlet, Navigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import { useEffect, useState } from "react";
import { Menu } from "lucide-react";

export default function Layout() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  useEffect(() => {
    const nim = localStorage.getItem("userNim");

    if (nim) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  // loading state (supaya tidak blank)
  if (isAuthenticated === null) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-slate-500">Loading...</p>
      </div>
    );
  }

  // redirect jika belum login
  if (!isAuthenticated) {
    return <Navigate to="/student-login" replace />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#f6f6f8] text-slate-900 font-sans">
      
      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative">

        {/* Mobile Toggle Button */}
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="lg:hidden fixed top-3 left-4 z-40 p-2 bg-white border border-emerald-100 rounded-xl shadow-sm text-emerald-600 hover:bg-emerald-50 transition-all active:scale-95"
        >
          <Menu size={20} />
        </button>

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>

      </div>
    </div>
  );
}