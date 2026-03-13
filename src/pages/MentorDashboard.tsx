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

interface Student {
  id: number;
  nama: string;
  nim: string;
  status: "sudah" | "belum";
  totalPoin: number;
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

const RINCIAN_KEYS: { label: string; key: keyof Student["rincian"] }[] = [
  { label: "Kehadiran", key: "kehadiran" },
  { label: "BPU Kepling", key: "bpuKepling" },
  { label: "BPU Keluarga", key: "bpuKeluarga" },
  { label: "Sosialisasi", key: "sosialisasi" },
  { label: "Administrasi", key: "administrasi" },
];

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
      onClick={(e) => e.stopPropagation()}
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
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  useEffect(() => {
    const mentorDataStr = localStorage.getItem("mentor_data");
    if (!mentorDataStr) {
      navigate("/mentor-login");
      return;
    }
    const mentor = JSON.parse(mentorDataStr);
    setMentorName(mentor.nama.split(" ")[0]);

    fetch(`http://localhost/api-penilaian/get_mahasiswa_by_mentor.php?mentor_id=${mentor.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success") setStudents(data.data);
      })
      .catch((err) => console.error("Error fetching data:", err));
  }, [navigate]);

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

  const toggleRow = (id: number) =>
    setExpandedRow((prev) => (prev === id ? null : id));

  return (
    <div className="flex flex-col min-h-full bg-emerald-50/20">

      {/* ── NAVBAR ATAS — identik dengan Dashboard.tsx mahasiswa ── */}
      <header className="h-16 bg-white border-b border-emerald-100 flex items-center justify-between lg:justify-end px-6 lg:px-8 sticky top-0 z-30 shrink-0 lg:pl-8 pl-16 shadow-sm">
        
        {/* Logo SATU — hanya di mobile (lg:hidden), sama persis dengan Dashboard mahasiswa */}
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

        {/* Breadcrumb — kanan navbar, hidden di xs */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-emerald-700/70 hidden sm:inline">Mentor Portal</span>
          <ChevronRight size={16} className="text-emerald-200 hidden sm:inline" />
          <span className="text-sm font-bold text-emerald-900 hidden sm:inline">Overview</span>
        </div>
      </header>

      {/* ── KONTEN UTAMA ── */}
      <div className="p-6 lg:p-8 space-y-8 max-w-7xl mx-auto w-full">

        {/* Greeting */}
        <div>
          <h1 className="text-2xl lg:text-3xl font-black text-emerald-950 capitalize">
            Welcome back, {mentorName.toLowerCase()}!
          </h1>
          <p className="text-emerald-700/60 mt-1 text-sm lg:text-base">
            Here's the latest update on your internship participants today.
          </p>
        </div>

        {/* Stat Cards */}
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

          {/* ── Filter Bar ── */}
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

              <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-50 transition-colors shrink-0 whitespace-nowrap">
                <Download size={14} />
                Export Excel
              </button>
            </div>
          </div>

          {/* ── Tabel scroll horizontal ── */}
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left min-w-[700px]">
              <thead>
                <tr className="bg-emerald-50/50 border-b border-emerald-100">
                  <th className="px-6 py-4 text-xs font-bold uppercase text-emerald-700/70 whitespace-nowrap">Mahasiswa</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-emerald-700/70 whitespace-nowrap">Status</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-emerald-700/70 text-center whitespace-nowrap">Poin</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-emerald-700/70 text-center whitespace-nowrap">Attitude</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-emerald-700/70 text-center whitespace-nowrap">Digitalisasi</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-emerald-700/70 text-center whitespace-nowrap">Drive</th>
                  <th className="px-6 py-4 w-8" />
                </tr>
              </thead>

              <tbody className="divide-y divide-emerald-50">
                {filtered.map((s) => (
                  <React.Fragment key={s.id}>
                    <tr
                      onClick={() => toggleRow(s.id)}
                      className={`transition-colors cursor-pointer ${
                        expandedRow === s.id ? "bg-emerald-50/40" : "hover:bg-emerald-50/30"
                      }`}
                    >
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
                        <span className="font-mono font-bold text-emerald-600">
                          {s.totalPoin > 0 ? s.totalPoin : <span className="text-emerald-200">—</span>}
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
                            onClick={(e) => e.stopPropagation()}
                            className="text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1 font-medium underline underline-offset-4 decoration-emerald-200 text-sm whitespace-nowrap"
                          >
                            <ExternalLink size={13} /> Drive
                          </a>
                        ) : (
                          <span className="text-emerald-200 text-sm">—</span>
                        )}
                      </td>

                      <td className="px-4 py-4">
                        <ChevronDown
                          size={15}
                          className={`text-emerald-300 transition-transform duration-200 ${
                            expandedRow === s.id ? "rotate-180 text-emerald-500" : ""
                          }`}
                        />
                      </td>
                    </tr>

                    {expandedRow === s.id && (
                      <tr className="bg-emerald-50/20">
                        <td colSpan={7} className="px-8 py-4 border-b border-emerald-50">
                          <p className="text-xs font-bold uppercase text-emerald-700/50 mb-3">Detail Aktivitas</p>
                          <div className="flex items-start gap-8 overflow-x-auto pb-1">
                            {RINCIAN_KEYS.map(({ label, key }) => (
                              <div key={key} className="shrink-0">
                                <p className="text-xs text-emerald-700/50 font-medium mb-1 whitespace-nowrap">{label}</p>
                                <p className={`text-xl font-black font-mono ${s.rincian[key] > 0 ? "text-emerald-900" : "text-emerald-200"}`}>
                                  {s.rincian[key]}
                                </p>
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
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

          {/* Footer tabel */}
          <div className="px-6 py-4 border-t border-emerald-100 text-sm text-emerald-700/60 flex justify-between items-center bg-emerald-50/10">
            <span>{filtered.length} dari {students.length} mahasiswa · {selectedWeek}</span>
          </div>
        </div>
      </div>
    </div>
  );
}