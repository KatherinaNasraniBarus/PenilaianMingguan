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
  Timer,
  Loader2,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";
import logo from "../image/logobpjss.png";

const PROGRAM_START_DATE = new Date("2026-03-02T00:00:00"); 

export default function SubmitReport() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [studentData, setStudentData] = useState<{ nim: string; nama: string } | null>(null);
  const [submitError, setSubmitError] = useState("");
  
  const [currentWeekName, setCurrentWeekName] = useState("Minggu 1");
  const [isDeadlinePassed, setIsDeadlinePassed] = useState(false);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [justSubmitted, setJustSubmitted] = useState(false);
  
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  const [formData, setFormData] = useState({
    nama: "", seminar: "", pu: "", bpu: "", sosialisasi: "",
    video: "", administrasi: "", kunjunganPu: "", kunjunganBpu: "", drive: ""
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const today = new Date();
    const diffTime = today.getTime() - PROGRAM_START_DATE.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    let weekNumber = Math.floor(diffDays / 7) + 1;
    if (weekNumber < 1) weekNumber = 1; 
    
    const weekName = `Minggu ${weekNumber}`;
    setCurrentWeekName(weekName);

    const day = today.getDay();
    if (day === 0) {
      setIsDeadlinePassed(true);
    }

    const storedNim = localStorage.getItem("userNim");
    const storedName = localStorage.getItem("userName");

    if (storedNim && storedName) {
      setStudentData({ nim: storedNim, nama: storedName });
      setFormData(prev => ({ ...prev, nama: storedName }));

      // PERBAIKAN LOGIKA PENGECEKAN DI SINI:
      fetch(`http://localhost/api-penilaian/get_dashboard_mahasiswa.php?nim=${storedNim}`)
        .then(res => res.json())
        .then(result => {
          if (result.status === "success") {
            // Karena PHP sekarang merespons dengan Array (banyak riwayat minggu),
            // kita harus mencari apakah ada data laporan yang cocok dengan minggu saat ini.
            const hasSubmittedThisWeek = result.data.some((laporan: any) => laporan.minggu === weekName);
            
            if (hasSubmittedThisWeek) {
              setAlreadySubmitted(true);
            }
          }
        })
        .finally(() => setCheckingStatus(false));
    } else {
      navigate("/");
    }
  }, [navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");

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

    if (!studentData?.nim) {
      setSubmitError("Sesi login Anda tidak valid. Silakan login ulang.");
      return;
    }

    setIsSubmitting(true);

    const payload = {
      nim: studentData.nim,
      minggu: currentWeekName,
      kehadiran_seminar: formData.seminar,
      akuisisi_pu: formData.pu,
      akuisisi_bpu: formData.bpu,
      jumlah_sosialisasi: formData.sosialisasi,
      video_viralisasi: formData.video,
      administrasi: formData.administrasi,
      kunjungan_pu: formData.kunjunganPu,
      kunjungan_bpu: formData.kunjunganBpu,
      link_drive: formData.drive
    };

    try {
      const response = await fetch("http://localhost/api-penilaian/submit_laporan.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok && result.status === "success") {
        setJustSubmitted(true);
        setAlreadySubmitted(true); 
        setShowSuccessModal(true); 
      } else {
        setSubmitError(result.message || "Gagal mengirim laporan. Coba lagi nanti.");
      }
    } catch (error) {
      setSubmitError("Terjadi kesalahan koneksi ke server. Pastikan XAMPP menyala.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormLocked = isDeadlinePassed || alreadySubmitted || checkingStatus;

  return (
    <div className="flex flex-col min-h-full bg-emerald-50/20">

      {/* ─── POPUP SUCCESS MODAL ─── */}
      <AnimatePresence>
        {showSuccessModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-950/40 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl flex flex-col items-center text-center relative"
            >
              <button 
                onClick={() => setShowSuccessModal(false)}
                className="absolute top-4 right-4 text-emerald-200 hover:text-emerald-600 transition-colors"
              >
                <X size={20} />
              </button>

              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6 text-emerald-500 shadow-inner">
                <CheckCircle size={40} className="animate-pulse" />
              </div>
              
              <h3 className="text-2xl font-black text-emerald-950 mb-2">Laporan Diterima!</h3>
              <p className="text-emerald-700/70 text-sm mb-8">
                Luar biasa! Laporan aktivitas Anda untuk <b>{currentWeekName}</b> telah berhasil dikirim ke Mentor.
              </p>
              
              <button
                onClick={() => setShowSuccessModal(false)}
                className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all active:scale-95 shadow-lg shadow-emerald-200"
              >
                Tutup & Lihat Laporan
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* ─── END POPUP ─── */}

      <header className="h-16 bg-white/80 backdrop-blur-md border-b border-emerald-100 flex items-center justify-between lg:justify-end px-6 lg:px-8 sticky top-0 z-30 shrink-0 lg:pl-8 pl-16">
        <div className="flex lg:hidden items-center gap-3">
          <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center border border-emerald-50 shrink-0 p-0.5">
            <img src={logo} alt="Logo BPJS TK" className="w-full h-full object-contain" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-black text-emerald-950 tracking-tighter leading-none">SATU</h1>
            <div className="flex items-center gap-1 mt-0.5">
              <div className="h-[2px] w-2 bg-emerald-500 rounded-full"></div>
              <p className="text-[8px] font-black text-emerald-600 tracking-[0.2em] uppercase">BPJS TK</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-emerald-700/70 hidden sm:inline">Laporan</span>
          <ChevronRight size={14} className="text-emerald-200 hidden sm:inline" />
          <span className="text-sm font-bold text-emerald-900 hidden sm:inline">Laporan Mingguan</span>
        </div>
      </header>

      <main className="flex-1 p-6 md:p-8 max-w-4xl mx-auto w-full pb-20">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <h2 className="text-3xl font-bold text-emerald-950 mb-2 tracking-tight">
            Laporan Mingguan Mahasiswa
          </h2>

          <div className="flex flex-wrap items-center gap-3 mb-8 mt-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-emerald-100 rounded-full shadow-sm">
              <Calendar size={14} className="text-emerald-500" />
              <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">
                {checkingStatus ? "Menghitung..." : currentWeekName}
              </span>
            </div>
            
            <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full border shadow-sm transition-colors duration-300 ${
              isDeadlinePassed ? "bg-red-50 border-red-100 text-red-700" : "bg-emerald-50 border-emerald-100 text-emerald-700"
            }`}>
              <Clock size={14} className={isDeadlinePassed ? "text-red-500" : "text-emerald-500"} />
              <span className="text-sm font-bold">Deadline: Sabtu, 23:59 WIB</span>
            </div>

            {!isDeadlinePassed && !alreadySubmitted && !checkingStatus && (
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium italic animate-pulse">
                <Timer size={12} />
                Sistem menerima laporan minggu ini
              </div>
            )}
          </div>

          <AnimatePresence>
            {submitError && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                className="mb-8 p-4 bg-red-50 border-l-4 border-red-400 rounded-r-lg flex items-start gap-3 text-red-800 shadow-sm"
              >
                <AlertCircle size={20} className="text-red-500 shrink-0 mt-0.5" />
                <p className="font-bold text-sm">{submitError}</p>
              </motion.div>
            )}

            {isDeadlinePassed && !alreadySubmitted && !checkingStatus && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                className="mb-8 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg flex items-start gap-3 text-red-800 shadow-sm"
              >
                <AlertCircle size={20} className="text-red-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-sm">Waktu Pelaporan Habis</p>
                  <p className="text-xs opacity-90 mt-1">Batas waktu pelaporan untuk {currentWeekName} adalah hari Sabtu. Form ditutup hari ini dan akan kembali terbuka besok (Senin) untuk minggu berikutnya.</p>
                </div>
              </motion.div>
            )}

            {alreadySubmitted && !checkingStatus && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                className="mb-8 p-5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-4 text-emerald-700 shadow-sm"
              >
                <div className="bg-emerald-500 p-2 rounded-full text-white">
                  <CheckCircle size={24} />
                </div>
                <div>
                  <p className="font-bold text-lg text-emerald-900">{justSubmitted ? "Laporan Baru Saja Terkirim!" : "Laporan Sudah Tercatat"}</p>
                  <p className="text-sm text-emerald-600">Anda telah menyelesaikan kewajiban laporan untuk <b>{currentWeekName}</b>.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <form className="space-y-8" onSubmit={handleSubmit}>
            <section className={`bg-white p-8 rounded-2xl border ${isFormLocked ? 'border-slate-100 opacity-70' : 'border-emerald-100 shadow-sm hover:shadow-md transition-shadow duration-300'}`}>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600"><Info size={20} /></div>
                <h3 className="text-xl font-bold text-emerald-900">Data Mahasiswa</h3>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-emerald-700 ml-1">Nama Lengkap</label>
                <input
                  type="text" name="nama" value={formData.nama} readOnly 
                  className={`w-full rounded-xl border px-4 py-3 outline-none transition-all duration-200 ${
                    errors.nama ? "border-red-300 bg-red-50" : "border-slate-200 bg-slate-50 cursor-not-allowed text-slate-700 font-bold"
                  }`}
                />
              </div>
            </section>

            <section className={`bg-white p-8 rounded-2xl border ${isFormLocked ? 'border-slate-100 opacity-70' : 'border-emerald-100 shadow-sm hover:shadow-md transition-shadow duration-300'}`}>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600"><Activity size={20} /></div>
                <h3 className="text-xl font-bold text-emerald-900">Aktivitas Mingguan</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                {[
                  { label: "Kehadiran Seminar", name: "seminar" }, { label: "Akuisisi PU", name: "pu" },
                  { label: "Akuisisi BPU", name: "bpu" }, { label: "Jumlah Sosialisasi", name: "sosialisasi" },
                  { label: "Jumlah Video Viralisasi", name: "video" }, { label: "Administrasi dan Laporan", name: "administrasi" },
                  { label: "Kunjungan PU", name: "kunjunganPu" }, { label: "Kunjungan BPU", name: "kunjunganBpu" }
                ].map((item, index) => (
                  <div key={index} className="space-y-2">
                    <label className="text-sm font-bold text-emerald-700 ml-1">{item.label}</label>
                    <input
                      type="number" min="0" name={item.name} value={formData[item.name as keyof typeof formData]}
                      onChange={handleChange} disabled={isFormLocked}
                      className={`w-full border rounded-xl px-4 py-3 outline-none transition-all duration-200 ${
                        isFormLocked ? "bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed" : 
                        errors[item.name] ? "border-red-300 bg-red-50 focus:ring-2 focus:ring-red-500" : "border-emerald-100 bg-emerald-50/20 focus:ring-2 focus:ring-emerald-500 cursor-text"
                      }`}
                    />
                  </div>
                ))}
              </div>
            </section>

            <section className={`bg-white p-8 rounded-2xl border ${isFormLocked ? 'border-slate-100 opacity-70' : 'border-emerald-100 shadow-sm hover:shadow-md transition-shadow duration-300'}`}>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600"><LinkIcon size={20} /></div>
                <h3 className="text-xl font-bold text-emerald-900">Link Evidence</h3>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-emerald-700 ml-1">Link Google Drive</label>
                <input
                  type="url" name="drive" value={formData.drive} onChange={handleChange} disabled={isFormLocked}
                  placeholder="https://drive.google.com/..."
                  className={`w-full border rounded-xl px-4 py-3 outline-none transition-all duration-200 ${
                    isFormLocked ? "bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed" : 
                    errors.drive ? "border-red-300 bg-red-50 focus:ring-2 focus:ring-red-500" : "border-emerald-100 bg-emerald-50/20 focus:ring-2 focus:ring-emerald-500 cursor-text"
                  }`}
                />
              </div>
            </section>

            <div className="flex justify-end pt-6 pb-16">
              <motion.button
                whileHover={!isFormLocked && !isSubmitting ? { scale: 1.02 } : {}}
                whileTap={!isFormLocked && !isSubmitting ? { scale: 0.98 } : {}}
                type="submit" disabled={isFormLocked || isSubmitting}
                className={`px-10 py-4 rounded-2xl font-bold shadow-lg flex items-center gap-3 transition-all duration-300
                ${isFormLocked 
                  ? "bg-slate-300 text-white cursor-not-allowed shadow-none" 
                  : isSubmitting
                    ? "bg-emerald-500 text-white opacity-80 cursor-wait"
                    : "bg-gradient-to-r from-emerald-600 to-green-600 text-white hover:from-emerald-700 hover:to-green-700 shadow-emerald-200"}`}
              >
                {checkingStatus ? <Loader2 size={22} className="animate-spin" /> : 
                 isFormLocked ? <CheckCircle size={22} /> : 
                 isSubmitting ? <Loader2 size={22} className="animate-spin" /> : <CheckCircle size={22} className="animate-pulse" />}
                
                {checkingStatus ? "Memeriksa Status..." :
                 alreadySubmitted ? "Laporan Terkunci" :
                 isDeadlinePassed ? "Deadline Terlewati" :
                 isSubmitting ? "Mengirim Data..." : "Submit Laporan Sekarang"}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </main>
    </div>
  );
}