import { Download, RefreshCw, TrendingUp, Hourglass, Users, Users2, Video, Building2, FileText, Smile } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function ActivityPoints() {
  const data = [
    { name: 'Jan', value: 40 },
    { name: 'Feb', value: 55 },
    { name: 'Mar', value: 70 },
    { name: 'Apr', value: 65 },
    { name: 'May', value: 85 },
    { name: 'Jun', value: 100 },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="max-w-6xl mx-auto p-8 w-full">
        <header className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-3xl font-black tracking-tight">Activity Points Breakdown</h2>
              <p className="text-slate-500 mt-1">Real-time tracking of your internship performance metrics for Semester 1.</p>
            </div>
            <div className="flex gap-3">
              <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 bg-white rounded-lg text-sm font-medium hover:bg-slate-50">
                <Download size={18} />
                Export PDF
              </button>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-blue-700">
                <RefreshCw size={18} />
                Update
              </button>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-50 rounded-full group-hover:scale-110 transition-transform"></div>
            <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">Total Points</p>
            <div className="flex items-end gap-2">
              <h3 className="text-4xl font-black text-blue-600">845</h3>
              <span className="text-lg font-medium text-slate-400 mb-1">/ 1000</span>
            </div>
            <div className="mt-4 w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div className="bg-blue-600 h-full w-[84.5%] rounded-full"></div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">Current Grade</p>
            <div className="flex items-center gap-4">
              <h3 className="text-5xl font-black text-slate-900">A</h3>
              <div className="flex flex-col">
                <span className="text-green-500 flex items-center text-sm font-bold">
                  <TrendingUp size={16} className="mr-1" />
                  +5%
                </span>
                <span className="text-xs text-slate-400">vs last month</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                <Hourglass size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Days Remaining</p>
                <p className="text-xl font-bold">42 Days</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <TrendingUp size={24} className="text-blue-600" />
            Category Scoring Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: 'Seminar Attendance', desc: 'Active participation in weekly technical seminars and workshops.', score: 120, max: 150, pct: 80, icon: Users, color: 'blue' },
              { title: 'Socialization', desc: 'Networking and professional interaction within the host organization.', score: 90, max: 100, pct: 90, icon: Users2, color: 'purple' },
              { title: 'Video Journals', desc: 'Weekly video submission documenting tasks and key learnings.', score: 100, max: 100, pct: 100, icon: Video, color: 'red' },
              { title: 'Field Visits', desc: 'Faculty supervisor site visits and on-site evaluation scores.', score: 140, max: 200, pct: 70, icon: Building2, color: 'emerald' },
              { title: 'Monthly Reports', desc: 'Accuracy and timeliness of monthly formal documentation.', score: 180, max: 200, pct: 90, icon: FileText, color: 'indigo' },
              { title: 'Attitude Score', desc: 'Professionalism, ethics, and punctuality as rated by the mentor.', score: 215, max: 250, pct: 86, icon: Smile, color: 'amber' },
            ].map((cat, i) => {
              const Icon = cat.icon;
              const colorMap: Record<string, { bg: string, text: string, bar: string, barBg: string }> = {
                blue: { bg: 'bg-blue-100', text: 'text-blue-600', bar: 'bg-blue-500', barBg: 'bg-blue-100' },
                purple: { bg: 'bg-purple-100', text: 'text-purple-600', bar: 'bg-purple-500', barBg: 'bg-purple-100' },
                red: { bg: 'bg-red-100', text: 'text-red-600', bar: 'bg-red-500', barBg: 'bg-red-100' },
                emerald: { bg: 'bg-emerald-100', text: 'text-emerald-600', bar: 'bg-emerald-500', barBg: 'bg-emerald-100' },
                indigo: { bg: 'bg-indigo-100', text: 'text-indigo-600', bar: 'bg-indigo-500', barBg: 'bg-indigo-100' },
                amber: { bg: 'bg-amber-100', text: 'text-amber-600', bar: 'bg-amber-500', barBg: 'bg-amber-100' },
              };
              const colors = colorMap[cat.color];

              return (
                <div key={i} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                  <div className="flex justify-between items-start mb-6">
                    <div className={`w-10 h-10 ${colors.bg} rounded-lg flex items-center justify-center ${colors.text}`}>
                      <Icon size={20} />
                    </div>
                    <span className="text-xs font-bold text-slate-400">{cat.score}/{cat.max}</span>
                  </div>
                  <h4 className="font-bold text-lg mb-1">{cat.title}</h4>
                  <p className="text-sm text-slate-500 mb-4 leading-relaxed">{cat.desc}</p>
                  <div className="relative pt-1">
                    <div className="flex mb-2 items-center justify-between">
                      <span className={`text-xs font-semibold inline-block ${colors.text}`}>{cat.pct === 100 ? 'Completed' : 'Progress'}</span>
                      <span className={`text-xs font-semibold inline-block ${colors.text}`}>{cat.pct}%</span>
                    </div>
                    <div className={`overflow-hidden h-1.5 text-xs flex rounded ${colors.barBg}`}>
                      <div style={{ width: `${cat.pct}%` }} className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${colors.bar}`}></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="font-bold text-lg">Scoring Trend</h3>
              <p className="text-sm text-slate-500">Monthly point acquisition progress</p>
            </div>
            <select className="bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium px-3 py-2 outline-none focus:ring-blue-600">
              <option>Last 6 Months</option>
              <option>Whole Semester</option>
            </select>
          </div>
          <div className="h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === data.length - 1 ? '#2563eb' : '#93c5fd'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
