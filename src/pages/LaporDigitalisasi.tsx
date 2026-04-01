import { useState, useEffect } from "react";
import { Laptop, Send, Loader2, FileText, Link as LinkIcon, CheckCircle2, ChevronRight, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import logo from "../image/bpjstk.png";

export default function LaporDigitalisasi() {
  const navigate = useNavigate();

  const [userName, setUserName] = useState("");
  const [userNim, setUserNim]   = useState("");
  
  // 🚀 STATE BARU UNTUK PILIHAN TUGAS
  const [availableTasks, setAvailableTasks] = useState<any[]>([]);
  const [selectedTask, setSelectedTask]     = useState<any | null>(null);

  // State untuk Dynamic Form (Diisi ketika tugas dipilih)
  const [formMinggu, setFormMinggu]   = useState("");
  const [formFields, setFormFields]   = useState<any[]>([]);
  const [formData, setFormData]       = useState<Record<string, string>>({});
  
  const [isLoadingForm, setIsLoadingForm] = useState(true);
  const [isSubmitting, setIsSubmitting]   = useState(false);
  const [errorMessage, setErrorMessage]   = useState("");
  
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [submittedWeekName, setSubmittedWeekName] = useState("");

  const TARGET_MENTOR = "BOY TOBING";

  // 🚀 FUNGSI BARU UNTUK MENGAMBIL DAFTAR TUGAS AKTIF
  const fetchActiveTasks = (nim: string) => {
    setIsLoadingForm(true);
    fetch(`https://api-penilaian.vercel.app/get_form_active.php?nim=${nim}&t=${new Date().getTime()}`)  
      .then(async (r) => {
        const text = await r.text();
        try {
          return JSON.parse(text);
        } catch (err) {
          throw new Error("Balasan server berantakan.");
        }
      })
      .then(res => {
        if (res.status === "success" && res.data) {
          setAvailableTasks(res.data);
          setErrorMessage("");
        } else {
          setAvailableTasks([]);
          setErrorMessage(res.message || "Semua tugas sudah selesai!");
        }
      })
      .catch(() => setErrorMessage("Gagal menghubungkan ke server untuk mengambil tugas."))
      .finally(() => setIsLoadingForm(false));
  };

  useEffect(() => {
    const nim  = localStorage.getItem("userNim");
    const name = localStorage.getItem("userName");
    
    if (!nim) {
      navigate("/");
      return;
    }
    
    if (name) setUserName(name);
    setUserNim(nim);

    fetchActiveTasks(nim);
  }, [navigate]);

  // 🚀 FUNGSI KETIKA MAHASISWA MEMILIH TUGAS
  const handleSelectTask = (task: any) => {
    setSelectedTask(task);
    setFormMinggu(task.minggu);
    setFormFields(task.form);
    
    // Siapkan kotak kosong sesuai form yang dipilih
    const initialData: Record<string, string> = {};
    task.form.forEach((field: any) => {
      initialData[field.id] = "";
    });
    setFormData(initialData);
  };

  const handleInputChange = (fieldId: string, value: string) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
  };

  const submitDigitalisasi = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    fetch("https://api-penilaian.vercel.app/submit_digitalisasi.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nim: userNim,
        nama: userName,
        mentor: TARGET_MENTOR,
        minggu: formMinggu,
        jawaban: formData 
      })
    })
    .then(r => r.json())
    .then(data => {
      if (data.status === "success") {
        setSubmittedWeekName(formMinggu);
        setShowSuccessModal(true);
        setFormData({});
        setSelectedTask(null); // 🚀 KEMBALI KE MENU PILIHAN SETELAH SUKSES
        fetchActiveTasks(userNim); 
      } else {
        alert("❌ Gagal menyimpan laporan: " + data.message);
      }
    })
    .catch(() => alert("Terjadi kesalahan koneksi saat mengirim laporan!"))
    .finally(() => setIsSubmitting(false));
  };

  return (
    <div className="min-h-screen bg-emerald-50/30 pb-20 selection:bg-emerald-200 relative">
      
      {/* 🚀 POP-UP MODAL SUKSES MENGIRIM LAPORAN */}
      <AnimatePresence>
        {showSuccessModal && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.9, opacity: 0, y: 20 }} 
              className="bg-white rounded-[2rem] p-8 max-w-sm w-full shadow-2xl text-center border border-emerald-100 flex flex-col items-center"
            >
              <div className="w-20 h-20 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mb-5 shadow-inner">
                <CheckCircle2 size={48} />
              </div>
              <h3 className="text-2xl font-black text-emerald-950 mb-2">Kerja Bagus!</h3>
              <p className="text-emerald-700/80 font-medium mb-8">
                Laporan <strong className="text-emerald-900">{submittedWeekName}</strong> telah berhasil dikirim ke mentor Anda.
              </p>
              <button 
                onClick={() => setShowSuccessModal(false)}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl transition-all active:scale-95 shadow-lg shadow-emerald-200"
              >
                Oke, Lanjut!
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── HEADER NAVBAR (SUDAH DIPERBAIKI) ─── */}
      <header className="h-16 bg-white/90 backdrop-blur-md border-b border-emerald-100 flex items-center justify-between lg:justify-end px-6 lg:px-8 sticky top-0 z-30 shrink-0 lg:pl-8 pl-16 shadow-sm">
        {/* Logo BPJS Muncul Khusus di Layar HP/Mobile */}
        <div className="flex lg:hidden items-center h-full">
          <img src={logo} alt="BPJS Ketenagakerjaan" className="h-10 w-auto object-contain" />
        </div>
        
        {/* Breadcrumb Teks Muncul Khusus di Layar Laptop/Desktop */}
        <div className="flex items-center gap-2">
          <span className="text-xs sm:text-sm font-medium text-emerald-700/70 hidden sm:inline">Mahasiswa</span>
          <ChevronRight size={16} className="text-emerald-300 hidden sm:inline" />
          <span className="text-xs sm:text-sm font-bold text-emerald-950 hidden sm:inline">Task Lists</span>
        </div>
      </header>

      <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto w-full mt-4 sm:mt-6">
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-emerald-50 overflow-hidden relative">
          
          <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-br from-emerald-600 to-emerald-800 opacity-10"></div>

          <div className="px-6 py-6 sm:px-10 sm:py-10 flex items-center gap-4 relative z-10 border-b border-emerald-50">
            <div className="p-4 bg-gradient-to-br from-emerald-500 to-emerald-700 text-white rounded-2xl shadow-lg shadow-emerald-500/30">
              <Laptop size={32} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-4xl font-black text-emerald-950 tracking-tight">Task Lists</h1>
              <p className="text-sm sm:text-base font-bold text-emerald-700/60 mt-1">Selesaikan misi tugas Anda minggu ini.</p>
            </div>
          </div>

          <div className="p-6 sm:p-10 relative z-10 min-h-[400px]">
            
            <AnimatePresence mode="wait">
              {isLoadingForm ? (
                <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center py-20 gap-4">
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-emerald-100 rounded-full"></div>
                    <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
                  </div>
                  <p className="text-base font-black text-emerald-700 animate-pulse tracking-wide">Mencari Tugas Aktif...</p>
                </motion.div>
                
              ) : availableTasks.length === 0 ? (
                <motion.div key="error" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-16 gap-3 text-center bg-emerald-50/50 rounded-3xl border border-emerald-100 p-8 sm:p-12">
                  <CheckCircle2 size={64} className="text-emerald-400 mb-4" />
                  <h3 className="font-black text-2xl text-emerald-900">Semua Tugas Selesai!</h3>
                  <p className="text-base font-semibold text-emerald-700/80 leading-relaxed max-w-lg mx-auto">{errorMessage}</p>
                  <button onClick={() => navigate('/dashboard')} className="mt-6 px-8 py-3 bg-white text-emerald-700 border border-emerald-200 rounded-xl font-bold text-sm hover:bg-emerald-50 transition-colors">
                    Kembali ke Dashboard
                  </button>
                </motion.div>

              // 🚀 TAMPILAN 1: LAYAR PILIH TUGAS
              ) : !selectedTask ? (
                <motion.div key="pilih-tugas" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div className="mb-6">
                    <h2 className="text-xl font-black text-emerald-950">Pilih Tugas yang Tersedia</h2>
                    <p className="text-sm font-medium text-slate-500 mt-1">Klik salah satu kartu di bawah ini untuk mulai mengisi laporan.</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {availableTasks.map((task, index) => (
                      <motion.button 
                        initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}
                        key={task.id}
                        onClick={() => handleSelectTask(task)}
                        className="text-left bg-white p-6 rounded-2xl border-2 border-emerald-50 hover:border-emerald-500 hover:shadow-[0_8px_30px_rgb(16,185,129,0.12)] transition-all group relative overflow-hidden flex flex-col"
                      >
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 font-black text-[10px] uppercase tracking-widest rounded-lg mb-3 w-fit">
                          {task.minggu}
                        </span>
                        <h3 className="text-lg font-black text-emerald-950 leading-tight mb-4 flex-1">
                          {task.keterangan || "Tugas Digitalisasi"}
                        </h3>
                        <div className="flex items-center gap-2 text-sm font-bold text-slate-400 group-hover:text-emerald-600 transition-colors">
                          Mulai Kerjakan <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>

              // 🚀 TAMPILAN 2: LAYAR FORM PENGISIAN
              ) : (
                <motion.form key="form" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} onSubmit={submitDigitalisasi} className="space-y-8">
                  
                  {/* TOMBOL KEMBALI */}
                  <button type="button" onClick={() => setSelectedTask(null)} className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-emerald-600 transition-colors group">
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Kembali ke Pilihan Tugas
                  </button>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100">
                    <span className="px-4 py-1.5 bg-emerald-600 text-white font-black text-xs uppercase tracking-widest rounded-lg shrink-0 w-fit">
                      {formMinggu}
                    </span>
                    <span className="font-bold text-emerald-900 text-sm sm:text-base">
                      {selectedTask.keterangan || "Laporan Tugas Digitalisasi"}
                    </span>
                  </div>

                  {formFields.map((field, index) => (
                    <motion.div 
                      key={field.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="space-y-2.5"
                    >
                      <label className="block text-base font-black text-emerald-950 ml-1">
                        {field.label} {field.wajib && <span className="text-red-500">*</span>}
                      </label>
                      
                      <div className="relative group">
                        <div className="absolute top-4 left-5 text-emerald-400 group-focus-within:text-emerald-600 transition-colors">
                          {field.tipe === 'url' ? <LinkIcon size={22} /> : <FileText size={22} />}
                        </div>

                        {field.tipe === "textarea" ? (
                          <textarea 
                            required={field.wajib} 
                            rows={5} 
                            value={formData[field.id] || ''} 
                            onChange={(e) => handleInputChange(field.id, e.target.value)} 
                            placeholder={`Ketikkan jawaban Anda di sini...`} 
                            className="w-full border border-emerald-100 rounded-2xl pl-14 pr-5 py-4 bg-emerald-50/30 hover:bg-emerald-50/80 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all resize-none font-semibold text-emerald-950 text-base placeholder:text-emerald-300 placeholder:font-medium shadow-sm"
                          />
                        ) : (
                          <input 
                            type={field.tipe} 
                            required={field.wajib} 
                            value={formData[field.id] || ''} 
                            onChange={(e) => handleInputChange(field.id, e.target.value)} 
                            placeholder={field.tipe === 'url' ? "https://..." : `Ketikkan jawaban Anda di sini...`} 
                            className="w-full border border-emerald-100 rounded-2xl pl-14 pr-5 py-4 bg-emerald-50/30 hover:bg-emerald-50/80 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-semibold text-emerald-950 text-base placeholder:text-emerald-300 placeholder:font-medium shadow-sm" 
                          />
                        )}
                      </div>
                    </motion.div>
                  ))}
                  
                  <motion.button 
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit" 
                    disabled={isSubmitting} 
                    className="w-full flex justify-center items-center gap-3 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 disabled:from-emerald-300 disabled:to-emerald-300 text-white py-5 rounded-2xl font-black transition-all mt-10 text-lg shadow-[0_8px_20px_rgb(16,185,129,0.25)] hover:shadow-[0_8px_25px_rgb(16,185,129,0.4)]"
                  >
                    {isSubmitting ? (
                      <><Loader2 size={24} className="animate-spin"/> Mengirim Laporan...</>
                    ) : (
                      <><Send size={24} /> Kirim Laporan Sekarang</>
                    )}
                  </motion.button>
                </motion.form>
              )}
            </AnimatePresence>
            
          </div>
        </motion.div>

      </div>
    </div>
  );
}