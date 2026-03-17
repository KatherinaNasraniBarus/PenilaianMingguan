import React, { useState, useEffect } from "react";
import { 
  ChevronRight, Info, Activity, Link as LinkIcon, 
  CheckCircle, AlertCircle, Clock, Calendar, Timer, Loader2, X 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion"; 
import { useNavigate } from "react-router-dom";
import logo from "../image/bpjstk.jpeg";

export default function SubmitReport() {
  const navigate = useNavigate();
  
  // State Management
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [studentData, setStudentData] = useState<{ nim: string; nama: string } | null>(null);
  const [submitError, setSubmitError] = useState("");
  const [checkingStatus, setCheckingStatus] = useState(true);
  
  // Logic Status Laporan
  const [currentWeekName, setCurrentWeekName] = useState("Minggu 1");
  const [deadlineText, setDeadlineText] = useState("Sabtu 23:59"); 
  const [isDeadlinePassed, setIsDeadlinePassed] = useState(false);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // State Link Drive (Hanya diisi sekali)
  const [existingDriveLink, setExistingDriveLink] = useState("");
  
  const [formData, setFormData] = useState({
    nama: "", seminar: "", bpu_kepling: "", bpu_keluarga: "", sosialisasi: "",
    video: "", administrasi: "", kunjunganPu: "", kunjunganBpu: "", drive: ""
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const storedNim = localStorage.getItem("userNim");
    const storedName = localStorage.getItem("userName");

    if (!storedNim || !storedName) {
      navigate("/");
      return;
    }

    setStudentData({ nim: storedNim, nama: storedName });
    setFormData(prev => ({ ...prev, nama: storedName }));

    const loadDynamicData = async () => {
      try {
        const [resWeeks, resDl] = await Promise.all([
          fetch("http://localhost/api-penilaian/manage_minggu.php"),
          fetch("http://localhost/api-penilaian/manage_deadlines.php")
        ]);
        
        const dataWeeks = await resWeeks.json();
        const dataDl = await resDl.json();
        
        let loadedWeeks = ["Minggu 1"];
        if (dataWeeks.status === "success" && dataWeeks.data.length > 0) {
          loadedWeeks = dataWeeks.data;
        }
        
        let loadedDl: Record<string, string> = {};
        if (dataDl.status === "success") {
          loadedDl = dataDl.data;
        }

        let activeWeek = loadedWeeks[0];
        const today = new Date();
        today.setHours(0, 0, 0, 0); 

        for (let i = 0; i < loadedWeeks.length; i++) {
          const weekName = loadedWeeks[i];
          const dlDateString = loadedDl[weekName];

          if (dlDateString) {
            const dlDate = new Date(dlDateString);
            dlDate.setHours(23, 59, 59, 999); 

            if (today.getTime() > dlDate.getTime()) {
              if (i + 1 < loadedWeeks.length) {
                activeWeek = loadedWeeks[i + 1];
              } else {
                activeWeek = weekName; 
              }
            } else {
              activeWeek = weekName;
              break;
            }
          }
        }

        setCurrentWeekName(activeWeek);

        if (loadedDl[activeWeek]) {
          const activeDlDate = new Date(loadedDl[activeWeek]);
          const hari = activeDlDate.toLocaleDateString('id-ID', { weekday: 'long' });
          const tgl = activeDlDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
          setDeadlineText(`${hari}, ${tgl} 23:59`);
          
          activeDlDate.setHours(23, 59, 59, 999);
          if (new Date().getTime() > activeDlDate.getTime()) {
            setIsDeadlinePassed(true);
          }
        } else {
          if (today.getDay() === 0) setIsDeadlinePassed(true);
        }

        const resHist = await fetch(`http://localhost/api-penilaian/get_dashboard_mahasiswa.php?nim=${storedNim}`);
        const result = await resHist.json();

        if (result.status === "success" && result.data.length > 0) {
          const savedLink = result.data[0].link_drive;
          if (savedLink) {
            setExistingDriveLink(savedLink);
            setFormData(prev => ({ ...prev, drive: savedLink }));
          }

          const hasSubmittedThisWeek = result.data.some((l: any) => l.minggu === activeWeek);
          if (hasSubmittedThisWeek) setAlreadySubmitted(true);
        }

      } catch (error) {
        console.error("Gagal menarik data:", error);
      } finally {
        setCheckingStatus(false);
      }
    };

    loadDynamicData();
  }, [navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Menghapus error merah saat user mulai mengetik ulang
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");
    let newErrors: Record<string, string> = {};

    // Validasi
    Object.keys(formData).forEach((key) => {
      const skippedFields = ["video", "kunjunganPu", "kunjunganBpu"];
      if (!skippedFields.includes(key) && !formData[key as keyof typeof formData]) {
        newErrors[key] = "Wajib diisi";
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // Notifikasi opsional jika ada field kosong
      setSubmitError("Mohon lengkapi semua kolom yang ditandai merah.");
      return;
    }

    setIsSubmitting(true);
    const payload = {
      nim: studentData?.nim,
      minggu: currentWeekName,
      kehadiran_seminar: formData.seminar,
      akuisisi_bpu_kepling: formData.bpu_kepling, 
      akuisisi_bpu_keluarga: formData.bpu_keluarga, 
      jumlah_sosialisasi: formData.sosialisasi,
      administrasi: formData.administrasi,
      link_drive: formData.drive
    };

    try {
      const response = await fetch("http://localhost/api-penilaian/submit_laporan.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      
      if (result.status === "success") {
        setAlreadySubmitted(true);
        setShowSuccessModal(true); 
      } else {
        setSubmitError(result.message || "Gagal mengirim laporan.");
      }
    } catch (error) {
      setSubmitError("Terjadi kesalahan koneksi ke server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormLocked = isDeadlinePassed || alreadySubmitted || checkingStatus;

  return (
    <div className="flex flex-col min-h-screen bg-emerald-50/20">
      
      <AnimatePresence>
        {showSuccessModal && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} 
              animate={{ scale: 1, y: 0 }} 
              className="bg-white rounded-3xl p-8 max-w-sm w-full text-center relative shadow-2xl"
            >
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-600">
                <CheckCircle size={44} className="animate-pulse" />
              </div>
              <h3 className="text-2xl font-black text-emerald-950 mb-2">Berhasil Terkirim!</h3>
              <p className="text-emerald-700/70 text-sm mb-8">
                Laporan untuk <b>{currentWeekName}</b> telah berhasil disimpan di sistem.
              </p>
              <button 
                onClick={() => {
                  setShowSuccessModal(false);
                  navigate("/dashboard");
                }}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold shadow-lg shadow-emerald-200"
              >
                Kembali ke Dashboard
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="h-16 bg-white border-b border-emerald-100 flex items-center justify-between lg:justify-end px-6 lg:px-8 sticky top-0 z-30 shrink-0 lg:pl-8 pl-16 shadow-sm">
        <div className="flex lg:hidden items-center h-full">
          <img src={logo} alt="Logo BPJS TK" className="h-10 w-auto object-contain" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-emerald-700/70 hidden sm:inline">Student Portal</span>
          <ChevronRight size={16} className="text-emerald-200 hidden sm:inline" />
          <span className="text-sm font-bold text-emerald-900 hidden sm:inline">Overview</span>
        </div>
      </header>

      <main className="flex-1 p-6 max-w-4xl mx-auto w-full pb-20">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-emerald-950 tracking-tight">Kirim Laporan Mingguan</h2>
          <div className="flex gap-3 mt-4">
             <div className="bg-white border border-emerald-100 px-4 py-1.5 rounded-full text-xs font-bold text-emerald-600 shadow-sm">
                {currentWeekName}
             </div>
             <div className="bg-emerald-50 border border-emerald-100 px-4 py-1.5 rounded-full text-xs font-bold text-emerald-700 shadow-sm">
                Deadline: {deadlineText}
             </div>
          </div>
        </div>

        {submitError && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-800 rounded-r-xl flex items-center gap-3">
            <AlertCircle size={20} />
            <p className="font-bold text-sm">{submitError}</p>
          </div>
        )}

        {alreadySubmitted && (
           <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center gap-3">
              <CheckCircle size={20} className="text-emerald-500" />
              <p className="font-bold text-sm">Anda sudah mengirimkan laporan untuk minggu ini.</p>
           </div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Section Data Mahasiswa */}
          <section className="bg-white p-6 rounded-2xl border border-emerald-100 shadow-sm">
            <label className="text-sm font-bold text-emerald-700">Nama Mahasiswa</label>
            <input type="text" value={formData.nama} readOnly className="w-full mt-2 bg-slate-50 border-slate-200 rounded-xl px-4 py-3 text-slate-500 font-bold cursor-not-allowed" />
          </section>

          {/* Section Aktivitas */}
          <section className="bg-white p-8 rounded-2xl border border-emerald-100 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600"><Activity size={20} /></div>
              <h3 className="text-lg font-bold text-emerald-900">Aktivitas Mingguan</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {[
                { label: "Kehadiran Seminar", name: "seminar" },
                { label: "Akuisisi BPU Kepling", name: "bpu_kepling" },
                { label: "Akuisisi BPU Keluarga", name: "bpu_keluarga" },
                { label: "Jumlah Sosialisasi", name: "sosialisasi" },
                { label: "Administrasi dan Laporan", name: "administrasi" },
              ].map((item) => (
                <div key={item.name}>
                  <label className={`text-xs font-bold ml-1 ${errors[item.name] ? 'text-red-600' : 'text-emerald-800'}`}>
                    {item.label}
                  </label>
                  <input 
                    type="number" 
                    name={item.name} 
                    value={formData[item.name as keyof typeof formData] || ""} 
                    onChange={handleChange} 
                    disabled={isFormLocked}
                    className={`w-full mt-1 border rounded-xl px-4 py-3 outline-none focus:ring-2 transition-all disabled:opacity-50 ${
                      errors[item.name] 
                        ? 'border-red-400 bg-red-50 focus:ring-red-500 text-red-900' 
                        : 'border-emerald-100 bg-emerald-50/30 focus:ring-emerald-500'
                    }`} 
                  />
                  {errors[item.name] && (
                    <span className="text-[11px] font-bold text-red-500 ml-1 flex items-center gap-1 mt-1.5">
                      <AlertCircle size={12} /> {errors[item.name]}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Section Link Evidence */}
          <section className={`bg-white p-8 rounded-2xl border ${isFormLocked && !existingDriveLink ? 'opacity-50' : 'border-emerald-100 shadow-sm'}`}>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600"><LinkIcon size={20} /></div>
              <h3 className="text-lg font-bold text-emerald-900">Link Evidence</h3>
            </div>
            
            <div className="space-y-2">
              <label className={`text-sm font-bold ml-1 ${errors.drive ? 'text-red-600' : 'text-emerald-700'}`}>
                Google Drive Link
              </label>
              
              {existingDriveLink ? (
                <div className="flex items-center justify-between p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <div className="flex items-center gap-3 truncate">
                    <CheckCircle size={18} className="text-emerald-500 shrink-0" />
                    <span className="text-sm text-emerald-800 truncate font-medium">{existingDriveLink}</span>
                  </div>
                </div>
              ) : (
                <>
                  <input
                    type="url" name="drive"
                    value={formData.drive}
                    onChange={handleChange}
                    disabled={isFormLocked}
                    placeholder="https://drive.google.com/..."
                    className={`w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 transition-all ${
                      errors.drive 
                        ? 'border-red-400 bg-red-50 focus:ring-red-500 text-red-900' 
                        : 'border-emerald-100 bg-emerald-50/30 focus:ring-emerald-500'
                    }`}
                  />
                  {errors.drive && (
                    <span className="text-[11px] font-bold text-red-500 ml-1 flex items-center gap-1 mt-1.5">
                      <AlertCircle size={12} /> {errors.drive}
                    </span>
                  )}
                </>
              )}
              <p className="text-[11px] text-emerald-600/60 italic mt-2">
                * Link Google Drive hanya diinput sekali pada laporan pertama.
              </p>
            </div>
          </section>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={isFormLocked || isSubmitting}
              className={`px-10 py-4 rounded-2xl font-black text-white shadow-xl transition-all active:scale-95 ${
                isFormLocked ? "bg-slate-300 cursor-not-allowed shadow-none" : "bg-emerald-600 hover:bg-emerald-700"
              }`}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2"><Loader2 className="animate-spin" /> Mengirim...</div>
              ) : alreadySubmitted ? (
                "Laporan Terkirim"
              ) : (
                "Submit Laporan Sekarang"
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}