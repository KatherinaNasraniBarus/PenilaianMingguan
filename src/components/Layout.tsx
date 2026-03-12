import { Outlet, Navigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import { useEffect, useState } from "react";

export default function Layout() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const nim = localStorage.getItem("userNim");
    setIsAuthenticated(!!nim);
  }, []);

  if (isAuthenticated === null) return null;
  if (!isAuthenticated) return <Navigate to="/student-login" replace />;

  return (
    <div className="flex h-screen overflow-hidden bg-[#f6f6f8] text-slate-900 font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
