import { ChevronRight, Medal, FileText, Link as LinkIcon, ExternalLink, UserCheck } from "lucide-react";
import { useEffect, useState } from "react";
import logo from "../image/logobpjss.png";

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Ambil data dari ingatan browser
    const nim = localStorage.getItem("userNim");
    const name = localStorage.getItem("userName");
    
    if (name) setUserName(name);

    if (nim) {
      // Panggil API PHP
      fetch(`http://localhost/api-penilaian/get_dashboard_mahasiswa.php?nim=${nim}&minggu=Minggu%201`)
        .then(res => res.json())
        .then(result => {
          if (result.status === "success") {
            const dbData = result.data;
            
            // Mengubah format tanggal dari XAMPP (Y-m-d H:i:s) menjadi format Indonesia yang cantik
            let formattedDate = "Minggu 1";
            if (dbData.tanggal_submit) {
              // Ganti spasi dengan 'T' agar aman di semua browser
              const dateObj = new Date(dbData.tanggal_submit.replace(" ", "T"));
              formattedDate = dateObj.toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
              }).replace(/\./g, ':'); // Ubah pemisah jam dari titik ke titik dua
            }
            
            const activityMap = [
              { key: "kehadiran_seminar", label: "Kehadiran Seminar" },
              { key: "akuisisi_pu", label: "Akuisisi PU" },
              { key: "akuisisi_bpu", label: "Akuisisi BPU" },
              { key: "jumlah_sosialisasi", label: "Jumlah Sosialisasi" },
              { key: "video_viralisasi", label: "Video Viralisasi" },
              { key: "administrasi", label: "Administrasi dan Laporan" },
              { key: "kunjungan_pu", label: "Kunjungan PU" },
              { key: "kunjungan_bpu", label: "Kunjungan BPU" },
            ];

            let calculatedTotalPoints = 0;
            const mappedReports: Report[] = [];

            activityMap.forEach((act, index) => {
              const count = Number(dbData[act.key as keyof typeof dbData]);
              if (count > 0) {
                calculatedTotalPoints += count;
                
                mappedReports.push({
                  id: index + 1,
                  date: formattedDate, // <-- Menggunakan TANGGAL ASLI di sini
                  activity_type: act.label,
                  description: `Melaporkan ${count} aktivitas ${act.label}`,
                  evidence_type: "link",
                  evidence_text: "Google Drive",
                  evidence_link: dbData.link_drive || "",
                  points: count,
                });
              }
            });

            setReports(mappedReports);
            setTotalPoints(calculatedTotalPoints);
            setReportCount(dbData.link_drive ? 1 : 0); 
          }
        })
        .catch(err => console.error("Failed to fetch reports:", err))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  return (
    <div className="flex flex-col min-h-full bg-emerald-50/20">
      
      {/* HEADER NAVBAR */}
      <header className="h-16 bg-white border-b border-emerald-100 flex items-center justify-between lg:justify-end px-6 lg:px-8 sticky top-0 z-30 shrink-0 lg:pl-8 pl-16 shadow-sm">
        <div className="flex lg:hidden items-center gap-3">
          <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center border border-emerald-50 shrink-0 p-0.5">
            <img src={logo} alt="Logo BPJS TK" className="w-full h-full object-contain" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-black text-emerald-950 tracking-tighter leading-none">SATU</h1>
            <div className="flex items-center gap-1 mt-0.5">
              <div className="h-[2px] w-2 bg-emerald-500 rounded-full"></div>
              <p className="text-[8px] font-black text-emerald-600 tracking-[0.2em] uppercase">BPJS TK</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-emerald-700/70 hidden sm:inline">Student Portal</span>
          <ChevronRight size={16} className="text-emerald-200 hidden sm:inline" />
          <span className="text-sm font-bold text-emerald-900 hidden sm:inline">Overview</span>
        </div>
      </header>

      {/* Konten Utama */}
      <div className="p-6 lg:p-8 space-y-6 lg:space-y-8 max-w-7xl mx-auto w-full pb-20">
        
        {/* WELCOME SECTION & TOMBOL ABSENSI DI KIRI */}
        <div className="flex flex-col gap-4 items-start">
          <div>
            <h1 className="text-2xl lg:text-3xl font-black text-emerald-950 capitalize">
              Welcome back, {userName ? userName.split(' ')[0].toLowerCase() : 'Student'}!
            </h1>
            <p className="text-emerald-700/60 mt-1 text-sm lg:text-base">Pantau aktivitas dan laporan Anda.</p>
          </div>
          
          <button 
            onClick={() => {/* Tambahkan fungsi navigasi/modal absensi di sini */}}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-sm hover:shadow-md active:scale-95 w-full sm:w-auto justify-center"
          >
            <UserCheck size={20} />
            <span>Isi Absensi</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <div className="bg-white p-6 rounded-xl border border-emerald-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                <Medal size={24} />
              </div>
            </div>
            <p className="text-emerald-700/60 text-sm font-medium">Total Points</p>
            <h3 className="text-2xl font-black text-emerald-900">{totalPoints}</h3>
          </div>

          <div className="bg-white p-6 rounded-xl border border-emerald-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                <FileText size={24} />
              </div>
            </div>
            <p className="text-emerald-700/60 text-sm font-medium">Weekly Reports Submitted</p>
            <h3 className="text-2xl font-black text-emerald-900">{reportCount}</h3>
          </div>
        </div>

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
                ) : reports.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-emerald-700/60 font-medium">
                      Belum ada laporan yang dikirimkan.
                    </td>
                  </tr>
                ) : (
                  reports.map((row) => (
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
                        {row.points > 0 ? `+${row.points}` : row.points}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="px-4 lg:px-6 py-4 border-t border-emerald-100 text-xs lg:text-sm text-emerald-700/60 flex flex-col sm:flex-row justify-between items-center gap-4 bg-emerald-50/10">
            <span>Menampilkan {reports.length} data aktivitas</span>
            <div className="flex gap-2 w-full sm:w-auto">
               <button className="flex-1 sm:flex-none px-3 py-1.5 rounded border border-emerald-200 hover:bg-emerald-50 text-emerald-700 transition-colors text-center cursor-not-allowed opacity-50">Kembali</button>
               <button className="flex-1 sm:flex-none px-3 py-1.5 rounded border border-emerald-200 hover:bg-emerald-50 text-emerald-700 transition-colors font-bold bg-emerald-50 text-center cursor-not-allowed opacity-50">Selanjutnya</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}