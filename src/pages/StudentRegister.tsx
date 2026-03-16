import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { User, Lock, ArrowRight, ChevronLeft, AlertCircle, GraduationCap, Mail, Users, CheckCircle2, ChevronDown } from "lucide-react";

export default function StudentRegister() {
  const navigate = useNavigate();
  const [mentorList, setMentorList] = useState<{id: number, nama: string}[]>([]);
  
  // State Form
  const [formData, setFormData] = useState({
    nama: "",
    nim: "",
    email: "",
    password: "",
    mentorId: ""
  });
  
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  // Menyimpan error utama (di atas) dan error per kolom (di bawah input)
  const [mainError, setMainError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<any>({});

  // Tarik data mentor saat halaman dimuat
  useEffect(() => {
    fetch("http://localhost/api-penilaian/get_mentors.php")
      .then(res => res.json())
      .then(data => {
        if (data.status === "success") setMentorList(data.data);
      })
      .catch(err => console.error("Gagal memuat mentor:", err));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMainError("");
    
    // Validasi Kolom
    const newErrors: any = {};
    if (!formData.nama.trim()) newErrors.nama = "Nama Lengkap tidak boleh kosong!";
    if (!formData.nim.trim()) newErrors.nim = "NIM tidak boleh kosong!";
    if (!formData.email.trim()) {
      newErrors.email = "Email tidak boleh kosong!";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Format email tidak valid!";
    }
    if (!formData.password.trim()) newErrors.password = "Password tidak boleh kosong!";
    else if (formData.password.length < 4) newErrors.password = "Password minimal 4 karakter!";
    if (!formData.mentorId) newErrors.mentorId = "Silakan pilih Mentor pembimbing!";

    if (Object.keys(newErrors).length > 0) {
      setFieldErrors(newErrors);
      return;
    }

    setFieldErrors({});
    setLoading(true);

    try {
      const response = await fetch("http://localhost/api-penilaian/register_mahasiswa.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          nama: formData.nama, 
          nim: formData.nim, 
          email: formData.email, 
          password: formData.password, 
          mentor_id: formData.mentorId 
        })
      });
      
      const result = await response.json();
      
      if (result.status === "success") {
        setIsSuccess(true);
        setTimeout(() => {
          navigate("/student-login");
        }, 2500);
      } else {
        if (result.message.toLowerCase().includes("terdaftar")) {
          setMainError(result.message);
        } else {
          setMainError("Gagal registrasi: " + result.message);
        }
      }
    } catch (error) {
      setMainError("Terjadi kesalahan koneksi ke server. Pastikan XAMPP menyala.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-emerald-50 flex items-center justify-center p-4 sm:p-6 font-sans">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg" // Dibuat sedikit lebih lebar (max-w-lg) karena formnya banyak
      >
        <button
          onClick={() => navigate("/student-login")}
          className="flex items-center gap-2 text-emerald-600 font-bold mb-6 hover:gap-3 transition-all"
        >
          <ChevronLeft size={20} /> Kembali ke Login
        </button>

        <div className="bg-white p-8 sm:p-10 rounded-[2.5rem] shadow-2xl shadow-emerald-100 border border-emerald-100">
          
          <AnimatePresence mode="wait">
            {isSuccess ? (
              <motion.div 
                key="success"
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                className="text-center py-10 space-y-4"
              >
                <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 size={48} className="text-emerald-500" />
                </div>
                <h3 className="text-2xl font-black text-emerald-950">Registrasi Berhasil!</h3>
                <p className="text-emerald-700 font-medium">Akun Anda telah dibuat. Mengalihkan ke halaman login...</p>
              </motion.div>
            ) : (
              <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="text-center mb-8">
                  <h1 className="text-3xl font-black text-emerald-950">Daftar Akun</h1>
                  <p className="text-emerald-700/60 mt-2 font-medium">Lengkapi data diri Anda untuk magang</p>
                </div>

                <AnimatePresence>
                  {mainError && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 text-red-600"
                    >
                      <AlertCircle size={20} className="shrink-0 mt-0.5" />
                      <p className="text-sm font-bold">{mainError}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <form onSubmit={handleSubmit} className="space-y-5">
                  
                  {/* NAMA LENGKAP */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-emerald-700 ml-1">Nama Lengkap</label>
                    <div className="relative">
                      <User className={`absolute left-4 top-1/2 -translate-y-1/2 ${fieldErrors.nama ? 'text-red-400' : 'text-emerald-400'}`} size={20} />
                      <input
                        type="text"
                        value={formData.nama}
                        onChange={(e) => { setFormData({ ...formData, nama: e.target.value }); setFieldErrors({...fieldErrors, nama: ""}); }}
                        placeholder="Contoh: Ahmad Rayhan"
                        className={`w-full bg-emerald-50/50 border rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:ring-2 transition-all font-medium ${fieldErrors.nama ? 'border-red-300 focus:ring-red-500 bg-red-50/30' : 'border-emerald-100 focus:ring-emerald-500'}`}
                      />
                    </div>
                    {fieldErrors.nama && <p className="text-red-500 text-xs font-bold ml-2">{fieldErrors.nama}</p>}
                  </div>

                  {/* BARIIS NIM & PASSWORD (Berdampingan di layar besar, bertumpuk di HP) */}
                  <div className="flex flex-col sm:flex-row gap-5">
                    <div className="space-y-2 flex-1">
                      <label className="text-sm font-bold text-emerald-700 ml-1">NIM</label>
                      <div className="relative">
                        <GraduationCap className={`absolute left-4 top-1/2 -translate-y-1/2 ${fieldErrors.nim ? 'text-red-400' : 'text-emerald-400'}`} size={20} />
                        <input
                          type="number"
                          value={formData.nim}
                          onChange={(e) => { setFormData({ ...formData, nim: e.target.value }); setFieldErrors({...fieldErrors, nim: ""}); }}
                          placeholder="211401011"
                          className={`w-full bg-emerald-50/50 border rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:ring-2 transition-all font-mono ${fieldErrors.nim ? 'border-red-300 focus:ring-red-500 bg-red-50/30' : 'border-emerald-100 focus:ring-emerald-500'}`}
                        />
                      </div>
                      {fieldErrors.nim && <p className="text-red-500 text-xs font-bold ml-2">{fieldErrors.nim}</p>}
                    </div>

                    <div className="space-y-2 flex-1">
                      <label className="text-sm font-bold text-emerald-700 ml-1">Buat Password</label>
                      <div className="relative">
                        <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 ${fieldErrors.password ? 'text-red-400' : 'text-emerald-400'}`} size={20} />
                        <input
                          type="password"
                          value={formData.password}
                          onChange={(e) => { setFormData({ ...formData, password: e.target.value }); setFieldErrors({...fieldErrors, password: ""}); }}
                          placeholder="••••••••"
                          className={`w-full bg-emerald-50/50 border rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:ring-2 transition-all font-medium ${fieldErrors.password ? 'border-red-300 focus:ring-red-500 bg-red-50/30' : 'border-emerald-100 focus:ring-emerald-500'}`}
                        />
                      </div>
                      {fieldErrors.password && <p className="text-red-500 text-xs font-bold ml-2">{fieldErrors.password}</p>}
                    </div>
                  </div>

                  {/* EMAIL */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-emerald-700 ml-1">Email Aktif</label>
                    <div className="relative">
                      <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 ${fieldErrors.email ? 'text-red-400' : 'text-emerald-400'}`} size={20} />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => { setFormData({ ...formData, email: e.target.value }); setFieldErrors({...fieldErrors, email: ""}); }}
                        placeholder="mahasiswa@gmail.com"
                        className={`w-full bg-emerald-50/50 border rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:ring-2 transition-all font-medium ${fieldErrors.email ? 'border-red-300 focus:ring-red-500 bg-red-50/30' : 'border-emerald-100 focus:ring-emerald-500'}`}
                      />
                    </div>
                    {fieldErrors.email && <p className="text-red-500 text-xs font-bold ml-2">{fieldErrors.email}</p>}
                  </div>

                  {/* MENTOR */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-emerald-700 ml-1">Mentor Pembimbing</label>
                    <div className="relative">
                      <Users className={`absolute left-4 top-1/2 -translate-y-1/2 ${fieldErrors.mentorId ? 'text-red-400' : 'text-emerald-400'}`} size={20} />
                      <select
                        value={formData.mentorId}
                        onChange={(e) => { setFormData({ ...formData, mentorId: e.target.value }); setFieldErrors({...fieldErrors, mentorId: ""}); }}
                        className={`w-full bg-emerald-50/50 border rounded-2xl py-3.5 pl-12 pr-10 outline-none focus:ring-2 transition-all font-medium appearance-none cursor-pointer ${fieldErrors.mentorId ? 'border-red-300 focus:ring-red-500 bg-red-50/30' : 'border-emerald-100 focus:ring-emerald-500'}`}
                      >
                        <option value="" disabled>-- Pilih Mentor --</option>
                        {mentorList.map(m => <option key={m.id} value={m.id}>{m.nama}</option>)}
                      </select>
                      <ChevronDown size={20} className={`absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none ${fieldErrors.mentorId ? 'text-red-400' : 'text-emerald-400'}`} />
                    </div>
                    {fieldErrors.mentorId && <p className="text-red-500 text-xs font-bold ml-2">{fieldErrors.mentorId}</p>}
                  </div>

                  <div className="pt-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      disabled={loading}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-4 rounded-2xl shadow-lg shadow-emerald-100 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                    >
                      {loading ? (
                        <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          Buat Akun Sekarang <ArrowRight size={20} />
                        </>
                      )}
                    </motion.button>
                  </div>

                  <div className="pt-4 text-center">
                    <p className="text-sm font-medium text-emerald-700/60">
                      Sudah punya akun Portal?{" "}
                      <Link to="/student-login" className="text-emerald-600 hover:text-emerald-800 font-bold underline underline-offset-4 decoration-emerald-300 transition-colors">
                        Masuk di sini
                      </Link>
                    </p>
                  </div>

                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}