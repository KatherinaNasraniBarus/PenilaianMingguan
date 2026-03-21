import { Outlet, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import AppSidebar, { SidebarMenuItem } from "./AppSidebar";

interface AppLayoutProps {
  /** localStorage key untuk cek autentikasi. Jika key ada = terautentikasi. */
  authStorageKey: string;
  /** Route redirect kalau belum login */
  loginPath: string;
  menuItems: SidebarMenuItem[];
  /** Sama dengan prop di AppSidebar */
  userStorageKey: string;
  roleLabel: string;
}

export default function AppLayout({
  authStorageKey,
  loginPath,
  menuItems,
  userStorageKey,
  roleLabel,
}: AppLayoutProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    setIsAuthenticated(!!localStorage.getItem(authStorageKey));
  }, [authStorageKey]);

  // Masih loading
  if (isAuthenticated === null) return null;
  // Belum login
  if (!isAuthenticated) return <Navigate to={loginPath} replace />;

  return (
    <div className="flex h-screen overflow-hidden bg-[#f6f6f8] text-slate-900 font-sans">
      <AppSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        menuItems={menuItems}
        userStorageKey={userStorageKey}
        roleLabel={roleLabel}
      />

      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Hamburger — hanya tampil saat sidebar tertutup */}
        {!isSidebarOpen && (
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="lg:hidden absolute top-3 left-4 z-50 p-2 bg-white border border-emerald-100
              rounded-xl shadow-sm text-emerald-600 hover:bg-emerald-50 transition-all active:scale-95"
            aria-label="Buka menu"
          >
            <Menu size={20} />
          </button>
        )}

        <main className="flex-1 overflow-y-auto relative">
          <Outlet />
        </main>
      </div>
    </div>
  );
}