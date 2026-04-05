import { useState, useEffect, useCallback } from "react";
import { Download, Search, ChevronRight, ChevronDown, ChevronUp, ExternalLink, Filter } from "lucide-react";
import logo from "../image/bpjstk.png";
import * as XLSX from "xlsx";

interface Student {
  id: number;
  nama: string;
  nim: string;
  nama_mentor?: string;
  total_hadir: number;
  total_kepling: number;
  total_keluarga: number;
  total_sosialisasi: number;
  poin_administrasi: number;
  link_drive?: string;
  driveLink?: string;
  attitude: number | "";
  digitalisasi: number | "";
}

type FilterStatus = "semua" | "belum_dinilai" | "sudah_dinilai";

const FILTER_LABELS: Record<FilterStatus, string> = {
  semua:         "Semua status",
  belum_dinilai: "Belum dinilai",
  sudah_dinilai: "Sudah dinilai",
};

function hitungPoin(s: Student) {
  const seminar      = Math.min((s.total_hadir      ?? 0) * 2,   10);
  const kepling      = Math.min(Math.floor((s.total_kepling    ?? 0) * 0.23), 16);
  const keluarga     = Math.min((s.total_keluarga   ?? 0) * 0.4,  4);
  const sosialisasi  = (s.total_sosialisasi ?? 0) > 0 ? 30 : 0;
  const administrasi = s.poin_administrasi ?? 0;
  const attitude     = Math.min(Number(s.attitude)     || 0, 10);
  const digitalisasi = Math.min(Number(s.digitalisasi) || 0, 20);
  const aktivitas    = seminar + kepling + keluarga + sosialisasi + administrasi;
  return { seminar, kepling, keluarga, sosialisasi, administrasi, attitude, digitalisasi, aktivitas, total: aktivitas + attitude + digitalisasi };
}

function normalize(raw: Record<string, unknown>): Student {
  return {
    id:                Number(raw.id),
    nama:              String(raw.nama ?? ""),
    nim:               String(raw.nim ?? ""),
    nama_mentor:       raw.nama_mentor ? String(raw.nama_mentor) : undefined,
    total_hadir:       Number(raw.total_hadir       ?? 0),
    total_kepling:     Number(raw.total_kepling      ?? 0),
    total_keluarga:    Number(raw.total_keluarga     ?? 0),
    total_sosialisasi: Number(raw.total_sosialisasi  ?? 0),
    poin_administrasi: Number(raw.poin_administrasi  ?? 0),
    link_drive:        String(raw.driveLink ?? raw.link_drive ?? ""),
    driveLink:         String(raw.driveLink ?? raw.link_drive ?? ""),
    attitude:          raw.attitude === "" || raw.attitude === null || raw.attitude === undefined
                         ? "" : Number(raw.attitude),
    digitalisasi:      raw.digitalisasi === "" || raw.digitalisasi === null || raw.digitalisasi === undefined
                         ? "" : Number(raw.digitalisasi),
  };
}

function initials(nama: string) {
  return nama.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();
}

function NilaiText({ val }: { val: number }) {
  const cls = val >= 80 ? "text-emerald-600" : val >= 60 ? "text-amber-600" : "text-red-500";
  return <span className={`font-mono font-bold text-base ${cls}`}>{val}</span>;
}

function NumberInput({ value, max, onChange, onBlur }: {
  value: number | "";
  max: number;
  onChange: (v: number | "") => void;
  onBlur?: () => void;
}) {
  return (
    <input
      type="number" min={0} max={max} value={value} placeholder="—"
      onChange={e => {
        const v = e.target.value === "" ? "" : Math.min(max, Math.max(0, Number(e.target.value)));
        onChange(v);
      }}
      onBlur={onBlur}
      className="w-12 text-center text-sm font-mono font-bold rounded-lg px-1 py-1.5
        border border-slate-200 bg-white text-slate-800
        focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all placeholder:text-slate-300"
    />
  );
}

// ── Popup konfirmasi — bottom sheet style ──
function ConfirmModal({ open, mode, nama, onConfirm, onCancel }: {
  open: boolean;
  mode: "verifikasi" | "batalkan";
  nama: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;
  const isVerif  = mode === "verifikasi";
  const accent   = isVerif ? "bg-emerald-500" : "bg-red-500";
  const handle   = isVerif ? "bg-emerald-200" : "bg-red-200";
  const btnMain  = isVerif
    ? "bg-emerald-600 hover:bg-emerald-700 text-white"
    : "bg-red-500 hover:bg-red-600 text-white";
  const title    = isVerif ? "Verifikasi laporan?" : "Batalkan verifikasi?";
  const message  = isVerif
    ? `Poin administrasi +10 untuk ${nama}.`
    : `Poin administrasi ${nama} akan kembali ke 0.`;
  const label    = isVerif ? "Verifikasi" : "Batalkan verifikasi";

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      style={{ background: "rgba(0,0,0,0.4)" }}
      onClick={onCancel}>
      <div
        className="bg-white w-full sm:w-80 sm:rounded-2xl rounded-t-2xl overflow-hidden shadow-xl"
        onClick={e => e.stopPropagation()}>
        <div className={`h-1 w-full ${accent}`} />
        <div className="pt-3 pb-1 flex justify-center">
          <div className={`w-8 h-1 rounded-full ${handle}`} />
        </div>
        <div className="px-6 pt-3 pb-6">
          <p className="text-base font-bold text-slate-900 text-center mb-1">{title}</p>
          <p className="text-sm text-slate-400 text-center mb-6 leading-relaxed">{message}</p>
          <div className="flex flex-col gap-2">
            <button onClick={onConfirm}
              className={`w-full py-3 rounded-xl text-sm font-bold transition-all ${btnMain}`}>
              {label}
            </button>
            <button onClick={onCancel}
              className="w-full py-3 rounded-xl text-sm font-medium text-slate-500 hover:bg-slate-50 transition-all">
              Batal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const PAGE_SIZE = 5;

export default function MentorRekap() {
  const [students, setStudents]       = useState<Student[]>([]);
  const [search, setSearch]           = useState("");
  const [filter, setFilter]           = useState<FilterStatus>("semua");
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(""); // ✅ BARU: tampilkan error jika fetch gagal
  const [mentorName, setMentorName]   = useState("");
  const [mentorId, setMentorId]       = useState<number | null>(null);
  const [userRole, setUserRole]       = useState("mentor");
  const [verifyingId, setVerifyingId] = useState<number | null>(null);
  const [expandedId, setExpandedId]   = useState<number | null>(null);
  const [page, setPage]               = useState(1);
  const [modal, setModal]             = useState<{
    open: boolean;
    student: Student | null;
    mode: "verifikasi" | "batalkan";
  }>({ open: false, student: null, mode: "verifikasi" });

  const fetchStudents = useCallback(() => {
    const raw = localStorage.getItem("mentor_data");
    if (!raw) { setLoading(false); return; }
    let mentor: { id: number; nama?: string; role?: string };
    try { mentor = JSON.parse(raw); } catch { setLoading(false); return; }

    setMentorName(mentor.nama?.split(" ")[0] ?? "");
    setMentorId(mentor.id);
    setUserRole(mentor.role ?? "mentor");
    setLoading(true);
    setError("");

    // ✅ FIX UTAMA: Hapus "/api-penilaian/" dari URL — path duplikat menyebabkan 404
    // SEBELUM (SALAH): https://api-penilaian.vercel.app/api-penilaian/get_mahasiswa_by_mentor.php
    // SESUDAH (BENAR): https://api-penilaian.vercel.app/get_mahasiswa_by_mentor.php
    fetch(`https://api-penilaian.vercel.app/get_mahasiswa_by_mentor.php?mentor_id=${mentor.id}&rekap=1`)
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}: ${r.statusText}`);
        return r.json();
      })
      .then(d => {
        if (d.status === "success") {
          setStudents((d.data ?? []).map(normalize));
        } else {
          setError("Gagal memuat data: " + (d.message || "Unknown error"));
          console.error("API error:", d.message);
        }
      })
      .catch(err => {
        setError("Gagal menghubungi server. Periksa koneksi atau coba refresh.");
        console.error("Fetch error:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  const handleBlurSave = async (s: Student) => {
    if (!mentorId) return;
    const attVal  = s.attitude  === "" || s.attitude  === 0 ? null : Number(s.attitude);
    const digiVal = s.digitalisasi === "" || s.digitalisasi === 0 ? null : Number(s.digitalisasi);
    try {
      await fetch("https://api-penilaian.vercel.app/simpan_nilai.php", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nim:          s.nim,
          attitude:     attVal,
          digitalisasi: digiVal,
          mentor_id:    mentorId,
        }),
      });
    } catch { /* silent */ }
  };

  const updateScore = (id: number, field: "attitude" | "digitalisasi", value: number | "") => {
    setStudents(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const handleVerifikasi      = (s: Student) => setModal({ open: true, student: s, mode: "verifikasi" });
  const handleResetVerifikasi = (s: Student) => setModal({ open: true, student: s, mode: "batalkan" });

  const handleModalConfirm = async () => {
    const s = modal.student;
    if (!s || !mentorId) { setModal(m => ({ ...m, open: false })); return; }
    setModal(m => ({ ...m, open: false }));

    if (modal.mode === "verifikasi") {
      setVerifyingId(s.id);
      try {
        const r = await fetch("https://api-penilaian.vercel.app/verifikasi_administrasi.php", {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nim: s.nim, mentor_id: mentorId }),
        });
        const d = await r.json();
        if (d.status === "success") {
          setStudents(prev => prev.map(x => x.id === s.id ? { ...x, poin_administrasi: 10 } : x));
        }
      } catch (err) {
        console.error("Verifikasi error:", err);
      } finally { setVerifyingId(null); }

    } else {
      try {
        const r = await fetch("https://api-penilaian.vercel.app/verifikasi_administrasi.php", {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nim: s.nim, mentor_id: mentorId, action: "reset" }),
        });
        const d = await r.json();
        if (d.status === "success") {
          setStudents(prev => prev.map(x => x.id === s.id ? { ...x, poin_administrasi: 0 } : x));
        }
      } catch (err) {
        console.error("Reset error:", err);
      }
    }
  };

  const handleExport = () => {
    const data = filtered.map(s => {
      const p = hitungPoin(s);
      return {
        "NIM":                 s.nim,
        "Nama":                s.nama,
        "Mentor":              s.nama_mentor ?? "-",
        "Hadir Seminar":       s.total_hadir,
        "BPU Kepling (orang)": s.total_kepling,
        "BPU Keluarga (orang)":s.total_keluarga,
        "Sosialisasi (kali)":  s.total_sosialisasi,
        "Poin Seminar":        p.seminar,
        "Poin Kepling":        p.kepling,
        "Poin Keluarga":       p.keluarga,
        "Poin Sosialisasi":    p.sosialisasi,
        "Poin Administrasi":   p.administrasi,
        "Attitude (/10)":      p.attitude,
        "Digitalisasi (/20)":  p.digitalisasi,
        "Nilai Akhir":         p.total,
      };
    });
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Rekap Nilai");
    XLSX.writeFile(wb, `Penilaian_${mentorName}.xlsx`);
  };

  const totalMhs       = students.length;
  const sudahDinilaiN  = students.filter(s =>
    s.attitude !== "" && s.attitude !== 0 && s.digitalisasi !== "" && s.digitalisasi !== 0 && s.poin_administrasi >= 10
  ).length;
  const belumDinilaiN  = totalMhs - sudahDinilaiN;
  const terverifikasiN = students.filter(s => s.poin_administrasi >= 10).length;

  const filtered = students.filter(s => {
    const matchSearch = s.nama.toLowerCase().includes(search.toLowerCase()) || s.nim.includes(search);
    const dinilai = s.attitude !== "" && s.attitude !== 0 && s.digitalisasi !== "" && s.digitalisasi !== 0 && s.poin_administrasi >= 10;
    if (filter === "belum_dinilai" && dinilai)  return false;
    if (filter === "sudah_dinilai" && !dinilai) return false;
    return matchSearch;
  });

  const totalPages  = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated   = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const goPage      = (p: number) => { setPage(p); setExpandedId(null); };

  return (
    <div className="flex flex-col min-h-full bg-slate-50">

      <ConfirmModal
        open={modal.open}
        mode={modal.mode}
        nama={modal.student?.nama ?? ""}
        onConfirm={handleModalConfirm}
        onCancel={() => setModal(m => ({ ...m, open: false }))}
      />

      <header className="h-16 bg-white border-b border-emerald-100 flex items-center justify-between lg:justify-end px-6 lg:px-8 sticky top-0 z-30 shrink-0 pl-16 lg:pl-8 shadow-sm">
        <div className="flex lg:hidden items-center h-full">
          <img src={logo} alt="BPJS TK" className="h-10 w-auto object-contain" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-emerald-700/70 hidden sm:inline">Mentor Portal</span>
          <ChevronRight size={16} className="text-emerald-200 hidden sm:inline" />
          <span className="text-sm font-bold text-emerald-900 hidden sm:inline">Penilaian</span>
        </div>
      </header>

      <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto w-full space-y-4 sm:space-y-5 pb-24">

        <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900">Penilaian</h1>

        {/* ✅ BARU: Error state yang informatif */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
            <div className="w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">!</div>
            <div>
              <p className="text-sm font-bold text-red-800">{error}</p>
              <button onClick={fetchStudents} className="text-xs text-red-600 underline mt-1">Coba lagi</button>
            </div>
          </div>
        )}

        {/* Stat cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total mahasiswa",      val: totalMhs,       color: "text-slate-800" },
            { label: "Sudah dinilai",         val: sudahDinilaiN,  color: "text-emerald-600" },
            { label: "Belum dinilai",         val: belumDinilaiN,  color: "text-amber-600" },
            { label: "Laporan terverifikasi", val: terverifikasiN, color: "text-emerald-600" },
          ].map(item => (
            <div key={item.label} className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4">
              <div className={`font-mono font-black text-2xl ${item.color}`}>{item.val}</div>
              <div className="text-xs text-slate-400 mt-1">{item.label}</div>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm px-5 py-4">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-40 max-w-xs">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text" placeholder="Nama atau NIM"
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                className="w-full pl-9 pr-4 py-2.5 text-sm text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all"
              />
            </div>
            <div className="relative">
              <Filter size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <select
                value={filter}
                onChange={e => { setFilter(e.target.value as FilterStatus); setPage(1); }}
                className="pl-8 pr-8 py-2.5 text-sm font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 appearance-none cursor-pointer"
              >
                {(Object.keys(FILTER_LABELS) as FilterStatus[]).map(k => (
                  <option key={k} value={k}>{FILTER_LABELS[k]}</option>
                ))}
              </select>
              <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
            <button onClick={handleExport}
              className="ml-auto flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl transition-all shadow-sm shrink-0">
              <Download size={14} /> Export Excel
            </button>
          </div>
        </div>

        {/* Column header */}
        {!loading && filtered.length > 0 && (
          <div className="hidden sm:flex items-center gap-3 px-5 select-none">
            <div className="flex-1 pl-12 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mahasiswa</div>
            <div className="w-14 text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">Aktivitas</div>
            <div className="w-12 text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">Attitude</div>
            <div className="w-20 text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">Digitalisasi</div>
            <div className="w-36 text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">Laporan</div>
            <div className="w-12 text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nilai</div>
            <div className="w-7" />
          </div>
        )}

        {/* Rows */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-slate-500 font-medium">Memuat data penilaian...</p>
          </div>
        ) : !error && filtered.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
            <p className="text-slate-400 text-sm font-medium">
              {students.length === 0
                ? "Belum ada mahasiswa yang terdaftar di bimbingan Anda."
                : "Tidak ada data yang cocok dengan filter."}
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              {paginated.map(s => {
                const p              = hitungPoin(s);
                const isVerifying    = verifyingId === s.id;
                const isVerified     = s.poin_administrasi >= 10;
                const isExpanded     = expandedId === s.id;
                const isDinilai = s.attitude !== "" && s.attitude !== 0 && s.digitalisasi !== "" && s.digitalisasi !== 0 && s.poin_administrasi >= 10;
                const aktColor       = p.aktivitas >= 50 ? "text-emerald-600" : p.aktivitas >= 30 ? "text-amber-600" : "text-red-500";

                return (
                  <div key={s.id}
                    className={`rounded-2xl border shadow-sm overflow-hidden transition-all ${
                      isExpanded ? "border-emerald-400 bg-emerald-50/50"
                      : isDinilai ? "bg-emerald-50 border-emerald-200"
                      : "bg-white border-slate-200 hover:border-slate-300"
                    }`}>

                    {/* Desktop row */}
                    <div className="hidden sm:flex items-center gap-3 px-5 py-3.5">

                      <button
                        className="flex items-center gap-3 flex-1 min-w-0 text-left"
                        onClick={() => setExpandedId(isExpanded ? null : s.id)}>
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                          isExpanded ? "bg-emerald-100 text-emerald-700"
                          : isDinilai ? "bg-emerald-50 text-emerald-600"
                          : "bg-slate-100 text-slate-600"
                        }`}>
                          {initials(s.nama)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-slate-900 truncate">{s.nama}</p>
                          <p className="text-xs font-mono text-slate-400">{s.nim}</p>
                        </div>
                      </button>

                      <div className="w-14 text-center">
                        <span className={`font-mono font-bold text-base ${aktColor}`}>{p.aktivitas}</span>
                      </div>

                      <div className="w-12 flex justify-center">
                        {userRole !== "admin" ? (
                          <NumberInput value={s.attitude} max={10}
                            onChange={v => updateScore(s.id, "attitude", v)}
                            onBlur={() => handleBlurSave(s)} />
                        ) : (
                          <span className="font-mono font-bold text-slate-700">{s.attitude === "" ? "—" : s.attitude}</span>
                        )}
                      </div>

                      <div className="w-20 flex justify-center">
                        {userRole !== "admin" ? (
                          <NumberInput value={s.digitalisasi} max={20}
                            onChange={v => updateScore(s.id, "digitalisasi", v)}
                            onBlur={() => handleBlurSave(s)} />
                        ) : (
                          <span className="font-mono font-bold text-slate-700">{s.digitalisasi === "" ? "—" : s.digitalisasi}</span>
                        )}
                      </div>

                      <div className="w-36 flex flex-col items-center gap-1">
                        {isVerified ? (
                          <button
                            onClick={() => handleResetVerifikasi(s)}
                            className="text-xs font-bold px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-all">
                            ✓ Terverifikasi
                          </button>
                        ) : (
                          <button
                            onClick={() => handleVerifikasi(s)}
                            disabled={isVerifying}
                            className="text-xs font-bold px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition-all disabled:opacity-50 whitespace-nowrap">
                            {isVerifying
                              ? <span className="w-3 h-3 border-2 border-amber-500 border-t-transparent rounded-full animate-spin inline-block" />
                              : "Verifikasi Laporan"
                            }
                          </button>
                        )}
                      </div>

                      <div className="w-12 text-center">
                        <NilaiText val={p.total} />
                      </div>

                      <button
                        onClick={() => setExpandedId(isExpanded ? null : s.id)}
                        className={`w-7 h-7 flex items-center justify-center rounded-lg transition-all ${
                          isExpanded ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                        }`}>
                        {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                      </button>
                    </div>

                    {/* Mobile row */}
                    <div className="sm:hidden px-4 py-3">
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <button
                          className="flex items-center gap-2.5 flex-1 min-w-0 text-left"
                          onClick={() => setExpandedId(isExpanded ? null : s.id)}
                        >
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                            isExpanded ? "bg-emerald-100 text-emerald-700"
                            : isDinilai ? "bg-emerald-50 text-emerald-600"
                            : "bg-slate-100 text-slate-600"
                          }`}>
                            {initials(s.nama)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-slate-900 truncate">{s.nama}</p>
                            <p className="text-xs font-mono text-slate-400">{s.nim}</p>
                          </div>
                        </button>
                        <div className="flex items-center gap-2 shrink-0">
                          <NilaiText val={p.total} />
                          <button
                            onClick={() => setExpandedId(isExpanded ? null : s.id)}
                            className={`w-7 h-7 flex items-center justify-center rounded-lg transition-all ${
                              isExpanded ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 text-xs bg-slate-50 border border-slate-200 rounded-xl p-3">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-500">Aktivitas</span>
                          <span className={`font-mono font-bold ${aktColor}`}>{p.aktivitas}</span>
                        </div>
                        {userRole !== "admin" && (
                          <div className="flex justify-between items-center">
                            <span className="text-slate-500">Attitude</span>
                            <NumberInput value={s.attitude} max={10}
                              onChange={v => updateScore(s.id, "attitude", v)}
                              onBlur={() => handleBlurSave(s)} />
                          </div>
                        )}
                        {userRole !== "admin" && (
                          <div className="flex justify-between items-center">
                            <span className="text-slate-500">Digitalisasi</span>
                            <NumberInput value={s.digitalisasi} max={20}
                              onChange={v => updateScore(s.id, "digitalisasi", v)}
                              onBlur={() => handleBlurSave(s)} />
                          </div>
                        )}
                      </div>

                      <div className="mt-3">
                        {isVerified ? (
                          <button onClick={() => handleResetVerifikasi(s)}
                            className="w-full text-xs font-bold py-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
                            ✓ Terverifikasi (Tap untuk batal)
                          </button>
                        ) : (
                          <button onClick={() => handleVerifikasi(s)} disabled={isVerifying}
                            className="w-full text-xs font-bold py-2 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 disabled:opacity-50">
                            {isVerifying ? "Memproses..." : "Verifikasi Laporan"}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Expanded detail */}
                    {isExpanded && (
                      <div className="border-t border-slate-100 px-4 sm:px-5 py-4">
                        <div className="grid grid-cols-2 sm:flex sm:items-center gap-3 sm:gap-0 mb-3 sm:mb-0">
                          {[
                            { label: "Kehadiran",    val: s.total_hadir },
                            { label: "BPU Kepling",  val: s.total_kepling },
                            { label: "BPU Keluarga", val: s.total_keluarga },
                            { label: "Sosialisasi",  val: s.total_sosialisasi },
                          ].map((item, i) => (
                            <div key={item.label} className="flex sm:items-center sm:flex-1">
                              <div className="flex-1">
                                <p className="text-xs text-slate-400">{item.label}</p>
                                <p className="text-sm sm:text-base font-bold font-mono text-slate-800 mt-0.5">{item.val}</p>
                              </div>
                              {i < 3 && <div className="hidden sm:block w-px bg-slate-200 h-8 mx-4 shrink-0" />}
                            </div>
                          ))}
                        </div>
                        <div className="sm:border-l sm:border-slate-200 sm:pl-5 sm:ml-5 mt-3 sm:mt-0">
                          {(s.link_drive || s.driveLink) ? (
                            <a href={s.link_drive || s.driveLink} target="_blank" rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-700 transition-all whitespace-nowrap">
                              <ExternalLink size={11} className="shrink-0" />
                              Lihat Google Drive
                            </a>
                          ) : (
                            <span className="text-xs text-slate-400 italic">Belum ada link Drive</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-slate-400">
                  {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filtered.length)} dari {filtered.length} mahasiswa
                </span>
                <div className="flex items-center gap-1">
                  <button onClick={() => goPage(currentPage - 1)} disabled={currentPage === 1}
                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 text-sm disabled:opacity-30 hover:bg-slate-50">
                    ←
                  </button>
                  <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-emerald-600 text-white text-sm font-bold">
                    {currentPage}
                  </div>
                  <button onClick={() => goPage(currentPage + 1)} disabled={currentPage === totalPages}
                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 text-sm disabled:opacity-30 hover:bg-slate-50">
                    →
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}