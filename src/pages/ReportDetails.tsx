import { ChevronRight, Bell, ArrowLeft, Download, Calendar, Clock, ZoomIn, Cloud, ExternalLink, Code, CheckCircle, Star, Link as LinkIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ReportDetails() {
  return (
    <div className="flex flex-col h-full">
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10 shrink-0">
        <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
          <Link to="/my-reports" className="hover:text-blue-600 transition-colors">My Reports</Link>
          <ChevronRight size={16} />
          <span className="text-slate-900">Report Details</span>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors relative">
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
        </div>
      </header>

      <div className="p-8 max-w-5xl mx-auto w-full">
        <div className="flex items-center justify-between mb-8">
          <Link to="/my-reports" className="group flex items-center gap-2 text-slate-600 hover:text-blue-600 transition-colors font-semibold">
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            Back to My Reports
          </Link>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 border border-slate-300 text-slate-700 font-bold rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2 text-sm">
              <Download size={18} />
              Export PDF
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-6 sm:p-8">
                <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                  <div className="space-y-1">
                    <h2 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
                      Frontend Development: UI Library Implementation
                    </h2>
                    <div className="flex items-center gap-4 text-slate-500 text-sm">
                      <div className="flex items-center gap-1">
                        <Calendar size={16} />
                        Oct 12, 2023 - Oct 18, 2023
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock size={16} />
                        Week 6
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold uppercase tracking-wider border border-green-200">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></span>
                      Approved
                    </span>
                    <div className="text-right">
                      <span className="text-xs font-medium text-slate-500 uppercase tracking-widest">Points Earned</span>
                      <p className="text-2xl font-black text-blue-600">450</p>
                    </div>
                  </div>
                </div>

                <div className="prose max-w-none text-slate-700">
                  <h4 className="text-lg font-bold text-slate-900 mb-3">Activity Description</h4>
                  <p className="mb-4 leading-relaxed">
                    This week focused on implementing the new Tailwind CSS design system components for the internship dashboard. I worked closely with the lead designer to translate Figma wireframes into reusable React components.
                  </p>
                  <ul className="list-disc pl-5 space-y-2 mb-6">
                    <li>Developed a responsive Sidebar and Navigation component.</li>
                    <li>Refactored the existing form validation logic using Zod.</li>
                    <li>Optimized page load times by implementing lazy loading for non-critical dashboard charts.</li>
                    <li>Participated in daily stand-ups and code reviews for the 'Nexus-Core' project.</li>
                  </ul>
                </div>

                <div className="mt-8 pt-8 border-t border-slate-100">
                  <h4 className="text-lg font-bold text-slate-900 mb-4">Evidence Gallery</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {[
                      'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=800',
                      'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800',
                      'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&q=80&w=800'
                    ].map((src, i) => (
                      <div key={i} className="aspect-video rounded-lg overflow-hidden bg-slate-100 group relative">
                        <img src={src} className="w-full h-full object-cover relative z-0" alt={`Evidence ${i+1}`} />
                        <div className="absolute inset-0 bg-blue-600/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                          <ZoomIn size={32} className="text-white" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <h4 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                <LinkIcon size={20} className="text-blue-600" />
                External Evidence & Documentation
              </h4>
              <div className="flex flex-col gap-3">
                <a href="#" className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors border border-slate-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded flex items-center justify-center">
                      <Cloud size={20} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">Detailed Weekly Documentation</p>
                      <p className="text-xs text-slate-500">Google Drive Folder</p>
                    </div>
                  </div>
                  <ExternalLink size={20} className="text-slate-400" />
                </a>
                <a href="#" className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors border border-slate-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-200 rounded flex items-center justify-center">
                      <Code size={20} className="text-slate-700" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">Pull Request #421 - UI Library</p>
                      <p className="text-xs text-slate-500">GitHub Repository</p>
                    </div>
                  </div>
                  <ExternalLink size={20} className="text-slate-400" />
                </a>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h4 className="font-bold text-slate-900">Mentor Review</h4>
                <CheckCircle size={20} className="text-green-500" />
              </div>
              <div className="p-6 space-y-6">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-200 flex-shrink-0 overflow-hidden">
                    <img src="https://i.pravatar.cc/150?u=sarah" alt="Prof. Sarah Mitchell" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <div>
                      <p className="text-sm font-bold text-slate-900 leading-none">Prof. Sarah Mitchell</p>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wide mt-1">Lead Supervisor</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 italic text-sm text-slate-600">
                      "Excellent progress Alex. The clean UI components you built for the dashboard are a significant improvement. I appreciate the documentation linked in the Drive folder as well. Keep up the good work on accessibility!"
                    </div>
                    <p className="text-[10px] text-slate-400">Reviewed on Oct 20, 2023 at 10:45 AM</p>
                  </div>
                </div>
                <div className="bg-blue-50 rounded-lg p-4 flex flex-col items-center text-center gap-1 border border-blue-100">
                  <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Final Status</span>
                  <div className="flex items-center gap-2 text-green-600 font-black text-xl">
                    <CheckCircle size={24} />
                    APPROVED
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
              <h4 className="font-bold text-slate-900 text-sm uppercase tracking-wider mb-2">Report Statistics</h4>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Total Hours</span>
                <span className="text-sm font-bold">40.5 hrs</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Skills Applied</span>
                <div className="flex flex-wrap gap-1 justify-end">
                  <span className="bg-slate-100 px-2 py-0.5 rounded text-[10px] font-medium">React</span>
                  <span className="bg-slate-100 px-2 py-0.5 rounded text-[10px] font-medium">Tailwind</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Confidence Level</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map(i => <Star key={i} size={14} className="text-blue-600 fill-blue-600" />)}
                  <Star size={14} className="text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-blue-600 p-6 rounded-xl text-white relative overflow-hidden">
              <div className="relative z-10">
                <h4 className="font-bold text-lg mb-2">Questions?</h4>
                <p className="text-blue-100 text-sm mb-4">Contact your coordinator if you need to appeal a review or update your submission.</p>
                <button className="w-full py-2 bg-white text-blue-600 font-bold rounded-lg text-sm hover:bg-slate-50 transition-colors">
                  Contact Support
                </button>
              </div>
              <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/10 rounded-full"></div>
              <div className="absolute top-2 right-2 w-8 h-8 bg-white/5 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
