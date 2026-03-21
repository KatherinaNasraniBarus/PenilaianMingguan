import { ChevronRight, Users, Heart, Megaphone, Video, ExternalLink, Link as LinkIcon, History, X, CalendarDays, Camera, MapPin, UserCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import logo from "../image/bpjstk.jpeg";

interface Report {
  minggu: string;
  total_kepling: number;
  total_keluarga: number;
  total_sosialisasi: number;
  // field lama (fallback)
  akuisisi_bpu_kepling?: number;
  akuisisi_bpu_keluarga?: number;
  jumlah_sosialisasi?: number;
  link_drive: string;
  tanggal_submit: string;
}

export default function Dashboard() {
  const [reports, setReports]               = useState<Report[]>([]);
  const [userName, setUserName]             = useState("");
  const [userNim, setUserNim]               = useState("");
  const [loading, setLoading]               = useState(true);

  const [totalKepling, setTotalKepling]         = useState(0);
  const [totalKeluarga, setTotalKeluarga]       = useState(0);
  const [totalSosialisasi, setTotalSosialisasi] = useState(0);
  const [jumlahHadir, setJumlahHadir]           = useState(0);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [isAbsenModalOpen, setIsAbsenModalOpen] = useState(false);
  const [absenHistory, setAbsenHistory]         = useState<any[]>([]);
  const [loadingAbsen, setLoadingAbsen]         = useState(false);

  useEffect(() => {
    const nim  = localStorage.getItem("userNim");
    const name = localStorage.getItem("userName");
    if (name) setUserName(name);
    if (nim)  setUserNim(nim);

    if (nim) {
      fetch(`http://localhost/api-penilaian/get_dashboard_mahasiswa.php?nim=${nim}`)
        .then(r => r.json())
        .then(result => {
          if (result.status === "success") {
            const data = result.data ?? [];
            setReports(data);

            // Kalau ada summary (API baru), pakai itu
            // Kalau tidak, hitung manual dari data (API lama)
            if (result.summary) {
              const s = result.summary;
              setTotalKepling(s.total_kepling       || 0);
              setTotalKeluarga(s.total_keluarga     || 0);
              setTotalSosialisasi(s.total_sosialisasi || 0);
              setJumlahHadir(s.jumlah_hadir         || 0);
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
              setJumlahHadir(0);
            }
          }
        })
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const fetchAbsenHistory = () => {
    setIsAbsenModalOpen(true);
    setLoadingAbsen(true);
    fetch(`http://localhost/api-penilaian/get_history_absen.php?nim=${userNim}`)
      .then(r => r.json())
      .then(result => { if (result.status === "success") setAbsenHistory(result.data); })
      .catch(err => console.error(err))
      .finally(() => setLoadingAbsen(false));
  };

  const totalPages     = Math.max(1, Math.ceil(reports.length / itemsPerPage));
  const currentReports = reports.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const statCards = [
    { label: "BPU Kepling",  val: totalKepling,     icon: <Users size={24} />,     color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "BPU Keluarga", val: totalKeluarga,    icon: <Heart size={24} />,     color: "text-blue-600",    bg: "bg-blue-50" },
    { label: "Sosialisasi",  val: totalSosialisasi, icon: <Megaphone size={24} />, color: "text-purple-600",  bg: "bg-purple-50" },
    { label: "Hadir Zoom",   val: jumlahHadir,      icon: <Video size={24} />,     color: "text-orange-600",  bg: "bg-orange-50" },
  ];

  return (
    <div className="flex flex-col min-h-full bg-emerald-50/20">

      {/* Modal Riwayat Absensi */}
      <AnimatePresence>
        {isAbsenModalOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-950/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden"
            >
              <div className="px-6 py-5 border-b border-emerald-100 flex justify-between items-center bg-emerald-50/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-600 text-white rounded-lg"><History size={20} /></div>
                  <h3 className="text-xl font-black text-emerald-950">Riwayat Kehadiran Anda</h3>
                </div>
                <button onClick={() => setIsAbsenModalOpen(false)} className="p-2 text-emerald-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                  <X size={24} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                {loadingAbsen ? (
                  <div className="flex flex-col items-center justify-center py-12 text-emerald-600 gap-3">
                    <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                    <p className="font-bold animate-pulse">Mengambil data...</p>
                  </div>
                ) : absenHistory.length === 0 ? (
                  <div className="text-center py-16">
                    <CalendarDays size={48} className="mx-auto text-emerald-200 mb-4" />
                    <p className="text-emerald-900 font-bold text-lg">Belum ada riwayat absensi</p>
                  </div>
                ) : (
                  <div className="border border-emerald-100 rounded-2xl overflow-hidden">
                    <table className="w-full text-left">
                      <thead className="bg-emerald-50/50 border-b border-emerald-100">
                        <tr>
                          <th className="px-5 py-3 text-xs font-bold text-emerald-700 uppercase tracking-wider">No</th>
                          <th className="px-5 py-3 text-xs font-bold text-emerald-700 uppercase tracking-wider">Tanggal</th>
                          <th className="px-5 py-3 text-xs font-bold text-emerald-700 uppercase tracking-wider">Waktu</th>
                          <th className="px-5 py-3 text-xs font-bold text-emerald-700 uppercase tracking-wider text-center">Foto</th>
                          <th className="px-5 py-3 text-xs font-bold text-emerald-700 uppercase tracking-wider text-right">Lokasi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-emerald-50">
                        {absenHistory.map((absen, index) => {
                          const raw   = absen.timestamp || "";
                          const parts = raw.split(" ");
                          let tanggal = parts[0] || "-";
                          const waktu = parts[1] || "-";
                          if (tanggal !== "-" && tanggal.includes("-")) {
                            const tp = tanggal.split("-");
                            tanggal = `${tp[2]}-${tp[1]}-${tp[0]}`;
                          }
                          return (
                            <tr key={absen.id || index} className="hover:bg-emerald-50/30">
                              <td className="px-5 py-4 font-bold text-emerald-900">{index + 1}</td>
                              <td className="px-5 py-4 font-medium text-emerald-900 text-sm">{tanggal}</td>
                              <td className="px-5 py-4 font-mono text-emerald-800 text-sm font-bold">{waktu}</td>
                              <td className="px-5 py-4 text-center">
                                {absen.photo_url ? (
                                  <a href={absen.photo_url} target="_blank" rel="noopener noreferrer" referrerPolicy="no-referrer"
                                    className="inline-flex items-center gap-1.5 text-emerald-600 hover:text-white font-bold text-xs bg-emerald-50 hover:bg-emerald-600 border border-emerald-200 px-3 py-1.5 rounded-lg transition-colors">
                                    <Camera size={14} /> Lihat
                                  </a>
                                ) : <span className="text-emerald-300 text-xs italic">-</span>}
                              </td>
                              <td className="px-5 py-4 text-right">
                                {absen.latitude && absen.longitude ? (
                                  <a href={`https://maps.google.com/?q=${absen.latitude},${absen.longitude}`} target="_blank" rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 text-blue-600 hover:text-white font-bold text-xs bg-blue-50 hover:bg-blue-600 border border-blue-200 px-3 py-1.5 rounded-lg transition-colors">
                                    <MapPin size={14} /> Maps
                                  </a>
                                ) : <span className="text-emerald-300 text-xs italic">-</span>}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="h-16 bg-white border-b border-emerald-100 flex items-center justify-between lg:justify-end px-6 lg:px-8 sticky top-0 z-30 shrink-0 lg:pl-8 pl-16 shadow-sm">
        <div className="flex lg:hidden items-center h-full">
          <img src={logo} alt="BPJS TK" className="h-10 w-auto object-contain" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-emerald-700/70 hidden sm:inline">Student Portal</span>
          <ChevronRight size={16} className="text-emerald-200 hidden sm:inline" />
          <span className="text-sm font-bold text-emerald-900 hidden sm:inline">Dashboard</span>
        </div>
      </header>

      <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full pb-20">

        {/* Welcome */}
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-black text-emerald-950 capitalize">
              Welcome back, {userName ? userName.split(" ")[0].toLowerCase() : "Student"}!
            </h1>
            <p className="text-emerald-700/60 mt-1 text-sm">Pantau aktivitas laporan Anda.</p>
          </div>
          <div className="flex gap-3">
            <a href={`https://localhost:5173/?nim=${userNim}`} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-md active:scale-95">
              <UserCheck size={20} /> Isi Absensi
            </a>
            <button onClick={fetchAbsenHistory}
              className="flex items-center gap-2 bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-50 px-5 py-2.5 rounded-xl font-bold transition-all shadow-sm active:scale-95">
              <History size={20} /> Riwayat Absensi
            </button>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map(card => (
            <div key={card.label} className="bg-white p-6 rounded-xl border border-emerald-100 shadow-sm hover:shadow-md transition-shadow">
              <div className={`p-2 ${card.bg} ${card.color} rounded-lg w-fit mb-4`}>{card.icon}</div>
              <p className="text-emerald-700/60 text-sm font-medium">{card.label}</p>
              <h3 className={`text-2xl font-black ${card.color}`}>{card.val}</h3>
            </div>
          ))}
        </div>

        {/* Tabel Laporan */}
        <div className="bg-white border border-emerald-100 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-emerald-50">
            <h2 className="text-lg font-black text-emerald-950">Riwayat Laporan Mingguan</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[600px]">
              <thead>
                <tr className="bg-emerald-50/50 border-b border-emerald-100">
                  <th className="px-6 py-4 text-xs font-bold uppercase text-emerald-700/70">Minggu</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-emerald-700/70">Tanggal Submit</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-emerald-700/70 text-center">BPU Kepling</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-emerald-700/70 text-center">BPU Keluarga</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-emerald-700/70 text-center">Sosialisasi</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-emerald-700/70 text-center">Drive</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-50">
                {loading ? (
                  <tr><td colSpan={6} className="px-6 py-12 text-center text-emerald-700/60">
                    <div className="flex justify-center mb-2">
                      <div className="w-6 h-6 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                    Loading...
                  </td></tr>
                ) : currentReports.length === 0 ? (
                  <tr><td colSpan={6} className="px-6 py-12 text-center text-emerald-700/60">Belum ada laporan.</td></tr>
                ) : currentReports.map((row, i) => {
                  const tgl = row.tanggal_submit
                    ? new Date(row.tanggal_submit.replace(" ", "T")).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
                    : "-";
                  // Support nama field lama & baru
                  const kepling    = row.total_kepling    ?? (row as any).akuisisi_bpu_kepling  ?? 0;
                  const keluarga   = row.total_keluarga   ?? (row as any).akuisisi_bpu_keluarga ?? 0;
                  const sosialisasi = row.total_sosialisasi ?? (row as any).jumlah_sosialisasi  ?? 0;
                  return (
                    <tr key={i} className="hover:bg-emerald-50/30 transition-colors">
                      <td className="px-6 py-4 text-sm font-bold text-emerald-900">{row.minggu}</td>
                      <td className="px-6 py-4 text-sm text-emerald-700/70">{tgl}</td>
                      <td className="px-6 py-4 text-center font-mono font-bold text-emerald-700">{kepling}</td>
                      <td className="px-6 py-4 text-center font-mono font-bold text-blue-600">{keluarga}</td>
                      <td className="px-6 py-4 text-center font-mono font-bold text-purple-600">{sosialisasi}</td>
                      <td className="px-6 py-4 text-center">
                        {row.link_drive ? (
                          <a href={row.link_drive} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-medium text-xs underline underline-offset-4">
                            <LinkIcon size={12} /> Buka <ExternalLink size={10} />
                          </a>
                        ) : <span className="text-emerald-300 italic text-xs">-</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-emerald-100 flex justify-between items-center text-sm text-emerald-700/60">
              <span>Halaman {currentPage} dari {totalPages}</span>
              <div className="flex gap-2">
                <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1}
                  className="px-3 py-1.5 rounded-lg border border-emerald-200 disabled:opacity-30 hover:bg-emerald-50">←</button>
                <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}
                  className="px-3 py-1.5 rounded-lg border border-emerald-200 disabled:opacity-30 hover:bg-emerald-50">→</button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}