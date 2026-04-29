import { useState, useEffect } from "react";
import { History, Edit3, X, Save, Loader2, FileText, CheckCircle2, ChevronRight, CalendarClock, Clock, Link as LinkIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import logo from "../image/bpjstk.png";

export default function RiwayatTugas() {
  const navigate = useNavigate();
  const [riwayat, setRiwayat] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State untuk Modal Edit
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const userNim = localStorage.getItem("userNim");

  const fetchRiwayat = () => {
    setLoading(true);
    fetch(`https://api-penilaian.vercel.app/get_riwayat_tugas.php?nim=${userNim}&t=${new Date().getTime()}`)
      .then(r => r.json())
      .then(data => {
        if (data.status === "success") {
          setRiwayat(data.data || []);
        }
      })
      .catch(err => console.error("Gagal fetch riwayat:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!userNim) navigate("/");
    else fetchRiwayat();
  }, [navigate, userNim]);

  const handleOpenEdit = (task: any) => {
    setEditingTask(task);
    setFormData(task.jawaban || {});
    setIsEditModalOpen(true);
  };

  const handleInputChange = (fieldId: string, value: string) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    fetch("https://api-penilaian.vercel.app/update_tugas.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: editingTask.id,
        jawaban: formData
      })
    })
      .then(r => r.json())
      .then(data => {
        if (data.status === "success") {
          setSuccessMsg("Perubahan berhasil disimpan!");
          setTimeout(() => {
            setSuccessMsg("");
            setIsEditModalOpen(false);
            fetchRiwayat(); // Refresh data
          }, 1500);
        } else {
          alert("Gagal menyimpan: " + data.message);
        }
      })
      .catch(() => alert("Kesalahan koneksi saat menyimpan!"))
      .finally(() => setIsSubmitting(false));
  };

  const formatTanggal = (tgl: string | null) => {
    if (!tgl || tgl === "0000-00-00 00:00:00") return "-";
    const d = new Date(tgl.replace(" ", "T") + "Z"); // Paksa ke UTC jika backend tidak menyertakan timezone
    if (isNaN(d.getTime())) return "-";
    return d.toLocaleDateString("id-ID", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit"
    }).replace(/\./g, ':') + ' WIB';
  };

  return (
    <div className="min-h-screen bg-emerald-50/30 pb-20 relative">
      
      {/* ─── MODAL EDIT TUGAS ─── */}
      <AnimatePresence>
        {isEditModalOpen && editingTask && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl w-full max-w-2xl flex flex-col shadow-2xl overflow-hidden max-h-[90vh]"
            >
              <div className="px-6 py-5 border-b border-emerald-100 flex justify-between items-center bg-emerald-50/50 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-600 text-white rounded-xl"><Edit3 size={20} /></div>
                  <div>
                    <h3 className="text-lg font-black text-emerald-950">Edit Laporan</h3>
                    <p className="text-xs font-bold text-emerald-700/60 uppercase tracking-widest">{editingTask.minggu}</p>
                  </div>
                </div>
                <button onClick={() => setIsEditModalOpen(false)} className="p-2 text-emerald-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {successMsg ? (
                  <div className="flex flex-col items-center justify-center py-10">
                    <CheckCircle2 size={64} className="text-emerald-500 mb-4" />
                    <h4 className="text-xl font-black text-emerald-900">{successMsg}</h4>
                  </div>
                ) : (
                  <form id="editForm" onSubmit={handleSaveEdit} className="space-y-6">
                    <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 mb-6">
                      <p className="text-sm font-bold text-emerald-900">{editingTask.keterangan}</p>
                    </div>

                    {editingTask.struktur_form?.map((field: any, index: number) => (
                      <div key={field.id} className="space-y-2">
                        <label className="block text-sm font-black text-emerald-950 ml-1">
                          {field.label} {field.wajib && <span className="text-red-500">*</span>}
                        </label>
                        <div className="relative group">
                          <div className="absolute top-3.5 left-4 text-emerald-400 group-focus-within:text-emerald-600 transition-colors">
                            {field.tipe === 'url' ? <LinkIcon size={18} /> : <FileText size={18} />}
                          </div>
                          {field.tipe === "textarea" ? (
                            <textarea 
                              required={field.wajib} rows={4} 
                              value={formData[field.id] || ''} 
                              onChange={(e) => handleInputChange(field.id, e.target.value)} 
                              className="w-full border border-emerald-100 rounded-xl pl-12 pr-4 py-3 bg-slate-50 hover:bg-white focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all resize-none font-medium text-emerald-950 text-sm shadow-sm"
                            />
                          ) : (
                            <input 
                              type={field.tipe} required={field.wajib} 
                              value={formData[field.id] || ''} 
                              onChange={(e) => handleInputChange(field.id, e.target.value)} 
                              className="w-full border border-emerald-100 rounded-xl pl-12 pr-4 py-3 bg-slate-50 hover:bg-white focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-medium text-emerald-950 text-sm shadow-sm" 
                            />
                          )}
                        </div>
                      </div>
                    ))}
                  </form>
                )}
              </div>

              {!successMsg && (
                <div className="p-6 border-t border-emerald-50 bg-slate-50/50 shrink-0">
                  <button 
                    type="submit" form="editForm" disabled={isSubmitting} 
                    className="w-full flex justify-center items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white py-3.5 rounded-xl font-black transition-all shadow-md active:scale-95"
                  >
                    {isSubmitting ? <><Loader2 size={18} className="animate-spin"/> Menyimpan...</> : <><Save size={18} /> Simpan Perubahan</>}
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── HEADER ─── */}
      <header className="h-16 bg-white/90 backdrop-blur-md border-b border-emerald-100 flex items-center justify-between lg:justify-end px-6 lg:px-8 sticky top-0 z-30 shrink-0 lg:pl-8 pl-16 shadow-sm">
        <div className="flex lg:hidden items-center h-full">
          <img src={logo} alt="BPJS TK" className="h-10 w-auto object-contain" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs sm:text-sm font-medium text-emerald-700/70 hidden sm:inline">Mahasiswa</span>
          <ChevronRight size={16} className="text-emerald-200 hidden sm:inline" />
          <span className="text-xs sm:text-sm font-bold text-emerald-900 hidden sm:inline">Riwayat Tugas</span>
        </div>
      </header>

      {/* ─── KONTEN UTAMA ─── */}
      <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full mt-4">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-4xl font-black text-emerald-950 tracking-tight flex items-center gap-3">
            <div className="p-3 bg-emerald-600 text-white rounded-2xl shadow-lg shadow-emerald-200"><History size={28} /></div>
            Riwayat Tugas Anda
          </h1>
          <p className="text-emerald-700/60 mt-2 font-medium text-sm sm:text-base">Daftar tugas yang telah Anda kumpulkan. Anda dapat mengeditnya kembali jika diperlukan.</p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-emerald-600">
            <Loader2 size={40} className="animate-spin mb-4" />
            <p className="font-bold animate-pulse">Memuat riwayat...</p>
          </div>
        ) : riwayat.length === 0 ? (
          <div className="bg-white p-12 sm:p-16 rounded-[2rem] border border-emerald-100 shadow-sm text-center">
            <FileText size={64} className="mx-auto text-emerald-200 mb-4" />
            <h3 className="text-xl font-black text-emerald-900 mb-2">Belum Ada Riwayat</h3>
            <p className="text-emerald-700/70 font-medium">Anda belum mengirimkan laporan tugas apapun.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl sm:rounded-[2rem] shadow-sm border border-emerald-100 overflow-hidden">
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left min-w-[800px]">
                <thead>
                  <tr className="bg-emerald-50/50 border-b border-emerald-100">
                    <th className="px-6 py-4 text-xs font-black uppercase text-emerald-800 tracking-widest">Nama Tugas</th>
                    <th className="px-6 py-4 text-xs font-black uppercase text-emerald-800 tracking-widest text-center">Status</th>
                    <th className="px-6 py-4 text-xs font-black uppercase text-emerald-800 tracking-widest">Waktu Submit</th>
                    <th className="px-6 py-4 text-xs font-black uppercase text-emerald-800 tracking-widest">Terakhir Diupdate</th>
                    <th className="px-6 py-4 text-xs font-black uppercase text-emerald-800 tracking-widest text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-50">
                  {riwayat.map((task, index) => (
                    <tr key={index} className="hover:bg-emerald-50/30 transition-colors">
                      <td className="px-6 py-5">
                        <p className="font-black text-emerald-950 text-sm sm:text-base mb-1">{task.minggu}</p>
                        <p className="text-xs font-bold text-emerald-700/60 line-clamp-1">{task.keterangan}</p>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-100 text-emerald-700 text-xs font-black whitespace-nowrap">
                          <CheckCircle2 size={14} /> Tersubmit
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2 text-sm font-bold text-slate-600 whitespace-nowrap">
                          <CalendarClock size={16} className="text-emerald-500" />
                          {formatTanggal(task.tanggal_submit)}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2 text-sm font-bold text-slate-500 whitespace-nowrap">
                          <Clock size={16} className="text-blue-400" />
                          {task.tanggal_update ? formatTanggal(task.tanggal_update) : <span className="italic">Belum pernah diedit</span>}
                        </div>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <button 
                          onClick={() => handleOpenEdit(task)}
                          className="inline-flex items-center justify-center gap-2 bg-white hover:bg-emerald-600 text-emerald-700 hover:text-white border border-emerald-200 px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-sm active:scale-95"
                        >
                          <Edit3 size={16} /> Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}