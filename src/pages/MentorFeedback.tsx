import { Bell, Search, Paperclip, ArrowRight, Link as LinkIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function MentorFeedback() {
  return (
    <div className="flex flex-col h-full">
      <header className="sticky top-0 z-10 flex items-center justify-between px-8 py-4 bg-white/80 backdrop-blur-md border-b border-slate-200 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-blue-600">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
          </span>
          <h2 className="text-xl font-bold tracking-tight">Mentor Feedback</h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" className="pl-10 pr-4 py-2 bg-slate-100 border-none rounded-lg text-sm focus:ring-2 focus:ring-blue-600 outline-none w-64" placeholder="Search feedback..." />
          </div>
          <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-slate-100 text-slate-600 relative">
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
        </div>
      </header>

      <div className="p-8 max-w-5xl mx-auto w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-900 mb-2">Feedback Gallery</h1>
          <p className="text-slate-600">Review guidance and performance evaluations from your industry mentors.</p>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-blue-100">
                    <img src="https://i.pravatar.cc/150?u=sarah" alt="Dr. Sarah Jenkins" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">Dr. Sarah Jenkins</h3>
                    <p className="text-xs text-slate-500">Senior Systems Architect • Oct 24, 2023</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-600 text-xs font-bold rounded-full uppercase tracking-wider">Performance</span>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg mb-6">
                <p className="text-slate-700 leading-relaxed italic">
                  "Your progress on the backend architecture is impressive. You've demonstrated a strong grasp of REST principles. For the next sprint, focus more on documenting the API endpoints to ensure better team collaboration. The database schema you proposed is solid, just keep an eye on redundancy."
                </p>
              </div>
              <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-4">
                <div className="flex gap-2">
                  <span className="flex items-center gap-1 text-xs text-slate-500"><Paperclip size={14} /> 2 Attachments</span>
                </div>
                <Link to="/my-reports/1" className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:underline">
                  View Related Weekly Report
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-blue-100">
                    <img src="https://i.pravatar.cc/150?u=mark" alt="Mark Thompson" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">Mark Thompson</h3>
                    <p className="text-xs text-slate-500">Product Manager • Oct 18, 2023</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-blue-100 text-blue-600 text-xs font-bold rounded-full uppercase tracking-wider">Communication</span>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg mb-6">
                <p className="text-slate-700 leading-relaxed italic">
                  "Excellent initiative during the client meeting. The UI prototypes show a deep understanding of user pain points. I particularly liked how you handled the feedback on the navigation menu. Keep up the proactive communication and don't hesitate to voice your ideas in standups."
                </p>
              </div>
              <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-4">
                <div className="flex gap-2">
                  <span className="flex items-center gap-1 text-xs text-slate-500"><LinkIcon size={14} /> 1 Project Link</span>
                </div>
                <Link to="/my-reports/2" className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:underline">
                  View Project Review Report
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-blue-100 flex items-center justify-center bg-blue-600 text-white">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">Elena Rodriguez</h3>
                    <p className="text-xs text-slate-500">QA Lead • Oct 12, 2023</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-amber-100 text-amber-600 text-xs font-bold rounded-full uppercase tracking-wider">Technical</span>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg mb-6">
                <p className="text-slate-700 leading-relaxed italic">
                  "Your bug reports are very detailed and easy to follow. Try to include environment details (browser version, OS) in every report going forward. Great job on identifying that race condition in the authentication flow."
                </p>
              </div>
              <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-4">
                <div className="flex gap-2">
                </div>
                <Link to="/my-reports/3" className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:underline">
                  View QA Audit Report
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 flex justify-center pb-12">
          <button className="flex items-center gap-2 px-6 py-2.5 rounded-full border border-slate-200 hover:bg-slate-50 transition-colors text-sm font-medium">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
            Load Past Feedback
          </button>
        </div>
      </div>
    </div>
  );
}
