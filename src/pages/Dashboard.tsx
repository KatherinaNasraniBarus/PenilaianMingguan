import { ChevronRight, Medal, FileText, Link as LinkIcon, ExternalLink, UserCheck, History, X, CalendarDays, MapPin, Camera } from "lucide-react";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import logo from "../image/bpjstk.jpeg";

interface Report {
  id: number;
  date: string;
  activity_type: string;
  description: string;
  evidence_type: string;
  evidence_text: string;
  evidence_link: string;
  points: number;
}

export default function Dashboard() {
  const [reports, setReports] = useState<Report[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [reportCount, setReportCount] = useState(0);
  const [userName, setUserName] = useState("");
  const [userNim, setUserNim] = useState("");
  const [loading, setLoading] = useState(true);

  // ─── STATE UNTUK PAGINATION (DARI TEMAN) ───
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // ─── STATE KHUSUS RIWAYAT ABSENSI (DARI ANDA) ───
  const [isAbsenModalOpen, setIsAbsenModalOpen] = useState(false);
  const [absenHistory, setAbsenHistory] = useState<any[]>([]);
  const [loadingAbsen, setLoadingAbsen] = useState(false);

  useEffect(() => {
    const nim = localStorage.getItem("userNim");
    const name = localStorage.getItem("userName");
    
    if (name) setUserName(name);
    if (nim) setUserNim(nim);

    if (nim) {
      fetch(`https://api-penilaian.vercel.app/get_dashboard_mahasiswa.php?nim=${nim}`)
        .then(res => res.json())
        .then(result => {
          if (result.status === "success") {
            const reportsData = result.data; 
            
            let calculatedTotalPoints = 0;
            let calculatedReportCount = reportsData.length; 
            const mappedReports: Report[] = [];
            let reportIdCounter = 1;

            // Kategori aktivitas yang sudah disesuaikan teman Anda
            const activityMap = [
              { key: "kehadiran_seminar", label: "Kehadiran Seminar" },
              { key: "akuisisi_bpu_kepling", label: "Akuisisi BPU Kepling" },
              { key: "akuisisi_bpu_keluarga", label: "Akuisisi BPU Keluarga" },
              { key: "jumlah_sosialisasi", label: "Jumlah Sosialisasi" },
              { key: "administrasi", label: "Administrasi dan Laporan" },
            ];

            reportsData.forEach((dbData: any) => {
              let formattedDate = dbData.minggu;
              if (dbData.tanggal_submit) {
                const dateObj = new Date(dbData.tanggal_submit.replace(" ", "T"));
                formattedDate = dateObj.toLocaleDateString("id-ID", {
                  day: "numeric", month: "short", year: "numeric",
                  hour: "2-digit", minute: "2-digit"
                }).replace(/\./g, ':');
              }

              activityMap.forEach((act) => {
                const count = Number(dbData[act.key]);
                if (count > 0) {
                  calculatedTotalPoints += count;
                  
                  mappedReports.push({
                    id: reportIdCounter++,
                    date: formattedDate,
                    activity_type: act.label,
                    description: `[${dbData.minggu}] Melaporkan ${count} aktivitas ${act.label}`,
                    evidence_type: "link",
                    evidence_text: "Google Drive",
                    evidence_link: dbData.link_drive || "",
                    points: count,
                  });
                }
              });
            });

            setReports(mappedReports);
            setTotalPoints(calculatedTotalPoints);
            setReportCount(calculatedReportCount); 
          }
        })
        .catch(err => console.error("Failed to fetch reports:", err))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  // ─── LOGIKA PAGINATION ───
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentReports = reports.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(reports.length / itemsPerPage);

  const getPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
    return pages;
  };

  // ─── FUNGSI MENGAMBIL ABSEN ───
  const fetchAbsenHistory = () => {
    setIsAbsenModalOpen(true);
    setLoadingAbsen(true);
    
    fetch(`https://api-penilaian.vercel.app/get_history_absen.php?nim=${userNim}`)
      .then(res => res.json())
      .then(result => {
        if (result.status === "success") {
          setAbsenHistory(result.data);
        } else {
          console.error("Gagal mengambil absen:", result.message);
        }
      })
      .catch(err => console.error("Error API Absen:", err))
      .finally(() => setLoadingAbsen(false));
  };

  return (
    <div className="flex flex-col min-h-full bg-emerald-50/20">

      {/* ─── MODAL RIWAYAT ABSENSI ─── */}
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
                    <p className="font-bold animate-pulse">Menarik data dari server absensi...</p>
                  </div>
                ) : absenHistory.length === 0 ? (
                  <div className="text-center py-16">
                    <CalendarDays size={48} className="mx-auto text-emerald-200 mb-4" />
                    <p className="text-emerald-900 font-bold text-lg">Belum ada riwayat absensi</p>
                    <p className="text-emerald-700/60 text-sm mt-1">Anda belum pernah melakukan presensi melalui sistem ini.</p>
                  </div>
                ) : (
                  <div className="border border-emerald-100 rounded-2xl overflow-hidden">
                    <table className="w-full text-left">
                      <thead className="bg-emerald-50/50 border-b border-emerald-100">
                        <tr>
                          <th className="px-5 py-3 text-xs font-bold text-emerald-700 uppercase tracking-wider">No</th>
                          <th className="px-5 py-3 text-xs font-bold text-emerald-700 uppercase tracking-wider">Tanggal</th>
                          <th className="px-5 py-3 text-xs font-bold text-emerald-700 uppercase tracking-wider">Waktu</th>
                          <th className="px-5 py-3 text-xs font-bold text-emerald-700 uppercase tracking-wider text-center">Bukti Foto</th>
                          <th className="px-5 py-3 text-xs font-bold text-emerald-700 uppercase tracking-wider text-right">Lokasi Maps</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-emerald-50">
                        {absenHistory.map((absen, index) => {
                          const rawTimestamp = absen.timestamp || "";
                          const parts = rawTimestamp.split(" ");
                          const tanggal = parts[0] || "-";
                          const waktu = parts[1] || "-";

                          return (
                            <tr key={absen.id || index} className="hover:bg-emerald-50/30 transition-colors">
                              <td className="px-5 py-4 font-bold text-emerald-900">{index + 1}</td>
                              
                              <td className="px-5 py-4">
                                <span className="font-medium text-emerald-900 text-sm">
                                  {tanggal}
                                </span>
                              </td>
                              
                              <td className="px-5 py-4">
                                <span className="font-mono text-emerald-800 text-sm font-bold bg-emerald-100/50 px-2 py-1 rounded">
                                  {waktu}
                                </span>
                              </td>

                              {/* PERBAIKAN TOMBOL FOTO MAHASISWA */}
                              <td className="px-5 py-4 text-center">
                                <a 
                                  href={absen.photo_url ? absen.photo_url : "#"} 
                                  onClick={(e) => !absen.photo_url && e.preventDefault()}
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 text-emerald-600 hover:text-white font-bold text-xs bg-emerald-50 hover:bg-emerald-600 border border-emerald-200 px-3 py-1.5 rounded-lg transition-colors shadow-sm"
                                >
                                  <Camera size={14} /> Lihat Foto
                                </a>
                              </td>

                              <td className="px-5 py-4 text-right">
                                {(absen.latitude && absen.longitude) ? (
                                  <a 
                                    href={`http://maps.google.com/maps?q=${absen.latitude},${absen.longitude}`} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center justify-end gap-1.5 text-blue-600 hover:text-white font-bold text-xs bg-blue-50 hover:bg-blue-600 border border-blue-200 px-3 py-1.5 rounded-lg transition-colors shadow-sm"
                                  >
                                    <MapPin size={14} /> Google Maps
                                  </a>
                                ) : (
                                  <span className="text-emerald-300 text-xs italic">Lokasi kosong</span>
                                )}
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
      {/* ─── END MODAL ─── */}
      
      {/* HEADER NAVBAR */}
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

      {/* Konten Utama */}
      <div className="p-6 lg:p-8 space-y-6 lg:space-y-8 max-w-7xl mx-auto w-full pb-20">
        
        {/* WELCOME SECTION */}
        <div className="flex flex-col gap-4 items-start">
          <div>
            <h1 className="text-2xl lg:text-3xl font-black text-emerald-950 capitalize">
              Welcome back, {userName ? userName.split(' ')[0].toLowerCase() : 'Student'}!
            </h1>
            <p className="text-emerald-700/60 mt-1 text-sm lg:text-base">Pantau aktivitas dan laporan Anda.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto mt-2">
          <a 
              href={`http://localhost:5173/?nim=${userNim}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-md active:scale-95 justify-center"
            >
              <UserCheck size={20} />
              <span>Isi Absensi</span>
            </a>
            
            <button 
              onClick={fetchAbsenHistory}
              className="flex items-center gap-2 bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-50 px-5 py-2.5 rounded-xl font-bold transition-all shadow-sm active:scale-95 justify-center"
            >
              <History size={20} />
              <span>Riwayat Absensi</span>
            </button>
          </div>
        </div>

        {/* STATS CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <div className="bg-white p-6 rounded-xl border border-emerald-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg w-fit mb-4">
              <Medal size={24} />
            </div>
            <p className="text-emerald-700/60 text-sm font-medium">Total Points</p>
            <h3 className="text-2xl font-black text-emerald-900">{totalPoints}</h3>
          </div>

          <div className="bg-white p-6 rounded-xl border border-emerald-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="p-2 bg-green-50 text-green-600 rounded-lg w-fit mb-4">
              <FileText size={24} />
            </div>
            <p className="text-emerald-700/60 text-sm font-medium">Weekly Reports Submitted</p>
            <h3 className="text-2xl font-black text-emerald-900">{reportCount}</h3>
          </div>
        </div>

        {/* TABLE SECTION */}
        <div className="bg-white border border-emerald-100 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[600px]">
              <thead>
                <tr className="bg-emerald-50/50 border-b border-emerald-100">
                  <th className="px-6 py-4 text-xs font-bold uppercase text-emerald-700/70">Tanggal</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-emerald-700/70">Jenis Aktivitas</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-emerald-700/70">Deskripsi</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-emerald-700/70">Link Drive</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-emerald-700/70 text-right">Point</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-emerald-50">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-emerald-700/60 font-medium">
                      <div className="flex justify-center mb-2">
                         <div className="w-6 h-6 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                      </div>
                      Loading reports...
                    </td>
                  </tr>
                ) : currentReports.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-emerald-700/60 font-medium">
                      Belum ada laporan yang dikirimkan.
                    </td>
                  </tr>
                ) : (
                  currentReports.map((row) => (
                    <tr key={row.id} className="hover:bg-emerald-50/30 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-emerald-900 whitespace-nowrap">{row.date}</td>
                      <td className="px-6 py-4 text-sm text-emerald-800 font-semibold">{row.activity_type}</td>
                      <td className="px-6 py-4 text-sm text-emerald-700/70">
                        <div className="max-w-[150px] lg:max-w-[220px] truncate" title={row.description}>
                          {row.description}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {row.evidence_link ? (
                          <a 
                            href={row.evidence_link.startsWith('http') ? row.evidence_link : `https://${row.evidence_link}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-emerald-600 hover:text-emerald-700 flex items-center gap-1 font-medium underline underline-offset-4 decoration-emerald-200"
                          >
                            <LinkIcon size={14} />
                            <span className="truncate max-w-[100px] inline-block">{row.evidence_text}</span>
                            <ExternalLink size={10} className="ml-0.5 opacity-50 shrink-0" />
                          </a>
                        ) : (
                          <span className="text-emerald-400 italic">No link provided</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right font-mono font-black text-emerald-600">
                        +{row.points}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* FOOTER PAGINATION */}
          <div className="px-4 lg:px-6 py-4 border-t border-emerald-100 text-xs lg:text-sm text-emerald-700/60 flex flex-col sm:flex-row justify-between items-center gap-4 bg-emerald-50/10">
            <span>
              Menampilkan {reports.length > 0 ? indexOfFirstItem + 1 : 0} - {Math.min(indexOfLastItem, reports.length)} dari {reports.length} data
            </span>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`px-3 py-1.5 rounded-lg border border-emerald-200 transition-all ${
                  currentPage === 1 ? "opacity-40 cursor-not-allowed bg-gray-50" : "hover:bg-emerald-50 text-emerald-700 active:scale-95"
                }`}
              >
                Prev
              </button>

              <div className="flex gap-1">
                {getPageNumbers().map((num) => (
                  <button
                    key={num}
                    onClick={() => setCurrentPage(num)}
                    className={`w-9 h-9 rounded-lg border font-bold transition-all ${
                      currentPage === num
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-md"
                        : "border-emerald-100 text-emerald-600 hover:bg-emerald-50"
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>

              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages || totalPages === 0}
                className={`px-3 py-1.5 rounded-lg border border-emerald-200 transition-all ${
                  currentPage === totalPages || totalPages === 0 ? "opacity-40 cursor-not-allowed bg-gray-50" : "hover:bg-emerald-50 text-emerald-700 active:scale-95"
                }`}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}