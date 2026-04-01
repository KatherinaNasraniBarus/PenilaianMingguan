import { useState, useEffect } from "react";
import { Laptop, Calendar, Trash2, CheckCircle, XCircle, Loader2, ChevronRight, Hash, ClipboardList , Edit3, AlertTriangle, CalendarClock, Clock, Power } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import logo from "../image/bpjstk.png";

export default function MentorRiwayatForm() {
  const navigate = useNavigate();
  const [listForm, setListForm] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [formToDelete, setFormToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchRiwayat = () => {
    setLoading(true);
    fetch(`https://api-penilaian.vercel.app/admin_get_all_forms.php?t=${new Date().getTime()}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.status === "success") setListForm(data.data || []);
      })
      .catch(() => alert("Gagal mengambil riwayat form!"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRiwayat();
  }, []);

  const handleDeleteClick = (id: number) => {
    setFormToDelete(id);
  };

  const confirmDelete = () => {
    if (formToDelete === null) return;
    setIsDeleting(true);
    fetch(`https://api-penilaian.vercel.app/admin_delete_form.php?id=${formToDelete}`)
      .then(r => r.json())
      .then(data => {
        if (data.status === "success") {
          setListForm(listForm.filter(f => f.id !== formToDelete));
          setFormToDelete(null); 
        } else {
          alert("Gagal menghapus: " + data.message);
        }
      })
      .catch(() => alert("Terjadi kesalahan koneksi!"))
      .finally(() => setIsDeleting(false));
  };

  // 🚀 FUNGSI BARU: Mengubah Status Aktif/Nonaktif
  const toggleStatus = (id: number, currentStatus: string | number) => {
    // Jika sedang 1, ubah jadi 0. Jika sedang 0, ubah jadi 1.
    const newStatus = currentStatus.toString() === "1" ? 0 : 1;
    
    // Update UI sementara biar terlihat instan (Optimistic UI)
    setListForm(listForm.map(f => f.id === id ? { ...f, is_active: newStatus.toString() } : f));

    fetch("https://api-penilaian.vercel.app/admin_toggle_status.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, is_active: newStatus })
    })
    .then(r => r.json())
    .then(data => {
      if (data.status !== "success") {
        // Jika server gagal, kembalikan ke status awal
        alert("❌ Gagal mengubah status form.");
        setListForm(listForm.map(f => f.id === id ? { ...f, is_active: currentStatus.toString() } : f));
      }
    })
    .catch(() => {
      alert("Terjadi kesalahan koneksi!");
      setListForm(listForm.map(f => f.id === id ? { ...f, is_active: currentStatus.toString() } : f));
    });
  };

  const formatTanggalAman = (tgl: string | null | undefined, isDeadline = false) => {
    if (!tgl || tgl === "0000-00-00 00:00:00") return "Waktu tidak tercatat";
    const formatString = tgl.replace(" ", "T") + (isDeadline ? "" : "Z");
    const d = new Date(formatString); 
    if (isNaN(d.getTime())) return "Format salah";
    return d.toLocaleString('id-ID', { 
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' 
    }).replace(/\./g, ':') + " WIB";
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20 relative">
      
      <AnimatePresence>
        {formToDelete !== null && (
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
              className="bg-white rounded-[2rem] p-8 max-w-sm w-full shadow-2xl text-center border border-red-100 flex flex-col items-center"
            >
              <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-5 shadow-inner">
                <AlertTriangle size={40} />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">Hapus Form?</h3>
              <p className="text-slate-500 font-medium mb-8 text-sm leading-relaxed">
                Tugas ini akan dihapus secara permanen. Mahasiswa tidak akan bisa lagi melihat dan mengisi form untuk minggu ini.
              </p>
              <div className="flex gap-3 w-full">
                <button 
                  onClick={() => setFormToDelete(null)}
                  disabled={isDeleting}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3.5 rounded-xl transition-all active:scale-95"
                >
                  Batal
                </button>
                <button 
                  onClick={confirmDelete}
                  disabled={isDeleting}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-200 active:scale-95"
                >
                  {isDeleting ? <Loader2 size={18} className="animate-spin" /> : "Ya, Hapus"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="h-16 bg-white/90 backdrop-blur-md border-b border-slate-200 flex items-center justify-between lg:justify-end px-6 lg:px-8 sticky top-0 z-30 shrink-0 lg:pl-8 pl-16 shadow-sm">
        <div className="flex lg:hidden items-center h-full">
          <img src={logo} alt="BPJS TK" className="h-10 w-auto object-contain" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs sm:text-sm font-medium text-slate-500 hidden sm:inline">Portal Admin</span>
          <ChevronRight size={16} className="text-slate-400 hidden sm:inline" />
          <span className="text-xs sm:text-sm font-bold text-slate-800 hidden sm:inline">Riwayat Form</span>
        </div>
      </header>

      <div className="p-4 sm:p-8 max-w-6xl mx-auto w-full">
        <div className="mb-8 mt-2">
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 flex items-center gap-3">
           <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-100"><ClipboardList size={28} /></div>
           Monitoring Form
          </h1>
          <p className="text-slate-500 mt-2 font-medium">Kelola antrean tugas yang muncul di aplikasi mahasiswa.</p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-slate-400">
            <Loader2 size={48} className="animate-spin text-blue-500" />
            <p className="font-black text-lg animate-pulse">Menghubungkan ke Database...</p>
          </div>
        ) : listForm.length === 0 ? (
          <div className="bg-white p-16 rounded-[3rem] border-2 border-dashed border-slate-200 text-center">
            <p className="font-bold text-slate-400 text-lg">Belum ada data form. Silakan buat form baru!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listForm.map((form, index) => (
              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: index * 0.05 }}
                key={form.id} 
                className={`bg-white rounded-[2.5rem] border ${form.is_active === "1" ? 'border-slate-200' : 'border-red-100 bg-red-50/20'} p-7 shadow-sm hover:shadow-xl transition-all relative overflow-hidden group flex flex-col`}
              >
                <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full opacity-10 ${form.is_active === "1" ? 'bg-emerald-500' : 'bg-red-500'}`}></div>

                <div className="flex justify-between items-start mb-4">
                  {/* 🚀 INI DIA TOMBOL SAKLARNYA! */}
                  <button 
                    onClick={() => toggleStatus(form.id, form.is_active)}
                    title={form.is_active === "1" ? "Klik untuk mematikan form ini" : "Klik untuk menghidupkan form ini"}
                    className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-sm border ${form.is_active === "1" ? 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100' : 'bg-red-50 text-red-500 border-red-200 hover:bg-red-100'}`}
                  >
                    <Power size={14} />
                    {form.is_active === "1" ? "Status: Aktif" : "Status: Nonaktif"}
                  </button>

                  <span className="text-xs font-mono font-bold text-slate-300">ID #{form.id}</span>
                </div>

                <h3 className={`text-2xl font-black leading-tight mb-1 ${form.is_active === "1" ? 'text-slate-800' : 'text-slate-500'}`}>
                  {form.minggu}
                </h3>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-md w-fit mb-5 ${form.is_active === "1" ? 'text-purple-600 bg-purple-50' : 'text-slate-500 bg-slate-100'}`}>
                  {form.keterangan || "Tugas Digitalisasi"}
                </span>
                
                <div className={`space-y-3 mb-8 flex-1 ${form.is_active === "0" && 'opacity-60'}`}>
                   <div className="flex items-center gap-3 text-sm font-bold text-slate-500">
                      <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg"><Clock size={14} /></div>
                      Dibuat: {formatTanggalAman(form.tanggal_buka)}
                   </div>
                   
                   {form.deadline && form.deadline !== "0000-00-00 00:00:00" && (
                     <div className="flex items-center gap-3 text-sm font-bold text-red-500">
                        <div className="p-1.5 bg-red-50 text-red-500 rounded-lg"><CalendarClock size={14} /></div>
                        Batas: {formatTanggalAman(form.deadline, true)}
                     </div>
                   )}

                   <div className="flex items-center gap-3 text-sm font-bold text-slate-500">
                      <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg"><Hash size={14} /></div>
                      {JSON.parse(form.struktur_form || "[]").length} Pertanyaan
                   </div>
                </div>

                <div className="flex gap-3">
                  <button onClick={() => handleDeleteClick(form.id)} className="flex-1 flex items-center justify-center gap-2 py-4 bg-red-50 text-red-600 rounded-2xl font-black text-xs hover:bg-red-600 hover:text-white transition-all">
                    <Trash2 size={16} /> Hapus
                  </button>
                  <button onClick={() => navigate('/mentor/form-builder', { state: { editData: form } })} className="flex-1 flex items-center justify-center gap-2 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs hover:bg-slate-800 transition-all shadow-lg shadow-slate-200">
                    <Edit3 size={16} /> Kelola
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}