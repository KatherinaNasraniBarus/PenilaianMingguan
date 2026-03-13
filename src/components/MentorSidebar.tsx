import { LayoutDashboard, Users, ClipboardCheck, BarChart2, LogOut, UserCircle, X } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import logo from "../image/logobpjss.png";

interface MentorSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MentorSidebar({ isOpen, onClose }: MentorSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [mentorName, setMentorName] = useState<string>("");

  useEffect(() => {
    const mentorDataStr = localStorage.getItem("mentor_data");
    if (mentorDataStr) {
      const mentor = JSON.parse(mentorDataStr);
      setMentorName(mentor.nama);
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const menuItems = [
    { name: "Dashboard", path: "/mentor/dashboard", icon: LayoutDashboard },
  ];

  return (
    <>
      {/* OVERLAY — mobile only */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* SIDEBAR — identik dengan Sidebar.tsx mahasiswa */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-emerald-100 flex flex-col h-full shrink-0 transform transition-transform duration-300 ease-in-out shadow-2xl lg:shadow-none ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        {/* Header */}
        <div className="p-6 border-b border-emerald-50 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm border border-emerald-100 shrink-0 overflow-hidden p-1">
              <img src={logo} alt="Logo BPJS TK" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-emerald-950 tracking-tighter leading-none">SATU</h1>
              <div className="flex items-center gap-1 mt-1">
                <div className="h-[2px] w-3 bg-emerald-500 rounded-full"></div>
                <p className="text-[9px] font-black text-emerald-600 tracking-[0.2em] uppercase">BPJS TK</p>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-2 text-emerald-600 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all active:scale-95 bg-emerald-50"
            aria-label="Close sidebar"
          >
            <X size={20} strokeWidth={2.5} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
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
                    : "text-emerald-700/70 hover:bg-emerald-50 hover:text-emerald-900 font-medium"
                }`}
              >
                <Icon
                  size={20}
                  strokeWidth={isActive ? 2.5 : 2}
                  className={isActive ? "text-white" : "text-emerald-500 group-hover:text-emerald-700 transition-colors"}
                />
                <span className="text-sm">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer — profil & logout */}
        <div className="p-4 border-t border-emerald-50 bg-slate-50/50 shrink-0">
          <div className="bg-white border border-emerald-100 p-3 rounded-2xl flex items-center gap-3 mb-3 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
              <UserCircle size={24} strokeWidth={2} />
            </div>
            <div className="overflow-hidden flex-1">
              <p className="text-sm font-bold text-slate-800 truncate">{mentorName || "Mentor"}</p>
              <p className="text-[11px] font-semibold text-emerald-600 truncate">Mentor</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-start gap-3 px-4 py-2.5 rounded-xl text-red-600 hover:bg-red-50 hover:text-red-700 font-bold transition-all border border-transparent hover:border-red-100 group active:scale-95"
          >
            <LogOut size={18} strokeWidth={2.5} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}