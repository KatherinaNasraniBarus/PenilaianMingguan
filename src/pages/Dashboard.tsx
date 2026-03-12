import { ChevronRight, Medal, FileText, Link as LinkIcon, Paperclip, ExternalLink } from "lucide-react";
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
    const nim = localStorage.getItem("userNim");
    const name = localStorage.getItem("userName");
    if (name) setUserName(name);

    if (nim) {
      fetch(`/api/reports/${nim}`)
        .then(res => res.json())
        .then(result => {
          if (result.status === "success") {
            setReports(result.data.reports);
            setTotalPoints(result.data.totalPoints);
            setReportCount(result.data.reportCount);
          }
        })
        .catch(err => console.error("Failed to fetch reports:", err))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

 return (
    <div className="flex flex-col h-full min-h-screen">
      {/* HEADER NAVBAR BARU */}
      <header className="h-16 bg-white border-b border-emerald-100 flex items-center justify-between px-6 lg:px-8 sticky top-0 z-10 shrink-0 lg:pl-8 pl-16">
        {/* Bagian Kiri: Logo dan Teks */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center border border-emerald-50 shrink-0 p-0.5">
            <img 
              src={logo} 
              alt="Logo BPJS TK" 
              className="w-full h-full object-contain" 
            />
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-black text-emerald-950 tracking-tighter leading-none">SATU</h1>
            <div className="flex items-center gap-1 mt-0.5">
              <div className="h-[2px] w-2 bg-emerald-500 rounded-full"></div>
              <p className="text-[8px] font-black text-emerald-600 tracking-[0.2em] uppercase">BPJS TK</p>
            </div>
          </div>
        </div>

        {/* Bagian Kanan: Breadcrumb */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-emerald-700/70 hidden sm:inline">Student Portal</span>
          <ChevronRight size={16} className="text-emerald-200 hidden sm:inline" />
          <span className="text-sm font-bold text-emerald-900 hidden sm:inline">Overview</span>
        </div>
      </header>

      <div className="p-8 space-y-8 max-w-7xl mx-auto w-full">
        {/* TITLE */}
        <div>
          <h1 className="text-3xl font-black text-emerald-950">
            Welcome back, {userName ? userName.split(' ')[0] : 'Alex'}!
          </h1>
          <p className="text-emerald-700/60 mt-1">Here's what's happening with your projects today.</p>
        </div>

        {/* CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
            <p className="text-emerald-700/60 text-sm font-medium">Reports Submitted</p>
            <h3 className="text-2xl font-black text-emerald-900">{reportCount}</h3>
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white border border-emerald-100 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-emerald-50/50 border-b border-emerald-100">
                  <th className="px-6 py-4 text-xs font-bold uppercase text-emerald-700/70">Date</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-emerald-700/70">Activity Type</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-emerald-700/70">Description</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-emerald-700/70">Evidence</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-emerald-700/70 text-right">Points</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-emerald-50">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-emerald-700/60 font-medium">
                      Loading reports...
                    </td>
                  </tr>
                ) : reports.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-emerald-700/60 font-medium">
                      No reports submitted yet.
                    </td>
                  </tr>
                ) : (
                  reports.map((row) => (
                    <tr key={row.id} className="hover:bg-emerald-50/30 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-emerald-900">{row.date}</td>
                      <td className="px-6 py-4 text-sm text-emerald-800">{row.activity_type}</td>
                      <td className="px-6 py-4 text-sm text-emerald-700/70">
                        <div className="max-w-[220px] truncate" title={row.description}>
                          {row.description}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {row.evidence_link ? (
                          <a 
                            href={row.evidence_link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-emerald-600 hover:text-emerald-700 flex items-center gap-1 font-medium underline underline-offset-4 decoration-emerald-200"
                          >
                            {row.evidence_type === "link" && <LinkIcon size={14} />}
                            {row.evidence_type === "file" && <Paperclip size={14} />}
                            {row.evidence_type === "doc" && <FileText size={14} />}
                            {row.evidence_text}
                            <ExternalLink size={10} className="ml-0.5 opacity-50" />
                          </a>
                        ) : (
                          <span className="text-emerald-400 italic">No link provided</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right font-mono font-bold text-emerald-600">
                        {row.points > 0 ? `+${row.points}` : row.points}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* FOOTER */}
          <div className="px-6 py-4 border-t border-emerald-100 text-sm text-emerald-700/60 flex justify-between items-center bg-emerald-50/10">
            <span>Showing {reports.length} entries</span>
            <div className="flex gap-2">
               <button className="px-3 py-1 rounded border border-emerald-200 hover:bg-emerald-50 text-emerald-700 transition-colors">Previous</button>
               <button className="px-3 py-1 rounded border border-emerald-200 hover:bg-emerald-50 text-emerald-700 transition-colors font-bold bg-emerald-50">Next</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}