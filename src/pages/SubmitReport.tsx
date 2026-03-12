import React, { useState, useEffect } from "react";
import { 
  ChevronRight, 
  Info, 
  Activity, 
  Link as LinkIcon, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  Calendar,
  Timer
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
// 1. Tambahkan import logo di sini
import logo from "../image/logobpjss.png";

export default function SubmitReport() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    nama: "",
    seminar: "",
    pu: "",
    bpu: "",
    sosialisasi: "",
    video: "",
    administrasi: "",
    kunjunganPu: "",
    kunjunganBpu: "",
    drive: ""
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const day = currentTime.getDay();
  const hour = currentTime.getHours();
  const minute = currentTime.getMinutes();

  // Deadline: Tuesday (2) at 23:59
  const passedDeadline =
    day > 2 || (day === 2 && (hour > 23 || (hour === 23 && minute > 59)));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });

    setErrors({
      ...errors,
      [e.target.name]: ""
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let newErrors: Record<string, string> = {};

    Object.keys(formData).forEach((key) => {
      if (!formData[key as keyof typeof formData]) {
        newErrors[key] = "Tidak boleh kosong";
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSubmitted(true);
  };

  return (
    <div className="flex flex-col h-full bg-emerald-50/20 min-h-screen">
      {/* 2. HEADER SAMA SEPERTI DI DASHBOARD */}
      <header className="h-16 bg-white/80 backdrop-blur-md border-b border-emerald-100 flex items-center justify-between px-6 lg:px-8 sticky top-0 z-20 shrink-0 lg:pl-8 pl-16">
        {/* Bagian Kiri: Logo dan Teks */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center border border-emerald-50 shrink-0 p-0.5">
            <img 
              src={logo} 
              alt="Logo BPJS TK" 
              className="w-full h-full object-contain" 
            />
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-black text-emerald-950 tracking-tighter leading-none">SATU</h1>
            <div className="flex items-center gap-1 mt-0.5">
              <div className="h-[2px] w-2 bg-emerald-500 rounded-full"></div>
              <p className="text-[8px] font-black text-emerald-600 tracking-[0.2em] uppercase">BPJS TK</p>
            </div>
          </div>
        </div>

        {/* Bagian Kanan: Breadcrumb */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-emerald-700/70 hidden sm:inline">Laporan</span>
          <ChevronRight size={14} className="text-emerald-200 hidden sm:inline" />
          <span className="text-sm font-bold text-emerald-900 hidden sm:inline">Laporan Mingguan</span>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-8 max-w-4xl mx-auto w-full">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h2 className="text-3xl font-bold text-emerald-950 mb-2 tracking-tight">
            Laporan Mingguan Mahasiswa
          </h2>
          
          {/* ENHANCED DEADLINE UI */}
          <div className="flex flex-wrap items-center gap-3 mb-8 mt-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-emerald-100 rounded-full shadow-sm">
              <Calendar size={14} className="text-emerald-500" />
              <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Periode Mingguan</span>
            </div>
            
            <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full border shadow-sm transition-colors duration-300 ${
              passedDeadline 
                ? "bg-red-50 border-red-100 text-red-700" 
                : "bg-emerald-50 border-emerald-100 text-emerald-700"
            }`}>
              <Clock size={14} className={passedDeadline ? "text-red-500" : "text-emerald-500"} />
              <span className="text-sm font-bold">
                Deadline: Selasa, 23:59 WIB
              </span>
            </div>

            {!passedDeadline && (
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium italic animate-pulse">
                <Timer size={12} />
                Sistem menerima laporan minggu ini
              </div>
            )}
          </div>

          <AnimatePresence>
            {passedDeadline && !submitted && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-8 p-4 bg-amber-50 border-l-4 border-amber-400 rounded-r-lg flex items-start gap-3 text-amber-800 shadow-sm"
              >
                <AlertCircle size={20} className="text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-sm">Deadline Minggu Ini Terlewati</p>
                  <p className="text-xs opacity-90 mt-1">Laporan yang Anda kirimkan sekarang akan secara otomatis tercatat untuk periode minggu berikutnya.</p>
                </div>
              </motion.div>
            )}

            {submitted && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-8 p-5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-4 text-emerald-700 shadow-sm"
              >
                <div className="bg-emerald-500 p-2 rounded-full text-white">
                  <CheckCircle size={24} />
                </div>
                <div>
                  <p className="font-bold text-lg text-emerald-900">Laporan Terkirim!</p>
                  <p className="text-sm text-emerald-600">Terima kasih telah memperbarui aktivitas mingguan Anda tepat waktu.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <form className="space-y-8" onSubmit={handleSubmit}>
            {/* NAMA */}
            <section className="bg-white p-8 rounded-2xl border border-emerald-100 shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                  <Info size={20} />
                </div>
                <h3 className="text-xl font-bold text-emerald-900">Data Mahasiswa</h3>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-emerald-700 ml-1">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  name="nama"
                  value={formData.nama}
                  onChange={handleChange}
                  placeholder="Masukkan nama sesuai KTM"
                  className={`w-full rounded-xl border px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all duration-200 ${
                    errors.nama ? "border-red-300 bg-red-50" : "border-emerald-100 bg-emerald-50/20"
                  }`}
                />
                {errors.nama && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-500 text-xs font-medium mt-1 ml-1">{errors.nama}</motion.p>
                )}
              </div>
            </section>

            {/* AKTIVITAS */}
            <section className="bg-white p-8 rounded-2xl border border-emerald-100 shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                  <Activity size={20} />
                </div>
                <h3 className="text-xl font-bold text-emerald-900">Aktivitas Mingguan</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                {[
                  { label: "Kehadiran Seminar", name: "seminar" },
                  { label: "Akuisisi PU", name: "pu" },
                  { label: "Akuisisi BPU", name: "bpu" },
                  { label: "Jumlah Sosialisasi", name: "sosialisasi" },
                  { label: "Jumlah Video Viralisasi", name: "video" },
                  { label: "Administrasi dan Laporan", name: "administrasi" },
                  { label: "Kunjungan PU", name: "kunjunganPu" },
                  { label: "Kunjungan BPU", name: "kunjunganBpu" }
                ].map((item, index) => (
                  <div key={index} className="space-y-2">
                    <label className="text-sm font-bold text-emerald-700 ml-1">
                      {item.label}
                    </label>
                    <input
                      type="number"
                      min="0"
                      name={item.name}
                      value={formData[item.name as keyof typeof formData]}
                      onChange={handleChange}
                      className={`w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all duration-200 ${
                        errors[item.name] ? "border-red-300 bg-red-50" : "border-emerald-100 bg-emerald-50/20"
                      }`}
                    />
                    {errors[item.name] && (
                      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-500 text-xs font-medium mt-1 ml-1">{errors[item.name]}</motion.p>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* LINK DRIVE */}
            <section className="bg-white p-8 rounded-2xl border border-emerald-100 shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                  <LinkIcon size={20} />
                </div>
                <h3 className="text-xl font-bold text-emerald-900">Link Evidence</h3>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-emerald-700 ml-1">
                  Link Google Drive
                </label>
                <input
                  type="url"
                  name="drive"
                  value={formData.drive}
                  onChange={handleChange}
                  placeholder="https://drive.google.com/..."
                  className={`w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all duration-200 ${
                    errors.drive ? "border-red-300 bg-red-50" : "border-emerald-100 bg-emerald-50/20"
                  }`}
                />
                {errors.drive && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-500 text-xs font-medium mt-1 ml-1">{errors.drive}</motion.p>
                )}
                <p className="text-[10px] text-emerald-400 mt-2 italic ml-1">
                  *Pastikan link dapat diakses oleh koordinator
                </p>
              </div>
            </section>

            {/* BUTTON */}
            <div className="flex justify-end pt-6 pb-16">
              <motion.button
                whileHover={!submitted ? { scale: 1.02 } : {}}
                whileTap={!submitted ? { scale: 0.98 } : {}}
                type="submit"
                disabled={submitted}
                className={`px-10 py-4 rounded-2xl text-white font-bold shadow-lg flex items-center gap-3 transition-all duration-300
                ${submitted 
                  ? "bg-slate-300 cursor-not-allowed shadow-none" 
                  : "bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 shadow-emerald-200"}`}
              >
                {submitted ? <CheckCircle size={22} /> : <CheckCircle size={22} className="animate-pulse" />}
                {submitted ? "Laporan Terkirim" : "Submit Laporan Sekarang"}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </main>
    </div>
  );
}