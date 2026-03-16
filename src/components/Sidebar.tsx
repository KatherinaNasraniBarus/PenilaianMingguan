import { LayoutDashboard, ClipboardList, LogOut, UserCircle, X } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import logo from "../image/bpjstk.jpeg";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [userName, setUserName] = useState<string>("");

  useEffect(() => {
    const storedName = localStorage.getItem("userName");
    if (storedName) setUserName(storedName);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const menuItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Submit Report", path: "/submit-report", icon: ClipboardList },
  ];

  return (
    <>
      {/* 1. OVERLAY (Mobile) */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* 2. SIDEBAR UTAMA */}
      <aside 
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-emerald-100 flex flex-col h-full shrink-0 transform transition-transform duration-300 ease-in-out shadow-2xl lg:shadow-none ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        {/* HEADER LOGO - Ukuran Ekstra Besar & Posisi Kiri */}
        <div className="h-24 px-6 flex items-center justify-between border-b border-emerald-50 shrink-0">
          <div className="flex items-center justify-start h-full w-full">
            <img 
              src={logo}
              alt="Logo BPJS Ketenagakerjaan"
              className="h-16 w-auto object-contain" // Tinggi h-16 membuat logo sangat dominan dan jelas
            />
          </div>
          
          {/* Tombol Close Mobile */}
          <button 
            onClick={onClose}
            className="lg:hidden p-1.5 text-emerald-600 hover:text-red-500 hover:bg-red-50 rounded-lg bg-emerald-50 shrink-0"
          >
            <X size={20} />
          </button>
        </div>

        {/* Menu Navigasi - Jarak rapat ke header */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto mt-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-200"
                    : "text-emerald-700/70 hover:bg-emerald-50 hover:text-emerald-900 font-semibold"
                }`}
              >
                <Icon 
                    size={20} 
                    className={isActive ? "text-white" : "text-emerald-500 group-hover:text-emerald-700"} 
                />
                <span className="text-sm">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer Sidebar */}
        <div className="p-4 border-t border-emerald-50 bg-slate-50/50 shrink-0">
          <div className="bg-white border border-emerald-100 p-3 rounded-2xl flex items-center gap-3 mb-3 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
              <UserCircle size={24} />
            </div>
            <div className="overflow-hidden flex-1">
              <p className="text-sm font-bold text-slate-800 truncate leading-tight">{userName || "Student"}</p>
              <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Mahasiswa</p>
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-start gap-3 px-4 py-2.5 rounded-xl text-red-600 hover:bg-red-50 font-bold transition-all group active:scale-95"
          >
            <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}