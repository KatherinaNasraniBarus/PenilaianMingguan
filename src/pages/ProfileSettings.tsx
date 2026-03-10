import { Camera, Lock, Save, MapPin } from 'lucide-react';

export default function ProfileSettings() {
  return (
    <div className="flex flex-col h-full">
      <div className="p-8 max-w-5xl mx-auto w-full">
        <header className="mb-8">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Profile Settings</h2>
          <p className="text-slate-500 mt-1">Update your personal profile and internship details below.</p>
        </header>

        <div className="space-y-8">
          <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Personal Information</h3>
            </div>
            <div className="p-8 flex flex-col md:flex-row gap-12">
              <div className="w-full md:w-1/3 flex flex-col items-center text-center gap-4">
                <div className="relative group">
                  <div className="w-40 h-40 rounded-full border-4 border-slate-100 bg-slate-50 flex items-center justify-center overflow-hidden">
                    <img src="https://i.pravatar.cc/300?u=alex" alt="Profile" className="w-full h-full object-cover" />
                  </div>
                  <button className="absolute bottom-1 right-1 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform">
                    <Camera size={18} />
                  </button>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Profile Photo</p>
                  <p className="text-xs text-slate-500 mt-1">SVG, PNG, JPG (max. 800x800px)</p>
                  <button className="mt-4 text-blue-600 text-sm font-medium hover:underline">Upload New Photo</button>
                </div>
              </div>

              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-slate-700">Full Name</label>
                  <input type="text" defaultValue="Alex Johnson" className="rounded-lg border-slate-200 bg-white text-slate-900 focus:border-blue-600 focus:ring-blue-600 h-11 px-4 text-sm border outline-none" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-slate-700">NIM (Student ID)</label>
                  <input type="text" defaultValue="20210045091" disabled className="rounded-lg border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed h-11 px-4 text-sm border outline-none" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-slate-700">Email Address</label>
                  <input type="email" defaultValue="alex.j@university.edu" className="rounded-lg border-slate-200 bg-white text-slate-900 focus:border-blue-600 focus:ring-blue-600 h-11 px-4 text-sm border outline-none" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-slate-700">Phone Number</label>
                  <input type="tel" defaultValue="+1 (555) 000-1234" className="rounded-lg border-slate-200 bg-white text-slate-900 focus:border-blue-600 focus:ring-blue-600 h-11 px-4 text-sm border outline-none" />
                </div>
                <div className="sm:col-span-2 flex flex-col gap-2">
                  <label className="text-sm font-semibold text-slate-700">Internship Location</label>
                  <div className="relative">
                    <MapPin size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="text" defaultValue="TechCorp Solutions, San Francisco, CA" className="w-full pl-10 pr-4 rounded-lg border-slate-200 bg-white text-slate-900 focus:border-blue-600 focus:ring-blue-600 h-11 text-sm border outline-none" />
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">Change Password</h3>
              <Lock size={20} className="text-slate-400" />
            </div>
            <div className="p-8">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-slate-700">Current Password</label>
                  <input type="password" placeholder="••••••••" className="rounded-lg border-slate-200 bg-white text-slate-900 focus:border-blue-600 focus:ring-blue-600 h-11 px-4 text-sm border outline-none" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-slate-700">New Password</label>
                  <input type="password" placeholder="Min. 8 characters" className="rounded-lg border-slate-200 bg-white text-slate-900 focus:border-blue-600 focus:ring-blue-600 h-11 px-4 text-sm border outline-none" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-slate-700">Confirm New Password</label>
                  <input type="password" placeholder="Re-type new password" className="rounded-lg border-slate-200 bg-white text-slate-900 focus:border-blue-600 focus:ring-blue-600 h-11 px-4 text-sm border outline-none" />
                </div>
              </div>
            </div>
          </section>

          <div className="flex items-center justify-end gap-4 pb-12">
            <button className="px-6 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">
              Cancel
            </button>
            <button className="px-8 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-lg shadow-md hover:bg-blue-700 transition-all flex items-center gap-2">
              <Save size={18} />
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
