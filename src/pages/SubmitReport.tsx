import { ChevronRight, Bell, Send, Info, Activity, Paperclip, Image as ImageIcon, Link as LinkIcon, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function SubmitReport() {
  return (
    <div className="flex flex-col h-full">
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10 shrink-0">
        <div className="flex items-center gap-2 text-slate-500 text-sm">
          <Link to="/my-reports" className="hover:text-blue-600">Reports</Link>
          <ChevronRight size={16} />
          <span className="text-slate-900 font-medium">New Weekly Report</span>
        </div>
        <div className="flex items-center gap-4">
          <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full">
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
          <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition-all">
            <Send size={16} />
            Submit Report
          </button>
        </div>
      </header>

      <div className="p-8 max-w-4xl mx-auto w-full">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900">Weekly Activity Report</h2>
          <p className="text-slate-500 mt-2">Document your internship progress and key performance indicators for the current week.</p>
        </div>

        <form className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Info size={20} className="text-blue-600" />
              General Activity Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-700">Date of Activity</label>
                <input type="date" className="rounded-lg border-slate-300 focus:ring-blue-600 focus:border-blue-600 px-4 py-2 border outline-none" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-700">Activity Type</label>
                <select className="rounded-lg border-slate-300 focus:ring-blue-600 focus:border-blue-600 px-4 py-2 border outline-none bg-white">
                  <option value="">Select type...</option>
                  <option value="technical">Technical Support</option>
                  <option value="field">Field Work</option>
                  <option value="office">Office Administration</option>
                  <option value="research">Research & Development</option>
                  <option value="marketing">Marketing & Outreach</option>
                </select>
              </div>
              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="text-sm font-semibold text-slate-700">Description of Activity</label>
                <textarea className="rounded-lg border-slate-300 focus:ring-blue-600 focus:border-blue-600 px-4 py-2 border outline-none resize-none" placeholder="Briefly describe the tasks performed and objectives met during this week..." rows={4}></textarea>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Activity size={20} className="text-blue-600" />
              Performance Indicators
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-700">Socialization Activities</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                  </span>
                  <input type="number" min="0" placeholder="0" className="w-full pl-10 rounded-lg border-slate-300 focus:ring-blue-600 focus:border-blue-600 py-2 border outline-none" />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-700">Video Viralization</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
                  </span>
                  <input type="number" min="0" placeholder="0" className="w-full pl-10 rounded-lg border-slate-300 focus:ring-blue-600 focus:border-blue-600 py-2 border outline-none" />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-700">Field Visits</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                  </span>
                  <input type="number" min="0" placeholder="0" className="w-full pl-10 rounded-lg border-slate-300 focus:ring-blue-600 focus:border-blue-600 py-2 border outline-none" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Paperclip size={20} className="text-blue-600" />
              Evidence & Media
            </h3>
            <div className="space-y-6">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-700">Activity Photos</label>
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer">
                  <ImageIcon size={40} className="text-slate-400 mb-2" />
                  <p className="text-sm text-slate-600 font-medium">Click to upload or drag and drop</p>
                  <p className="text-xs text-slate-400 mt-1">PNG, JPG or JPEG (Max. 5MB)</p>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-700">Google Drive Evidence Link</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400">
                    <LinkIcon size={20} />
                  </span>
                  <input type="url" placeholder="https://drive.google.com/..." className="w-full pl-10 rounded-lg border-slate-300 focus:ring-blue-600 focus:border-blue-600 py-2 border outline-none" />
                </div>
                <p className="text-xs text-slate-500">Ensure the link visibility is set to "Anyone with the link can view".</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-4 pt-4 pb-12">
            <button type="button" className="px-6 py-2.5 rounded-lg border border-slate-300 text-slate-700 font-bold hover:bg-slate-50 transition-all">
              Save Draft
            </button>
            <button type="button" className="px-8 py-2.5 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all flex items-center gap-2">
              <CheckCircle size={20} />
              Submit Weekly Report
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
