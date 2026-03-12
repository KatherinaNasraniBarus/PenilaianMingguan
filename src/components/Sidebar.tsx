import { LayoutDashboard, ClipboardList, LogOut, UserCircle } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import logo from "../image/logobpjss.png";

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [userName, setUserName] = useState<string>("");

  useEffect(() => {
    const storedName = localStorage.getItem("userName");
    if (storedName) {
      setUserName(storedName);
    }
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
    <aside className="w-64 bg-white border-r border-emerald-100 flex flex-col h-full shrink-0">
      <div className="p-8 border-b border-emerald-50">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-emerald-50 shrink-0 overflow-hidden p-1">
             <img 
              src={logo}
              alt="Logo"
              className="w-full h-full object-contain"
            />
            </div>
            <div>
              <h1 className="text-3xl font-black text-emerald-950 tracking-tighter leading-none">SATU</h1>
              <div className="flex items-center gap-1 mt-1">
                <div className="h-[2px] w-3 bg-emerald-500"></div>
                <p className="text-[10px] font-black text-emerald-600 tracking-[0.25em] uppercase">BPJS TK</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-100"
                  : "text-emerald-700/60 hover:bg-emerald-50 hover:text-emerald-700"
              }`}
            >
              <Icon size={20} className={isActive ? "text-white" : "group-hover:text-emerald-600"} />
              <span className="font-bold text-sm">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-emerald-50">
        <div className="bg-emerald-50/50 p-4 rounded-2xl flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-emerald-200 flex items-center justify-center text-emerald-700">
            <UserCircle size={24} />
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-black text-emerald-900 truncate">{userName}</p>
            <p className="text-[10px] font-medium text-emerald-600 truncate">Mahasiswa</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-colors group"
        >
          <LogOut size={20} />
          <span className="font-bold text-sm">Logout</span>
        </button>
      </div>
    </aside>
  );
}