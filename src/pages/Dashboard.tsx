import { ChevronRight, Medal, FileText, Link as LinkIcon, Paperclip } from "lucide-react";

export default function Dashboard() {
  const reports = [
    {
      id: 1,
      date: "Nov 12, 2023",
      type: "Frontend Dev",
      desc: "Implemented responsive navigation...",
      evidence: { type: "link", text: "Github PR" },
      points: 15,
    },
    {
      id: 2,
      date: "Nov 11, 2023",
      type: "Bug Fixing",
      desc: "Resolved critical memory leak...",
      evidence: { type: "file", text: "Error Log" },
      points: 20,
    },
    {
      id: 3,
      date: "Nov 10, 2023",
      type: "Documentation",
      desc: "Updated API documentation...",
      evidence: { type: "doc", text: "PDF Report" },
      points: 0,
    },
    {
      id: 4,
      date: "Nov 09, 2023",
      type: "Backend Dev",
      desc: "Refactored user authentication...",
      evidence: { type: "link", text: "Jira Ticket" },
      points: 25,
    },
  ];

  return (
    <div className="flex flex-col h-full bg-emerald-50/20 min-h-screen">

      {/* HEADER */}
      <header className="h-16 bg-white border-b border-emerald-100 flex items-center justify-between px-8 sticky top-0 z-10 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-emerald-700/70">Student Portal</span>
          <ChevronRight size={16} className="text-emerald-200" />
          <span className="text-sm font-bold text-emerald-900">Overview</span>
        </div>
      </header>

      <div className="p-8 space-y-8 max-w-7xl mx-auto w-full">

        {/* TITLE */}
        <div>
          <h1 className="text-3xl font-black text-emerald-950">
            Welcome back, Alex!
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
            <h3 className="text-2xl font-black text-emerald-900">850</h3>
          </div>

          <div className="bg-white p-6 rounded-xl border border-emerald-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                <FileText size={24} />
              </div>
            </div>
            <p className="text-emerald-700/60 text-sm font-medium">Reports Submitted</p>
            <h3 className="text-2xl font-black text-emerald-900">12</h3>
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
                {reports.map((row) => (
                  <tr key={row.id} className="hover:bg-emerald-50/30 transition-colors">

                    <td className="px-6 py-4 text-sm font-medium text-emerald-900">{row.date}</td>

                    <td className="px-6 py-4 text-sm text-emerald-800">{row.type}</td>

                    <td className="px-6 py-4 text-sm text-emerald-700/70">
                      <div className="max-w-[220px] truncate">
                        {row.desc}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-sm">
                      <span className="text-emerald-600 hover:text-emerald-700 cursor-pointer flex items-center gap-1 font-medium underline underline-offset-4 decoration-emerald-200">
                        {row.evidence.type === "link" && <LinkIcon size={14} />}
                        {row.evidence.type === "file" && <Paperclip size={14} />}
                        {row.evidence.type === "doc" && <FileText size={14} />}
                        {row.evidence.text}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right font-mono font-bold text-emerald-600">
                      {row.points > 0 ? `+${row.points}` : row.points}
                    </td>

                  </tr>
                ))}
              </tbody>

            </table>
          </div>

          {/* FOOTER */}
          <div className="px-6 py-4 border-t border-emerald-100 text-sm text-emerald-700/60 flex justify-between items-center bg-emerald-50/10">
            <span>Showing 1 to 4 of 24 entries</span>
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
