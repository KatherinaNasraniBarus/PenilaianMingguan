import React, { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronRight,
  ChevronDown,
  Download,
  ExternalLink,
  Users,
  CheckCircle2,
  Clock,
} from "lucide-react";
import logo from "../image/logobpjss.png";
// IMPORT LIBRARY EXCEL BARU
import * as XLSX from 'xlsx';

interface Student {
  id: number;
  nama: string;
  nim: string;
  status: "sudah" | "belum";
  poinMingguan: number;
  poinKumulatif: number;
  attitude: number | "";
  digitalisasi: number | "";
  driveLink: string;
  rincian: {
    kehadiran: number;
    bpuKepling: number;
    bpuKeluarga: number;
    sosialisasi: number;
    administrasi: number;
  };
}

const WEEKS = ["Minggu 1", "Minggu 2", "Minggu 3", "Minggu 4", "Minggu 5", "Minggu 6"];

function ScoreInput({
  value,
  max,
  onChange,
}: {
  value: number | "";
  max: number;
  onChange: (v: number | "") => void;
}) {
  return (
    <input
      type="number"
      min={0}
      max={max}
      value={value}
      onChange={(e) => {
        const v =
          e.target.value === ""
            ? ""
            : Math.min(max, Math.max(0, Number(e.target.value)));
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
  const [selectedWeek, setSelectedWeek] = useState("Minggu 1");
  const [statusFilter, setStatusFilter] = useState<"semua" | "sudah" | "belum">("semua");

  useEffect(() => {
    const mentorDataStr = localStorage.getItem("mentor_data");
    if (!mentorDataStr) {
      navigate("/mentor-login");
      return;
    }
    const mentor = JSON.parse(mentorDataStr);
    setMentorName(mentor.nama.split(" ")[0]);

    fetch(`http://localhost/api-penilaian/get_mahasiswa_by_mentor.php?mentor_id=${mentor.id}&minggu=${encodeURIComponent(selectedWeek)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success") setStudents(data.data);
      })
      .catch((err) => console.error("Error fetching data:", err));
      
  }, [navigate, selectedWeek]); 

  const sudahCount = students.filter((s) => s.status === "sudah").length;
  const belumCount = students.filter((s) => s.status === "belum").length;
  const filtered = students.filter(
    (s) => statusFilter === "semua" || s.status === statusFilter
  );

  const updateScore = useCallback(
    (id: number, field: "attitude" | "digitalisasi", value: number | "") => {
      setStudents((prev) =>
        prev.map((s) => (s.id === id ? { ...s, [field]: value } : s))
      );
    },
    []
  );

  // FUNGSI BARU UNTUK EXPORT KE EXCEL
  const handleExportExcel = () => {
    // 1. Siapkan data yang akan dimasukkan ke Excel
    const dataToExport = filtered.map((s) => ({
      "NIM": s.nim,
      "Nama Mahasiswa": s.nama,
      "Status Laporan": s.status === "sudah" ? "Sudah Lapor" : "Belum Lapor",
      "Poin Aktivitas": s.poinMingguan,
      "Nilai Attitude": s.attitude === "" ? 0 : s.attitude,
      "Nilai Digitalisasi": s.digitalisasi === "" ? 0 : s.digitalisasi,
      "TOTAL POIN AKHIR": s.poinKumulatif + (Number(s.attitude) || 0) + (Number(s.digitalisasi) || 0),
      "Link Evidence": s.driveLink || "Tidak ada"
    }));

    // 2. Buat sheet dan workbook Excel
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    
    // 3. Tambahkan sheet ke dalam workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, `Rekap ${selectedWeek}`);

    // 4. Unduh file otomatis
    XLSX.writeFile(workbook, `Rekap_Nilai_Magang_${mentorName}_${selectedWeek}.xlsx`);
  };

  return (
    <div className="flex flex-col min-h-full bg-emerald-50/20">

      {/* ── NAVBAR ATAS ── */}
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
          <span className="text-sm font-medium text-emerald-700/70 hidden sm:inline">Mentor Portal</span>
          <ChevronRight size={16} className="text-emerald-200 hidden sm:inline" />
          <span className="text-sm font-bold text-emerald-900 hidden sm:inline">Overview</span>
        </div>
      </header>

      {/* ── KONTEN UTAMA ── */}
      <div className="p-6 lg:p-8 space-y-8 max-w-7xl mx-auto w-full">

        <div>
          <h1 className="text-2xl lg:text-3xl font-black text-emerald-950 capitalize">
            Welcome back, {mentorName.toLowerCase()}!
          </h1>
          <p className="text-emerald-700/60 mt-1 text-sm lg:text-base">
            Here's the latest update on your internship participants today.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl border border-emerald-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                <Users size={24} />
              </div>
            </div>
            <p className="text-emerald-700/60 text-sm font-medium">Total Mahasiswa</p>
            <h3 className="text-2xl font-black text-emerald-900">{students.length}</h3>
          </div>

          <div className="bg-white p-6 rounded-xl border border-emerald-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                <CheckCircle2 size={24} />
              </div>
            </div>
            <p className="text-emerald-700/60 text-sm font-medium">Sudah Lapor</p>
            <h3 className="text-2xl font-black text-emerald-900">{sudahCount}</h3>
          </div>

          <div className="bg-white p-6 rounded-xl border border-emerald-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-red-50 text-red-500 rounded-lg">
                <Clock size={24} />
              </div>
            </div>
            <p className="text-emerald-700/60 text-sm font-medium">Belum Lapor</p>
            <h3 className="text-2xl font-black text-red-500">{belumCount}</h3>
          </div>
        </div>

        {/* Tabel */}
        <div className="bg-white border border-emerald-100 rounded-xl shadow-sm overflow-hidden">

          <div className="px-4 lg:px-6 py-4 border-b border-emerald-100 bg-emerald-50/10">
            <div className="flex items-center gap-3 overflow-x-auto pb-1">
              <div className="relative shrink-0">
                <select
                  value={selectedWeek}
                  onChange={(e) => setSelectedWeek(e.target.value)}
                  className="appearance-none pl-3 pr-8 py-1.5 text-sm font-semibold text-emerald-800 bg-white border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 cursor-pointer"
                >
                  {WEEKS.map((w) => <option key={w}>{w}</option>)}
                </select>
                <ChevronDown size={13} className="absolute right-2 top-1/2 -translate-y-1/2 text-emerald-400 pointer-events-none" />
              </div>

              <div className="relative shrink-0">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as "semua" | "sudah" | "belum")}
                  className="appearance-none pl-3 pr-8 py-1.5 text-sm font-semibold text-emerald-800 bg-white border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 cursor-pointer"
                >
                  <option value="semua">Semua Status</option>
                  <option value="sudah">Sudah Lapor</option>
                  <option value="belum">Belum Lapor</option>
                </select>
                <ChevronDown size={13} className="absolute right-2 top-1/2 -translate-y-1/2 text-emerald-400 pointer-events-none" />
              </div>

              <div className="flex-1 min-w-0" />

              {/* TOMBOL EXCEL DIHUBUNGKAN KE FUNGSI handleExportExcel */}
              <button 
                onClick={handleExportExcel}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-50 active:scale-95 transition-all shrink-0 whitespace-nowrap"
              >
                <Download size={14} />
                Export Excel
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
                </tr>
              </thead>

              <tbody className="divide-y divide-emerald-50">
                {filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-emerald-50/30 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-emerald-900 whitespace-nowrap">{s.nama}</p>
                      <p className="text-xs text-emerald-700/50 font-mono mt-0.5">{s.nim}</p>
                    </td>

                    <td className="px-6 py-4">
                      {s.status === "sudah" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 whitespace-nowrap">
                          <CheckCircle2 size={11} /> Sudah
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-500 whitespace-nowrap">
                          <Clock size={11} /> Belum
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4 text-center">
                      <span className="font-mono font-medium text-emerald-600">
                        {s.poinMingguan > 0 ? s.poinMingguan : <span className="text-emerald-200">—</span>}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-center">
                      <ScoreInput value={s.attitude} max={10} onChange={(v) => updateScore(s.id, "attitude", v)} />
                    </td>

                    <td className="px-6 py-4 text-center">
                      <ScoreInput value={s.digitalisasi} max={20} onChange={(v) => updateScore(s.id, "digitalisasi", v)} />
                    </td>

                    <td className="px-6 py-4 text-center">
                      {s.driveLink ? (
                        <a
                          href={s.driveLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1 font-medium underline underline-offset-4 decoration-emerald-200 text-sm whitespace-nowrap"
                        >
                          <ExternalLink size={13} /> Drive
                        </a>
                      ) : (
                        <span className="text-emerald-200 text-sm">—</span>
                      )}
                    </td>

                    <td className="px-6 py-4 text-center bg-emerald-50/50 border-l border-emerald-100">
                      <span className="font-mono font-black text-emerald-900 text-lg">
                        {s.poinKumulatif + (Number(s.attitude) || 0) + (Number(s.digitalisasi) || 0)}
                      </span>
                    </td>
                  </tr>
                ))}

                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-16 text-center">
                      <Users size={32} className="mx-auto text-emerald-200 mb-3" />
                      <p className="text-sm text-emerald-700/40 font-medium">
                        {students.length === 0
                          ? "Data mahasiswa belum tersedia"
                          : "Tidak ada mahasiswa yang sesuai filter"}
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-4 border-t border-emerald-100 text-sm text-emerald-700/60 flex justify-between items-center bg-emerald-50/10">
            <span>{filtered.length} dari {students.length} mahasiswa · {selectedWeek}</span>
          </div>
        </div>
      </div>
    </div>
  );
}