import { ChevronRight, Users, Heart, Megaphone, Video, ExternalLink, Link as LinkIcon, History, X, CalendarDays, Camera, MapPin, UserCheck, ChevronDown, FileText } from "lucide-react";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import logo from "../image/bpjstk.jpeg";

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

// --- KOMPONEN PENERJEMAH KOORDINAT KE NAMA JALAN (DENGAN ANTREAN PINTAR) ---
const LocationName = ({ lat, lng }: { lat: number; lng: number }) => {
  const [address, setAddress] = useState("Melacak jalan...");

  useEffect(() => {
    if (!lat || !lng) {
      setAddress("Tidak tersedia");
      return;
    }
    
    // 1. Cek apakah lokasi ini sudah pernah dilacak sebelumnya (Cache)
    const cacheKey = `loc_${lat}_${lng}`;
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      setAddress(cached);
      return;
    }

    // 2. Buat jeda waktu acak (antara 500ms hingga 3000ms) agar tidak membanjiri server
    const randomDelay = Math.floor(Math.random() * 2500) + 500;
    
    const timeoutId = setTimeout(() => {
      // Menambahkan parameter email palsu agar server OpenStreetMap tidak mengira ini bot spam
      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&email=admin@kampus.ac.id`)
        .then(res => {
          if (!res.ok) throw new Error("Terkena limit API");
          return res.json();
        })
        .then(data => {
          if (data && data.address) {
            // Ambil nama jalan terdekat
            const street = data.address.road || data.address.neighbourhood || data.address.suburb || data.address.village || "Lokasi terdeteksi";
            setAddress(street);
            sessionStorage.setItem(cacheKey, street); // Simpan ke memori browser
          } else {
            setAddress("Jalan tak dikenal");
          }
        })
        .catch(() => setAddress("Satelit sibuk (Gagal)"));
    }, randomDelay);

    // Bersihkan antrean jika pengguna menutup modal sebelum pelacakan selesai
    return () => clearTimeout(timeoutId);
  }, [lat, lng]);

  return (
    <span className="inline-flex items-center justify-end gap-1.5 text-emerald-900 font-bold text-[10px] sm:text-xs whitespace-nowrap bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
      <MapPin size={12} className="text-emerald-500 shrink-0" /> 
      <span className="truncate max-w-[150px] sm:max-w-[200px] text-right" title={address}>
        {address}
      </span>
    </span>
  );
};
// ---------------------------------------------------

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
      // 1. MENGAMBIL DATA LAPORAN MINGGUAN
      fetch(`https://api-penilaian.vercel.app/get_dashboard_mahasiswa.php?nim=${nim}`)
        .then(r => r.json())
        .then(result => {
          if (result.status === "success") {
            const data = result.data ?? [];
            setReports(data);

            if (result.summary) {
              const s = result.summary;
              setTotalKepling(s.total_kepling       || 0);
              setTotalKeluarga(s.total_keluarga     || 0);
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
        })
        .catch(err => console.error(err))
        .finally(() => setLoading(false));

      // 2. MENGHITUNG KEHADIRAN ZOOM BERDASARKAN RIWAYAT ABSEN
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
            Object.values(dateMap).forEach(day => {
              if (day.in && day.out) meetCount++; 
            });
            
            setJumlahHadir(meetCount);
          }
        })
        .catch(err => console.error("Gagal menghitung Hadir Zoom:", err));

    } else {
      setLoading(false);
    }
  }, []);

  const fetchAbsenHistory = () => {
    setIsAbsenModalOpen(true);
    setLoadingAbsen(true);
    fetch(`https://api-penilaian.vercel.app/get_history_absen.php?nim=${userNim}`)
      .then(r => r.json())
      .then(result => { if (result.status === "success") setAbsenHistory(result.data); })
      .catch(err => console.error(err))
      .finally(() => setLoadingAbsen(false));
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
    <div className="flex flex-col min-h-full bg-emerald-50/20">

      {/* ─── MODAL RIWAYAT ABSENSI (RESPONSIF) ─── */}
      <AnimatePresence>
        {isAbsenModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-emerald-950/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white rounded-2xl sm:rounded-3xl w-full max-w-5xl max-h-[90vh] sm:max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
              
              <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-emerald-100 flex justify-between items-center bg-emerald-50/50 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-600 text-white rounded-xl"><History size={20} /></div>
                  <h3 className="text-lg sm:text-xl font-black text-emerald-950 truncate">Riwayat Kehadiran Anda</h3>
                </div>
                <button onClick={() => setIsAbsenModalOpen(false)} className="p-2 text-emerald-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all shrink-0">
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                {loadingAbsen ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-4">
                    <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                    <p className="font-bold animate-pulse text-base sm:text-lg text-emerald-600">Mengambil data absensi...</p>
                  </div>
                ) : absenHistory.length === 0 ? (
                  <div className="text-center py-16 sm:py-20">
                    <CalendarDays size={48} className="mx-auto text-emerald-200 mb-4" />
                    <p className="text-emerald-950 font-black text-lg sm:text-xl mb-2">Belum ada riwayat absensi</p>
                  </div>
                ) : (
                  <div className="border border-emerald-100 rounded-xl sm:rounded-2xl shadow-sm overflow-hidden flex flex-col">
                    <div className="overflow-x-auto w-full">
                      <table className="w-full text-left min-w-[800px]">
                        <thead className="bg-emerald-50/80 border-b border-emerald-100">
                          <tr>
                            <th className="px-4 sm:px-6 py-3 sm:py-4 text-[11px] sm:text-xs font-black text-emerald-800 uppercase tracking-widest whitespace-nowrap">No</th>
                            <th className="px-4 sm:px-6 py-3 sm:py-4 text-[11px] sm:text-xs font-black text-emerald-800 uppercase tracking-widest whitespace-nowrap">Tanggal</th>
                            <th className="px-4 sm:px-6 py-3 sm:py-4 text-[11px] sm:text-xs font-black text-emerald-800 uppercase tracking-widest whitespace-nowrap">Waktu</th>
                            <th className="px-4 sm:px-6 py-3 sm:py-4 text-[11px] sm:text-xs font-black text-emerald-800 uppercase tracking-widest text-center whitespace-nowrap">Tipe Absen</th>
                            {/* HEADER LAPORAN */}
                            <th className="px-4 sm:px-6 py-3 sm:py-4 text-[11px] sm:text-xs font-black text-emerald-800 uppercase tracking-widest min-w-[200px]">Laporan Jurnal</th>
                            <th className="px-4 sm:px-6 py-3 sm:py-4 text-[11px] sm:text-xs font-black text-emerald-800 uppercase tracking-widest text-center whitespace-nowrap">Bukti Foto</th>
                            <th className="px-4 sm:px-6 py-3 sm:py-4 text-[11px] sm:text-xs font-black text-emerald-800 uppercase tracking-widest text-right whitespace-nowrap">Lokasi GPS</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-emerald-50">
                          {absenHistory.map((absen, index) => {
                            const raw = absen.timestamp || "";
                            let tanggal = "-"; let waktu = "-";
                            
                            if (raw.includes(" ")) {
                              const parts = raw.split(" ");
                              if (parts[0].includes("-")) { const dp = parts[0].split("-"); tanggal = `${dp[2]}-${dp[1]}-${dp[0]}`; }
                              if (parts[1]?.includes(":")) { const tp = parts[1].split(":"); waktu = `${tp[0]}:${tp[1]} WIB`; }
                            }

                            const tipeRaw = absen.type || "in";
                            let labelTipe = "Masuk";
                            let warnaTipe = "bg-emerald-100 text-emerald-700 border-emerald-200";

                            if (tipeRaw === "out") {
                              labelTipe = "Pulang";
                              warnaTipe = "bg-orange-100 text-orange-700 border-orange-200";
                            } else if (tipeRaw === "meet-in") {
                              labelTipe = "Masuk (Meet)";
                              warnaTipe = "bg-blue-100 text-blue-700 border-blue-200";
                            } else if (tipeRaw === "meet-out") {
                              labelTipe = "Pulang (Meet)";
                              warnaTipe = "bg-rose-100 text-rose-700 border-rose-200";
                            }

                            // Variabel penangkap teks laporan
                            const textLaporan = absen.report || absen.catatan;

                            return (
                              <tr key={absen.id || index} className="hover:bg-emerald-50/50 transition-colors">
                                <td className="px-4 sm:px-6 py-3 sm:py-4 font-black text-emerald-950 text-sm align-top">{index + 1}</td>
                                <td className="px-4 sm:px-6 py-3 sm:py-4 font-bold text-emerald-800 text-sm whitespace-nowrap align-top">{tanggal}</td>
                                <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap align-top">
                                  <span className="font-mono text-xs sm:text-sm font-bold bg-white border border-emerald-100 shadow-sm px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-emerald-700">{waktu}</span>
                                </td>
                                
                                <td className="px-4 sm:px-6 py-3 sm:py-4 text-center whitespace-nowrap align-top">
                                  <span className={`text-[10px] sm:text-xs font-black px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg border shadow-sm ${warnaTipe}`}>
                                    {labelTipe}
                                  </span>
                                </td>

                                {/* ─── TAMPILAN KOLOM LAPORAN JURNAL (RAPI & ELEGAN) ─── */}
                                <td className="px-4 sm:px-6 py-3 sm:py-4 align-top w-[250px] sm:w-[350px]">
                                  {textLaporan ? (
                                    <div className="group flex gap-3 items-start bg-white p-3 rounded-xl border border-emerald-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)] hover:shadow-md hover:border-emerald-300 hover:bg-emerald-50/30 transition-all duration-300 cursor-default">
                                      <div className="p-1.5 bg-emerald-50 group-hover:bg-emerald-500 rounded-lg shrink-0 transition-colors duration-300">
                                        <FileText size={16} className="text-emerald-500 group-hover:text-white" />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className="text-xs sm:text-sm font-medium text-slate-700 leading-relaxed line-clamp-2 group-hover:line-clamp-none transition-all duration-300">
                                          {textLaporan}
                                        </p>
                                        <p className="text-[10px] font-bold text-emerald-500 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 h-0 group-hover:h-auto overflow-hidden">
                                          Baca selengkapnya
                                        </p>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="flex items-center justify-center gap-2 bg-slate-50/80 border border-dashed border-slate-200 p-2.5 rounded-xl text-slate-400">
                                      <FileText size={14} className="opacity-50" />
                                      <span className="text-[10px] sm:text-xs font-medium italic">Tidak ada laporan</span>
                                    </div>
                                  )}
                                </td>
                                
                                <td className="px-4 sm:px-6 py-3 sm:py-4 text-center align-top">
                                  {absen.photo_url ? (
                                    <a href={absen.photo_url.startsWith('http') ? absen.photo_url : `https://${absen.photo_url}`} target="_blank" rel="noopener noreferrer" referrerPolicy="no-referrer"
                                      className="inline-flex items-center gap-1.5 sm:gap-2 text-emerald-700 hover:text-white font-bold text-[10px] sm:text-xs bg-emerald-50 hover:bg-emerald-600 border border-emerald-200 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl transition-colors whitespace-nowrap">
                                      <Camera size={14} /> Lihat Foto
                                    </a>
                                  ) : <span className="text-emerald-300 text-[10px] sm:text-xs italic whitespace-nowrap">Tidak ada foto</span>}
                                </td>
                                
                                <td className="px-4 sm:px-6 py-3 sm:py-4 text-right align-top">
                                  {(absen.latitude && absen.longitude) ? (
                                    <LocationName lat={absen.latitude} lng={absen.longitude} />
                                  ) : (
                                    <span className="text-emerald-400 text-[10px] sm:text-xs italic whitespace-nowrap">Tidak tersedia</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── HEADER NAVBAR ─── */}
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

      <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full pb-20">

        {/* ─── HERO & ACTION BUTTONS ─── */}
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-emerald-950 capitalize tracking-tight">
              Welcome back, {userName ? userName.split(" ")[0].toLowerCase() : "Student"}!
            </h1>
            <p className="text-emerald-700/60 mt-1.5 text-sm sm:text-base font-medium">Pantau aktivitas dan riwayat laporan Anda.</p>
          </div>
          <div className="flex flex-wrap gap-3">
          <a  href={`https://localhost:5173/?nim=${userNim}`} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl font-bold transition-all shadow-md active:scale-95 text-sm sm:text-base flex-1 sm:flex-none">
              <UserCheck size={20} /> Isi Presensi 
            </a>
            <button onClick={fetchAbsenHistory}
              className="flex items-center justify-center gap-2 bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-50 px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl font-bold transition-all shadow-sm active:scale-95 text-sm sm:text-base flex-1 sm:flex-none">
              <History size={20} /> Riwayat Absensi
            </button>
          </div>
        </div>

        {/* ─── KARTU STATISTIK ─── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {statCards.map(card => (
            <div key={card.label} className="bg-white p-4 sm:p-6 rounded-2xl border border-emerald-50 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_4px_20px_rgb(0,0,0,0.06)] transition-all">
              <div className={`p-2.5 sm:p-3 ${card.bg} ${card.color} rounded-xl w-fit mb-3 sm:mb-4`}>{card.icon}</div>
              <p className="text-emerald-700/60 text-xs sm:text-sm font-bold mb-1">{card.label}</p>
              <h3 className={`text-2xl sm:text-3xl font-black ${card.color}`}>{card.val}</h3>
            </div>
          ))}
        </div>

        {/* ─── TABEL LAPORAN MINGGUAN (RESPONSIF) ─── */}
        <div className="bg-white border border-emerald-100 rounded-2xl sm:rounded-[2rem] shadow-[0_4px_20px_rgb(0,0,0,0.03)] overflow-hidden">
          <div className="px-5 sm:px-6 py-4 sm:py-5 border-b border-emerald-50">
            <h2 className="text-base sm:text-lg font-black text-emerald-950 flex items-center gap-2">
              <span className="w-1.5 sm:w-2 h-5 sm:h-6 bg-emerald-500 rounded-full"></span> Riwayat Laporan Mingguan
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
                    Belum ada laporan yang Anda kumpulkan.
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

          {/* PAGINATION */}
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