import React, { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronRight, ChevronDown, Download, ExternalLink, Users, 
  CheckCircle2, Clock, Trash2, UserPlus, ShieldAlert, X, Key, Copy, GraduationCap, AlertCircle, Mail
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import logo from "../image/logobpjss.png";
import * as XLSX from 'xlsx';

interface Student {
  id: number;
  nama: string;
  nim: string;
  nama_mentor?: string;
  status: "sudah" | "belum";
  poinMingguan: number;
  poinKumulatif: number;
  attitude: number | "";
  digitalisasi: number | "";
  driveLink: string;
}

const WEEKS = ["Minggu 1", "Minggu 2", "Minggu 3", "Minggu 4", "Minggu 5", "Minggu 6"];

function ScoreInput({ value, max, onChange }: { value: number | ""; max: number; onChange: (v: number | "") => void; }) {
  return (
    <input
      type="number" min={0} max={max} value={value}
      onChange={(e) => {
        const v = e.target.value === "" ? "" : Math.min(max, Math.max(0, Number(e.target.value)));
        onChange(v);
      }}
      className="w-14 text-center border border-emerald-100 rounded-lg px-1 py-1.5 text-sm font-bold text-emerald-900 bg-emerald-50/40 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all font-mono"
      placeholder="—"
    />
  );
}

export default function MentorDashboard() {
  const navigate = useNavigate();
  const [students, setStudents] = useState<Student[]>([]);
  const [mentorName, setMentorName] = useState("");
  const [userRole, setUserRole] = useState("mentor"); 
  const [selectedWeek, setSelectedWeek] = useState("Minggu 1");
  const [statusFilter, setStatusFilter] = useState<"semua" | "sudah" | "belum">("semua");
  
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // STATE KELOLA MENTOR
  const [isMentorModalOpen, setIsMentorModalOpen] = useState(false);
  const [mentorList, setMentorList] = useState<{id: number, nama: string, username: string}[]>([]);
  const [newMentorName, setNewMentorName] = useState("");
  const [newAccountInfo, setNewAccountInfo] = useState<{username: string, password: string} | null>(null);
  const [isAddingMentor, setIsAddingMentor] = useState(false);

  // STATE KELOLA MAHASISWA
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [newStudentName, setNewStudentName] = useState("");
  const [newStudentNim, setNewStudentNim] = useState("");
  const [newStudentEmail, setNewStudentEmail] = useState(""); // <-- STATE BARU UNTUK EMAIL
  const [selectedNewMentor, setSelectedNewMentor] = useState("");
  const [newStudentAccountInfo, setNewStudentAccountInfo] = useState<{nim: string, password: string, email_sent: boolean} | null>(null);
  const [isAddingStudent, setIsAddingStudent] = useState(false);
  
  // STATE ERROR FORM MAHASISWA
  const [studentFormErrors, setStudentFormErrors] = useState<{nama?: string, nim?: string, email?: string, mentor?: string}>({});

  useEffect(() => {
    const mentorDataStr = localStorage.getItem("mentor_data");
    if (!mentorDataStr) {
      navigate("/mentor-login");
      return;
    }
    const mentor = JSON.parse(mentorDataStr);
    setMentorName(mentor.nama.split(" ")[0]);
    setUserRole(mentor.role || "mentor");

    fetch(`http://localhost/api-penilaian/get_mahasiswa_by_mentor.php?mentor_id=${mentor.id}&minggu=${encodeURIComponent(selectedWeek)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success") setStudents(data.data);
      })
      .catch((err) => console.error("Error fetching data:", err));
      
  }, [navigate, selectedWeek, refreshTrigger]); 

  const fetchMentors = () => {
    fetch("http://localhost/api-penilaian/get_mentors.php")
      .then(res => res.json())
      .then(data => {
        if(data.status === "success") setMentorList(data.data);
      });
  };

  const openMentorModal = () => {
    setIsMentorModalOpen(true);
    setNewAccountInfo(null);
    setNewMentorName("");
    fetchMentors();
  };

  const handleAddMentor = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!newMentorName.trim()) return;
    setIsAddingMentor(true);
    try {
      const response = await fetch("http://localhost/api-penilaian/add_mentor.php", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nama: newMentorName })
      });
      const result = await response.json();
      if(result.status === "success") {
        setNewAccountInfo({ username: result.data.username, password: result.data.password });
        setNewMentorName("");
        fetchMentors();
      } else alert("Gagal: " + result.message);
    } catch (err) { alert("Kesalahan koneksi."); } finally { setIsAddingMentor(false); }
  };

  const handleDeleteMentor = async (id: number, nama: string) => {
    if(window.confirm(`YAKIN INGIN MENGHAPUS MENTOR "${nama}"?\nSeluruh mahasiswa bimbingannya mungkin akan kehilangan akses mentor.`)) {
      try {
        const res = await fetch("http://localhost/api-penilaian/delete_mentor.php", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id })
        });
        const result = await res.json();
        if(result.status === "success") fetchMentors();
      } catch (err) { alert("Kesalahan koneksi."); }
    }
  };

  const openStudentModal = () => {
    setIsStudentModalOpen(true);
    setNewStudentAccountInfo(null);
    setNewStudentName("");
    setNewStudentNim("");
    setNewStudentEmail(""); // <-- Bersihkan email
    setSelectedNewMentor("");
    setStudentFormErrors({}); 
    fetchMentors(); 
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validasi Form
    const errors: {nama?: string, nim?: string, email?: string, mentor?: string} = {};
    if (!newStudentName.trim()) errors.nama = "Nama Lengkap tidak boleh kosong!";
    if (!newStudentNim.trim()) errors.nim = "NIM tidak boleh kosong!";
    if (!newStudentEmail.trim()) {
      errors.email = "Email tidak boleh kosong!";
    } else if (!/\S+@\S+\.\S+/.test(newStudentEmail)) {
      errors.email = "Format email tidak valid!";
    }
    if (!selectedNewMentor) errors.mentor = "Silakan pilih Mentor pembimbing!";

    if (Object.keys(errors).length > 0) {
      setStudentFormErrors(errors);
      return; 
    }

    setStudentFormErrors({}); 
    setIsAddingStudent(true);

    try {
      const response = await fetch("http://localhost/api-penilaian/add_mahasiswa.php", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          nama: newStudentName, 
          nim: newStudentNim, 
          email: newStudentEmail, // <-- Kirim email ke PHP
          mentor_id: selectedNewMentor 
        })
      });
      const result = await response.json();
      
      if(result.status === "success") {
        setNewStudentAccountInfo({ 
          nim: result.data.nim, 
          password: result.data.password,
          email_sent: result.data.email_sent 
        });
        setNewStudentName("");
        setNewStudentNim("");
        setNewStudentEmail("");
        setSelectedNewMentor("");
        setRefreshTrigger(prev => prev + 1); 
      } else {
        if (result.message.toLowerCase().includes("terdaftar")) {
          setStudentFormErrors({ nim: result.message });
        } else {
          alert("Gagal menambahkan mahasiswa: " + result.message);
        }
      }
    } catch (err) {
      alert("Kesalahan koneksi ke server.");
    } finally {
      setIsAddingStudent(false);
    }
  };

  const handleDeleteStudent = async (nim: string, nama: string) => {
    if (window.confirm(`⚠️ PERINGATAN: Yakin ingin MENGHAPUS mahasiswa ${nama} (${nim}) secara permanen?\n\nSemua riwayat laporan magangnya juga akan ikut terhapus dan tidak bisa dikembalikan!`)) {
      try {
        const response = await fetch("http://localhost/api-penilaian/delete_mahasiswa.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nim })
        });
        
        const result = await response.json();
        
        if (result.status === "success") {
          // Trigger refresh otomatis agar tabel langsung terupdate
          setRefreshTrigger(prev => prev + 1);
        } else {
          alert("Gagal menghapus mahasiswa: " + result.message);
        }
      } catch (err) {
        alert("Terjadi kesalahan koneksi ke server saat menghapus data.");
      }
    }
  };

  const sudahCount = students.filter((s) => s.status === "sudah").length;
  const belumCount = students.filter((s) => s.status === "belum").length;
  const filtered = students.filter((s) => statusFilter === "semua" || s.status === statusFilter);

  const updateScore = useCallback(
    (id: number, field: "attitude" | "digitalisasi", value: number | "") => {
      setStudents((prev) => prev.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
    }, []
  );

  const handleExportExcel = () => {
    const dataToExport = filtered.map((s) => ({
      "NIM": s.nim, "Nama Mahasiswa": s.nama, "Mentor Pembimbing": s.nama_mentor || "-",
      "Status Laporan": s.status === "sudah" ? "Sudah Lapor" : "Belum Lapor",
      "Poin Aktivitas": s.poinMingguan, "Nilai Attitude": s.attitude === "" ? 0 : s.attitude,
      "Nilai Digitalisasi": s.digitalisasi === "" ? 0 : s.digitalisasi,
      "TOTAL POIN AKHIR": s.poinKumulatif + (Number(s.attitude) || 0) + (Number(s.digitalisasi) || 0),
      "Link Evidence": s.driveLink || "Tidak ada"
    }));
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `Rekap ${selectedWeek}`);
    XLSX.writeFile(workbook, `Rekap_Nilai_${mentorName}_${selectedWeek}.xlsx`);
  };

  return (
    <div className="flex flex-col min-h-full bg-emerald-50/20">

      {/* ─── MODAL KELOLA MENTOR ─── */}
      <AnimatePresence>
        {isMentorModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-950/60 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
            >
              <div className="px-6 py-5 border-b border-emerald-100 flex justify-between items-center bg-emerald-50/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-600 text-white rounded-lg"><Users size={20} /></div>
                  <h3 className="text-xl font-black text-emerald-950">Kelola Akun Mentor</h3>
                </div>
                <button onClick={() => setIsMentorModalOpen(false)} className="p-2 text-emerald-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                <AnimatePresence>
                  {newAccountInfo && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                      className="bg-emerald-50 border-2 border-emerald-500 rounded-2xl p-5 relative overflow-hidden"
                    >
                      <div className="absolute -right-4 -top-4 opacity-10"><Key size={100} /></div>
                      <div className="flex gap-3 mb-3">
                        <CheckCircle2 className="text-emerald-500 shrink-0" />
                        <div>
                          <p className="font-bold text-emerald-900">Akun Mentor Berhasil Dibuat!</p>
                          <p className="text-xs text-emerald-700/70">Segera salin kredensial di bawah dan berikan kepada Mentor yang bersangkutan. <b>Password ini tidak akan ditampilkan lagi.</b></p>
                        </div>
                      </div>
                      <div className="bg-white rounded-xl p-4 border border-emerald-200 flex flex-col sm:flex-row gap-4 items-center relative z-10">
                        <div className="flex-1 w-full space-y-1">
                          <p className="text-xs font-bold text-emerald-700/50 uppercase tracking-widest">Username</p>
                          <p className="text-lg font-mono font-black text-emerald-950 bg-emerald-50 px-3 py-1 rounded">{newAccountInfo.username}</p>
                        </div>
                        <div className="flex-1 w-full space-y-1">
                          <p className="text-xs font-bold text-emerald-700/50 uppercase tracking-widest">Password</p>
                          <p className="text-lg font-mono font-black text-emerald-950 bg-emerald-50 px-3 py-1 rounded">{newAccountInfo.password}</p>
                        </div>
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(`Username: ${newAccountInfo.username}\nPassword: ${newAccountInfo.password}`);
                            alert("Kredensial berhasil disalin!");
                          }}
                          className="bg-emerald-600 text-white p-3 rounded-xl hover:bg-emerald-700 transition-colors" title="Salin Kredensial"
                        >
                          <Copy size={20} />
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <form onSubmit={handleAddMentor} className="bg-white border border-emerald-100 rounded-2xl p-5 shadow-sm">
                  <p className="font-bold text-emerald-900 mb-3 text-sm flex items-center gap-2"><UserPlus size={16}/> Tambah Mentor Baru</p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input 
                      type="text" required placeholder="Nama Lengkap Mentor..." 
                      value={newMentorName} onChange={(e) => setNewMentorName(e.target.value)}
                      className="flex-1 border border-emerald-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                    />
                    <button type="submit" disabled={isAddingMentor || !newMentorName.trim()} className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white px-6 py-2.5 rounded-xl font-bold transition-all whitespace-nowrap">
                      {isAddingMentor ? "Membuat Akun..." : "Buat Akun"}
                    </button>
                  </div>
                </form>

                <div>
                  <p className="font-bold text-emerald-900 mb-3 text-sm flex items-center gap-2"><Users size={16}/> Daftar Mentor Aktif ({mentorList.length})</p>
                  <div className="border border-emerald-100 rounded-2xl overflow-hidden">
                    <table className="w-full text-left">
                      <thead className="bg-emerald-50/50 border-b border-emerald-100">
                        <tr>
                          <th className="px-4 py-3 text-xs font-bold text-emerald-700">Nama Mentor</th>
                          <th className="px-4 py-3 text-xs font-bold text-emerald-700">Username</th>
                          <th className="px-4 py-3 w-10 text-center">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-emerald-50">
                        {mentorList.length === 0 ? (
                          <tr><td colSpan={3} className="text-center py-6 text-emerald-600/50 text-sm">Tidak ada mentor</td></tr>
                        ) : mentorList.map((m) => (
                          <tr key={m.id} className="hover:bg-emerald-50/20">
                            <td className="px-4 py-3 font-medium text-emerald-900">{m.nama}</td>
                            <td className="px-4 py-3 font-mono text-xs text-emerald-600 bg-emerald-50 rounded px-2">{m.username}</td>
                            <td className="px-4 py-3 text-center">
                              <button onClick={() => handleDeleteMentor(m.id, m.nama)} className="text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors">
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── MODAL KELOLA MAHASISWA ─── */}
      <AnimatePresence>
        {isStudentModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-950/60 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
            >
              <div className="px-6 py-5 border-b border-emerald-100 flex justify-between items-center bg-emerald-50/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-600 text-white rounded-lg"><GraduationCap size={20} /></div>
                  <h3 className="text-xl font-black text-emerald-950">Tambah Mahasiswa</h3>
                </div>
                <button onClick={() => setIsStudentModalOpen(false)} className="p-2 text-emerald-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                
                <AnimatePresence>
                  {newStudentAccountInfo && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                      className="bg-emerald-50 border-2 border-emerald-500 rounded-2xl p-5 relative overflow-hidden"
                    >
                      <div className="absolute -right-4 -top-4 opacity-10"><Key size={100} /></div>
                      <div className="flex gap-3 mb-3">
                        <CheckCircle2 className="text-emerald-500 shrink-0" />
                        <div>
                          <p className="font-bold text-emerald-900">Akun Berhasil Dibuat!</p>
                          <p className="text-xs text-emerald-700/70">
                            {newStudentAccountInfo.email_sent 
                              ? "Kredensial login telah berhasil dikirim ke email mahasiswa." 
                              : "Sistem XAMPP lokal tidak dapat mengirim email otomatis. Silakan salin kredensial di bawah ini secara manual."}
                          </p>
                        </div>
                      </div>
                      <div className="bg-white rounded-xl p-4 border border-emerald-200 flex flex-col sm:flex-row gap-4 items-center relative z-10">
                        <div className="flex-1 w-full space-y-1">
                          <p className="text-xs font-bold text-emerald-700/50 uppercase tracking-widest">NIM (Username)</p>
                          <p className="text-lg font-mono font-black text-emerald-950 bg-emerald-50 px-3 py-1 rounded">{newStudentAccountInfo.nim}</p>
                        </div>
                        <div className="flex-1 w-full space-y-1">
                          <p className="text-xs font-bold text-emerald-700/50 uppercase tracking-widest">Password</p>
                          <p className="text-lg font-mono font-black text-emerald-950 bg-emerald-50 px-3 py-1 rounded">{newStudentAccountInfo.password}</p>
                        </div>
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(`Login Magang\nNIM: ${newStudentAccountInfo.nim}\nPassword: ${newStudentAccountInfo.password}`);
                            alert("Kredensial berhasil disalin!");
                          }}
                          className="bg-emerald-600 text-white p-3 rounded-xl hover:bg-emerald-700 transition-colors" title="Salin Kredensial"
                        >
                          <Copy size={20} />
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <form onSubmit={handleAddStudent} className="bg-white border border-emerald-100 rounded-2xl p-6 shadow-sm space-y-5">
                  
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-emerald-900 ml-1">Nama Lengkap Mahasiswa</label>
                    <input 
                      type="text" placeholder="Contoh: Ahmad Rayhan" 
                      value={newStudentName} 
                      onChange={(e) => { setNewStudentName(e.target.value); setStudentFormErrors({...studentFormErrors, nama: ""}); }}
                      className={`w-full border rounded-xl px-4 py-2.5 outline-none focus:ring-2 font-medium transition-all duration-200 ${
                        studentFormErrors.nama ? "border-red-400 bg-red-50 focus:ring-red-500" : "border-emerald-200 bg-emerald-50/20 focus:ring-emerald-500"
                      }`}
                    />
                    {studentFormErrors.nama && <p className="text-red-500 text-xs font-medium ml-1 flex items-center gap-1"><AlertCircle size={12} /> {studentFormErrors.nama}</p>}
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-emerald-900 ml-1">NIM</label>
                    <input 
                      type="number" placeholder="Contoh: 211401011" 
                      value={newStudentNim} 
                      onChange={(e) => { setNewStudentNim(e.target.value); setStudentFormErrors({...studentFormErrors, nim: ""}); }}
                      className={`w-full border rounded-xl px-4 py-2.5 outline-none focus:ring-2 font-mono transition-all duration-200 ${
                        studentFormErrors.nim ? "border-red-400 bg-red-50 focus:ring-red-500" : "border-emerald-200 bg-emerald-50/20 focus:ring-emerald-500"
                      }`}
                    />
                    {studentFormErrors.nim && <p className="text-red-500 text-xs font-medium ml-1 flex items-center gap-1"><AlertCircle size={12} /> {studentFormErrors.nim}</p>}
                  </div>

                  {/* KOLOM EMAIL BARU */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-emerald-900 ml-1">Email Mahasiswa</label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400">
                        <Mail size={16} />
                      </div>
                      <input 
                        type="email" placeholder="contoh@gmail.com" 
                        value={newStudentEmail} 
                        onChange={(e) => { setNewStudentEmail(e.target.value); setStudentFormErrors({...studentFormErrors, email: ""}); }}
                        className={`w-full border rounded-xl pl-11 pr-4 py-2.5 outline-none focus:ring-2 font-medium transition-all duration-200 ${
                          studentFormErrors.email ? "border-red-400 bg-red-50 focus:ring-red-500" : "border-emerald-200 bg-emerald-50/20 focus:ring-emerald-500"
                        }`}
                      />
                    </div>
                    {studentFormErrors.email && <p className="text-red-500 text-xs font-medium ml-1 flex items-center gap-1"><AlertCircle size={12} /> {studentFormErrors.email}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-emerald-900 ml-1">Mentor Pembimbing</label>
                    <div className="relative">
                      <select 
                        value={selectedNewMentor} 
                        onChange={(e) => { setSelectedNewMentor(e.target.value); setStudentFormErrors({...studentFormErrors, mentor: ""}); }}
                        className={`w-full border rounded-xl px-4 py-2.5 outline-none focus:ring-2 font-medium appearance-none cursor-pointer transition-all duration-200 ${
                          studentFormErrors.mentor ? "border-red-400 bg-red-50 focus:ring-red-500" : "border-emerald-200 bg-emerald-50/20 focus:ring-emerald-500"
                        }`}
                      >
                        <option value="" disabled>-- Pilih Mentor --</option>
                        {mentorList.map(m => <option key={m.id} value={m.id}>{m.nama}</option>)}
                      </select>
                      <ChevronDown size={16} className={`absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none ${studentFormErrors.mentor ? 'text-red-400' : 'text-emerald-500'}`} />
                    </div>
                    {studentFormErrors.mentor && <p className="text-red-500 text-xs font-medium ml-1 flex items-center gap-1"><AlertCircle size={12} /> {studentFormErrors.mentor}</p>}
                  </div>

                  <div className="pt-4">
                    <button type="submit" disabled={isAddingStudent} className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-400 text-white px-6 py-3.5 rounded-xl font-bold transition-all flex justify-center items-center gap-2 active:scale-95 shadow-md">
                      {isAddingStudent ? "Memproses..." : <><UserPlus size={18}/> Tambahkan & Kirim Kredensial</>}
                    </button>
                  </div>
                </form>

              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="h-16 bg-white border-b border-emerald-100 flex items-center justify-between lg:justify-end px-6 lg:px-8 sticky top-0 z-30 shrink-0 lg:pl-8 pl-16 shadow-sm">
        <div className="flex lg:hidden items-center gap-3">
          <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center border border-emerald-50 shrink-0 p-0.5">
            <img src={logo} alt="Logo BPJS TK" className="w-full h-full object-contain" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-black text-emerald-950 tracking-tighter leading-none">SATU</h1>
            <div className="flex items-center gap-1 mt-0.5">
              <div className="h-[2px] w-2 bg-emerald-500 rounded-full"></div>
              <p className="text-[8px] font-black text-emerald-600 tracking-[0.2em] uppercase">BPJS TK</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-emerald-700/70 hidden sm:inline">
            {userRole === 'admin' ? 'Admin Portal' : 'Mentor Portal'}
          </span>
          <ChevronRight size={16} className="text-emerald-200 hidden sm:inline" />
          <span className="text-sm font-bold text-emerald-900 hidden sm:inline">Overview</span>
        </div>
      </header>

      <div className="p-6 lg:p-8 space-y-8 max-w-7xl mx-auto w-full">

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl lg:text-3xl font-black text-emerald-950 capitalize">
                Welcome back, {mentorName.toLowerCase()}!
              </h1>
              {userRole === 'admin' && (
                <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full border border-amber-200 flex items-center gap-1">
                  <ShieldAlert size={12} /> ADMIN VIEW
                </span>
              )}
            </div>
            <p className="text-emerald-700/60 text-sm lg:text-base">
              {userRole === 'admin' ? 'Anda dapat memantau seluruh data mahasiswa dari semua mentor.' : 'Here\'s the latest update on your internship participants today.'}
            </p>
          </div>

          {userRole === 'admin' && (
            <div className="flex gap-2">
              <button onClick={openMentorModal} className="flex items-center gap-2 bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-50 px-4 py-2 rounded-xl font-bold transition-all shadow-sm text-sm">
                <Users size={16} /> Kelola Mentor
              </button>
              <button onClick={openStudentModal} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl font-bold transition-all shadow-sm text-sm">
                <UserPlus size={16} /> Tambah Mahasiswa
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl border border-emerald-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><Users size={24} /></div>
            </div>
            <p className="text-emerald-700/60 text-sm font-medium">Total Mahasiswa</p>
            <h3 className="text-2xl font-black text-emerald-900">{students.length}</h3>
          </div>

          <div className="bg-white p-6 rounded-xl border border-emerald-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><CheckCircle2 size={24} /></div>
            </div>
            <p className="text-emerald-700/60 text-sm font-medium">Sudah Lapor</p>
            <h3 className="text-2xl font-black text-emerald-900">{sudahCount}</h3>
          </div>

          <div className="bg-white p-6 rounded-xl border border-emerald-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-red-50 text-red-500 rounded-lg"><Clock size={24} /></div>
            </div>
            <p className="text-emerald-700/60 text-sm font-medium">Belum Lapor</p>
            <h3 className="text-2xl font-black text-red-500">{belumCount}</h3>
          </div>
        </div>

        <div className="bg-white border border-emerald-100 rounded-xl shadow-sm overflow-hidden">
          <div className="px-4 lg:px-6 py-4 border-b border-emerald-100 bg-emerald-50/10">
            <div className="flex items-center gap-3 overflow-x-auto pb-1">
              <div className="relative shrink-0">
                <select value={selectedWeek} onChange={(e) => setSelectedWeek(e.target.value)} className="appearance-none pl-3 pr-8 py-1.5 text-sm font-semibold text-emerald-800 bg-white border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 cursor-pointer">
                  {WEEKS.map((w) => <option key={w}>{w}</option>)}
                </select>
                <ChevronDown size={13} className="absolute right-2 top-1/2 -translate-y-1/2 text-emerald-400 pointer-events-none" />
              </div>

              <div className="relative shrink-0">
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as "semua" | "sudah" | "belum")} className="appearance-none pl-3 pr-8 py-1.5 text-sm font-semibold text-emerald-800 bg-white border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 cursor-pointer">
                  <option value="semua">Semua Status</option>
                  <option value="sudah">Sudah Lapor</option>
                  <option value="belum">Belum Lapor</option>
                </select>
                <ChevronDown size={13} className="absolute right-2 top-1/2 -translate-y-1/2 text-emerald-400 pointer-events-none" />
              </div>

              <div className="flex-1 min-w-0" />

              <button onClick={handleExportExcel} className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-50 active:scale-95 transition-all shrink-0 whitespace-nowrap">
                <Download size={14} /> Export Excel
              </button>
            </div>
          </div>

          <div className="overflow-x-auto w-full">
            <table className="w-full text-left min-w-[800px]">
              <thead>
                <tr className="bg-emerald-50/50 border-b border-emerald-100">
                  <th className="px-6 py-4 text-xs font-bold uppercase text-emerald-700/70 whitespace-nowrap">Mahasiswa</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-emerald-700/70 whitespace-nowrap">Status</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-emerald-700/70 text-center whitespace-nowrap">Poin Aktivitas</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-emerald-700/70 text-center whitespace-nowrap">Attitude</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-emerald-700/70 text-center whitespace-nowrap">Digitalisasi</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-emerald-700/70 text-center whitespace-nowrap">Drive</th>
                  <th className="px-6 py-4 text-xs font-black uppercase text-emerald-900 bg-emerald-50/80 text-center whitespace-nowrap border-l border-emerald-100">Total Akhir</th>
                  {userRole === 'admin' && <th className="px-6 py-4 text-xs font-bold uppercase text-emerald-700/70 text-center whitespace-nowrap">Aksi</th>}
                </tr>
              </thead>

              <tbody className="divide-y divide-emerald-50">
                {filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-emerald-50/30 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-emerald-900 whitespace-nowrap">{s.nama}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-xs text-emerald-700/50 font-mono">{s.nim}</p>
                        {userRole === 'admin' && s.nama_mentor && (
                          <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold whitespace-nowrap">
                            Mentor: {s.nama_mentor.split(' ')[0]}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {s.status === "sudah" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 whitespace-nowrap"><CheckCircle2 size={11} /> Sudah</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-500 whitespace-nowrap"><Clock size={11} /> Belum</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="font-mono font-medium text-emerald-600">{s.poinMingguan > 0 ? s.poinMingguan : <span className="text-emerald-200">—</span>}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <ScoreInput value={s.attitude} max={10} onChange={(v) => updateScore(s.id, "attitude", v)} />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <ScoreInput value={s.digitalisasi} max={20} onChange={(v) => updateScore(s.id, "digitalisasi", v)} />
                    </td>
                    <td className="px-6 py-4 text-center">
                      {s.driveLink ? (
                        <a href={s.driveLink} target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1 font-medium underline underline-offset-4 decoration-emerald-200 text-sm whitespace-nowrap"><ExternalLink size={13} /> Drive</a>
                      ) : (<span className="text-emerald-200 text-sm">—</span>)}
                    </td>
                    <td className="px-6 py-4 text-center bg-emerald-50/50 border-l border-emerald-100">
                      <span className="font-mono font-black text-emerald-900 text-lg">{s.poinKumulatif + (Number(s.attitude) || 0) + (Number(s.digitalisasi) || 0)}</span>
                    </td>
                    
                    {userRole === 'admin' && (
                      <td className="px-6 py-4 text-center">
                        <button onClick={() => handleDeleteStudent(s.nim, s.nama)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Hapus Mahasiswa">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}