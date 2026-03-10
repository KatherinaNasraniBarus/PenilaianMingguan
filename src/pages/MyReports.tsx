import { Bell, Plus, Star, Search, Filter, Link as LinkIcon, Paperclip, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function MyReports() {
  return (
    <div className="flex flex-col h-full">
      <header className="h-16 border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-10 flex items-center justify-between px-8 shrink-0">
        <h2 className="text-xl font-bold text-slate-900">Internship Progress</h2>
        <div className="flex items-center gap-4">
          <button className="w-10 h-10 flex items-center justify-center rounded-full border border-slate-200 hover:bg-slate-50">
            <Bell size={20} className="text-slate-600" />
          </button>
          <Link to="/submit-report" className="bg-blue-600 text-white text-sm font-bold px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all">
            <Plus size={16} />
            Submit New Report
          </Link>
        </div>
      </header>

      <div className="p-8 max-w-7xl mx-auto w-full">
        <div className="mb-8">
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">Daily Activity Reports</h3>
          <p className="text-slate-500">Review and track the status of your submitted internship reports and points earned.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-500 text-sm font-medium">Total Reports</span>
              <div className="text-blue-600">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>
              </div>
            </div>
            <div className="text-3xl font-bold">24</div>
          </div>
          <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-500 text-sm font-medium">Approved Points</span>
              <Star size={24} className="text-emerald-500 fill-emerald-500" />
            </div>
            <div className="text-3xl font-bold">185</div>
          </div>
          <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-500 text-sm font-medium">Pending Review</span>
              <div className="text-amber-500">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 22h14"/><path d="M5 2h14"/><path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22"/><path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2"/></svg>
              </div>
            </div>
            <div className="text-3xl font-bold">3</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm mb-6">
          <div className="p-4 flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:ring-blue-600 focus:border-blue-600 text-sm outline-none" placeholder="Search reports by description or activity..." />
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
              <select className="bg-slate-50 border border-slate-200 rounded-lg text-sm px-3 py-2 min-w-[140px] outline-none focus:ring-blue-600 focus:border-blue-600">
                <option>All Statuses</option>
                <option>Approved</option>
                <option>Pending</option>
                <option>Rejected</option>
              </select>
              <select className="bg-slate-50 border border-slate-200 rounded-lg text-sm px-3 py-2 min-w-[140px] outline-none focus:ring-blue-600 focus:border-blue-600">
                <option>Activity Type</option>
                <option>Frontend Dev</option>
                <option>Backend Dev</option>
                <option>Bug Fixing</option>
                <option>Documentation</option>
              </select>
              <button className="p-2 border border-slate-200 rounded-lg flex items-center justify-center hover:bg-slate-50 transition-colors">
                <Filter size={20} className="text-slate-600" />
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Date</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Activity Type</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Description</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Evidence</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-center">Status</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Points</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {[
                  { id: 1, date: 'Nov 12, 2023', type: 'Frontend Dev', desc: 'Implemented responsive navigation and dark mode switch using Tailwind CSS...', evidence: { type: 'link', text: 'Github PR' }, status: 'Pending Review', statusColor: 'bg-amber-100 text-amber-800', points: 15 },
                  { id: 2, date: 'Nov 11, 2023', type: 'Bug Fixing', desc: 'Resolved critical memory leak in the dashboard charts data polling...', evidence: { type: 'file', text: 'Error Log' }, status: 'Approved', statusColor: 'bg-emerald-100 text-emerald-800', points: 20 },
                  { id: 3, date: 'Nov 10, 2023', type: 'Documentation', desc: 'Updated API documentation for the internal endpoints v2 release...', evidence: { type: 'doc', text: 'PDF Report' }, status: 'Rejected', statusColor: 'bg-red-100 text-red-800', points: 0 },
                  { id: 4, date: 'Nov 09, 2023', type: 'Backend Dev', desc: 'Refactored user authentication middleware for better security compliance...', evidence: { type: 'link', text: 'Jira Ticket' }, status: 'Approved', statusColor: 'bg-emerald-100 text-emerald-800', points: 25 },
                ].map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{row.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{row.type}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      <div className="max-w-[200px] truncate">{row.desc}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <a href="#" className="text-blue-600 hover:underline flex items-center gap-1">
                        {row.evidence.type === 'link' && <LinkIcon size={14} />}
                        {row.evidence.type === 'file' && <Paperclip size={14} />}
                        {row.evidence.type === 'doc' && <FileText size={14} />}
                        {row.evidence.text}
                      </a>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${row.statusColor}`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-mono">{row.points}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <Link to={`/my-reports/${row.id}`} className="text-blue-600 font-bold text-sm hover:bg-blue-50 px-3 py-1 rounded-md transition-colors">View</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
            <span className="text-sm text-slate-500">Showing 1 to 4 of 24 entries</span>
            <div className="flex items-center gap-2">
              <button className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed" disabled>
                <ChevronLeft size={16} />
              </button>
              <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-600 text-white text-sm font-medium">1</button>
              <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-50 text-sm font-medium">2</button>
              <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-50 text-sm font-medium">3</button>
              <button className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
