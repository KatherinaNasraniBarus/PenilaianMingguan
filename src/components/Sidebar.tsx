import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, FileText, LogOut, GraduationCap } from "lucide-react";

export default function Sidebar() {
  const location = useLocation();

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Submit Report", path: "/submit-report", icon: FileText },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 h-full">
      
      {/* LOGO */}
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white">
          <GraduationCap size={24} />
        </div>
        <div>
          <h1 className="font-bold text-lg leading-tight">UniIntern</h1>
          <p className="text-xs text-slate-500">Internship Portal</p>
        </div>
      </div>

      {/* MENU */}
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                isActive
                  ? "bg-blue-50 text-blue-600 font-semibold"
                  : "text-slate-600 hover:bg-slate-50 font-medium"
              }`}
            >
              <Icon
                size={20}
                className={isActive ? "text-blue-600" : "text-slate-400"}
              />
              <span className="text-sm">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* LOGOUT */}
      <div className="p-4 border-t border-slate-200">
        <button className="w-full flex items-center gap-3 px-3 py-2.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
          <LogOut size={20} />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>

    </aside>
  );
}