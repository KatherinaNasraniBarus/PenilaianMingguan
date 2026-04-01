import { useState, useEffect } from "react";
import { Laptop, Calendar, Trash2, CheckCircle, XCircle, Loader2, ChevronRight, Hash, ClipboardList , Edit3, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import logo from "../image/bpjstk.png";

export default function MentorRiwayatForm() {
  const navigate = useNavigate();
  const [listForm, setListForm] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 🚀 STATE UNTUK POP-UP HAPUS
  const [formToDelete, setFormToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchRiwayat = () => {
    setLoading(true);
    fetch("https://api-penilaian.vercel.app/admin_get_all_forms.php")
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

  // 🚀 FUNGSI KETIKA TOMBOL HAPUS DIKLIK (HANYA MEMUNCULKAN POP-UP)
  const handleDeleteClick = (id: number) => {
    setFormToDelete(id);
  };

  // 🚀 FUNGSI EKSEKUSI HAPUS ASLI
  const confirmDelete = () => {
    if (formToDelete === null) return;
    
    setIsDeleting(true);
    fetch(`https://api-penilaian.vercel.app/admin_delete_form.php?id=${formToDelete}`)
      .then(r => r.json())
      .then(data => {
        if (data.status === "success") {
          setListForm(listForm.filter(f => f.id !== formToDelete));
          setFormToDelete(null); // Tutup pop-up setelah sukses
        } else {
          alert("Gagal menghapus: " + data.message);
        }
      })
      .catch(() => alert("Terjadi kesalahan koneksi!"))
      .finally(() => setIsDeleting(false));
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20 relative">
      
      {/* 🚀 POP-UP KONFIRMASI HAPUS MODERN */}
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

      {/* ─── HEADER NAVBAR ─── */}
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
                className="bg-white rounded-[2.5rem] border border-slate-200 p-7 shadow-sm hover:shadow-xl transition-all relative overflow-hidden group"
              >
                <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full opacity-10 ${form.is_active === "1" ? 'bg-emerald-500' : 'bg-slate-500'}`}></div>

                <div className="flex justify-between items-center mb-6">
                  <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${form.is_active === "1" ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-50 text-slate-400 border border-slate-100'}`}>
                    {form.is_active === "1" ? <CheckCircle size={12} /> : <XCircle size={12} />}
                    {form.is_active === "1" ? "Aktif di HP" : "Nonaktif"}
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-300">ID #{form.id}</span>
                </div>

                <h3 className="text-2xl font-black text-slate-800 leading-tight mb-4">{form.minggu}</h3>
                
                <div className="space-y-3 mb-8">
                   <div className="flex items-center gap-3 text-sm font-bold text-slate-500">
                      <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg"><Calendar size={14} /></div>
                      Jadwal: {new Date(form.tanggal_buka).toLocaleString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                   </div>
                   <div className="flex items-center gap-3 text-sm font-bold text-slate-500">
                      <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg"><Hash size={14} /></div>
                      {JSON.parse(form.struktur_form || "[]").length} Pertanyaan
                   </div>
                </div>

                <div className="flex gap-3">
                  {/* 🚀 TOMBOL HAPUS SEKARANG MEMANGGIL FUNGSI handleDeleteClick */}
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