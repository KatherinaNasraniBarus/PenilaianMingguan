import React, { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronRight, ChevronDown, Download, ExternalLink, Users,
  CheckCircle2, Clock, Trash2, UserPlus, X, Key, Copy, GraduationCap,
  Mail, CalendarClock, Save, History, MapPin, Camera, CalendarDays,
  PlusCircle, Search, MessageCircle, FileText, Pencil
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion"; 
import logo from "../image/bpjstk.jpeg";
import * as XLSX from 'xlsx';

interface Student {
  id: number;
  nama: string;
  nim: string;
  nama_mentor?: string;
  status: "sudah" | "belum";
  total_kepling: number;
  total_keluarga: number;
  total_sosialisasi: number;
  driveLink: string;
}

// --- KOMPONEN PENERJEMAH KOORDINAT KE NAMA JALAN (DENGAN ANTREAN PINTAR) ---
const LocationName = ({ lat, lng }: { lat: number; lng: number }) => {
  const [address, setAddress] = useState("Melacak jalan...");

  useEffect(() => {
    if (!lat || !lng) {
      setAddress("Tidak tersedia");
      return;
    }
    
    // 1. Cek apakah lokasi ini sudah pernah dilacak sebelumnya (Cache)
    const cacheKey = `loc_${lat}_${lng}`;
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      setAddress(cached);
      return;
    }

    // 2. Buat jeda waktu acak (antara 500ms hingga 3000ms) agar tidak membanjiri server
    const randomDelay = Math.floor(Math.random() * 2500) + 500;
    
    const timeoutId = setTimeout(() => {
      // Menambahkan parameter email palsu agar server OpenStreetMap tidak mengira ini bot spam
      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&email=admin@kampus.ac.id`)
        .then(res => {
          if (!res.ok) throw new Error("Terkena limit API");
          return res.json();
        })
        .then(data => {
          if (data && data.address) {
            // Ambil nama jalan terdekat
            const street = data.address.road || data.address.neighbourhood || data.address.suburb || data.address.village || "Lokasi terdeteksi";
            setAddress(street);
            sessionStorage.setItem(cacheKey, street); // Simpan ke memori browser
          } else {
            setAddress("Jalan tak dikenal");
          }
        })
        .catch(() => setAddress("Satelit sibuk (Gagal)"));
    }, randomDelay);

    // Bersihkan antrean jika pengguna menutup modal sebelum pelacakan selesai
    return () => clearTimeout(timeoutId);
  }, [lat, lng]);

  return (
    <span className="inline-flex items-center justify-end gap-1.5 text-emerald-900 font-bold text-[10px] sm:text-xs whitespace-nowrap bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
      <MapPin size={12} className="text-emerald-500 shrink-0" /> 
      <span className="truncate max-w-[150px] sm:max-w-[200px] text-right" title={address}>
        {address}
      </span>
    </span>
  );
};
// ---------------------------------------------------

export default function MentorDashboard() {
  const navigate = useNavigate();
  const [students, setStudents] = useState<Student[]>([]);
  const [mentorName, setMentorName] = useState("");
  const [userRole, setUserRole] = useState("mentor");

  const [weeksList, setWeeksList] = useState<string[]>(["Minggu 1"]);
  const [selectedWeek, setSelectedWeek] = useState("Minggu 1");
  const [newWeekInput, setNewWeekInput] = useState("");
  const [isAddingWeek, setIsAddingWeek] = useState(false);

  const [statusFilter, setStatusFilter] = useState<"semua" | "sudah" | "belum">("semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [isDeadlineModalOpen, setIsDeadlineModalOpen] = useState(false);
  const [deadlines, setDeadlines] = useState<Record<string, string>>({});
  const [savingDeadline, setSavingDeadline] = useState<string | null>(null);

  const [isAbsenModalOpen, setIsAbsenModalOpen] = useState(false);
  const [absenHistory, setAbsenHistory] = useState<any[]>([]);
  const [loadingAbsen, setLoadingAbsen] = useState(false);
  const [selectedStudentForAbsen, setSelectedStudentForAbsen] = useState<{ nim: string; nama: string } | null>(null);

  const [isMentorModalOpen, setIsMentorModalOpen] = useState(false);
  const [mentorList, setMentorList] = useState<{ id: number; nama: string; username: string }[]>([]);
  const [newMentorName, setNewMentorName] = useState("");
  const [newAccountInfo, setNewAccountInfo] = useState<{ username: string; password: string } | null>(null);
  const [isAddingMentor, setIsAddingMentor] = useState(false);

  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [newStudentName, setNewStudentName] = useState("");
  const [newStudentNim, setNewStudentNim] = useState("");
  const [newStudentEmail, setNewStudentEmail] = useState("");
  const [selectedNewMentor, setSelectedNewMentor] = useState("");
  const [newStudentAccountInfo, setNewStudentAccountInfo] = useState<{ nim: string; password: string; email_sent: boolean } | null>(null);
  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const [studentFormErrors, setStudentFormErrors] = useState<{ nama?: string; nim?: string; email?: string; mentor?: string }>({});

  // STATE UNTUK GANTI MENTOR MAHASISWA (FITUR BARU)
  const [isEditMentorModalOpen, setIsEditMentorModalOpen] = useState(false);
  const [studentToEdit, setStudentToEdit] = useState<{ nim: string; nama: string; nama_mentor?: string } | null>(null);
  const [selectedEditMentor, setSelectedEditMentor] = useState("");
  const [isUpdatingMentor, setIsUpdatingMentor] = useState(false);

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
    if (!mentorDataStr) { navigate("/mentor-login"); return; }
    const mentor = JSON.parse(mentorDataStr);
    setMentorName(mentor.nama.split(" ")[0]);
    setUserRole(mentor.role || "mentor");

    fetch(`https://api-penilaian.vercel.app/get_mahasiswa_by_mentor.php?mentor_id=${mentor.id}&minggu=${encodeURIComponent(selectedWeek)}`)
      .then(res => res.json())
      .then(data => {
        if (data.status === "success") { setStudents(data.data); setCurrentPage(1); }
      })
      .catch(err => console.error("Error fetching data:", err));

    fetchWeeks();
    fetchDeadlines();
  }, [navigate, selectedWeek, refreshTrigger, fetchWeeks, fetchDeadlines]);

  const handleAddWeek = async () => {
    if (!newWeekInput.trim()) return;
    setIsAddingWeek(true);
    try {
      const res = await fetch("https://api-penilaian.vercel.app/manage_minggu.php", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ nama_minggu: newWeekInput.trim() }) });
      const result = await res.json();
      if (result.status === "success") { setNewWeekInput(""); fetchWeeks(); } else alert(result.message);
    } catch { alert("Kesalahan koneksi ke server."); } finally { setIsAddingWeek(false); }
  };

  const handleSaveDeadline = async (minggu: string, tanggal: string) => {
    if (!tanggal) { alert("Silakan pilih tanggal!"); return; }
    setSavingDeadline(minggu);
    try {
      const response = await fetch("https://api-penilaian.vercel.app/manage_deadlines.php", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ minggu, tanggal_deadline: tanggal }) });
      const result = await response.json();
      if (result.status === "success") fetchDeadlines(); else alert("Gagal menyimpan: " + result.message);
    } catch { alert("Kesalahan koneksi."); } finally { setSavingDeadline(null); }
  };

  const handleViewAbsen = (nim: string, nama: string) => {
    setSelectedStudentForAbsen({ nim, nama }); setIsAbsenModalOpen(true); setLoadingAbsen(true);
    fetch(`https://api-penilaian.vercel.app/get_history_absen.php?nim=${nim}`)
      .then(res => res.json())
      .then(result => { if (result.status === "success") setAbsenHistory(result.data); else setAbsenHistory([]); })
      .catch(() => setAbsenHistory([]))
      .finally(() => setLoadingAbsen(false));
  };

  const fetchMentors = () => {
    fetch("https://api-penilaian.vercel.app/get_mentors.php").then(res => res.json()).then(data => { if (data.status === "success") setMentorList(data.data); });
  };

  const openMentorModal = () => { setIsMentorModalOpen(true); setNewAccountInfo(null); setNewMentorName(""); fetchMentors(); };

  const handleAddMentor = async (e: React.FormEvent) => {
    e.preventDefault(); if (!newMentorName.trim()) return; setIsAddingMentor(true);
    try {
      const response = await fetch("https://api-penilaian.vercel.app/add_mentor.php", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ nama: newMentorName }) });
      const result = await response.json();
      if (result.status === "success") { setNewAccountInfo({ username: result.data.username, password: result.data.password }); setNewMentorName(""); fetchMentors(); } else alert("Gagal: " + result.message);
    } catch { alert("Kesalahan koneksi."); } finally { setIsAddingMentor(false); }
  };

  const handleDeleteMentor = async (id: number, nama: string) => {
    if (window.confirm(`YAKIN INGIN MENGHAPUS MENTOR "${nama}"?`)) {
      try {
        const res = await fetch("https://api-penilaian.vercel.app/delete_mentor.php", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
        const result = await res.json(); if (result.status === "success") fetchMentors();
      } catch { alert("Kesalahan koneksi."); }
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
      if (result.status === "success") { setNewStudentAccountInfo({ nim: result.data.nim, password: result.data.password, email_sent: result.data.email_sent }); setNewStudentName(""); setNewStudentNim(""); setNewStudentEmail(""); setSelectedNewMentor(""); setRefreshTrigger(prev => prev + 1); }
      else { if (result.message.toLowerCase().includes("terdaftar")) setStudentFormErrors({ nim: result.message }); else alert("Gagal menambahkan: " + result.message); }
    } catch { alert("Kesalahan koneksi ke server."); } finally { setIsAddingStudent(false); }
  };

  const handleDeleteStudent = async (nim: string, nama: string) => {
    if (window.confirm(`⚠️ Yakin ingin MENGHAPUS mahasiswa ${nama} (${nim}) beserta data absensinya?`)) {
      try {
        const response = await fetch("https://api-penilaian.vercel.app/delete_mahasiswa.php", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ nim }) });
        const result = await response.json(); if (result.status === "success") setRefreshTrigger(prev => prev + 1); else alert("Gagal menghapus: " + result.message);
      } catch { alert("Terjadi kesalahan."); }
    }
  };

  // FUNGSI GANTI MENTOR
  const openEditMentorModal = (student: Student) => {
    setStudentToEdit({ nim: student.nim, nama: student.nama, nama_mentor: student.nama_mentor });
    setSelectedEditMentor("");
    fetchMentors();
    setIsEditMentorModalOpen(true);
  };

  const handleUpdateMentor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentToEdit || !selectedEditMentor) return;
    setIsUpdatingMentor(true);
    try {
      const response = await fetch("https://api-penilaian.vercel.app/update_mahasiswa_mentor.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nim: studentToEdit.nim, mentor_id: selectedEditMentor })
      });
      const result = await response.json();
      if (result.status === "success") {
        setIsEditMentorModalOpen(false);
        setRefreshTrigger(prev => prev + 1);
      } else {
        alert("Gagal memindahkan mentor: " + result.message);
      }
    } catch {
      alert("Kesalahan koneksi ke server.");
    } finally {
      setIsUpdatingMentor(false);
    }
  };

  const searchedStudents = students.filter(s =>
    s.nama.toLowerCase().includes(searchQuery.toLowerCase()) || s.nim.includes(searchQuery)
  );
  const sudahCount = searchedStudents.filter(s => s.status === "sudah").length;
  const belumCount = searchedStudents.filter(s => s.status === "belum").length;
  const filteredStudents = searchedStudents.filter(s => statusFilter === "semua" || s.status === statusFilter);

  const indexOfLastItem  = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentStudents  = filteredStudents.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages       = Math.ceil(filteredStudents.length / itemsPerPage);

  const handleExportExcel = () => {
    const dataToExport = filteredStudents.map(s => ({
      "NIM":            s.nim,
      "Nama Mahasiswa": s.nama,
      "Mentor":         s.nama_mentor || "-",
      "Status":         s.status === "sudah" ? "Sudah Lapor" : "Belum Lapor",
      "BPU Kepling":    s.total_kepling    || 0,
      "BPU Keluarga":   s.total_keluarga   || 0,
      "Sosialisasi":    s.total_sosialisasi || 0,
      "Link Drive":     s.driveLink || "-",
    }));
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook  = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `Rekap ${selectedWeek}`);
    XLSX.writeFile(workbook, `Rekap_${mentorName}_${selectedWeek}.xlsx`);
  };

  return (
    <div className="flex flex-col min-h-full bg-emerald-50/30">

      {/* ─── MODAL GANTI MENTOR (KHUSUS ADMIN) ─── */}
      <AnimatePresence>
        {isEditMentorModalOpen && studentToEdit && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-emerald-950/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white rounded-2xl sm:rounded-3xl w-full max-w-md flex flex-col shadow-2xl overflow-hidden">
              <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-emerald-100 flex justify-between items-center bg-emerald-50/50 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-600 text-white rounded-xl shrink-0"><Pencil size={20} /></div>
                  <h3 className="text-lg sm:text-xl font-black text-emerald-950">Ganti Mentor</h3>
                </div>
                <button onClick={() => setIsEditMentorModalOpen(false)} className="p-2 text-emerald-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all shrink-0"><X size={24} /></button>
              </div>
              <div className="p-4 sm:p-6 space-y-5 bg-slate-50/50">
                <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                  <p className="text-xs font-bold text-emerald-600/70 uppercase tracking-widest mb-1">Mahasiswa</p>
                  <p className="text-sm font-black text-emerald-950">{studentToEdit.nama} ({studentToEdit.nim})</p>
                  <p className="text-xs font-medium text-emerald-700 mt-1">Mentor Saat Ini: <span className="font-bold">{studentToEdit.nama_mentor || '-'}</span></p>
                </div>
                
                <form onSubmit={handleUpdateMentor} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs sm:text-sm font-bold text-emerald-900 ml-1">Pilih Mentor Baru</label>
                    <div className="relative">
                      <select required value={selectedEditMentor} onChange={e => setSelectedEditMentor(e.target.value)} className="w-full border rounded-xl pl-4 sm:pl-5 pr-10 py-2.5 sm:py-3.5 outline-none focus:ring-2 font-bold appearance-none border-emerald-200 bg-white text-sm">
                        <option value="" disabled>-- Pilih Mentor --</option>
                        {mentorList.map(m => <option key={m.id} value={m.id}>{m.nama}</option>)}
                      </select>
                      <ChevronDown size={16} className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-emerald-500 pointer-events-none sm:w-[20px] sm:h-[20px]" />
                    </div>
                  </div>
                  <button type="submit" disabled={isUpdatingMentor || !selectedEditMentor} className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-black shadow-md text-sm mt-2 transition-all">
                    {isUpdatingMentor ? "Menyimpan..." : "Simpan Perubahan"}
                  </button>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {/* MODAL ABSENSI (RESPONSIF) */}
        {isAbsenModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-emerald-950/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white rounded-2xl sm:rounded-3xl w-full max-w-5xl max-h-[90vh] sm:max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-emerald-100 flex justify-between items-center bg-emerald-50/50 shrink-0">
  <div className="flex items-center gap-3 min-w-0 pr-2">
    <div className="p-2 bg-emerald-600 text-white rounded-xl shrink-0"><History size={20} /></div>
    <h3 className="text-lg sm:text-xl font-black text-emerald-950 truncate">
      Riwayat: <span className="text-emerald-700">{selectedStudentForAbsen?.nama?.split(" ")[0]}</span>
    </h3>
  </div>
  <button onClick={() => setIsAbsenModalOpen(false)} className="p-2 text-emerald-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all shrink-0">
    <X size={24} />
  </button>
</div>
              <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                {loadingAbsen ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-4">
                    <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                    <p className="font-bold animate-pulse text-base sm:text-lg text-emerald-600">Mengambil data absensi...</p>
                  </div>
                ) : absenHistory.length === 0 ? (
                  <div className="text-center py-16 sm:py-20">
                    <CalendarDays size={48} className="mx-auto text-emerald-200 mb-4" />
                    <p className="text-emerald-950 font-black text-lg sm:text-xl mb-2">Belum ada riwayat absensi</p>
                  </div>
                ) : (
                  <div className="border border-emerald-100 rounded-xl sm:rounded-2xl shadow-sm overflow-hidden flex flex-col">
                    <div className="overflow-x-auto w-full">
                      <table className="w-full text-left min-w-[800px]">
                        <thead className="bg-emerald-50/80 border-b border-emerald-100">
                          <tr>
                            <th className="px-4 sm:px-6 py-3 sm:py-4 text-[11px] sm:text-xs font-black text-emerald-800 uppercase tracking-widest whitespace-nowrap">No</th>
                            <th className="px-4 sm:px-6 py-3 sm:py-4 text-[11px] sm:text-xs font-black text-emerald-800 uppercase tracking-widest whitespace-nowrap">Tanggal</th>
                            <th className="px-4 sm:px-6 py-3 sm:py-4 text-[11px] sm:text-xs font-black text-emerald-800 uppercase tracking-widest whitespace-nowrap">Waktu</th>
                            <th className="px-4 sm:px-6 py-3 sm:py-4 text-[11px] sm:text-xs font-black text-emerald-800 uppercase tracking-widest text-center whitespace-nowrap">Tipe Absen</th>
                            {/* HEADER LAPORAN */}
                            <th className="px-4 sm:px-6 py-3 sm:py-4 text-[11px] sm:text-xs font-black text-emerald-800 uppercase tracking-widest min-w-[200px]">Laporan Jurnal</th>
                            <th className="px-4 sm:px-6 py-3 sm:py-4 text-[11px] sm:text-xs font-black text-emerald-800 uppercase tracking-widest text-center whitespace-nowrap">Bukti Foto</th>
                            <th className="px-4 sm:px-6 py-3 sm:py-4 text-[11px] sm:text-xs font-black text-emerald-800 uppercase tracking-widest text-right whitespace-nowrap">Lokasi GPS</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-emerald-50">
                          {absenHistory.map((absen, index) => {
                            const raw = absen.timestamp || "";
                            let tanggal = "-"; let waktu = "-";
                            
                            // FORMAT TANGGAL DAN WAKTU WIB
                            if (raw.includes(" ")) {
                              const parts = raw.split(" ");
                              if (parts[0].includes("-")) { const dp = parts[0].split("-"); tanggal = `${dp[2]}-${dp[1]}-${dp[0]}`; }
                              if (parts[1]?.includes(":")) { const tp = parts[1].split(":"); waktu = `${tp[0]}:${tp[1]} WIB`; }
                            }

                            // LOGIKA WARNA & TIPE ABSEN (IN/OUT)
                            const tipeRaw = absen.type || "in";
                            let labelTipe = "Masuk";
                            let warnaTipe = "bg-emerald-100 text-emerald-700 border-emerald-200";

                            if (tipeRaw === "out") {
                              labelTipe = "Pulang";
                              warnaTipe = "bg-orange-100 text-orange-700 border-orange-200";
                            } else if (tipeRaw === "meet-in") {
                              labelTipe = "Masuk (Meet)";
                              warnaTipe = "bg-blue-100 text-blue-700 border-blue-200";
                            } else if (tipeRaw === "meet-out") {
                              labelTipe = "Pulang (Meet)";
                              warnaTipe = "bg-rose-100 text-rose-700 border-rose-200";
                            }

                            // Variabel penangkap teks laporan
                            const textLaporan = absen.report || absen.catatan;

                            return (
                              <tr key={absen.id || index} className="hover:bg-emerald-50/50 transition-colors">
                                <td className="px-4 sm:px-6 py-3 sm:py-4 font-black text-emerald-950 text-sm align-top">{index + 1}</td>
                                <td className="px-4 sm:px-6 py-3 sm:py-4 font-bold text-emerald-800 text-sm whitespace-nowrap align-top">{tanggal}</td>
                                <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap align-top">
                                  <span className="font-mono text-xs sm:text-sm font-bold bg-white border border-emerald-100 shadow-sm px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-emerald-700">{waktu}</span>
                                </td>
                                
                                {/* KOLOM TIPE ABSEN */}
                                <td className="px-4 sm:px-6 py-3 sm:py-4 text-center whitespace-nowrap align-top">
                                  <span className={`text-[10px] sm:text-xs font-black px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg border shadow-sm ${warnaTipe}`}>
                                    {labelTipe}
                                  </span>
                                </td>

                                {/* ─── TAMPILAN KOLOM LAPORAN JURNAL (RAPI & ELEGAN) ─── */}
                                <td className="px-4 sm:px-6 py-3 sm:py-4 align-top w-[250px] sm:w-[350px]">
                                  {textLaporan ? (
                                    <div className="group flex gap-3 items-start bg-white p-3 rounded-xl border border-emerald-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)] hover:shadow-md hover:border-emerald-300 hover:bg-emerald-50/30 transition-all duration-300 cursor-default">
                                      <div className="p-1.5 bg-emerald-50 group-hover:bg-emerald-500 rounded-lg shrink-0 transition-colors duration-300">
                                        <FileText size={16} className="text-emerald-500 group-hover:text-white" />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className="text-xs sm:text-sm font-medium text-slate-700 leading-relaxed line-clamp-2 group-hover:line-clamp-none transition-all duration-300">
                                          {textLaporan}
                                        </p>
                                        <p className="text-[10px] font-bold text-emerald-500 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 h-0 group-hover:h-auto overflow-hidden">
                                          Baca selengkapnya
                                        </p>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="flex items-center justify-center gap-2 bg-slate-50/80 border border-dashed border-slate-200 p-2.5 rounded-xl text-slate-400">
                                      <FileText size={14} className="opacity-50" />
                                      <span className="text-[10px] sm:text-xs font-medium italic">Tidak ada laporan</span>
                                    </div>
                                  )}
                                </td>
                                
                                <td className="px-4 sm:px-6 py-3 sm:py-4 text-center align-top">
                                  {absen.photo_url ? (
                                    <a href={absen.photo_url.startsWith('http') ? absen.photo_url : `https://${absen.photo_url}`} target="_blank" rel="noopener noreferrer" referrerPolicy="no-referrer"
                                      className="inline-flex items-center gap-1.5 sm:gap-2 text-emerald-700 hover:text-white font-bold text-[10px] sm:text-xs bg-emerald-50 hover:bg-emerald-600 border border-emerald-200 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl transition-colors whitespace-nowrap">
                                      <Camera size={14} /> Lihat Foto
                                    </a>
                                  ) : <span className="text-emerald-300 text-[10px] sm:text-xs italic whitespace-nowrap">Tidak ada foto</span>}
                                </td>
                                
                                {/* KOLOM LOKASI MAPS MENGGUNAKAN NAMA JALAN */}
                                <td className="px-4 sm:px-6 py-3 sm:py-4 text-right align-top">
                                  {(absen.latitude && absen.longitude) ? (
                                    <LocationName lat={absen.latitude} lng={absen.longitude} />
                                  ) : (
                                    <span className="text-emerald-400 text-[10px] sm:text-xs italic whitespace-nowrap">Tidak tersedia</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {/* MODAL DEADLINE (RESPONSIF) */}
        {isDeadlineModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-emerald-950/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white rounded-2xl sm:rounded-3xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
              <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-emerald-100 flex justify-between items-center bg-emerald-50/50">
                <div className="flex items-center gap-3"><div className="p-2 bg-emerald-600 text-white rounded-xl"><CalendarClock size={20} /></div><h3 className="text-lg sm:text-xl font-black text-emerald-950">Atur Jadwal & Minggu</h3></div>
                <button onClick={() => setIsDeadlineModalOpen(false)} className="p-2 text-emerald-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"><X size={24} /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/50">
                <div className="space-y-3 mb-6 sm:mb-8">
                  {weeksList.map(w => (
                    <div key={w} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0 bg-white border border-emerald-100 p-4 rounded-2xl shadow-sm">
                      <div className="font-black text-emerald-950 text-sm sm:text-base">{w}</div>
                      <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                        <input type="date" value={deadlines[w] || ""} onChange={e => setDeadlines(prev => ({ ...prev, [w]: e.target.value }))} className="flex-1 sm:flex-none border border-emerald-200 rounded-xl px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold text-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-emerald-50/30" />
                        <button onClick={() => handleSaveDeadline(w, deadlines[w])} disabled={savingDeadline === w} className="bg-emerald-100 hover:bg-emerald-600 text-emerald-700 hover:text-white p-2 sm:p-2.5 rounded-xl transition-colors shrink-0">
                          {savingDeadline === w ? <div className="w-4 sm:w-5 h-4 sm:h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" /> : <Save size={16} className="sm:w-[18px] sm:h-[18px]" />}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="bg-emerald-600 p-5 sm:p-6 rounded-2xl sm:rounded-3xl text-white shadow-lg">
                  <p className="text-xs sm:text-sm font-black mb-3 sm:mb-4 flex items-center gap-2"><PlusCircle size={16} className="sm:w-[18px] sm:h-[18px]" /> Tambah Minggu Baru</p>
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <input type="text" placeholder="Contoh: Minggu 7" value={newWeekInput} onChange={e => setNewWeekInput(e.target.value)} className="w-full sm:flex-1 bg-white/10 border border-white/20 text-white placeholder:text-white/50 rounded-xl px-4 py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-white font-bold" />
                    <button onClick={handleAddWeek} disabled={!newWeekInput.trim() || isAddingWeek} className="w-full sm:w-auto bg-white hover:bg-emerald-50 disabled:opacity-50 text-emerald-900 px-6 py-2.5 rounded-xl font-black text-sm">
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
        {/* MODAL MENTOR (RESPONSIF) */}
        {isMentorModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-emerald-950/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white rounded-2xl sm:rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
              <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-emerald-100 flex justify-between items-center bg-emerald-50/50 shrink-0">
                <div className="flex items-center gap-3"><div className="p-2 bg-emerald-600 text-white rounded-xl"><Users size={20} /></div><h3 className="text-lg sm:text-xl font-black text-emerald-950">Kelola Mentor</h3></div>
                <button onClick={() => setIsMentorModalOpen(false)} className="p-2 text-emerald-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all shrink-0"><X size={24} /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 sm:space-y-8 bg-slate-50/50">
                <AnimatePresence>
                  {newAccountInfo && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-400 rounded-2xl sm:rounded-3xl p-5 sm:p-6 relative overflow-hidden shadow-sm">
                      <div className="flex gap-3 sm:gap-4 mb-4 items-start"><CheckCircle2 size={24} className="text-emerald-500 shrink-0 sm:w-[28px] sm:h-[28px]" /><div><p className="font-black text-base sm:text-lg text-emerald-950">Akun Dibuat!</p><p className="text-xs sm:text-sm font-medium text-emerald-700/80 mt-1">Segera salin kredensial di bawah.</p></div></div>
                      <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-emerald-100 flex flex-col sm:flex-row gap-3 sm:gap-5 items-center shadow-sm">
                        <div className="flex-1 w-full"><p className="text-[10px] sm:text-xs font-bold text-emerald-600/70 uppercase tracking-widest mb-1">Username</p><p className="text-base sm:text-lg font-mono font-black text-emerald-950 bg-emerald-50/50 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl truncate">{newAccountInfo.username}</p></div>
                        <div className="flex-1 w-full"><p className="text-[10px] sm:text-xs font-bold text-emerald-700/50 uppercase tracking-widest mb-1">Password</p><p className="text-base sm:text-lg font-mono font-black text-emerald-950 bg-emerald-50/50 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl truncate">{newAccountInfo.password}</p></div>
                        <button onClick={() => { navigator.clipboard.writeText(`Username: ${newAccountInfo.username}\nPassword: ${newAccountInfo.password}`); alert("Disalin!"); }} className="w-full sm:w-auto bg-emerald-600 text-white p-3 sm:p-4 rounded-xl sm:rounded-2xl hover:bg-emerald-700 transition-colors shadow-md flex justify-center"><Copy size={20} className="sm:w-[24px] sm:h-[24px]" /></button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                <form onSubmit={handleAddMentor} className="bg-white border border-emerald-100 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-sm">
                  <p className="font-black text-sm sm:text-base text-emerald-950 mb-3 sm:mb-4 flex items-center gap-2"><UserPlus size={16} className="text-emerald-600 sm:w-[18px] sm:h-[18px]" /> Tambah Mentor Baru</p>
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <input type="text" required placeholder="Nama Lengkap Mentor..." value={newMentorName} onChange={e => setNewMentorName(e.target.value)} className="flex-1 border border-emerald-200 bg-emerald-50/30 rounded-xl px-4 sm:px-5 py-2.5 sm:py-3 outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-sm" />
                    <button type="submit" disabled={isAddingMentor || !newMentorName.trim()} className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl font-black shadow-md text-sm">{isAddingMentor ? "Memuat..." : "Buat Akun"}</button>
                  </div>
                </form>
                <div className="bg-white border border-emerald-100 rounded-2xl sm:rounded-3xl shadow-sm overflow-hidden flex flex-col">
                  <div className="p-4 sm:p-6 border-b border-emerald-50 shrink-0"><p className="font-black text-sm sm:text-base text-emerald-950 flex items-center gap-2"><Users size={16} className="text-emerald-600 sm:w-[18px] sm:h-[18px]" /> Daftar Mentor ({mentorList.length})</p></div>
                  <div className="overflow-x-auto w-full">
                    <table className="w-full text-left min-w-[500px]">
                      <thead className="bg-emerald-50/50 border-b border-emerald-100">
                        <tr><th className="px-4 sm:px-6 py-3 sm:py-4 text-[10px] sm:text-xs font-black text-emerald-800 uppercase tracking-widest whitespace-nowrap">Nama</th><th className="px-4 sm:px-6 py-3 sm:py-4 text-[10px] sm:text-xs font-black text-emerald-800 uppercase tracking-widest whitespace-nowrap">Username</th><th className="px-4 sm:px-6 py-3 sm:py-4 w-10 text-center whitespace-nowrap">Aksi</th></tr>
                      </thead>
                      <tbody className="divide-y divide-emerald-50">
                        {mentorList.length === 0 ? <tr><td colSpan={3} className="text-center py-8 text-emerald-600/50 text-sm">Belum ada data</td></tr>
                          : mentorList.map(m => (
                            <tr key={m.id} className="hover:bg-emerald-50/30">
                              <td className="px-4 sm:px-6 py-3 sm:py-4 font-bold text-emerald-950 text-xs sm:text-sm whitespace-nowrap">{m.nama}</td>
                              <td className="px-4 sm:px-6 py-3 sm:py-4 font-mono text-[11px] sm:text-sm font-bold text-emerald-700 whitespace-nowrap">{m.username}</td>
                              <td className="px-4 sm:px-6 py-3 sm:py-4 text-center"><button onClick={() => handleDeleteMentor(m.id, m.nama)} className="text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg sm:rounded-xl transition-colors"><Trash2 size={16} className="sm:w-[18px] sm:h-[18px]" /></button></td>
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

      <AnimatePresence>
        {/* MODAL MAHASISWA (RESPONSIF) */}
        {isStudentModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-emerald-950/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white rounded-2xl sm:rounded-3xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
              <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-emerald-100 flex justify-between items-center bg-emerald-50/50 shrink-0">
                <div className="flex items-center gap-3"><div className="p-2 bg-emerald-600 text-white rounded-xl"><GraduationCap size={20} /></div><h3 className="text-lg sm:text-xl font-black text-emerald-950">Tambah Mahasiswa</h3></div>
                <button onClick={() => setIsStudentModalOpen(false)} className="p-2 text-emerald-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all shrink-0"><X size={24} /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 sm:space-y-8 bg-slate-50/50">
                <AnimatePresence>
                  {newStudentAccountInfo && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-400 rounded-2xl sm:rounded-3xl p-5 sm:p-6 relative overflow-hidden shadow-sm">
                      <div className="flex gap-3 sm:gap-4 mb-4 items-start"><CheckCircle2 size={24} className="text-emerald-500 shrink-0 sm:w-[28px] sm:h-[28px]" /><div><p className="font-black text-base sm:text-lg text-emerald-950">Akun Mahasiswa Dibuat!</p><p className="text-xs sm:text-sm font-medium text-emerald-700/80 mt-1">{newStudentAccountInfo.email_sent ? "Kredensial dikirim ke email." : "Gagal kirim email. Salin manual."}</p></div></div>
                      <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-emerald-100 flex flex-col sm:flex-row gap-3 sm:gap-5 items-center shadow-sm">
                        <div className="flex-1 w-full"><p className="text-[10px] sm:text-xs font-bold text-emerald-600/70 uppercase tracking-widest mb-1">NIM</p><p className="text-base sm:text-lg font-mono font-black text-emerald-950 bg-emerald-50/50 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl truncate">{newStudentAccountInfo.nim}</p></div>
                        <div className="flex-1 w-full"><p className="text-[10px] sm:text-xs font-bold text-emerald-700/50 uppercase tracking-widest mb-1">Password</p><p className="text-base sm:text-lg font-mono font-black text-emerald-950 bg-emerald-50/50 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl truncate">{newStudentAccountInfo.password}</p></div>
                        <button onClick={() => { navigator.clipboard.writeText(`NIM: ${newStudentAccountInfo.nim}\nPassword: ${newStudentAccountInfo.password}`); alert("Disalin!"); }} className="w-full sm:w-auto bg-emerald-600 text-white p-3 sm:p-4 rounded-xl sm:rounded-2xl hover:bg-emerald-700 transition-colors shadow-md flex justify-center"><Copy size={20} className="sm:w-[24px] sm:h-[24px]" /></button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                <form onSubmit={handleAddStudent} className="bg-white border border-emerald-100 rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-sm space-y-4 sm:space-y-5">
                  <div className="space-y-1.5 sm:space-y-2"><label className="text-xs sm:text-sm font-bold text-emerald-900 ml-1">Nama Lengkap</label><input type="text" value={newStudentName} onChange={e => { setNewStudentName(e.target.value); setStudentFormErrors({ ...studentFormErrors, nama: "" }); }} className="w-full border rounded-xl px-4 sm:px-5 py-2.5 sm:py-3.5 outline-none focus:ring-2 font-bold border-emerald-200 bg-emerald-50/30 text-sm" placeholder="Ahmad Rayhan" />{studentFormErrors.nama && <p className="text-red-500 text-[10px] sm:text-xs font-bold ml-1">{studentFormErrors.nama}</p>}</div>
                  <div className="space-y-1.5 sm:space-y-2"><label className="text-xs sm:text-sm font-bold text-emerald-900 ml-1">NIM</label><input type="number" value={newStudentNim} onChange={e => { setNewStudentNim(e.target.value); setStudentFormErrors({ ...studentFormErrors, nim: "" }); }} className="w-full border rounded-xl px-4 sm:px-5 py-2.5 sm:py-3.5 outline-none focus:ring-2 font-mono font-bold border-emerald-200 bg-emerald-50/30 text-sm" placeholder="210123456" />{studentFormErrors.nim && <p className="text-red-500 text-[10px] sm:text-xs font-bold ml-1">{studentFormErrors.nim}</p>}</div>
                  <div className="space-y-1.5 sm:space-y-2"><label className="text-xs sm:text-sm font-bold text-emerald-900 ml-1">Email Aktif</label><div className="relative"><div className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 text-emerald-400"><Mail size={16} className="sm:w-[18px] sm:h-[18px]" /></div><input type="email" value={newStudentEmail} onChange={e => { setNewStudentEmail(e.target.value); setStudentFormErrors({ ...studentFormErrors, email: "" }); }} className="w-full border rounded-xl pl-10 sm:pl-12 pr-4 sm:pr-5 py-2.5 sm:py-3.5 outline-none focus:ring-2 font-bold border-emerald-200 bg-emerald-50/30 text-sm" placeholder="mahasiswa@kampus.ac.id" /></div>{studentFormErrors.email && <p className="text-red-500 text-[10px] sm:text-xs font-bold ml-1">{studentFormErrors.email}</p>}</div>
                  <div className="space-y-1.5 sm:space-y-2"><label className="text-xs sm:text-sm font-bold text-emerald-900 ml-1">Mentor Pembimbing</label><div className="relative"><select value={selectedNewMentor} onChange={e => { setSelectedNewMentor(e.target.value); setStudentFormErrors({ ...studentFormErrors, mentor: "" }); }} className="w-full border rounded-xl pl-4 sm:pl-5 pr-10 py-2.5 sm:py-3.5 outline-none focus:ring-2 font-bold appearance-none border-emerald-200 bg-emerald-50/30 text-sm"><option value="" disabled>-- Pilih Mentor --</option>{mentorList.map(m => <option key={m.id} value={m.id}>{m.nama}</option>)}</select><ChevronDown size={16} className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-emerald-500 pointer-events-none sm:w-[20px] sm:h-[20px]" /></div>{studentFormErrors.mentor && <p className="text-red-500 text-[10px] sm:text-xs font-bold ml-1">{studentFormErrors.mentor}</p>}</div>
                  <div className="pt-4 sm:pt-6"><button type="submit" disabled={isAddingStudent} className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-6 py-3 sm:py-4 rounded-xl font-black flex justify-center items-center gap-2 shadow-lg text-sm sm:text-base">{isAddingStudent ? "Memproses..." : "Tambahkan Akun Baru"}</button></div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── HEADER NAVBAR ─── */}
      <header className="h-16 sm:h-20 bg-white/90 backdrop-blur-md border-b border-emerald-100 flex items-center justify-between lg:justify-end px-4 sm:px-6 lg:px-8 sticky top-0 z-30 shrink-0 lg:pl-8 pl-14 shadow-sm">
        <div className="flex lg:hidden items-center h-full">
          <img src={logo} alt="Logo BPJS TK" className="h-10 sm:h-12 w-auto object-contain" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs sm:text-sm font-medium text-emerald-700/70 hidden sm:inline">Mentor Portal</span>
          <ChevronRight size={14} className="text-emerald-200 hidden sm:inline sm:w-[16px] sm:h-[16px]" />
          <span className="text-xs sm:text-sm font-bold text-emerald-900 hidden sm:inline">Dashboard</span>
        </div>
      </header>

      <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-5 max-w-7xl mx-auto w-full pb-20">

        {/* ─── HERO & ACTION BUTTONS ─── */}
        <div className="relative bg-emerald-900 rounded-[1.5rem] sm:rounded-[2.5rem] p-6 sm:p-10 overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 sm:w-80 h-64 sm:h-80 rounded-full bg-emerald-700/50 blur-3xl"></div>
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 sm:gap-8">
            <div className="max-w-2xl">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white capitalize tracking-tight">
                Welcome back, {mentorName.toLowerCase()}!
              </h1>
              <p className="text-emerald-100/90 text-xs sm:text-sm lg:text-base font-medium leading-relaxed mt-2">
                {userRole === 'admin' ? 'Pusat kendali sistem penilaian magang.' : 'Pantau laporan mingguan mahasiswa bimbingan Anda.'}
              </p>
            </div>
            {userRole === 'admin' && (
              <div className="flex flex-wrap gap-2 sm:gap-3 lg:justify-end">
                {/* TOMBOL BOT WA */}
                <a href="https://anugrahbodi.github.io/project-wa/public/" target="_blank" rel="noopener noreferrer" className="flex flex-1 sm:flex-none items-center justify-center gap-1.5 sm:gap-2 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 px-3 sm:px-5 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl font-black transition-all shadow-lg text-xs sm:text-sm">
                  <MessageCircle size={16} className="sm:w-[18px] sm:h-[18px]" /> Panel WA
                </a>
                <button onClick={() => setIsDeadlineModalOpen(true)} className="flex flex-1 sm:flex-none items-center justify-center gap-1.5 sm:gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 px-3 sm:px-5 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl font-bold transition-all text-xs sm:text-sm">
                  <CalendarClock size={16} className="sm:w-[18px] sm:h-[18px]" /> Jadwal
                </button>
                <button onClick={openMentorModal} className="flex flex-1 sm:flex-none items-center justify-center gap-1.5 sm:gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 px-3 sm:px-5 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl font-bold transition-all text-xs sm:text-sm">
                  <Users size={16} className="sm:w-[18px] sm:h-[18px]" /> Mentor
                </button>
                <button onClick={openStudentModal} className="flex w-full sm:w-auto items-center justify-center gap-1.5 sm:gap-2 bg-white text-emerald-900 hover:bg-emerald-50 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl font-black transition-all shadow-xl text-xs sm:text-sm mt-1 sm:mt-0">
                  <UserPlus size={16} className="sm:w-[18px] sm:h-[18px]" /> Tambah Mahasiswa
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ─── KARTU STATISTIK ─── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-5">
          {[
            { label: "Total Mahasiswa", val: students.length,  icon: <Users size={24} className="sm:w-[28px] sm:h-[28px]" />,       color: "text-emerald-600", bg: "bg-emerald-50" },
            { label: "Sudah Lapor",     val: sudahCount,        icon: <CheckCircle2 size={24} className="sm:w-[28px] sm:h-[28px]" />, color: "text-emerald-500", bg: "bg-emerald-50" },
            { label: "Belum Lapor",     val: belumCount,        icon: <Clock size={24} className="sm:w-[28px] sm:h-[28px]" />,        color: "text-red-500",     bg: "bg-red-50" },
          ].map(card => (
            <div key={card.label} className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-emerald-50 shadow-[0_4px_20px_rgb(0,0,0,0.03)] flex items-center gap-4 sm:gap-5">
              <div className={`w-12 sm:w-16 h-12 sm:h-16 rounded-xl sm:rounded-2xl ${card.bg} flex items-center justify-center ${card.color} shrink-0`}>{card.icon}</div>
              <div>
                <p className="text-emerald-700/60 text-xs sm:text-sm font-bold mb-0.5 sm:mb-1">{card.label}</p>
                <h3 className={`text-2xl sm:text-3xl font-black ${card.color}`}>{card.val}</h3>
              </div>
            </div>
          ))}
        </div>

        {/* ─── TOOLBAR PENCARIAN & FILTER ─── */}
        <div className="bg-white border border-slate-200 rounded-xl sm:rounded-2xl shadow-sm px-4 sm:px-5 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 flex-wrap">
            <div className="relative shrink-0">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input type="text" placeholder="Cari nama/NIM..."
                value={searchQuery} onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="w-full sm:w-48 pl-9 pr-4 py-2 sm:py-2.5 text-xs sm:text-sm text-slate-800 bg-slate-50 border border-slate-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all" />
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-none">
                <select value={selectedWeek} onChange={e => setSelectedWeek(e.target.value)}
                  className="w-full pl-3 sm:pl-4 pr-8 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 appearance-none cursor-pointer">
                  {weeksList.map(w => <option key={w} value={w}>{w}</option>)}
                </select>
                <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
              <div className="relative flex-1 sm:flex-none">
                <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value as any); setCurrentPage(1); }}
                  className="w-full pl-3 sm:pl-4 pr-8 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 appearance-none cursor-pointer">
                  <option value="semua">Semua Status</option>
                  <option value="sudah">Sudah Lapor</option>
                  <option value="belum">Belum Lapor</option>
                </select>
                <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>
            <button onClick={handleExportExcel}
              className="mt-2 sm:mt-0 sm:ml-auto flex items-center justify-center gap-2 px-4 py-2 sm:py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold rounded-lg sm:rounded-xl transition-all shadow-sm w-full sm:w-auto">
              <Download size={14} /> Export Excel
            </button>
          </div>
        </div>

        {/* ─── TABEL UTAMA (RESPONSIF) ─── */}
        <div className="bg-white border border-emerald-100 rounded-2xl sm:rounded-[2rem] shadow-[0_4px_20px_rgb(0,0,0,0.03)] overflow-hidden flex flex-col">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left min-w-[800px]">
              <thead>
                <tr className="bg-emerald-50/30 border-b border-emerald-100">
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-[10px] sm:text-[11px] font-black text-emerald-800 uppercase tracking-widest whitespace-nowrap">Mahasiswa</th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-[10px] sm:text-[11px] font-black text-emerald-800 uppercase tracking-widest whitespace-nowrap">Status</th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-[10px] sm:text-[11px] font-black text-emerald-800 uppercase tracking-widest text-center whitespace-nowrap">Kehadiran</th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-[10px] sm:text-[11px] font-black text-emerald-800 uppercase tracking-widest text-center whitespace-nowrap">BPU Kepling</th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-[10px] sm:text-[11px] font-black text-emerald-800 uppercase tracking-widest text-center whitespace-nowrap">BPU Keluarga</th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-[10px] sm:text-[11px] font-black text-emerald-800 uppercase tracking-widest text-center whitespace-nowrap">Sosialisasi</th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-[10px] sm:text-[11px] font-black text-emerald-800 uppercase tracking-widest text-center whitespace-nowrap">Link Drive</th>
                  {userRole === 'admin' && <th className="px-4 sm:px-6 py-3 sm:py-4 text-[10px] sm:text-[11px] font-black text-emerald-800 uppercase tracking-widest text-center whitespace-nowrap">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-50/50">
                {currentStudents.length === 0 ? (
                  <tr><td colSpan={8} className="px-4 sm:px-6 py-16 sm:py-20 text-center">
                    <p className="text-sm sm:text-lg font-bold text-emerald-900">Tidak ada data mahasiswa</p>
                  </td></tr>
                ) : currentStudents.map(s => (
                  <tr key={s.id} className="hover:bg-emerald-50/40 transition-colors group">
                    <td className="px-4 sm:px-6 py-4 sm:py-5">
                      <p className="text-xs sm:text-sm font-bold text-emerald-950 whitespace-nowrap">{s.nama}</p>
                      <div className="flex items-center gap-1.5 sm:gap-2 mt-1">
                        <p className="text-[10px] sm:text-xs font-bold text-emerald-600/70 font-mono bg-emerald-50 px-1.5 sm:px-2 py-0.5 rounded">{s.nim}</p>
                        {userRole === 'admin' && s.nama_mentor && (
                          <span className="text-[9px] sm:text-[10px] bg-slate-100 text-slate-600 border border-slate-200 px-1.5 sm:px-2 py-0.5 rounded font-bold whitespace-nowrap">{s.nama_mentor.split(' ')[0]}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 sm:py-5">
                      {s.status === "sudah" ? (
                        <span className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-black bg-emerald-100 text-emerald-700 whitespace-nowrap"><CheckCircle2 size={12} className="sm:w-[14px] sm:h-[14px]" /> Lapor</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-black bg-red-50 text-red-500 border border-red-100 whitespace-nowrap"><Clock size={12} className="sm:w-[14px] sm:h-[14px]" /> Belum</span>
                      )}
                    </td>
                    <td className="px-4 sm:px-6 py-4 sm:py-5 text-center">
                      <button onClick={() => handleViewAbsen(s.nim, s.nama)}
                        className="inline-flex items-center gap-1 sm:gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 bg-white hover:bg-emerald-600 text-emerald-700 hover:text-white border border-emerald-200 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold transition-all shadow-sm whitespace-nowrap">
                        <History size={12} className="sm:w-[14px] sm:h-[14px]" /> Cek
                      </button>
                    </td>
                    <td className="px-4 sm:px-6 py-4 sm:py-5 text-center font-mono font-bold text-xs sm:text-base text-emerald-700">
                      {s.total_kepling ?? '—'}
                    </td>
                    <td className="px-4 sm:px-6 py-4 sm:py-5 text-center font-mono font-bold text-xs sm:text-base text-blue-600">
                      {s.total_keluarga ?? '—'}
                    </td>
                    <td className="px-4 sm:px-6 py-4 sm:py-5 text-center font-mono font-bold text-xs sm:text-base text-purple-600">
                      {s.total_sosialisasi ?? '—'}
                    </td>
                    <td className="px-4 sm:px-6 py-4 sm:py-5 text-center">
                      {s.driveLink ? (
                        <a href={s.driveLink.startsWith('http') ? s.driveLink : `https://${s.driveLink}`} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 sm:gap-1.5 text-emerald-600 hover:text-white hover:bg-emerald-600 bg-emerald-50 border border-emerald-200 font-bold px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[10px] sm:text-xs transition-colors whitespace-nowrap">
                          <ExternalLink size={12} className="sm:w-[14px] sm:h-[14px]" /> Buka
                        </a>
                      ) : <span className="text-slate-300 text-[10px] sm:text-xs font-bold">—</span>}
                    </td>
                    
                    {/* KOLOM AKSI (KHUSUS ADMIN) - GANTI MENTOR & HAPUS */}
                    {userRole === 'admin' && (
                      <td className="px-4 sm:px-6 py-4 sm:py-5 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => openEditMentorModal(s)} title="Ganti Mentor" className="p-1.5 sm:p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg sm:rounded-xl transition-colors">
                            <Pencil size={16} className="sm:w-[18px] sm:h-[18px]" />
                          </button>
                          <button onClick={() => handleDeleteStudent(s.nim, s.nama)} title="Hapus Mahasiswa" className="p-1.5 sm:p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg sm:rounded-xl transition-colors">
                            <Trash2 size={16} className="sm:w-[18px] sm:h-[18px]" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ─── PAGINATION (RESPONSIF) ─── */}
          <div className="px-4 sm:px-6 py-4 border-t border-emerald-50 flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4 bg-white text-xs sm:text-sm text-emerald-700/60 font-medium">
            <span>
              Menampilkan <span className="font-bold text-emerald-900">{filteredStudents.length > 0 ? indexOfFirstItem + 1 : 0}–{Math.min(indexOfLastItem, filteredStudents.length)}</span> dari <span className="font-bold text-emerald-900">{filteredStudents.length}</span> data
            </span>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1}
                className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl font-bold border border-emerald-100 disabled:opacity-40 disabled:bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 transition-all active:scale-95">
                Mundur
              </button>
              <div className="w-7 sm:w-9 h-7 sm:h-9 flex items-center justify-center rounded-lg sm:rounded-xl bg-emerald-600 text-white font-bold">
                {currentPage}
              </div>
              <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages || totalPages === 0}
                className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl font-bold border border-emerald-100 disabled:opacity-40 disabled:bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 transition-all active:scale-95">
                Lanjut
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}