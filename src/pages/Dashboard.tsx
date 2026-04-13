import { ChevronRight, Users, Heart, Megaphone, Video, ExternalLink, Link as LinkIcon, History, UserCheck, Clock, Laptop, Edit3, X, Save, FileText, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import logo from "../image/bpjstk.png";

interface Report {
  minggu: string;
  total_kepling: number;
  total_keluarga: number;
  total_sosialisasi: number;
  akuisisi_bpu_kepling?: number;
  akuisisi_bpu_keluarga?: number;
  jumlah_sosialisasi?: number;
  link_drive: string;
  tanggal_submit: string;
}

export default function Dashboard() {
  const navigate = useNavigate();

  const [reports, setReports]               = useState<Report[]>([]);
  const [userName, setUserName]             = useState("");
  const [userNim, setUserNim]               = useState("");
  const [loading, setLoading]               = useState(true);

  const [riwayatDigital, setRiwayatDigital] = useState<any[]>([]);
  const [loadingRiwayat, setLoadingRiwayat] = useState(true);

  // 🚀 STATE UNTUK FITUR EDIT
  const [editingReport, setEditingReport]   = useState<any | null>(null);
  const [editFormData, setEditFormData]     = useState<Record<string, string>>({});
  const [isSavingEdit, setIsSavingEdit]     = useState(false);

  const [totalKepling, setTotalKepling]         = useState(0);
  const [totalKeluarga, setTotalKeluarga]       = useState(0);
  const [totalSosialisasi, setTotalSosialisasi] = useState(0);
  const [jumlahHadir, setJumlahHadir]           = useState(0);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchRiwayatDigital = (nim: string) => {
    setLoadingRiwayat(true);
    fetch(`https://api-penilaian.vercel.app/get_riwayat_mahasiswa.php?nim=${nim}&t=${new Date().getTime()}`)
      .then(r => r.json())
      .then(res => {
        if (res.status === "success" && res.data) {
          setRiwayatDigital(res.data);
        } else {
          setRiwayatDigital([]);
        }
      })
      .catch(() => console.error("Gagal mengambil riwayat digitalisasi"))
      .finally(() => setLoadingRiwayat(false));
  };

  useEffect(() => {
    const nim  = localStorage.getItem("userNim");
    const name = localStorage.getItem("userName");
    if (name) setUserName(name);
    if (nim)  setUserNim(nim);

    if (nim) {
      // 1. Data Laporan Mingguan Manual
      fetch(`https://api-penilaian.vercel.app/get_dashboard_mahasiswa.php?nim=${nim}`)
        .then(r => r.json())
        .then(result => {
          if (result.status === "success") {
            const data = result.data ?? [];
            setReports(data);
            if (result.summary) {
              const s = result.summary;
              setTotalKepling(s.total_kepling || 0);
              setTotalKeluarga(s.total_keluarga || 0);
              setTotalSosialisasi(s.total_sosialisasi || 0);
            } else {
              let kepling = 0, keluarga = 0, sosialisasi = 0;
              data.forEach((l: any) => {
                kepling     += Number(l.total_kepling    || l.akuisisi_bpu_kepling  || 0);
                keluarga    += Number(l.total_keluarga   || l.akuisisi_bpu_keluarga || 0);
                sosialisasi += Number(l.total_sosialisasi || l.jumlah_sosialisasi   || 0);
              });
              setTotalKepling(kepling);
              setTotalKeluarga(keluarga);
              setTotalSosialisasi(sosialisasi);
            }
          }
        }).finally(() => setLoading(false));

      // 2. Absensi
      fetch(`https://api-penilaian.vercel.app/get_history_absen.php?nim=${nim}`)
        .then(r => r.json())
        .then(result => {
          if (result.status === "success") {
            const history = result.data || [];
            const dateMap: Record<string, { in: boolean; out: boolean }> = {};
            history.forEach((absen: any) => {
              const date = absen.timestamp ? absen.timestamp.split(" ")[0] : "";
              if (!date) return;
              if (!dateMap[date]) dateMap[date] = { in: false, out: false };
              if (absen.type === "meet-in") dateMap[date].in = true;
              if (absen.type === "meet-out") dateMap[date].out = true;
            });
            let meetCount = 0;
            Object.values(dateMap).forEach(day => { if (day.in && day.out) meetCount++; });
            setJumlahHadir(meetCount);
          }
        });

      // 3. Riwayat Digital
      fetchRiwayatDigital(nim);

    } else {
      setLoading(false);
      setLoadingRiwayat(false);
    }
  }, []);

  // 🚀 FUNGSI BUKA MODAL EDIT
  const handleOpenEdit = (report: any) => {
    let parsedJawaban: Record<string, string> = {};
    try {
      let temp = report.jawaban;
      while(typeof temp === 'string') temp = JSON.parse(temp);
      parsedJawaban = temp || {};
    } catch(e) {}

    let parsedStruktur: any[] = [];
    try {
      let temp = report.struktur_form;
      while(typeof temp === 'string') temp = JSON.parse(temp);
      parsedStruktur = temp || [];
    } catch(e) {}

    setEditFormData(parsedJawaban);
    setEditingReport({ ...report, struktur_form_parsed: parsedStruktur });
  };

  const handleEditChange = (fieldId: string, value: string) => {
    setEditFormData(prev => ({ ...prev, [fieldId]: value }));
  };

  // 🚀 FUNGSI SIMPAN EDIT KE DATABASE
  const submitEdit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingEdit(true);

    fetch("https://api-penilaian.vercel.app/update_digitalisasi.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: editingReport.id,
        jawaban: editFormData
      })
    })
    .then(r => r.json())
    .then(data => {
      if (data.status === "success") {
        setEditingReport(null);
        if (userNim) fetchRiwayatDigital(userNim); // Refresh Riwayat
      } else {
        alert("❌ Gagal memperbarui laporan: " + data.message);
      }
    })
    .catch(() => alert("Terjadi kesalahan koneksi!"))
    .finally(() => setIsSavingEdit(false));
  };

  const totalPages     = Math.max(1, Math.ceil(reports.length / itemsPerPage));
  const currentReports = reports.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const statCards = [
    { label: "BPU Kepling",  val: totalKepling,      icon: <Users size={24} />,     color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "BPU Keluarga", val: totalKeluarga,    icon: <Heart size={24} />,     color: "text-blue-600",    bg: "bg-blue-50" },
    { label: "Sosialisasi",  val: totalSosialisasi, icon: <Megaphone size={24} />, color: "text-purple-600",  bg: "bg-purple-50" },
    { label: "Hadir Zoom",   val: jumlahHadir,      icon: <Video size={24} />,     color: "text-orange-600",  bg: "bg-orange-50" },
  ];

  return (
    <div className="flex flex-col min-h-full bg-emerald-50/20 relative">

      {/* 🚀 MODAL EDIT LAPORAN */}
      <AnimatePresence>
        {editingReport && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden my-auto border border-emerald-100"
            >
              <div className="flex justify-between items-center p-6 border-b border-emerald-50 bg-emerald-50/50">
                <div>
                  <h3 className="text-xl font-black text-emerald-950 flex items-center gap-2">
                    <Edit3 size={20} className="text-emerald-500" /> Edit Laporan {editingReport.minggu}
                  </h3>
                  <p className="text-sm font-bold text-emerald-700/60 mt-1">{editingReport.keterangan}</p>
                </div>
                <button onClick={() => setEditingReport(null)} className="p-2 hover:bg-white rounded-full text-slate-400 hover:text-red-500 transition-colors">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={submitEdit} className="p-6 sm:p-8 space-y-6">
                {editingReport.struktur_form_parsed?.map((field: any, index: number) => (
                  <div key={field.id} className="space-y-2.5">
                    <label className="block text-sm font-black text-emerald-950 ml-1">
                      {index + 1}. {field.label} {field.wajib && <span className="text-red-500">*</span>}
                    </label>
                    <div className="relative group">
                      <div className="absolute top-3.5 left-4 text-emerald-400 group-focus-within:text-emerald-600 transition-colors">
                        {field.tipe === 'url' ? <LinkIcon size={18} /> : <FileText size={18} />}
                      </div>
                      {field.tipe === "textarea" ? (
                        <textarea 
                          required={field.wajib} rows={4} 
                          value={editFormData[field.id] || ''} 
                          onChange={(e) => handleEditChange(field.id, e.target.value)} 
                          className="w-full border border-emerald-100 rounded-xl pl-11 pr-4 py-3 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-semibold text-emerald-950 text-sm placeholder:text-slate-300 resize-none"
                        />
                      ) : (
                        <input 
                          type={field.tipe} required={field.wajib} 
                          value={editFormData[field.id] || ''} 
                          onChange={(e) => handleEditChange(field.id, e.target.value)} 
                          className="w-full border border-emerald-100 rounded-xl pl-11 pr-4 py-3 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-semibold text-emerald-950 text-sm placeholder:text-slate-300" 
                        />
                      )}
                    </div>
                  </div>
                ))}

                <div className="pt-4 border-t border-emerald-50 flex gap-3">
                  <button type="button" onClick={() => setEditingReport(null)} className="flex-1 px-4 py-3.5 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors">Batal</button>
                  <button type="submit" disabled={isSavingEdit} className="flex-[2] flex justify-center items-center gap-2 px-4 py-3.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition-colors shadow-lg shadow-emerald-200">
                    {isSavingEdit ? <><Loader2 size={18} className="animate-spin"/> Menyimpan...</> : <><Save size={18} /> Perbarui Laporan</>}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="h-16 bg-white/90 backdrop-blur-md border-b border-emerald-100 flex items-center justify-between lg:justify-end px-6 lg:px-8 sticky top-0 z-30 shrink-0 lg:pl-8 pl-16 shadow-sm">
        <div className="flex lg:hidden items-center h-full">
          <img src={logo} alt="BPJS TK" className="h-10 w-auto object-contain" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs sm:text-sm font-medium text-emerald-700/70 hidden sm:inline">Student Portal</span>
          <ChevronRight size={16} className="text-emerald-200 hidden sm:inline" />
          <span className="text-xs sm:text-sm font-bold text-emerald-900 hidden sm:inline">Dashboard</span>
        </div>
      </header>

      <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto w-full pb-20">

        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-emerald-950 capitalize tracking-tight">
              Welcome back, {userName ? userName.split(" ")[0].toLowerCase() : "Student"}!
            </h1>
            <p className="text-emerald-700/60 mt-1.5 text-sm sm:text-base font-medium">Pantau aktivitas dan riwayat laporan Anda.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a  href={`https://absensai-kamera.vercel.app/?nim=${userNim}`} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl font-bold transition-all shadow-md active:scale-95 text-sm sm:text-base flex-1 sm:flex-none">
              <UserCheck size={20} /> Isi Presensi 
            </a>
            <button onClick={() => navigate('/riwayat-absen')}
              className="flex items-center justify-center gap-2 bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-50 px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl font-bold transition-all shadow-sm active:scale-95 text-sm sm:text-base flex-1 sm:flex-none">
              <History size={20} /> Riwayat Absensi
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {statCards.map(card => (
            <div key={card.label} className="bg-white p-4 sm:p-6 rounded-2xl border border-emerald-50 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_4px_20px_rgb(0,0,0,0.06)] transition-all">
              <div className={`p-2.5 sm:p-3 ${card.bg} ${card.color} rounded-xl w-fit mb-3 sm:mb-4`}>{card.icon}</div>
              <p className="text-emerald-700/60 text-xs sm:text-sm font-bold mb-1">{card.label}</p>
              <h3 className={`text-2xl sm:text-3xl font-black ${card.color}`}>{card.val}</h3>
            </div>
          ))}
        </div>

        {/* ─── RIWAYAT TUGAS DIGITALISASI DENGAN TOMBOL EDIT ─── */}
        <div className="bg-white border border-emerald-100 rounded-2xl sm:rounded-[2rem] shadow-[0_4px_20px_rgb(0,0,0,0.03)] p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl"><Laptop size={24} /></div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-emerald-950 leading-tight">Riwayat Tugas</h2>
              <p className="text-xs sm:text-sm font-bold text-slate-400 mt-0.5">Task Lists yang sudah dikerjakan</p>
            </div>
          </div>

          {loadingRiwayat ? (
             <div className="py-12 flex justify-center"><div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>
          ) : riwayatDigital.length === 0 ? (
             <div className="bg-slate-50 rounded-2xl p-8 text-center border border-slate-100">
               <p className="text-sm font-bold text-slate-500">Belum ada tugas digitalisasi yang diselesaikan.</p>
             </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {riwayatDigital.map((item, idx) => {
                let tgl = "-";
                let labelStatus = null;

                if (item.tanggal_submit) {
                  const submitDate = new Date(item.tanggal_submit.replace(" ", "T") + "Z");
                  tgl = submitDate.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).replace(/\./g, ':') + ' WIB';

                  if (item.deadline && item.deadline !== "0000-00-00 00:00:00") {
                    const deadlineDate = new Date(item.deadline.replace(" ", "T")); 
                    
                    if (submitDate > deadlineDate) {
                      labelStatus = <span className="bg-red-50 border border-red-200 text-red-600 font-bold text-[10px] px-2.5 py-1 rounded-md">⚠️ Terlambat</span>;
                    } else {
                      labelStatus = <span className="bg-emerald-50 border border-emerald-200 text-emerald-600 font-bold text-[10px] px-2.5 py-1 rounded-md">✅ Tepat Waktu</span>;
                    }
                  } else {
                    labelStatus = <span className="bg-slate-100 border border-slate-200 text-slate-500 font-bold text-[10px] px-2.5 py-1 rounded-md">Terkirim</span>;
                  }
                }

                return (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} key={item.id} className="bg-white border border-emerald-100 shadow-sm rounded-2xl p-4 sm:p-5 flex flex-col justify-between hover:shadow-md transition-all group relative overflow-hidden">
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-2 py-1 rounded uppercase tracking-wider">{item.minggu}</span>
                      {labelStatus}
                    </div>
                    <h3 className="font-bold text-slate-800 text-base mb-3 line-clamp-2">{item.keterangan}</h3>
                    
                    <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-50">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                        <Clock size={14}/> Dikirim: {tgl}
                      </div>
                      
                      {/* 🚀 TOMBOL EDIT (Hanya muncul jika is_active dari Mentor = 1) */}
                      {item.is_active == 1 && (
                        <button 
                          onClick={() => handleOpenEdit(item)}
                          className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          <Edit3 size={14} /> Revisi
                        </button>
                      )}
                      {item.is_active == 0 && (
                        <span className="text-[10px] font-bold text-slate-300 italic">Ditutup</span>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* ─── TABEL LAPORAN MINGGUAN (LAMA/MANUAL) ─── */}
        <div className="bg-white border border-emerald-100 rounded-2xl sm:rounded-[2rem] shadow-[0_4px_20px_rgb(0,0,0,0.03)] overflow-hidden">
          <div className="px-5 sm:px-6 py-4 sm:py-5 border-b border-emerald-50">
            <h2 className="text-base sm:text-lg font-black text-emerald-950 flex items-center gap-2">
              <span className="w-1.5 sm:w-2 h-5 sm:h-6 bg-emerald-500 rounded-full"></span> Laporan Kinerja Lapangan
            </h2>
          </div>
          
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left min-w-[600px] sm:min-w-[800px]">
              <thead>
                <tr className="bg-emerald-50/30 border-b border-emerald-100">
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-[10px] sm:text-xs font-black uppercase text-emerald-800 tracking-widest whitespace-nowrap">Minggu</th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-[10px] sm:text-xs font-black uppercase text-emerald-800 tracking-widest whitespace-nowrap">Tanggal Submit</th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-[10px] sm:text-xs font-black uppercase text-emerald-800 tracking-widest text-center whitespace-nowrap">BPU Kepling</th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-[10px] sm:text-xs font-black uppercase text-emerald-800 tracking-widest text-center whitespace-nowrap">BPU Keluarga</th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-[10px] sm:text-xs font-black uppercase text-emerald-800 tracking-widest text-center whitespace-nowrap">Sosialisasi</th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-[10px] sm:text-xs font-black uppercase text-emerald-800 tracking-widest text-center whitespace-nowrap">Drive Laporan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-50/50">
                {loading ? (
                  <tr><td colSpan={6} className="px-4 sm:px-6 py-12 sm:py-16 text-center text-emerald-700/60">
                    <div className="flex justify-center mb-3">
                      <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                    <p className="font-bold text-sm">Memuat data laporan...</p>
                  </td></tr>
                ) : currentReports.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 sm:px-6 py-12 sm:py-16 text-center text-emerald-700/50 font-medium text-sm">
                    Belum ada laporan lapangan yang Anda kumpulkan.
                  </td></tr>
                ) : currentReports.map((row, i) => {
                  
                  let tgl = "-";
                  if (row.tanggal_submit) {
                      const dateObj = new Date(row.tanggal_submit.replace(" ", "T"));
                      tgl = dateObj.toLocaleDateString("id-ID", {
                          day: "2-digit", month: "short", year: "numeric",
                          hour: "2-digit", minute: "2-digit"
                      }).replace(/\./g, ':') + ' WIB';
                  }

                  const kepling     = row.total_kepling    ?? (row as any).akuisisi_bpu_kepling  ?? 0;
                  const keluarga    = row.total_keluarga   ?? (row as any).akuisisi_bpu_keluarga ?? 0;
                  const sosialisasi = row.total_sosialisasi ?? (row as any).jumlah_sosialisasi  ?? 0;
                  
                  return (
                    <tr key={i} className="hover:bg-emerald-50/40 transition-colors">
                      <td className="px-4 sm:px-6 py-4 sm:py-5 text-xs sm:text-sm font-bold text-emerald-950 whitespace-nowrap">{row.minggu}</td>
                      <td className="px-4 sm:px-6 py-4 sm:py-5 text-[11px] sm:text-sm font-medium text-emerald-700/80 whitespace-nowrap">{tgl}</td>
                      <td className="px-4 sm:px-6 py-4 sm:py-5 text-center font-mono font-black text-sm sm:text-base text-emerald-700">{kepling}</td>
                      <td className="px-4 sm:px-6 py-4 sm:py-5 text-center font-mono font-black text-sm sm:text-base text-blue-600">{keluarga}</td>
                      <td className="px-4 sm:px-6 py-4 sm:py-5 text-center font-mono font-black text-sm sm:text-base text-purple-600">{sosialisasi}</td>
                      <td className="px-4 sm:px-6 py-4 sm:py-5 text-center">
                        {row.link_drive ? (
                          <a href={row.link_drive.startsWith('http') ? row.link_drive : `https://${row.link_drive}`} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 sm:gap-1.5 text-emerald-600 hover:text-white hover:bg-emerald-600 bg-emerald-50 border border-emerald-200 font-bold px-3 py-1.5 rounded-lg text-[10px] sm:text-xs transition-colors whitespace-nowrap">
                            <LinkIcon size={12} /> Buka <ExternalLink size={10} />
                          </a>
                        ) : <span className="text-slate-300 italic text-xs">—</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="px-4 sm:px-6 py-4 border-t border-emerald-50 flex flex-col sm:flex-row justify-between items-center gap-3 bg-white text-xs sm:text-sm text-emerald-700/60 font-medium">
              <span>Halaman <span className="font-bold text-emerald-900">{currentPage}</span> dari <span className="font-bold text-emerald-900">{totalPages}</span></span>
              <div className="flex gap-1.5 sm:gap-2">
                <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl font-bold border border-emerald-100 disabled:opacity-40 disabled:bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 transition-all active:scale-95">
                  Mundur
                </button>
                <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl font-bold border border-emerald-100 disabled:opacity-40 disabled:bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 transition-all active:scale-95">
                  Lanjut
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}