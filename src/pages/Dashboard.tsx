import { ChevronRight, Medal, FileText, Link as LinkIcon, ExternalLink, UserCheck } from "lucide-react";
import { useEffect, useState } from "react";
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
  const [loading, setLoading] = useState(true);

  // STATE UNTUK PAGINATION
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const nim = localStorage.getItem("userNim");
    const name = localStorage.getItem("userName");
    
    if (name) setUserName(name);

    if (nim) {
      fetch(`http://localhost/api-penilaian/get_dashboard_mahasiswa.php?nim=${nim}`)
        .then(res => res.json())
        .then(result => {
          if (result.status === "success") {
            const reportsData = result.data;
            
            let calculatedTotalPoints = 0;
            let calculatedReportCount = reportsData.length; 
            const mappedReports: Report[] = [];
            let reportIdCounter = 1;

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

  // LOGIKA PAGINATION
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

  return (
    <div className="flex flex-col min-h-full bg-emerald-50/20">
      
      {/* HEADER NAVBAR */}
      <header className="h-16 bg-white border-b border-emerald-100 flex items-center justify-between lg:justify-end px-6 lg:px-8 sticky top-0 z-30 shrink-0 lg:pl-8 pl-16 shadow-sm">
  <div className="flex lg:hidden items-center h-full">
    {/* Kotak dihapus, ukuran diatur ke h-10 agar pas */}
    <img 
      src={logo} 
      alt="Logo BPJS TK" 
      className="h-10 w-auto object-contain" 
    />
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
          
          <button className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-sm hover:shadow-md active:scale-95 w-full sm:w-auto justify-center">
            <UserCheck size={20} />
            <span>Isi Absensi</span>
          </button>
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