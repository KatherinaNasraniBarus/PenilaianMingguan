import { Bell, ChevronRight, Medal, Star, FileText, CheckCircle, Activity, History, Eye, Edit2, Info } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  return (
    <div className="flex flex-col h-full">
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-500">Student Portal</span>
          <ChevronRight size={16} className="text-slate-300" />
          <span className="text-sm font-bold text-slate-900">Overview</span>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full relative">
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 border-2 border-white rounded-full"></span>
          </button>
          <div className="h-8 w-px bg-slate-200 mx-2"></div>
          <div className="flex items-center gap-3 pl-2">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-slate-900 leading-none">Alex Johnson</p>
              <p className="text-xs text-slate-500 mt-1">Computer Science Senior</p>
            </div>
            <img src="https://i.pravatar.cc/150?u=alex" alt="Profile" className="w-10 h-10 rounded-full border border-slate-200" />
          </div>
        </div>
      </header>

      <div className="p-8 space-y-8 max-w-7xl mx-auto w-full">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Welcome back, Alex!</h1>
          <p className="text-slate-500">You're currently in Week 8 of your internship. Keep up the great progress!</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <Medal size={24} />
              </div>
              <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded">+12% vs last month</span>
            </div>
            <p className="text-slate-500 text-sm font-medium">Total Points</p>
            <h3 className="text-2xl font-black text-slate-900">850</h3>
          </div>
          
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                <Star size={24} />
              </div>
            </div>
            <p className="text-slate-500 text-sm font-medium">Current Grade</p>
            <h3 className="text-2xl font-black text-slate-900">A-</h3>
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

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                <CheckCircle size={24} />
              </div>
            </div>
            <p className="text-slate-500 text-sm font-medium">Approved Reports</p>
            <h3 className="text-2xl font-black text-slate-900">10</h3>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Activity size={20} className="text-blue-600" />
              Activity Progress
            </h2>
            <div className="space-y-6">
              {[
                { label: 'Seminar Attendance', value: 80, color: 'bg-blue-600' },
                { label: 'Socialization Activities', value: 65, color: 'bg-blue-600' },
                { label: 'Video Viralization', value: 45, color: 'bg-amber-500' },
                { label: 'Monthly Reports', value: 100, color: 'bg-green-500' },
                { label: 'Field Visits', value: 30, color: 'bg-indigo-500' },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-600 font-medium">{item.label}</span>
                    <span className="font-bold text-slate-900">{item.value}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className={`${item.color} h-2 rounded-full`} style={{ width: `${item.value}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <History size={20} className="text-blue-600" />
                Recent Reports
              </h2>
              <Link to="/my-reports" className="text-sm font-semibold text-blue-600 hover:underline">View All</Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-slate-500 border-b border-slate-100 text-sm font-semibold">
                    <th className="pb-3 px-2 font-medium">Date</th>
                    <th className="pb-3 px-2 font-medium">Activity</th>
                    <th className="pb-3 px-2 font-medium">Status</th>
                    <th className="pb-3 px-2 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {[
                    { date: 'Oct 24, 2023', title: 'System Integration Seminar', type: 'Seminar Attendance', status: 'Approved', statusColor: 'text-green-600 bg-green-50', dotColor: 'bg-green-600', icon: Eye },
                    { date: 'Oct 21, 2023', title: 'Marketing Video #3', type: 'Video Viralization', status: 'Pending', statusColor: 'text-amber-600 bg-amber-50', dotColor: 'bg-amber-600', icon: Edit2 },
                    { date: 'Oct 18, 2023', title: 'Regional Office Visit', type: 'Field Visits', status: 'Approved', statusColor: 'text-green-600 bg-green-50', dotColor: 'bg-green-600', icon: Eye },
                    { date: 'Oct 15, 2023', title: 'Monthly Progress Report - Sept', type: 'Monthly Reports', status: 'Rejected', statusColor: 'text-red-600 bg-red-50', dotColor: 'bg-red-600', icon: Info },
                  ].map((row, i) => {
                    const ActionIcon = row.icon;
                    return (
                      <tr key={i}>
                        <td className="py-4 px-2 text-sm text-slate-600">{row.date}</td>
                        <td className="py-4 px-2">
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-slate-900">{row.title}</span>
                            <span className="text-xs text-slate-500">{row.type}</span>
                          </div>
                        </td>
                        <td className="py-4 px-2">
                          <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${row.statusColor}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${row.dotColor}`}></span>
                            {row.status}
                          </span>
                        </td>
                        <td className="py-4 px-2 text-right">
                          <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors">
                            <ActionIcon size={18} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
