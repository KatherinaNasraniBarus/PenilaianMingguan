import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { User, Lock, ArrowRight, ChevronLeft, AlertCircle, Mail, X, CheckCircle2, MailCheck } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";

export default function StudentLogin() {
  const navigate = useNavigate();
  
  // STATE LOGIN
  const [formData, setFormData] = useState({ nim: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // STATE LUPA PASSWORD
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [forgotData, setForgotData] = useState({ nim: "", email: "" });
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMessage, setForgotMessage] = useState({ text: "", type: "" }); // Untuk error form
  
  // STATE BARU: POPUP SUKSES EMAIL TERKIRIM
  const [isResetSuccessOpen, setIsResetSuccessOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");
    
    try {
      const response = await fetch("https://api-penilaian-ruby.vercel.app/login.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nim: formData.nim, password: formData.password }),
      });

      const result = await response.json();

      if (result.status === "success") {
        localStorage.setItem("userRole", result.data.role);
        localStorage.setItem("userNim", result.data.nim);
        localStorage.setItem("userName", result.data.nama);
        navigate("/dashboard");
      } else {
        setErrorMessage(result.message || "Gagal melakukan login. Silakan coba lagi.");
      }
    } catch (error) {
      setErrorMessage("Terjadi kesalahan koneksi ke server. Pastikan XAMPP menyala.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotMessage({ text: "", type: "" });
    
    if (!forgotData.nim || !forgotData.email) {
      setForgotMessage({ text: "NIM dan Email harus diisi!", type: "error" });
      return;
    }

    setForgotLoading(true);

    try {
      const response = await fetch("https://api-penilaian-ruby.vercel.app/reset_password.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nim: forgotData.nim, email: forgotData.email }),
      });

      const result = await response.json();

      if (result.status === "success") {
        // 1. Tutup modal form lupa password
        setIsForgotOpen(false);
        // 2. Kosongkan isian form
        setForgotData({ nim: "", email: "" });
        // 3. BUKA POPUP SUKSES
        setIsResetSuccessOpen(true);
      } else {
        setForgotMessage({ text: result.message, type: "error" });
      }
    } catch (error) {
      setForgotMessage({ text: "Koneksi ke server gagal.", type: "error" });
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-emerald-50 flex items-center justify-center p-6 relative overflow-hidden">
      
      {/* ─── MODAL LUPA PASSWORD (FORM) ─── */}
      <AnimatePresence>
        {isForgotOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-950/60 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden"
            >
              <div className="px-6 py-5 border-b border-emerald-100 flex justify-between items-center bg-emerald-50/50">
                <h3 className="text-xl font-black text-emerald-950 flex items-center gap-2">
                  <Lock size={20} className="text-emerald-600" /> Reset Password
                </h3>
                <button 
                  onClick={() => { setIsForgotOpen(false); setForgotMessage({text:"", type:""}); }} 
                  className="p-2 text-emerald-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-6">
                <p className="text-emerald-700/70 text-sm mb-6 font-medium leading-relaxed">
                  Masukkan NIM dan Email Anda yang terdaftar. Sistem akan membuatkan password baru dan mengirimkannya ke email Anda.
                </p>

                <AnimatePresence>
                  {forgotMessage.text && forgotMessage.type === 'error' && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="mb-5 p-4 border rounded-2xl flex items-start gap-3 bg-red-50 border-red-200 text-red-600">
                      <AlertCircle size={20} className="shrink-0 mt-0.5" />
                      <p className="text-sm font-bold">{forgotMessage.text}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <form onSubmit={handleForgotPassword} className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-emerald-700 ml-1">NIM Anda</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400" size={20} />
                      <input type="text" required value={forgotData.nim} onChange={(e) => setForgotData({ ...forgotData, nim: e.target.value })} placeholder="211401011" className="w-full bg-emerald-50/50 border border-emerald-100 rounded-2xl py-3 pl-12 pr-4 outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-mono" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-emerald-700 ml-1">Email Terdaftar</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400" size={20} />
                      <input type="email" required value={forgotData.email} onChange={(e) => setForgotData({ ...forgotData, email: e.target.value })} placeholder="mahasiswa@gmail.com" className="w-full bg-emerald-50/50 border border-emerald-100 rounded-2xl py-3 pl-12 pr-4 outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium" />
                    </div>
                  </div>

                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} disabled={forgotLoading} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3.5 rounded-2xl shadow-lg shadow-emerald-100 flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-2">
                    {forgotLoading ? <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" /> : "Kirim Password Baru"}
                  </motion.button>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── MODAL SUKSES EMAIL TERKIRIM ─── */}
      <AnimatePresence>
        {isResetSuccessOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-emerald-950/60 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden p-8 text-center relative"
            >
              {/* Dekorasi Latar Belakang Modal */}
              <div className="absolute top-0 left-0 w-full h-32 bg-emerald-50 rounded-b-[50%] -z-10"></div>
              
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner border-4 border-white relative z-10">
                <MailCheck size={40} className="text-emerald-600" />
              </div>
              
              <h2 className="text-2xl font-black text-emerald-950 mb-2 relative z-10">Email Terkirim!</h2>
              <p className="text-emerald-700/80 font-medium text-sm leading-relaxed mb-8 relative z-10">
                Password baru Anda telah berhasil dikirim. Silakan periksa kotak masuk (Inbox) atau folder Spam di email Anda.
              </p>
              
              <button 
                onClick={() => setIsResetSuccessOpen(false)}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-2xl shadow-md transition-all active:scale-95"
              >
                Kembali ke Login
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* ─── END MODAL SUKSES ─── */}

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md relative z-10"
      >
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-emerald-600 font-bold mb-8 hover:gap-3 transition-all"
        >
          <ChevronLeft size={20} /> Kembali
        </button>

        <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-emerald-100 border border-emerald-100">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black text-emerald-950">Login Mahasiswa</h1>
            <p className="text-emerald-700/60 mt-2 font-medium">Masukkan NIM dan Password Anda</p>
          </div>

          <AnimatePresence>
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-600"
              >
                <AlertCircle size={20} className="shrink-0" />
                <p className="text-sm font-bold">{errorMessage}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-emerald-700 ml-1">NIM (Nomor Induk Mahasiswa)</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400" size={20} />
                <input
                  type="text"
                  required
                  value={formData.nim}
                  onChange={(e) => setFormData({ ...formData, nim: e.target.value })}
                  placeholder="Contoh: 210123456"
                  className="w-full bg-emerald-50/50 border border-emerald-100 rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-sm font-bold text-emerald-700">Password</label>
                
                {/* ─── TOMBOL LUPA PASSWORD ─── */}
                <button type="button" onClick={() => setIsForgotOpen(true)} className="text-xs font-bold text-emerald-500 hover:text-emerald-700 transition-colors">
                  Lupa Password?
                </button>
              </div>

              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400" size={20} />
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full bg-emerald-50/50 border border-emerald-100 rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
                />
              </div>
            </div>

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
                  Masuk Sekarang <ArrowRight size={20} />
                </>
              )}
            </motion.button>

            {/* ─── TAUTAN KE HALAMAN REGISTER ─── */}
            <div className="pt-4 text-center">
              <p className="text-sm font-medium text-emerald-700/60">
                Belum punya akun Portal?{" "}
                <Link to="/register" className="text-emerald-600 hover:text-emerald-800 font-bold underline underline-offset-4 decoration-emerald-300 transition-colors">
                  Daftar Sekarang
                </Link>
              </p>
            </div>

          </form>
        </div>
      </motion.div>
    </div>
  );
}