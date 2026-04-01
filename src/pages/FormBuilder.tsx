import { useState, useEffect } from "react";
// 🚀 PERBAIKAN: Menambahkan AlertTriangle untuk icon error
import { PlusCircle, Save, FilePlus, Edit2, CornerDownRight, X, Loader2, ChevronRight, CheckCircle2, CalendarClock, AlertTriangle } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import logo from "../image/bpjstk.png";

export default function FormBuilder() {
  const navigate = useNavigate();
  const location = useLocation();

  const editData = location.state?.editData;

  const [editId, setEditId] = useState<number | null>(null);
  const [mingguJudul, setMingguJudul] = useState("Minggu Tugas");
  const [keteranganTugas, setKeteranganTugas] = useState(""); 
  const [deadlineTugas, setDeadlineTugas] = useState("");
  
  const [fields, setFields] = useState<any[]>([]); 
  const [isSaving, setIsSaving] = useState(false);
  
  // 🚀 STATE UNTUK POP-UP MODERN (Menggantikan showSuccessPopup)
  const [showModal, setShowModal] = useState(false);
  const [modalConfig, setModalConfig] = useState<{type: 'success'|'error', title: string, message: string}>({ type: 'success', title: '', message: '' });

  useEffect(() => {
    if (editData) {
      setEditId(editData.id);
      setMingguJudul(editData.minggu);
      setKeteranganTugas(editData.keterangan || ""); 
      
      if (editData.deadline && editData.deadline !== "0000-00-00 00:00:00") {
        const formattedForHTML = editData.deadline.replace(' ', 'T').substring(0, 16);
        setDeadlineTugas(formattedForHTML);
      } else {
        setDeadlineTugas("");
      }

      try {
        setFields(JSON.parse(editData.struktur_form));
      } catch (e) {
        console.error("Gagal membaca struktur form lama");
      }
    }
  }, [editData]);

  // 🚀 FUNGSI PEMANGGIL POP-UP MODERN
  const tampilkanPopUp = (type: 'success' | 'error', title: string, message: string) => {
    setModalConfig({ type, title, message });
    setShowModal(true);
    
    // Jika sukses, otomatis hilang dalam 2 detik dan pindah halaman
    if (type === 'success') {
      setTimeout(() => {
        setShowModal(false);
        navigate("/mentor/riwayat-form");
      }, 2000);
    }
  };

  const addField = (tipe: 'text' | 'textarea' | 'url') => {
    const newField = {
      id: "q" + Date.now(), 
      tipe: tipe,
      label: tipe === 'url' ? "Masukkan Link Drive Bukti" : "Tuliskan soal/permintaan di sini...",
      wajib: true
    };
    setFields([...fields, newField]);
  };

  const removeField = (id: string) => {
    setFields(fields.filter(f => f.id !== id));
  };

  const updateFieldProperty = (id: string, property: string, value: any) => {
    setFields(fields.map(f => f.id === id ? { ...f, [property]: value } : f));
  };

  const handleSaveForm = () => {
    // 🚀 PERBAIKAN: Mengganti semua alert() dengan Pop-Up Modern
    if (!mingguJudul) { tampilkanPopUp('error', 'Data Belum Lengkap', 'Judul Tugas wajib diisi!'); return; }
    if (!keteranganTugas) { tampilkanPopUp('error', 'Data Belum Lengkap', 'Ditugaskan Kepada wajib diisi!'); return; }
    if (!deadlineTugas) { tampilkanPopUp('error', 'Data Belum Lengkap', 'Deadline wajib diisi!'); return; } 
    if (fields.length === 0) { tampilkanPopUp('error', 'Kotak Form Kosong', 'Tambahkan minimal satu kotak input pertanyaan!'); return; }

    setIsSaving(true);

    const url = editId 
      ? "https://api-penilaian.vercel.app/admin_update_form.php" 
      : "https://api-penilaian.vercel.app/admin_save_form.php";
      
    const formattedDeadline = deadlineTugas.replace('T', ' ') + ":00";

    const payload = editId 
      ? { id: editId, minggu: mingguJudul, keterangan: keteranganTugas, deadline: formattedDeadline, struktur: fields }
      : { minggu: mingguJudul, keterangan: keteranganTugas, deadline: formattedDeadline, struktur: fields };

    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
    .then(r => r.json())
    .then(data => {
      if (data.status === "success") {
        // 🚀 MENGGUNAKAN POP-UP SUKSES
        tampilkanPopUp('success', 'Kerja Bagus!', `Form ${mingguJudul} telah berhasil disimpan.`);
      } else {
        // 🚀 MENGGUNAKAN POP-UP ERROR DARI SERVER
        tampilkanPopUp('error', 'Gagal Menyimpan', data.message);
      }
    })
    .catch(() => tampilkanPopUp('error', 'Masalah Koneksi', 'Terjadi kesalahan jaringan saat menyimpan form!'))
    .finally(() => setIsSaving(false));
  };

  return (
    <div className="min-h-screen bg-emerald-50/20 pb-20 relative">
      
      {/* 🚀 DESAIN POP-UP MODERN YANG BISA BERUBAH WARNA */}
      <AnimatePresence>
        {showModal && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.9, opacity: 0, y: 20 }} 
              className="bg-white rounded-[2rem] p-8 max-w-sm w-full shadow-2xl text-center border border-slate-100 flex flex-col items-center"
            >
              <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-5 shadow-inner ${modalConfig.type === 'success' ? 'bg-emerald-100 text-emerald-500' : 'bg-red-50 text-red-500'}`}>
                {modalConfig.type === 'success' ? <CheckCircle2 size={48} /> : <AlertTriangle size={48} />}
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">{modalConfig.title}</h3>
              <p className="text-slate-500 font-medium mb-8">
                {modalConfig.message}
              </p>
              
              {modalConfig.type === 'error' && (
                <button 
                  onClick={() => setShowModal(false)}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl transition-all active:scale-95 shadow-lg"
                >
                  Tutup dan Perbaiki
                </button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="h-16 bg-white/90 backdrop-blur-md border-b border-emerald-100 flex items-center justify-between lg:justify-end px-6 lg:px-8 sticky top-0 z-30 shrink-0 lg:pl-8 pl-16 shadow-sm">
        <div className="flex lg:hidden items-center h-full">
          <img src={logo} alt="BPJS TK" className="h-10 w-auto object-contain" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs sm:text-sm font-medium text-emerald-700/70 hidden sm:inline">Portal Admin</span>
          <ChevronRight size={16} className="text-emerald-200 hidden sm:inline" />
          <span className="text-xs sm:text-sm font-bold text-emerald-900 hidden sm:inline">
            {editId ? "Kelola Form" : "Buat Form"}
          </span>
        </div>
      </header>

      <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto w-full mt-4">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-emerald-950 tracking-tight flex items-center gap-3">
              <div className="p-2.5 bg-emerald-600 text-white rounded-2xl"><FilePlus size={24} /></div>
              {editId ? "Edit Form Digitalisasi" : "Perakit Form Digitalisasi"}
            </h1>
            <p className="text-emerald-700/60 mt-1.5 text-sm sm:text-base font-medium">
              {editId ? "Perbarui kotak input untuk tugas ini." : "Rakit kotak input yang wajib diisi mahasiswa minggu ini."}
            </p>
          </div>
          <button onClick={handleSaveForm} disabled={isSaving} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white px-6 py-3.5 rounded-xl font-bold transition-all shadow-md active:scale-95 text-base w-full sm:w-auto justify-center">
            {isSaving ? (
              <><Loader2 size={18} className="animate-spin" /> Menyimpan...</>
            ) : (
              <><Save size={20} /> {editId ? "Perbarui Form" : "Simpan Form"}</>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="bg-white p-6 rounded-3xl border border-emerald-50 shadow-[0_4px_20px_rgb(0,0,0,0.03)] space-y-5 lg:sticky lg:top-24 h-fit">
            <h2 className="text-lg font-black text-emerald-950 flex items-center gap-2.5">
              <Edit2 size={20} className="text-emerald-400" /> Tambah Kotak Input
            </h2>
            <div className="space-y-3">
              <button onClick={() => addField('text')} className="w-full flex items-center justify-between gap-3 bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-100 px-5 py-3.5 rounded-xl font-bold transition-all text-sm group">
                Tambah Kolom Teks Pendek <PlusCircle size={20} className="text-emerald-300 group-hover:text-emerald-500" />
              </button>
              <button onClick={() => addField('textarea')} className="w-full flex items-center justify-between gap-3 bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-100 px-5 py-3.5 rounded-xl font-bold transition-all text-sm group">
                Tambah Kolom Teks Panjang <PlusCircle size={20} className="text-emerald-300 group-hover:text-emerald-500" />
              </button>
              <button onClick={() => addField('url')} className="w-full flex items-center justify-between gap-3 bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-100 px-5 py-3.5 rounded-xl font-bold transition-all text-sm group">
                Tambah Kolom Tautan (Link) <PlusCircle size={20} className="text-emerald-300 group-hover:text-emerald-500" />
              </button>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-emerald-50 shadow-[0_4px_20px_rgb(0,0,0,0.03)] space-y-4">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Judul Tugas / Minggu Ke-</label>
                  <input type="text" value={mingguJudul} onChange={(e) => setMingguJudul(e.target.value)} placeholder="Contoh: Minggu 1" className="w-full border border-slate-200 rounded-xl px-4 py-3.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-black text-lg text-emerald-950 shadow-inner" />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Ditugaskan Kepada</label>
                  <input type="text" value={keteranganTugas} onChange={(e) => setKeteranganTugas(e.target.value)} placeholder="Contoh: IT Project" className="w-full border border-slate-200 rounded-xl px-4 py-3.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-bold text-base text-emerald-900 shadow-inner" />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-red-600 mb-2">
                  <CalendarClock size={18} /> Batas Waktu Pengumpulan (Deadline)
                </label>
                <input 
                  type="datetime-local" 
                  value={deadlineTugas} 
                  onChange={(e) => setDeadlineTugas(e.target.value)} 
                  className="w-full border border-red-200 rounded-xl px-4 py-3.5 bg-red-50 focus:bg-white focus:ring-2 focus:ring-red-500 outline-none transition-all font-bold text-base text-red-900 shadow-inner" 
                />
              </div>

            </div>

            <div className="bg-emerald-950 p-6 sm:p-8 rounded-[2rem] shadow-xl border-4 border-emerald-800">
              <div className="flex justify-between items-center mb-6 border-b border-emerald-700 pb-4">
                <div>
                  <h3 className="text-xl font-black text-white">Tampilan di Mahasiswa</h3>
                  <p className="text-emerald-400 font-medium text-sm mt-1">{keteranganTugas || "Belum ada kategori"}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="inline-block px-3 py-1 bg-emerald-500 text-white font-black text-xs rounded-lg">{mingguJudul}</span>
                  {deadlineTugas && (
                    <span className="inline-block px-2 py-1 bg-red-500/20 border border-red-500/50 text-red-300 font-bold text-[10px] rounded">
                      Batas: {deadlineTugas.replace('T', ', ')}
                    </span>
                  )}
                </div>
              </div>
              
              <AnimatePresence mode="wait">
                {fields.length === 0 ? (
                  <motion.div key="kosong" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-10 border-2 border-dashed border-emerald-700 rounded-2xl">
                    <FilePlus size={48} className="mx-auto text-emerald-700 mb-3" />
                    <p className="text-emerald-400 font-bold text-sm">
                      Form masih kosong. Gunakan panel kiri untuk merakit kotak!
                    </p>
                  </motion.div>
                ) : (
                  <motion.div key="ada-isi" className="space-y-6">
                    {fields.map((field, index) => (
                      <motion.div key={field.id} layout initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white p-5 rounded-xl shadow-inner border border-slate-200 relative group">
                        <button onClick={() => removeField(field.id)} className="absolute top-2 right-2 p-1 text-slate-300 hover:text-red-500 rounded-lg hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"><X size={20} /></button>
                        <div className="flex items-center gap-3 mb-3">
                          <div className="font-mono text-xs font-black px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-lg">Kotak {index + 1}</div>
                          <div className="flex items-center gap-2">
                            <label className="text-sm font-black text-slate-800">Label/Pertanyaan untuk Mahasiswa:</label>
                          </div>
                        </div>
                        <input type="text" value={field.label} onChange={(e) => updateFieldProperty(field.id, "label", e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-white focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-bold text-sm text-slate-800 mb-3" />
                        
                        <div className="border border-dashed border-slate-200 p-4 rounded-xl space-y-3">
                          <div className="flex justify-between items-center gap-4">
                            <div className="flex items-center gap-2"><CornerDownRight size={16} className="text-slate-400" /><span className="text-xs font-bold text-slate-500">Tipe Input: {field.tipe === 'url' ? 'Link Tautan' : field.tipe === 'textarea' ? 'Teks Panjang' : 'Teks Pendek'}</span></div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-500">Wajib Isi?</span>
                              <input type="checkbox" checked={field.wajib} onChange={(e) => updateFieldProperty(field.id, "wajib", e.target.checked)} className="form-checkbox h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" />
                            </div>
                          </div>
                          <div className={`w-full ${field.tipe === 'textarea' ? 'h-24' : 'h-12'} rounded-lg bg-slate-100 border border-slate-200`}></div>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}