import React, { useState } from "react";
import { motion } from "motion/react";
import { User, Lock, ArrowRight, ChevronLeft, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function MentorLogin() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(""); // State baru untuk pesan error

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      // Menembak API PHP yang baru kita buat
      const response = await fetch("https://api-penilaian-ruby.vercel.app/login_mentor.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
        }),
      });

      const result = await response.json();

      if (response.ok && result.status === "success") {
        // Jika berhasil, simpan data mentor ke localStorage
        localStorage.setItem("mentor_data", JSON.stringify(result.data));
        // Lempar ke dashboard
        navigate("/mentor/dashboard");
      } else {
        // Jika gagal (password salah/user tidak ada), tampilkan error dari PHP
        setErrorMsg(result.message || "Gagal login. Periksa kembali data Anda.");
      }
    } catch (error) {
      setErrorMsg("Terjadi kesalahan koneksi ke server. Pastikan XAMPP menyala.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-emerald-50 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-emerald-600 font-bold mb-8 hover:gap-3 transition-all"
        >
          <ChevronLeft size={20} /> Kembali
        </button>

        <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-emerald-100 border border-emerald-100">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-black text-emerald-950">Login Mentor</h1>
            <p className="text-emerald-700/60 mt-2 font-medium">Masukkan Username Anda</p>
          </div>

          {/* Alert Error Box */}
          {errorMsg && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600">
              <AlertCircle size={20} />
              <p className="text-sm font-bold">{errorMsg}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-emerald-700 ml-1">Username</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400" size={20} />
                <input
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="ari_ismoyo"
                  className="w-full bg-emerald-50/50 border border-emerald-100 rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-emerald-700 ml-1">Password</label>
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
          </form>
        </div>
      </motion.div>
    </div>
  );
}