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
    <div className="flex flex-col h-full">

      {/* HEADER */}
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-500">Student Portal</span>
          <ChevronRight size={16} className="text-slate-300" />
          <span className="text-sm font-bold text-slate-900">Overview</span>
        </div>
      </header>

      <div className="p-8 space-y-8 max-w-7xl mx-auto w-full">

        {/* TITLE */}
        <div>
          <h1 className="text-3xl font-black text-slate-900">
            Welcome back, Alex!
          </h1>
        </div>

        {/* CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <Medal size={24} />
              </div>
            </div>
            <p className="text-slate-500 text-sm font-medium">Total Points</p>
            <h3 className="text-2xl font-black text-slate-900">850</h3>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                <FileText size={24} />
              </div>
            </div>
            <p className="text-slate-500 text-sm font-medium">Reports Submitted</p>
            <h3 className="text-2xl font-black text-slate-900">12</h3>
          </div>

        </div>

        {/* TABLE */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">

              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Date</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Activity Type</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Description</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Evidence</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 text-right">Points</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200">
                {reports.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50">

                    <td className="px-6 py-4 text-sm font-medium">{row.date}</td>

                    <td className="px-6 py-4 text-sm">{row.type}</td>

                    <td className="px-6 py-4 text-sm text-slate-500">
                      <div className="max-w-[220px] truncate">
                        {row.desc}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-sm">
                      <span className="text-blue-600 flex items-center gap-1">
                        {row.evidence.type === "link" && <LinkIcon size={14} />}
                        {row.evidence.type === "file" && <Paperclip size={14} />}
                        {row.evidence.type === "doc" && <FileText size={14} />}
                        {row.evidence.text}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right font-mono">
                      {row.points}
                    </td>

                  </tr>
                ))}
              </tbody>

            </table>
          </div>

          {/* FOOTER */}
          <div className="px-6 py-4 border-t border-slate-200 text-sm text-slate-500">
            Showing 1 to 4 of 24 entries
          </div>
        </div>
      </div>
    </div>
  );
}