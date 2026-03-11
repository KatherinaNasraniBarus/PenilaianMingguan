import { motion } from "motion/react";
import { GraduationCap, Users, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function RoleSelection() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-emerald-50 flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl font-black text-emerald-950 tracking-tight">
          Selamat Datang di Portal
        </h1>
        <p className="text-emerald-700/60 mt-2 font-medium">
          Silakan pilih peran Anda untuk melanjutkan
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        {/* MENTOR */}
        <motion.button
          whileHover={{ scale: 1.05, y: -5 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate("/mentor-login")}
          className="bg-white p-10 rounded-[2.5rem] border-2 border-emerald-100 shadow-xl shadow-emerald-100/50 flex flex-col items-center text-center group hover:border-emerald-500 transition-all duration-300"
        >
          <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 mb-6 group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300">
            <Users size={48} />
          </div>
          <h2 className="text-2xl font-black text-emerald-950 mb-2">Mentor</h2>
          <p className="text-emerald-700/60 text-sm mb-8 leading-relaxed">
            Akses dashboard koordinator untuk memantau perkembangan mahasiswa.
          </p>
          <div className="flex items-center gap-2 text-emerald-600 font-bold group-hover:gap-4 transition-all">
            Pilih Mentor <ArrowRight size={20} />
          </div>
        </motion.button>

        {/* MAHASISWA */}
        <motion.button
          whileHover={{ scale: 1.05, y: -5 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate("/student-login")}
          className="bg-white p-10 rounded-[2.5rem] border-2 border-emerald-100 shadow-xl shadow-emerald-100/50 flex flex-col items-center text-center group hover:border-emerald-500 transition-all duration-300"
        >
          <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 mb-6 group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300">
            <GraduationCap size={48} />
          </div>
          <h2 className="text-2xl font-black text-emerald-950 mb-2">Mahasiswa</h2>
          <p className="text-emerald-700/60 text-sm mb-8 leading-relaxed">
            Kirim laporan mingguan dan pantau poin aktivitas Anda.
          </p>
          <div className="flex items-center gap-2 text-emerald-600 font-bold group-hover:gap-4 transition-all">
            Pilih Mahasiswa <ArrowRight size={20} />
          </div>
        </motion.button>
      </div>

      <p className="mt-16 text-emerald-700/40 text-xs font-bold tracking-widest uppercase">
        © 2026 Student Portal System
      </p>
    </div>
  );
}
