import React, { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronRight, ChevronDown, Download, ExternalLink, Users, 
  CheckCircle2, Clock, Trash2, UserPlus, ShieldAlert, X, Key, Copy, GraduationCap, AlertCircle, Mail, MessageCircle, CalendarClock, Save, History, MapPin, Camera, CalendarDays, PlusCircle, Search
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import logo from "../image/bpjstk.jpeg"; 
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

function ScoreInput({ value, max, onChange }: { value: number | ""; max: number; onChange: (v: number | "") => void; }) {
  return (
    <input
      type="number" min={0} max={max} value={value}
      onChange={(e) => {
        const v = e.target.value === "" ? "" : Math.min(max, Math.max(0, Number(e.target.value)));
        onChange(v);
      }}
      className="w-14 text-center border border-emerald-100 rounded-xl px-1 py-1.5 text-sm font-bold text-emerald-900 bg-emerald-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all font-mono shadow-inner"
      placeholder="—"
    />
  );
}

export default function MentorDashboard() {
  const navigate = useNavigate();
  const [students, setStudents] = useState<Student[]>([]);
  const [mentorName, setMentorName] = useState("");
  const [userRole, setUserRole] = useState("mentor"); 
  
  // STATE DINAMIS UNTUK MINGGU
  const [weeksList, setWeeksList] = useState<string[]>(["Minggu 1"]); 
  const [selectedWeek, setSelectedWeek] = useState("Minggu 1");
  const [newWeekInput, setNewWeekInput] = useState("");
  const [isAddingWeek, setIsAddingWeek] = useState(false);

  const [statusFilter, setStatusFilter] = useState<"semua" | "sudah" | "belum">("semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // STATE PAGINATION
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // STATE MODALS
  const [isDeadlineModalOpen, setIsDeadlineModalOpen] = useState(false);
  const [deadlines, setDeadlines] = useState<Record<string, string>>({});
  const [savingDeadline, setSavingDeadline] = useState<string | null>(null);

  const [isAbsenModalOpen, setIsAbsenModalOpen] = useState(false);
  const [absenHistory, setAbsenHistory] = useState<any[]>([]);
  const [loadingAbsen, setLoadingAbsen] = useState(false);
  const [selectedStudentForAbsen, setSelectedStudentForAbsen] = useState<{nim: string, nama: string} | null>(null);

  const [isMentorModalOpen, setIsMentorModalOpen] = useState(false);
  const [mentorList, setMentorList] = useState<{id: number, nama: string, username: string}[]>([]);
  const [newMentorName, setNewMentorName] = useState("");
  const [newAccountInfo, setNewAccountInfo] = useState<{username: string, password: string} | null>(null);
  const [isAddingMentor, setIsAddingMentor] = useState(false);

  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [newStudentName, setNewStudentName] = useState("");
  const [newStudentNim, setNewStudentNim] = useState("");
  const [newStudentEmail, setNewStudentEmail] = useState(""); 
  const [selectedNewMentor, setSelectedNewMentor] = useState("");
  const [newStudentAccountInfo, setNewStudentAccountInfo] = useState<{nim: string, password: string, email_sent: boolean} | null>(null);
  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const [studentFormErrors, setStudentFormErrors] = useState<{nama?: string, nim?: string, email?: string, mentor?: string}>({});

  // FUNGSI FETCH
  const fetchWeeks = useCallback(() => {
    fetch("https://api-penilaian.vercel.app/manage_minggu.php")
      .then(res => res.json())
      .then(data => { 
        if (data.status === "success") {
          setWeeksList(data.data);
          if (!data.data.includes(selectedWeek) && data.data.length > 0) setSelectedWeek(data.data[0]);
        } 
      })
      .catch(err => console.error("Gagal mengambil minggu:", err));
  }, [selectedWeek]);

  const fetchDeadlines = useCallback(() => {
    fetch("https://api-penilaian.vercel.app/manage_deadlines.php")
      .then(res => res.json())
      .then(data => { if (data.status === "success") setDeadlines(data.data); })
      .catch(err => console.error("Gagal mengambil deadline:", err));
  }, []);

  useEffect(() => {
    const mentorDataStr = localStorage.getItem("mentor_data");
    if (!mentorDataStr) {
      navigate("/mentor-login");
      return;
    }
    const mentor = JSON.parse(mentorDataStr);
    setMentorName(mentor.nama.split(" ")[0]);
    setUserRole(mentor.role || "mentor");

    fetch(`https://api-penilaian.vercel.app/get_mahasiswa_by_mentor.php?mentor_id=${mentor.id}&minggu=${encodeURIComponent(selectedWeek)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success") { setStudents(data.data); setCurrentPage(1); }
      })
      .catch((err) => console.error("Error fetching data:", err));
      
    fetchWeeks(); fetchDeadlines(); 
  }, [navigate, selectedWeek, refreshTrigger, fetchWeeks, fetchDeadlines]); 

  const handleAddWeek = async () => {
    if (!newWeekInput.trim()) return;
    setIsAddingWeek(true);
    try {
      const res = await fetch("https://api-penilaian.vercel.app/manage_minggu.php", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ nama_minggu: newWeekInput.trim() }) });
      const result = await res.json();
      if (result.status === "success") { setNewWeekInput(""); fetchWeeks(); } else alert(result.message);
    } catch (err) { alert("Kesalahan koneksi ke server."); } finally { setIsAddingWeek(false); }
  };

  const handleSaveDeadline = async (minggu: string, tanggal: string) => {
    if (!tanggal) { alert("Silakan pilih tanggal!"); return; }
    setSavingDeadline(minggu);
    try {
      const response = await fetch("https://api-penilaian.vercel.app/manage_deadlines.php", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ minggu, tanggal_deadline: tanggal }) });
      const result = await response.json();
      if(result.status === "success") fetchDeadlines(); else alert("Gagal menyimpan: " + result.message);
    } catch (err) { alert("Kesalahan koneksi."); } finally { setSavingDeadline(null); }
  };

  const handleViewAbsen = (nim: string, nama: string) => {
    setSelectedStudentForAbsen({ nim, nama }); setIsAbsenModalOpen(true); setLoadingAbsen(true);
    fetch(`https://api-penilaian.vercel.app/get_history_absen.php?nim=${nim}`).then(res => res.json())
      .then(result => { if (result.status === "success") setAbsenHistory(result.data); else setAbsenHistory([]); })
      .catch(err => { console.error("Error API Absen:", err); setAbsenHistory([]); }).finally(() => setLoadingAbsen(false));
  };

  const fetchMentors = () => { fetch("https://api-penilaian.vercel.app/get_mentors.php").then(res => res.json()).then(data => { if(data.status === "success") setMentorList(data.data); }); };
  const openMentorModal = () => { setIsMentorModalOpen(true); setNewAccountInfo(null); setNewMentorName(""); fetchMentors(); };
  const handleAddMentor = async (e: React.FormEvent) => {
    e.preventDefault(); if(!newMentorName.trim()) return; setIsAddingMentor(true);
    try {
      const response = await fetch("https://api-penilaian.vercel.app/add_mentor.php", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ nama: newMentorName }) });
      const result = await response.json();
      if(result.status === "success") { setNewAccountInfo({ username: result.data.username, password: result.data.password }); setNewMentorName(""); fetchMentors(); } else alert("Gagal: " + result.message);
    } catch (err) { alert("Kesalahan koneksi."); } finally { setIsAddingMentor(false); }
  };
  const handleDeleteMentor = async (id: number, nama: string) => {
    if(window.confirm(`YAKIN INGIN MENGHAPUS MENTOR "${nama}"?`)) {
      try {
        const res = await fetch("https://api-penilaian.vercel.app/delete_mentor.php", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
        const result = await res.json(); if(result.status === "success") fetchMentors();
      } catch (err) { alert("Kesalahan koneksi."); }
    }
  };

  const openStudentModal = () => { setIsStudentModalOpen(true); setNewStudentAccountInfo(null); setNewStudentName(""); setNewStudentNim(""); setNewStudentEmail(""); setSelectedNewMentor(""); setStudentFormErrors({}); fetchMentors(); };
  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: any = {};
    if (!newStudentName.trim()) errors.nama = "Nama Lengkap tidak boleh kosong!";
    if (!newStudentNim.trim()) errors.nim = "NIM tidak boleh kosong!";
    if (!newStudentEmail.trim()) errors.email = "Email tidak boleh kosong!"; else if (!/\S+@\S+\.\S+/.test(newStudentEmail)) errors.email = "Format email tidak valid!";
    if (!selectedNewMentor) errors.mentor = "Silakan pilih Mentor pembimbing!";
    if (Object.keys(errors).length > 0) { setStudentFormErrors(errors); return; }
    setStudentFormErrors({}); setIsAddingStudent(true);
    try {
      const response = await fetch("https://api-penilaian.vercel.app/add_mahasiswa.php", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ nama: newStudentName, nim: newStudentNim, email: newStudentEmail, mentor_id: selectedNewMentor }) });
      const result = await response.json();
      if(result.status === "success") { setNewStudentAccountInfo({ nim: result.data.nim, password: result.data.password, email_sent: result.data.email_sent }); setNewStudentName(""); setNewStudentNim(""); setNewStudentEmail(""); setSelectedNewMentor(""); setRefreshTrigger(prev => prev + 1); } 
      else { if (result.message.toLowerCase().includes("terdaftar")) setStudentFormErrors({ nim: result.message }); else alert("Gagal menambahkan: " + result.message); }
    } catch (err) { alert("Kesalahan koneksi ke server."); } finally { setIsAddingStudent(false); }
  };
  const handleDeleteStudent = async (nim: string, nama: string) => {
    if (window.confirm(`⚠️ PERINGATAN: Yakin ingin MENGHAPUS mahasiswa ${nama} (${nim}) secara permanen?`)) {
      try {
        const response = await fetch("https://api-penilaian.vercel.app/delete_mahasiswa.php", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ nim }) });
        const result = await response.json(); if (result.status === "success") setRefreshTrigger(prev => prev + 1); else alert("Gagal menghapus: " + result.message);
      } catch (err) { alert("Terjadi kesalahan."); }
    }
  };

  const updateScore = useCallback((id: number, field: "attitude" | "digitalisasi", value: number | "") => {
    setStudents((prev) => prev.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  }, []);

  // FILTERING & SEARCHING
  const searchedStudents = students.filter(s => 
    s.nama.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.nim.includes(searchQuery)
  );
  const sudahCount = searchedStudents.filter((s) => s.status === "sudah").length;
  const belumCount = searchedStudents.filter((s) => s.status === "belum").length;
  const filteredStudents = searchedStudents.filter((s) => statusFilter === "semua" || s.status === statusFilter);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentStudents = filteredStudents.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const getPageNumbers = () => { const pages = []; for (let i = 1; i <= totalPages; i++) pages.push(i); return pages; };

  // EXPORT EXCEL
  const handleExportExcel = () => {
    const dataToExport = filteredStudents.map((s) => {
      const baseData: any = { "NIM": s.nim, "Nama Mahasiswa": s.nama, "Mentor Pembimbing": s.nama_mentor || "-", "Status Laporan": s.status === "sudah" ? "Sudah Lapor" : "Belum Lapor", "Poin Aktivitas": s.poinMingguan };
      if (userRole !== 'admin') { baseData["Nilai Attitude"] = s.attitude === "" ? 0 : s.attitude; baseData["Nilai Digitalisasi"] = s.digitalisasi === "" ? 0 : s.digitalisasi; }
      baseData["TOTAL POIN AKHIR"] = s.poinKumulatif + (Number(s.attitude) || 0) + (Number(s.digitalisasi) || 0); baseData["Link Evidence"] = s.driveLink || "Tidak ada";
      return baseData;
    });
    const worksheet = XLSX.utils.json_to_sheet(dataToExport); const workbook = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(workbook, worksheet, `Rekap ${selectedWeek}`); XLSX.writeFile(workbook, `Rekap_Nilai_${mentorName}_${selectedWeek}.xlsx`);
  };

  return (
    <div className="flex flex-col min-h-full bg-emerald-50/30">

      {/* ─── MODALS DI SINI ─── */}
      <AnimatePresence>
        {/* MODAL ABSENSI */}
        {isAbsenModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-950/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white rounded-3xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
              <div className="px-6 py-5 border-b border-emerald-100 flex justify-between items-center bg-emerald-50/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-600 text-white rounded-xl"><History size={20} /></div>
                  <h3 className="text-xl font-black text-emerald-950">Riwayat Kehadiran: <span className="text-emerald-700">{selectedStudentForAbsen?.nama}</span></h3>
                </div>
                <button onClick={() => setIsAbsenModalOpen(false)} className="p-2 text-emerald-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"><X size={24} /></button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                {loadingAbsen ? (
                  <div className="flex flex-col items-center justify-center py-16 text-emerald-600 gap-4">
                    <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" /><p className="font-bold animate-pulse text-lg">Mengambil data absensi...</p>
                  </div>
                ) : absenHistory.length === 0 ? (
                  <div className="text-center py-20">
                    <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6"><CalendarDays size={40} className="text-emerald-300" /></div>
                    <p className="text-emerald-950 font-black text-xl mb-2">Belum ada riwayat absensi</p><p className="text-emerald-700/60 font-medium">Mahasiswa ini belum pernah melakukan presensi masuk.</p>
                  </div>
                ) : (
                  <div className="border border-emerald-100 rounded-2xl overflow-hidden shadow-sm">
                    <table className="w-full text-left">
                      <thead className="bg-emerald-50/80 border-b border-emerald-100">
                        <tr>
                          <th className="px-6 py-4 text-xs font-black text-emerald-800 uppercase tracking-widest">No</th>
                          <th className="px-6 py-4 text-xs font-black text-emerald-800 uppercase tracking-widest">Tanggal</th>
                          <th className="px-6 py-4 text-xs font-black text-emerald-800 uppercase tracking-widest">Waktu</th>
                          <th className="px-6 py-4 text-xs font-black text-emerald-800 uppercase tracking-widest text-center">Bukti Foto</th>
                          <th className="px-6 py-4 text-xs font-black text-emerald-800 uppercase tracking-widest text-right">Lokasi Maps</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-emerald-50">
                        {absenHistory.map((absen, index) => {
                          // --- PERBAIKAN FORMAT TANGGAL DAN WAKTU DI SINI ---
                          const rawTimestamp = absen.timestamp || "";
                          let tanggal = "-";
                          let waktu = "-";

                          if (rawTimestamp && rawTimestamp.includes(" ")) {
                            const parts = rawTimestamp.split(" ");
                            const rawDate = parts[0];
                            const rawTime = parts[1];

                            // Ubah format tanggal (YYYY-MM-DD ke DD-MM-YYYY)
                            if (rawDate.includes("-")) {
                              const dateParts = rawDate.split("-");
                              tanggal = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
                            }

                            // Ubah format waktu (HH:mm:ss ke HH:mm WIB)
                            if (rawTime.includes(":")) {
                              const timeParts = rawTime.split(":");
                              waktu = `${timeParts[0]}:${timeParts[1]} WIB`; 
                            }
                          }
                          // ---------------------------------------------------

                          return (
                            <tr key={absen.id || index} className="hover:bg-emerald-50/50 transition-colors">
                              <td className="px-6 py-4 font-black text-emerald-950">{index + 1}</td>
                              
                              <td className="px-6 py-4">
                                <span className="font-bold text-emerald-800">{tanggal}</span>
                              </td>
                              
                              <td className="px-6 py-4">
                                <span className="font-mono text-emerald-700 text-sm font-bold bg-white border border-emerald-100 shadow-sm px-3 py-1.5 rounded-lg">
                                  {waktu}
                                </span>
                              </td>
                              
                              <td className="px-6 py-4 text-center">
                                {absen.photo_url ? (
                                  <a 
                                    href={absen.photo_url.startsWith('http') ? absen.photo_url : `https://${absen.photo_url}`} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    referrerPolicy="no-referrer"
                                    className="inline-flex items-center gap-2 text-emerald-700 hover:text-white font-bold text-xs bg-emerald-50 hover:bg-emerald-600 border border-emerald-200 px-4 py-2 rounded-xl transition-colors shadow-sm"
                                  >
                                    <Camera size={14} /> Lihat Foto
                                  </a>
                                ) : (
                                  <span className="text-emerald-300 text-xs italic">Tidak ada foto</span>
                                )}
                              </td>

                              <td className="px-6 py-4 text-right">
                                {(absen.latitude && absen.longitude) ? (
                                  <a 
                                    href={`http://googleusercontent.com/maps.google.com/maps?q=${absen.latitude},${absen.longitude}`} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="inline-flex items-center justify-end gap-2 text-blue-700 hover:text-white font-bold text-xs bg-blue-50 hover:bg-blue-600 border border-blue-200 px-4 py-2 rounded-xl transition-colors shadow-sm"
                                  >
                                    <MapPin size={14} /> Google Maps
                                  </a>
                                ) : (
                                  <span className="text-emerald-400 text-xs italic font-medium">Lokasi tidak tersedia</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {/* MODAL DEADLINE */}
        {isDeadlineModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-950/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white rounded-3xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
              <div className="px-6 py-5 border-b border-emerald-100 flex justify-between items-center bg-emerald-50/50">
                <div className="flex items-center gap-3"><div className="p-2 bg-emerald-600 text-white rounded-xl"><CalendarClock size={20} /></div><h3 className="text-xl font-black text-emerald-950">Atur Jadwal & Minggu</h3></div>
                <button onClick={() => setIsDeadlineModalOpen(false)} className="p-2 text-emerald-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"><X size={24} /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
                <p className="text-sm font-medium text-emerald-700/80 mb-6">Tentukan batas akhir pengumpulan laporan, atau tambahkan minggu baru jika masa magang diperpanjang.</p>
                <div className="space-y-3 mb-8">
                  {weeksList.map((w) => (
                    <div key={w} className="flex items-center justify-between bg-white border border-emerald-100 p-4 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                      <div className="font-black text-emerald-950">{w}</div>
                      <div className="flex items-center gap-3">
                        <input type="date" value={deadlines[w] || ""} onChange={(e) => setDeadlines(prev => ({...prev, [w]: e.target.value}))} className="border border-emerald-200 rounded-xl px-4 py-2 text-sm font-bold text-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-emerald-50/30" />
                        <button onClick={() => handleSaveDeadline(w, deadlines[w])} disabled={savingDeadline === w} className="bg-emerald-100 hover:bg-emerald-600 text-emerald-700 hover:text-white p-2.5 rounded-xl transition-colors flex items-center justify-center shadow-sm" title="Simpan Deadline">
                          {savingDeadline === w ? <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"/> : <Save size={18} />}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="bg-emerald-600 p-6 rounded-3xl text-white shadow-lg relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500 rounded-full blur-2xl -mr-10 -mt-10 opacity-50"></div>
                  <p className="text-sm font-black mb-4 flex items-center gap-2 relative z-10"><PlusCircle size={18} /> Tambah Minggu Baru</p>
                  <div className="flex gap-3 relative z-10">
                    <input type="text" placeholder="Contoh: Minggu 7" value={newWeekInput} onChange={e => setNewWeekInput(e.target.value)} className="flex-1 bg-white/10 border border-white/20 text-white placeholder:text-white/50 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-white font-bold backdrop-blur-sm" />
                    <button onClick={handleAddWeek} disabled={!newWeekInput.trim() || isAddingWeek} className="bg-white hover:bg-emerald-50 disabled:opacity-50 text-emerald-900 px-6 py-2.5 rounded-xl font-black transition-all shadow-sm">
                      {isAddingWeek ? "Loading..." : "Tambah"}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {/* MODAL MENTOR */}
        {isMentorModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-950/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
              <div className="px-6 py-5 border-b border-emerald-100 flex justify-between items-center bg-emerald-50/50">
                <div className="flex items-center gap-3"><div className="p-2 bg-emerald-600 text-white rounded-xl"><Users size={20} /></div><h3 className="text-xl font-black text-emerald-950">Kelola Akun Mentor</h3></div>
                <button onClick={() => setIsMentorModalOpen(false)} className="p-2 text-emerald-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"><X size={24} /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-slate-50/50">
                <AnimatePresence>
                  {newAccountInfo && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-400 rounded-3xl p-6 relative overflow-hidden shadow-sm">
                      <div className="absolute -right-4 -top-4 opacity-5"><Key size={120} /></div>
                      <div className="flex gap-4 mb-4 items-start"><CheckCircle2 size={28} className="text-emerald-500 shrink-0" /><div><p className="font-black text-lg text-emerald-950">Akun Mentor Dibuat!</p><p className="text-sm font-medium text-emerald-700/80 mt-1">Segera salin kredensial di bawah. Password tidak akan ditampilkan lagi.</p></div></div>
                      <div className="bg-white rounded-2xl p-5 border border-emerald-100 flex flex-col sm:flex-row gap-5 items-center relative z-10 shadow-sm">
                        <div className="flex-1 w-full"><p className="text-xs font-bold text-emerald-600/70 uppercase tracking-widest mb-1">Username</p><p className="text-lg font-mono font-black text-emerald-950 bg-emerald-50/50 px-4 py-2 rounded-xl border border-emerald-50">{newAccountInfo.username}</p></div>
                        <div className="flex-1 w-full"><p className="text-xs font-bold text-emerald-700/50 uppercase tracking-widest mb-1">Password</p><p className="text-lg font-mono font-black text-emerald-950 bg-emerald-50/50 px-4 py-2 rounded-xl border border-emerald-50">{newAccountInfo.password}</p></div>
                        <button onClick={() => { navigator.clipboard.writeText(`Username: ${newAccountInfo.username}\nPassword: ${newAccountInfo.password}`); alert("Disalin!"); }} className="bg-emerald-600 text-white p-4 rounded-2xl hover:bg-emerald-700 transition-colors shadow-md mt-4 sm:mt-0" title="Salin"><Copy size={24} /></button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                <form onSubmit={handleAddMentor} className="bg-white border border-emerald-100 rounded-3xl p-6 shadow-sm">
                  <p className="font-black text-emerald-950 mb-4 flex items-center gap-2"><UserPlus size={18} className="text-emerald-600"/> Tambah Mentor Baru</p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input type="text" required placeholder="Nama Lengkap Mentor..." value={newMentorName} onChange={(e) => setNewMentorName(e.target.value)} className="flex-1 border border-emerald-200 bg-emerald-50/30 rounded-xl px-5 py-3 outline-none focus:ring-2 focus:ring-emerald-500 font-bold" />
                    <button type="submit" disabled={isAddingMentor || !newMentorName.trim()} className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-8 py-3 rounded-xl font-black transition-all shadow-md">{isAddingMentor ? "Loading..." : "Buat Akun"}</button>
                  </div>
                </form>
                <div className="bg-white border border-emerald-100 rounded-3xl shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-emerald-50"><p className="font-black text-emerald-950 flex items-center gap-2"><Users size={18} className="text-emerald-600"/> Daftar Mentor Aktif ({mentorList.length})</p></div>
                  <table className="w-full text-left"><thead className="bg-emerald-50/50 border-b border-emerald-100"><tr><th className="px-6 py-4 text-xs font-black text-emerald-800 uppercase tracking-widest">Nama Mentor</th><th className="px-6 py-4 text-xs font-black text-emerald-800 uppercase tracking-widest">Username</th><th className="px-6 py-4 w-10 text-center">Aksi</th></tr></thead><tbody className="divide-y divide-emerald-50">{mentorList.length === 0 ? ( <tr><td colSpan={3} className="text-center py-8 text-emerald-600/50 font-medium">Belum ada data</td></tr> ) : mentorList.map((m) => (<tr key={m.id} className="hover:bg-emerald-50/30"><td className="px-6 py-4 font-bold text-emerald-950">{m.nama}</td><td className="px-6 py-4 font-mono text-sm font-bold text-emerald-700 bg-emerald-50/50 rounded-lg px-3 py-1 inline-block mt-2 border border-emerald-100">{m.username}</td><td className="px-6 py-4 text-center"><button onClick={() => handleDeleteMentor(m.id, m.nama)} className="text-red-400 hover:text-red-600 hover:bg-red-50 p-2.5 rounded-xl transition-colors"><Trash2 size={18} /></button></td></tr>))}</tbody></table>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {/* MODAL MAHASISWA */}
        {isStudentModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-950/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white rounded-3xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
              <div className="px-6 py-5 border-b border-emerald-100 flex justify-between items-center bg-emerald-50/50">
                <div className="flex items-center gap-3"><div className="p-2 bg-emerald-600 text-white rounded-xl"><GraduationCap size={20} /></div><h3 className="text-xl font-black text-emerald-950">Tambah Mahasiswa</h3></div>
                <button onClick={() => setIsStudentModalOpen(false)} className="p-2 text-emerald-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"><X size={24} /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-slate-50/50">
                <AnimatePresence>
                  {newStudentAccountInfo && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-400 rounded-3xl p-6 relative overflow-hidden shadow-sm">
                      <div className="absolute -right-4 -top-4 opacity-5"><Key size={120} /></div>
                      <div className="flex gap-4 mb-4 items-start"><CheckCircle2 size={28} className="text-emerald-500 shrink-0" /><div><p className="font-black text-lg text-emerald-950">Akun Mahasiswa Dibuat!</p><p className="text-sm font-medium text-emerald-700/80 mt-1">{newStudentAccountInfo.email_sent ? "Kredensial login telah berhasil dikirim ke email mahasiswa." : "Gagal kirim email otomatis. Salin manual kredensial di bawah."}</p></div></div>
                      <div className="bg-white rounded-2xl p-5 border border-emerald-100 flex flex-col sm:flex-row gap-5 items-center relative z-10 shadow-sm">
                        <div className="flex-1 w-full"><p className="text-xs font-bold text-emerald-600/70 uppercase tracking-widest mb-1">NIM (Username)</p><p className="text-lg font-mono font-black text-emerald-950 bg-emerald-50/50 px-4 py-2 rounded-xl border border-emerald-50">{newStudentAccountInfo.nim}</p></div>
                        <div className="flex-1 w-full"><p className="text-xs font-bold text-emerald-700/50 uppercase tracking-widest mb-1">Password</p><p className="text-lg font-mono font-black text-emerald-950 bg-emerald-50/50 px-4 py-2 rounded-xl border border-emerald-50">{newStudentAccountInfo.password}</p></div>
                        <button onClick={() => { navigator.clipboard.writeText(`Login Magang\nNIM: ${newStudentAccountInfo.nim}\nPassword: ${newStudentAccountInfo.password}`); alert("Kredensial disalin!"); }} className="bg-emerald-600 text-white p-4 rounded-2xl hover:bg-emerald-700 transition-colors shadow-md mt-4 sm:mt-0" title="Salin"><Copy size={24} /></button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                <form onSubmit={handleAddStudent} className="bg-white border border-emerald-100 rounded-3xl p-8 shadow-sm space-y-5">
                  <div className="space-y-2"><label className="text-sm font-bold text-emerald-900 ml-1">Nama Lengkap</label><input type="text" value={newStudentName} onChange={(e) => { setNewStudentName(e.target.value); setStudentFormErrors({...studentFormErrors, nama: ""}); }} className="w-full border rounded-xl px-5 py-3.5 outline-none focus:ring-2 font-bold border-emerald-200 bg-emerald-50/30" placeholder="Ahmad Rayhan" /></div>
                  <div className="space-y-2"><label className="text-sm font-bold text-emerald-900 ml-1">NIM Mahasiswa</label><input type="number" value={newStudentNim} onChange={(e) => { setNewStudentNim(e.target.value); setStudentFormErrors({...studentFormErrors, nim: ""}); }} className="w-full border rounded-xl px-5 py-3.5 outline-none focus:ring-2 font-mono font-bold border-emerald-200 bg-emerald-50/30" placeholder="210123456" /></div>
                  <div className="space-y-2"><label className="text-sm font-bold text-emerald-900 ml-1">Email Aktif</label><div className="relative"><div className="absolute left-5 top-1/2 -translate-y-1/2 text-emerald-400"><Mail size={18} /></div><input type="email" value={newStudentEmail} onChange={(e) => { setNewStudentEmail(e.target.value); setStudentFormErrors({...studentFormErrors, email: ""}); }} className="w-full border rounded-xl pl-12 pr-5 py-3.5 outline-none focus:ring-2 font-bold border-emerald-200 bg-emerald-50/30" placeholder="mahasiswa@kampus.ac.id" /></div></div>
                  <div className="space-y-2"><label className="text-sm font-bold text-emerald-900 ml-1">Mentor Pembimbing</label><div className="relative"><select value={selectedNewMentor} onChange={(e) => { setSelectedNewMentor(e.target.value); setStudentFormErrors({...studentFormErrors, mentor: ""}); }} className="w-full border rounded-xl pl-5 pr-10 py-3.5 outline-none focus:ring-2 font-bold appearance-none border-emerald-200 bg-emerald-50/30"><option value="" disabled>-- Pilih Mentor --</option>{mentorList.map(m => <option key={m.id} value={m.id}>{m.nama}</option>)}</select><ChevronDown size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500 pointer-events-none" /></div></div>
                  <div className="pt-6"><button type="submit" disabled={isAddingStudent} className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-6 py-4 rounded-xl font-black transition-all flex justify-center items-center gap-2 shadow-lg">{isAddingStudent ? "Memproses..." : "Tambahkan Akun Baru"}</button></div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── HEADER NAVBAR ─── */}
      <header className="h-20 bg-white/80 backdrop-blur-md border-b border-emerald-100 flex items-center justify-between lg:justify-end px-6 lg:px-8 sticky top-0 z-30 shrink-0 lg:pl-8 pl-16 shadow-sm">
        <div className="flex lg:hidden items-center h-full">
          <img src={logo} alt="Logo BPJS TK" className="h-12 w-auto object-contain drop-shadow-sm" />
        </div>
        <div className="flex items-center gap-3">
          <div className="flex flex-col text-right hidden sm:flex">
            <span className="text-xs font-bold text-emerald-500 uppercase tracking-widest">{userRole === 'admin' ? 'Administrator' : 'Mentor'}</span>
            <span className="text-sm font-black text-emerald-950">{mentorName}</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-emerald-100 border-2 border-emerald-200 flex items-center justify-center text-emerald-700 font-black">
            {mentorName.charAt(0)}
          </div>
        </div>
      </header>

      {/* ─── KONTEN UTAMA ─── */}
      <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto w-full">
        
        {/* ─── HERO BANNER ─── */}
        <div className="relative bg-emerald-900 rounded-[2.5rem] p-8 sm:p-10 overflow-hidden shadow-2xl mb-10">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-emerald-700/50 blur-3xl"></div>
          <div className="absolute bottom-0 right-40 w-64 h-64 rounded-full bg-teal-500/20 blur-3xl"></div>

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3 mb-3">
                <h1 className="text-3xl sm:text-4xl font-black text-white capitalize tracking-tight">
                  Welcome back, {mentorName.toLowerCase()}!
                </h1>
              </div>
              <p className="text-emerald-100/90 text-sm sm:text-base font-medium leading-relaxed">
                {userRole === 'admin' ? 'Ini adalah pusat kendali Anda. Pantau seluruh laporan, kelola akses mentor, atur jadwal, dan evaluasi mahasiswa magang dalam satu tempat.' : 'Berikut adalah ringkasan dan pembaruan laporan dari mahasiswa magang di bawah bimbingan Anda minggu ini.'}
              </p>
            </div>

            {/* TOMBOL AKSI ADMIN (Glassmorphism) */}
            {userRole === 'admin' && (
              <div className="flex flex-wrap gap-3 lg:justify-end">
                <button onClick={() => setIsDeadlineModalOpen(true)} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 px-5 py-3 rounded-2xl font-bold transition-all backdrop-blur-md shadow-sm text-sm">
                  <CalendarClock size={18} /> Atur Jadwal
                </button>
                <a href="http://localhost:3000" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 px-5 py-3 rounded-2xl font-black transition-all shadow-lg text-sm">
                  <MessageCircle size={18} /> Panel WA
                </a>
                <button onClick={openMentorModal} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 px-5 py-3 rounded-2xl font-bold transition-all backdrop-blur-md shadow-sm text-sm">
                  <Users size={18} /> Kelola Mentor
                </button>
                <button onClick={openStudentModal} className="flex items-center gap-2 bg-white text-emerald-900 hover:bg-emerald-50 px-6 py-3 rounded-2xl font-black transition-all shadow-xl text-sm">
                  <UserPlus size={18} /> Mahasiswa Baru
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ─── KARTU STATISTIK ─── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-3xl border border-emerald-50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0"><Users size={28} /></div>
            <div>
              <p className="text-emerald-700/60 text-sm font-bold mb-1">Total Mahasiswa</p>
              <h3 className="text-3xl font-black text-emerald-950">{students.length}</h3>
            </div>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-emerald-50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-500 shrink-0"><CheckCircle2 size={28} /></div>
            <div>
              <p className="text-emerald-700/60 text-sm font-bold mb-1">Sudah Lapor</p>
              <h3 className="text-3xl font-black text-emerald-950">{sudahCount}</h3>
            </div>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-emerald-50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center text-red-500 shrink-0"><Clock size={28} /></div>
            <div>
              <p className="text-emerald-700/60 text-sm font-bold mb-1">Belum Lapor</p>
              <h3 className="text-3xl font-black text-red-500">{belumCount}</h3>
            </div>
          </div>
        </div>

        {/* ─── TABEL DATA MAHASISWA ─── */}
        <div className="bg-white border border-emerald-100 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
          
          {/* HEADER TABEL & FILTER */}
          <div className="px-6 py-5 border-b border-emerald-50 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-xl font-black text-emerald-950 flex items-center gap-2">
              <span className="w-2 h-6 bg-emerald-500 rounded-full"></span> Data Laporan
            </h2>

            <div className="flex items-center gap-3 overflow-x-auto pb-2 sm:pb-0">
              {/* Cari */}
              <div className="relative shrink-0">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400" />
                <input 
                  type="text" placeholder="Cari nama/NIM..." 
                  value={searchQuery} onChange={(e) => {setSearchQuery(e.target.value); setCurrentPage(1);}}
                  className="pl-9 pr-4 py-2 text-sm font-bold text-emerald-900 bg-slate-50 border border-emerald-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:bg-white transition-all w-40 sm:w-48"
                />
              </div>

              {/* Filter Minggu */}
              <div className="flex flex-col shrink-0 relative group">
                <div className="relative">
                  <select value={selectedWeek} onChange={(e) => setSelectedWeek(e.target.value)} className="appearance-none pl-4 pr-10 py-2 text-sm font-bold text-emerald-900 bg-slate-50 border border-emerald-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 cursor-pointer hover:bg-emerald-50 transition-all">
                    {weeksList.map((w) => <option key={w} value={w}>{w}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500 pointer-events-none" />
                </div>
                {deadlines[selectedWeek] && (
                  <span className="absolute -bottom-5 left-1 text-[10px] font-black text-rose-500 whitespace-nowrap">
                    DL: {new Date(deadlines[selectedWeek]).toLocaleDateString('id-ID', {day:'numeric', month:'short'})}
                  </span>
                )}
              </div>

              {/* Filter Status */}
              <div className="relative shrink-0">
                <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value as "semua" | "sudah" | "belum"); setCurrentPage(1); }} className="appearance-none pl-4 pr-10 py-2 text-sm font-bold text-emerald-900 bg-slate-50 border border-emerald-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 cursor-pointer hover:bg-emerald-50 transition-all">
                  <option value="semua">Semua Status</option>
                  <option value="sudah">Sudah Lapor</option>
                  <option value="belum">Belum Lapor</option>
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500 pointer-events-none" />
              </div>
              
              <button onClick={handleExportExcel} className="flex items-center gap-2 px-4 py-2 text-sm font-black text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl hover:bg-emerald-600 hover:text-white active:scale-95 transition-all shrink-0 whitespace-nowrap shadow-sm">
                <Download size={16} /> Excel
              </button>
            </div>
          </div>

          {/* TABEL */}
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left min-w-[900px]">
              <thead>
                <tr className="bg-slate-50 border-b border-emerald-100">
                  <th className="px-6 py-4 text-[11px] font-black text-emerald-800 uppercase tracking-widest whitespace-nowrap">Mahasiswa</th>
                  <th className="px-6 py-4 text-[11px] font-black text-emerald-800 uppercase tracking-widest whitespace-nowrap">Status</th>
                  <th className="px-6 py-4 text-[11px] font-black text-emerald-800 uppercase tracking-widest text-center whitespace-nowrap">Kehadiran</th>
                  <th className="px-6 py-4 text-[11px] font-black text-emerald-800 uppercase tracking-widest text-center whitespace-nowrap">Poin Aktv</th>
                  
                  {userRole !== 'admin' && (
                    <>
                      <th className="px-6 py-4 text-[11px] font-black text-emerald-800 uppercase tracking-widest text-center whitespace-nowrap">Attitude</th>
                      <th className="px-6 py-4 text-[11px] font-black text-emerald-800 uppercase tracking-widest text-center whitespace-nowrap">Digitalisasi</th>
                    </>
                  )}
                  
                  <th className="px-6 py-4 text-[11px] font-black text-emerald-800 uppercase tracking-widest text-center whitespace-nowrap">Evidence</th>
                  <th className="px-6 py-4 text-[11px] font-black text-emerald-950 bg-emerald-100/50 uppercase tracking-widest text-center whitespace-nowrap border-l border-emerald-100">Total Akhir</th>
                  {userRole === 'admin' && <th className="px-6 py-4 text-[11px] font-black text-emerald-800 uppercase tracking-widest text-center whitespace-nowrap">Aksi</th>}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {currentStudents.length === 0 ? (
                  <tr>
                    <td colSpan={userRole === 'admin' ? 7 : 8} className="px-6 py-20 text-center">
                      <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4"><Users size={32} className="text-emerald-200" /></div>
                      <p className="text-lg font-bold text-emerald-900 mb-1">Data Tidak Ditemukan</p>
                      <p className="text-sm font-medium text-emerald-700/50">Coba ubah filter atau kata kunci pencarian Anda.</p>
                    </td>
                  </tr>
                ) : (
                  currentStudents.map((s) => (
                    <tr key={s.id} className="hover:bg-emerald-50/50 transition-colors group">
                      <td className="px-6 py-5">
                        <p className="text-sm font-bold text-emerald-950 whitespace-nowrap">{s.nama}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-xs font-bold text-emerald-600/70 font-mono bg-emerald-50 px-2 py-0.5 rounded">{s.nim}</p>
                          {userRole === 'admin' && s.nama_mentor && (
                            <span className="text-[10px] bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 rounded font-bold whitespace-nowrap">
                              {s.nama_mentor.split(' ')[0]}
                            </span>
                          )}
                        </div>
                      </td>
                      
                      <td className="px-6 py-5">
                        {s.status === "sudah" ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black bg-emerald-100 text-emerald-700 whitespace-nowrap"><CheckCircle2 size={14} /> Lapor</span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black bg-red-50 text-red-500 border border-red-100 whitespace-nowrap"><Clock size={14} /> Belum</span>
                        )}
                      </td>

                      <td className="px-6 py-5 text-center">
                        <button onClick={() => handleViewAbsen(s.nim, s.nama)} className="inline-flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-emerald-600 text-emerald-700 hover:text-white border border-emerald-200 rounded-xl text-xs font-bold transition-all shadow-sm whitespace-nowrap group-hover:border-emerald-400">
                          <History size={14} /> Cek
                        </button>
                      </td>

                      <td className="px-6 py-5 text-center">
                        <span className="font-mono font-black text-emerald-700 text-base">{s.poinMingguan > 0 ? s.poinMingguan : <span className="text-slate-300">—</span>}</span>
                      </td>
                      
                      {userRole !== 'admin' && (
                        <>
                          <td className="px-6 py-5 text-center">
                            <ScoreInput value={s.attitude} max={10} onChange={(v) => updateScore(s.id, "attitude", v)} />
                          </td>
                          <td className="px-6 py-5 text-center">
                            <ScoreInput value={s.digitalisasi} max={20} onChange={(v) => updateScore(s.id, "digitalisasi", v)} />
                          </td>
                        </>
                      )}

                      <td className="px-6 py-5 text-center">
                        {s.driveLink ? (
                          <a href={s.driveLink} target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 inline-flex items-center gap-1.5 font-bold px-3 py-1.5 rounded-lg text-xs whitespace-nowrap transition-colors"><ExternalLink size={14} /> Buka</a>
                        ) : (<span className="text-slate-300 text-sm font-bold">—</span>)}
                      </td>
                      <td className="px-6 py-5 text-center bg-emerald-50/30 border-l border-emerald-50 group-hover:bg-emerald-100/50 transition-colors">
                        <span className="font-mono font-black text-emerald-950 text-xl">{s.poinKumulatif + (Number(s.attitude) || 0) + (Number(s.digitalisasi) || 0)}</span>
                      </td>
                      
                      {userRole === 'admin' && (
                        <td className="px-6 py-5 text-center">
                          <button onClick={() => handleDeleteStudent(s.nim, s.nama)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors" title="Hapus Mahasiswa">
                            <Trash2 size={18} />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* FOOTER PAGINATION */}
          <div className="px-6 py-5 border-t border-slate-100 text-xs sm:text-sm font-medium text-slate-500 flex flex-col sm:flex-row justify-between items-center gap-4 bg-white">
            <span>
              Menampilkan <span className="font-bold text-emerald-900">{filteredStudents.length > 0 ? indexOfFirstItem + 1 : 0} - {Math.min(indexOfLastItem, filteredStudents.length)}</span> dari <span className="font-bold text-emerald-900">{filteredStudents.length}</span> data
            </span>
            
            <div className="flex items-center gap-2">
              <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className={`px-4 py-2 rounded-xl font-bold transition-all ${currentPage === 1 ? "opacity-50 cursor-not-allowed bg-slate-50 text-slate-400" : "bg-white border border-slate-200 hover:border-emerald-300 hover:text-emerald-700 active:scale-95 shadow-sm"}`}>Prev</button>
              
              <div className="flex gap-1 hidden sm:flex">
                {getPageNumbers().map((num) => (
                  <button key={num} onClick={() => setCurrentPage(num)} className={`w-9 h-9 rounded-xl font-bold transition-all ${currentPage === num ? "bg-emerald-600 text-white shadow-md" : "bg-white border border-slate-200 text-slate-600 hover:border-emerald-300 hover:text-emerald-700"}`}>{num}</button>
                ))}
              </div>

              <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages || totalPages === 0} className={`px-4 py-2 rounded-xl font-bold transition-all ${currentPage === totalPages || totalPages === 0 ? "opacity-50 cursor-not-allowed bg-slate-50 text-slate-400" : "bg-white border border-slate-200 hover:border-emerald-300 hover:text-emerald-700 active:scale-95 shadow-sm"}`}>Next</button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}