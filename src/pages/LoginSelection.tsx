// import { GraduationCap, Users, ArrowRight } from 'lucide-react';
// import { useNavigate } from 'react-router-dom';

// export default function LoginSelection() {
//   const navigate = useNavigate();

//   const handleSelection = (role: 'student' | 'mentor') => {
//     // Menyimpan role ke localStorage agar Sidebar bisa menyesuaikan menu
//     localStorage.setItem('userRole', role);
//     // Navigasi ke dashboard setelah memilih
//     navigate('/dashboard'); 
//   };

//   return (
//     <div className="min-h-screen bg-[#f4f9f7] flex flex-col items-center justify-center p-6">
//       {/* Header / Logo Section */}
//       <div className="text-center mb-12">
//         <div className="inline-flex p-4 rounded-2xl bg-white shadow-sm mb-4 border border-slate-100">
//           <GraduationCap size={48} className="text-[#008C5E]" />
//         </div>
//         <h1 className="text-3xl font-bold text-slate-900 tracking-tight">UniIntern Portal</h1>
//         <p className="text-slate-500 mt-2 max-w-xs mx-auto">
//           Sistem Informasi Magang Terintegrasi. Silakan pilih peran Anda.
//         </p>
//       </div>

//       {/* Selection Cards */}
//       <div className="grid md:grid-cols-2 gap-6 w-full max-w-3xl">
        
//         {/* Card Mahasiswa */}
//         <button 
//           onClick={() => handleSelection('student')}
//           className="group bg-white p-8 rounded-3xl border-2 border-transparent hover:border-[#008C5E] shadow-sm hover:shadow-2xl transition-all duration-300 text-left flex flex-col relative overflow-hidden"
//         >
//           <div className="w-14 h-14 bg-[#e6f4f0] text-[#008C5E] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
//             <GraduationCap size={32} />
//           </div>
//           <h2 className="text-2xl font-bold text-slate-800">Mahasiswa</h2>
//           <p className="text-slate-500 mt-3 leading-relaxed flex-1">
//             Isi logbook harian, upload laporan mingguan, dan pantau penilaian dari mentor lapangan.
//           </p>
//           <div className="mt-8 flex items-center gap-2 text-[#008C5E] font-bold">
//             Masuk Sekarang <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
//           </div>
//         </button>

//         {/* Card Mentor */}
//         <button 
//           onClick={() => handleSelection('mentor')}
//           className="group bg-white p-8 rounded-3xl border-2 border-transparent hover:border-[#008C5E] shadow-sm hover:shadow-2xl transition-all duration-300 text-left flex flex-col relative overflow-hidden"
//         >
//           <div className="w-14 h-14 bg-[#e6f4f0] text-[#008C5E] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
//             <Users size={32} />
//           </div>
//           <h2 className="text-2xl font-bold text-slate-800">Mentor / DPL</h2>
//           <p className="text-slate-500 mt-3 leading-relaxed flex-1">
//             Validasi kehadiran mahasiswa, berikan nilai bimbingan, dan tinjau laporan akhir.
//           </p>
//           <div className="mt-8 flex items-center gap-2 text-[#008C5E] font-bold">
//             Masuk Sekarang <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
//           </div>
//         </button>

//       </div>

//       {/* Footer Info */}
//       <div className="mt-12 flex flex-col items-center gap-2">
//         <p className="text-xs text-slate-400 font-semibold tracking-[0.2em] uppercase">
//           Powered by Google AI Studio
//         </p>
//         <div className="h-1 w-12 bg-[#008C5E] rounded-full opacity-20"></div>
//       </div>
//     </div>
//   );
// }