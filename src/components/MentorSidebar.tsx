import { GraduationCap, LayoutDashboard, LogOut, UserCircle } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function MentorSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mentorFullName, setMentorFullName] = useState("Loading...");

  useEffect(() => {
    // Membaca nama mentor dari sesi login
    const mentorDataStr = localStorage.getItem("mentor_data");
    if (mentorDataStr) {
      const mentor = JSON.parse(mentorDataStr);
      setMentorFullName(mentor.nama);
    }
  }, []);

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    localStorage.removeItem("mentor_data"); // Hapus data login dari memory
    navigate("/"); // Arahkan kembali ke halaman pilih role
  };

  const menuItems = [
    { name: "Dashboard", path: "/mentor/dashboard", icon: LayoutDashboard },
  ];

  return (
    <aside className="w-64 bg-white border-r border-emerald-100 flex flex-col h-full">
      <div className="p-6 border-b border-emerald-50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center text-white shadow-sm">
            <GraduationCap size={18} />
          </div>
          <div>
            <h1 className="font-black text-emerald-950 leading-none">UniIntern</h1>
            <p className="text-[10px] font-bold text-emerald-600 tracking-widest uppercase mt-1">Internship Portal</p>
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
          <div className="w-10 h-10 rounded-full bg-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
            <UserCircle size={24} />
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-black text-emerald-900 truncate">{mentorFullName}</p>
            <p className="text-[10px] font-medium text-emerald-600 truncate">Mentor</p>
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