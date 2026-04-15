import { useEffect, useState } from "react";
import { History, CalendarDays, Camera, MapPin, ArrowLeft, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";

// --- KOMPONEN PENERJEMAH KOORDINAT ---
const LocationName = ({ lat, lng }: { lat: number; lng: number }) => {
  const [address, setAddress] = useState("Melacak jalan...");

  useEffect(() => {
    if (!lat || !lng) { setAddress("Tidak tersedia"); return; }
    const cacheKey = `loc_${lat}_${lng}`;
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) { setAddress(cached); return; }

    const randomDelay = Math.floor(Math.random() * 2500) + 500;
    const timeoutId = setTimeout(() => {
      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&email=admin@kampus.ac.id`)
        .then(res => { if (!res.ok) throw new Error("Limit"); return res.json(); })
        .then(data => {
          if (data && data.address) {
            const street = data.address.road || data.address.neighbourhood || data.address.suburb || data.address.village || "Lokasi terdeteksi";
            setAddress(street); sessionStorage.setItem(cacheKey, street);
          } else setAddress("Jalan tak dikenal");
        })
        .catch(() => setAddress("Satelit sibuk (Gagal)"));
    }, randomDelay);
    return () => clearTimeout(timeoutId);
  }, [lat, lng]);

  return (
    <span className="inline-flex items-center justify-end gap-1.5 text-emerald-900 font-bold text-[10px] sm:text-xs whitespace-nowrap bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
      <MapPin size={12} className="text-emerald-500 shrink-0" /> 
      <span className="truncate max-w-[150px] sm:max-w-[200px] text-right" title={address}>{address}</span>
    </span>
  );
};
// ---------------------------------------------------

export default function RiwayatAbsen() {
  const [absenHistory, setAbsenHistory] = useState<any[]>([]);
  const [loadingAbsen, setLoadingAbsen] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const nim = localStorage.getItem("userNim");
    if (!nim) {
      navigate("/"); // Usir ke halaman login kalau tidak ada NIM
      return;
    }

    fetch(`https://api-penilaian-ruby.vercel.app/get_history_absen.php?nim=${nim}`)
      .then(r => r.json())
      .then(result => { if (result.status === "success") setAbsenHistory(result.data); })
      .catch(err => console.error(err))
      .finally(() => setLoadingAbsen(false));
  }, [navigate]);

  return (
    <div className="min-h-screen bg-emerald-50/20 pb-20">
      {/* HEADER NAVBAR */}
      <header className="h-16 bg-white/90 backdrop-blur-md border-b border-emerald-100 flex items-center px-4 sm:px-6 lg:px-8 sticky top-0 z-30 shadow-sm">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-emerald-700 hover:text-emerald-900 font-bold transition-colors">
          <ArrowLeft size={20} /> <span className="hidden sm:inline">Kembali ke Dashboard</span>
        </button>
      </header>

      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        <div className="mb-6 flex items-center gap-3">
          <div className="p-3 bg-emerald-600 text-white rounded-xl"><History size={24} /></div>
          <h1 className="text-2xl sm:text-3xl font-black text-emerald-950 tracking-tight">Riwayat Kehadiran Anda</h1>
        </div>

        {/* AREA TABEL */}
        <div className="bg-white border border-emerald-100 rounded-2xl sm:rounded-[2rem] shadow-[0_4px_20px_rgb(0,0,0,0.03)] overflow-hidden">
          {loadingAbsen ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              <p className="font-bold animate-pulse text-base sm:text-lg text-emerald-600">Mengambil data absensi...</p>
            </div>
          ) : absenHistory.length === 0 ? (
            <div className="text-center py-20">
              <CalendarDays size={64} className="mx-auto text-emerald-200 mb-4" />
              <p className="text-emerald-950 font-black text-lg sm:text-xl mb-2">Belum ada riwayat absensi</p>
            </div>
          ) : (
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left min-w-[800px]">
                <thead className="bg-emerald-50/80 border-b border-emerald-100">
                  <tr>
                    <th className="px-4 sm:px-6 py-4 text-[11px] sm:text-xs font-black text-emerald-800 uppercase tracking-widest">No</th>
                    <th className="px-4 sm:px-6 py-4 text-[11px] sm:text-xs font-black text-emerald-800 uppercase tracking-widest">Tanggal</th>
                    <th className="px-4 sm:px-6 py-4 text-[11px] sm:text-xs font-black text-emerald-800 uppercase tracking-widest">Waktu</th>
                    <th className="px-4 sm:px-6 py-4 text-[11px] sm:text-xs font-black text-emerald-800 uppercase tracking-widest text-center">Tipe Absen</th>
                    <th className="px-4 sm:px-6 py-4 text-[11px] sm:text-xs font-black text-emerald-800 uppercase tracking-widest min-w-[250px]">Laporan Jurnal</th>
                    <th className="px-4 sm:px-6 py-4 text-[11px] sm:text-xs font-black text-emerald-800 uppercase tracking-widest text-center">Bukti Foto</th>
                    <th className="px-4 sm:px-6 py-4 text-[11px] sm:text-xs font-black text-emerald-800 uppercase tracking-widest text-right">Lokasi GPS</th>
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
                    let labelTipe = "Masuk"; let warnaTipe = "bg-emerald-100 text-emerald-700 border-emerald-200";
                    if (tipeRaw === "out") { labelTipe = "Pulang"; warnaTipe = "bg-orange-100 text-orange-700 border-orange-200"; }
                    else if (tipeRaw === "meet-in") { labelTipe = "Masuk (Meet)"; warnaTipe = "bg-blue-100 text-blue-700 border-blue-200"; }
                    else if (tipeRaw === "meet-out") { labelTipe = "Pulang (Meet)"; warnaTipe = "bg-rose-100 text-rose-700 border-rose-200"; }

                    const textLaporan = absen.report || absen.catatan;

                    return (
                      <tr key={absen.id || index} className="hover:bg-emerald-50/50 transition-colors">
                        <td className="px-4 sm:px-6 py-4 font-black text-emerald-950 text-sm align-top">{index + 1}</td>
                        <td className="px-4 sm:px-6 py-4 font-bold text-emerald-800 text-sm whitespace-nowrap align-top">{tanggal}</td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap align-top">
                          <span className="font-mono text-xs sm:text-sm font-bold bg-white border border-emerald-100 shadow-sm px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-emerald-700">{waktu}</span>
                        </td>
                        <td className="px-4 sm:px-6 py-4 text-center whitespace-nowrap align-top">
                          <span className={`text-[10px] sm:text-xs font-black px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg border shadow-sm ${warnaTipe}`}>{labelTipe}</span>
                        </td>
                        <td className="px-4 sm:px-6 py-4 align-top w-[250px] sm:w-[350px]">
                          {textLaporan ? (
                            <div className="group flex gap-3 items-start bg-white p-3 rounded-xl border border-emerald-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)] cursor-default">
                              <div className="p-1.5 bg-emerald-50 rounded-lg shrink-0"><FileText size={16} className="text-emerald-500" /></div>
                              <p className="text-xs sm:text-sm font-medium text-slate-700 leading-relaxed">{textLaporan}</p>
                            </div>
                          ) : <div className="flex items-center justify-center gap-2 bg-slate-50/80 border border-dashed border-slate-200 p-2.5 rounded-xl text-slate-400"><FileText size={14} className="opacity-50" /><span className="text-[10px] sm:text-xs font-medium italic">Tidak ada laporan</span></div>}
                        </td>
                        <td className="px-4 sm:px-6 py-4 text-center align-top">
                          {absen.photo_url ? (
                            <a href={absen.photo_url.startsWith('http') ? absen.photo_url : `https://${absen.photo_url}`} target="_blank" rel="noopener noreferrer"
                               className="inline-flex items-center gap-1.5 sm:gap-2 text-emerald-700 hover:text-white font-bold text-[10px] sm:text-xs bg-emerald-50 hover:bg-emerald-600 border border-emerald-200 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl transition-colors whitespace-nowrap">
                              <Camera size={14} /> Lihat Foto
                            </a>
                          ) : <span className="text-emerald-300 text-[10px] sm:text-xs italic whitespace-nowrap">Tidak ada foto</span>}
                        </td>
                        <td className="px-4 sm:px-6 py-4 text-right align-top">
                          {(absen.latitude && absen.longitude) ? <LocationName lat={absen.latitude} lng={absen.longitude} /> : <span className="text-emerald-400 text-[10px] sm:text-xs italic whitespace-nowrap">Tidak tersedia</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}