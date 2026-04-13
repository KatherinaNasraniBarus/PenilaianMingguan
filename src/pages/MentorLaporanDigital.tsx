import { useState, useEffect } from "react";
import { Laptop, Search, Loader2, User, CalendarDays, FileText, ChevronRight, Filter, Tags, Clock, CheckCircle, AlertCircle, BarChart3 } from "lucide-react";
import logo from "../image/bpjstk.png";

export default function MentorLaporanDigital() {
  const [laporan, setLaporan] = useState<any[]>([]);
  const [formMaster, setFormMaster] = useState<Record<string, { struktur: any[], keterangan: string, deadline: string | null }>>({}); 
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMinggu, setFilterMinggu] = useState("Semua"); 
  const [filterKategori, setFilterKategori] = useState("Semua"); 

  const mentorName = "BOY TOBING"; 

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`https://api-penilaian.vercel.app/get_digitalisasi_mentor.php?mentor=${mentorName}&t=${new Date().getTime()}`).then(r => r.json()),
      fetch(`https://api-penilaian.vercel.app/admin_get_all_forms.php?t=${new Date().getTime()}`).then(r => r.json())
    ])
    .then(([laporanData, formData]) => {
      if (laporanData.status === "success") setLaporan(laporanData.data || []);
      
      if (formData.status === "success") {
        const kamusForm: Record<string, { struktur: any[], keterangan: string, deadline: string | null }> = {};
        
        formData.data.forEach((form: any) => {
          let parsedStruktur = [];
          try {
            let temp = form.struktur_form;
            while (typeof temp === 'string') {
              temp = JSON.parse(temp);
            }
            if (Array.isArray(temp)) {
              parsedStruktur = temp;
            }
          } catch (e) { 
            console.error("Gagal membaca struktur form", e); 
          }

          kamusForm[form.minggu] = {
            struktur: parsedStruktur,
            keterangan: form.keterangan || "Tugas Digitalisasi",
            deadline: form.deadline || null 
          };
        });
        setFormMaster(kamusForm);
      }
    })
    .finally(() => setLoading(false));
  }, []);

  const filteredLaporan = laporan.filter(item => {
    const cocokPencarian = item.nama_mahasiswa.toLowerCase().includes(searchTerm.toLowerCase()) || item.nim.includes(searchTerm);
    const cocokMinggu = filterMinggu === "Semua" || item.minggu === filterMinggu;
    const kategoriItem = formMaster[item.minggu]?.keterangan || "Tugas Digitalisasi";
    const cocokKategori = filterKategori === "Semua" || kategoriItem === filterKategori;
    return cocokPencarian && cocokMinggu && cocokKategori;
  });

  const daftarMinggu = ["Semua", ...Array.from(new Set(Object.keys(formMaster)))];
  const daftarKategori = ["Semua", ...Array.from(new Set(Object.values(formMaster).map(f => f.keterangan)))];

  // 🚀 MENGHITUNG STATISTIK BERDASARKAN FILTER SAAT INI
  let tepatWaktuCount = 0;
  let terlambatCount = 0;

  filteredLaporan.forEach(item => {
    const deadlineString = formMaster[item.minggu]?.deadline;
    if (item.tanggal_submit && deadlineString && deadlineString !== "0000-00-00 00:00:00") {
      const submitDate = new Date(item.tanggal_submit.replace(" ", "T") + "Z");
      const deadlineDate = new Date(deadlineString.replace(" ", "T"));
      if (submitDate > deadlineDate) {
        terlambatCount++;
      } else {
        tepatWaktuCount++;
      }
    } else {
      tepatWaktuCount++; // Jika tidak ada deadline, otomatis tepat waktu
    }
  });

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      <header className="h-16 bg-white/90 backdrop-blur-md border-b border-slate-200 flex items-center justify-between lg:justify-end px-6 lg:px-8 sticky top-0 z-30 shrink-0 lg:pl-8 pl-16 shadow-sm">
        <div className="flex lg:hidden items-center h-full"><img src={logo} alt="BPJS TK" className="h-10 w-auto object-contain" /></div>
        <div className="flex items-center gap-2">
          <span className="text-xs sm:text-sm font-medium text-slate-500 hidden sm:inline">Portal Mentor</span>
          <ChevronRight size={16} className="text-slate-400 hidden sm:inline" />
          <span className="text-xs sm:text-sm font-bold text-slate-800 hidden sm:inline">Cek Digitalisasi</span>
        </div>
      </header>

      <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-5 bg-white p-6 rounded-3xl shadow-sm border border-slate-100 mt-2">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 flex items-center gap-3">
            <div className="p-2.5 bg-blue-600 text-white rounded-2xl"><Laptop size={24} /></div> Laporan Mahasiswa
          </h1>
          <div className="flex flex-col sm:flex-row w-full lg:w-auto gap-3 flex-wrap justify-end">
            <div className="relative w-full sm:w-40 shrink-0">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500" size={18} />
              <select value={filterMinggu} onChange={(e) => setFilterMinggu(e.target.value)} className="w-full pl-10 pr-8 py-3 bg-blue-50/50 border border-blue-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-bold text-blue-900 appearance-none">
                {daftarMinggu.map(minggu => <option key={minggu} value={minggu}>{minggu === "Semua" ? "Semua Tugas" : minggu}</option>)}
              </select>
            </div>
            <div className="relative w-full sm:w-48 shrink-0">
              <Tags className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-500" size={18} />
              <select value={filterKategori} onChange={(e) => setFilterKategori(e.target.value)} className="w-full pl-10 pr-8 py-3 bg-purple-50/50 border border-purple-100 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all text-sm font-bold text-purple-900 appearance-none">
                {daftarKategori.map(kat => <option key={kat} value={kat}>{kat === "Semua" ? "Semua Kategori" : kat}</option>)}
              </select>
            </div>
            <div className="relative w-full sm:w-56 shrink-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input type="text" placeholder="Cari Nama/NIM..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium" />
            </div>
          </div>
        </div>

        {/* 🚀 DASHBOARD MINI STATISTIK (Hanya muncul jika loading selesai) */}
        {!loading && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-4 shadow-sm">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><BarChart3 size={24} /></div>
              <div>
                <p className="text-sm font-bold text-slate-500">Total Ditampilkan</p>
                <h3 className="text-2xl font-black text-slate-800">{filteredLaporan.length} <span className="text-sm font-bold text-slate-400">Laporan</span></h3>
              </div>
            </div>
            <div className="bg-white border border-emerald-100 rounded-2xl p-4 flex items-center gap-4 shadow-sm">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><CheckCircle size={24} /></div>
              <div>
                <p className="text-sm font-bold text-slate-500">Tepat Waktu</p>
                <h3 className="text-2xl font-black text-emerald-600">{tepatWaktuCount} <span className="text-sm font-bold text-emerald-300">Laporan</span></h3>
              </div>
            </div>
            <div className="bg-white border border-red-100 rounded-2xl p-4 flex items-center gap-4 shadow-sm">
              <div className="p-3 bg-red-50 text-red-600 rounded-xl"><AlertCircle size={24} /></div>
              <div>
                <p className="text-sm font-bold text-slate-500">Terlambat</p>
                <h3 className="text-2xl font-black text-red-600">{terlambatCount} <span className="text-sm font-bold text-red-300">Laporan</span></h3>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4"><Loader2 size={40} className="text-blue-500 animate-spin" /></div>
        ) : filteredLaporan.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
            <FileText size={60} className="mx-auto text-slate-300 mb-4" />
            <p className="text-slate-600 font-bold text-lg">Belum ada laporan atau tidak ada data yang cocok dengan filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredLaporan.map((item, index) => {
              let jawabanObj: Record<string, string> = {};
              try { 
                let temp = item.jawaban;
                while (typeof temp === 'string') temp = JSON.parse(temp);
                jawabanObj = temp;
              } catch(e) { console.error("Gagal parse jawaban", e); }

              const strukturMingguIni = formMaster[item.minggu]?.struktur || [];
              const kategoriTugas = formMaster[item.minggu]?.keterangan || "Tugas Digitalisasi";
              const deadlineString = formMaster[item.minggu]?.deadline;

              let tgl = "-";
              let labelStatus = null;

              if (item.tanggal_submit) {
                const submitDate = new Date(item.tanggal_submit.replace(" ", "T") + "Z");
                tgl = submitDate.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).replace(/\./g, ':') + ' WIB';

                if (deadlineString && deadlineString !== "0000-00-00 00:00:00") {
                  const deadlineDate = new Date(deadlineString.replace(" ", "T")); 
                  
                  if (submitDate > deadlineDate) {
                    const selisihMs = submitDate.getTime() - deadlineDate.getTime();
                    const selisihHari = Math.floor(selisihMs / (1000 * 60 * 60 * 24));
                    const selisihJam = Math.floor((selisihMs / (1000 * 60 * 60)) % 24);
                    const selisihMenit = Math.floor((selisihMs / (1000 * 60)) % 60);

                    let teksTelat = "";
                    if (selisihHari > 0) teksTelat = `Terlambat ${selisihHari} Hari`;
                    else if (selisihJam > 0) teksTelat = `Terlambat ${selisihJam} Jam`;
                    else teksTelat = `Terlambat ${selisihMenit} Menit`;

                    labelStatus = (
                      <div className="flex flex-col items-end gap-1">
                        <span className="bg-red-50 border border-red-200 text-red-600 font-bold text-[10px] px-2.5 py-1 rounded-md whitespace-nowrap shadow-sm">⚠️ {teksTelat}</span>
                        <span className="text-[9px] font-bold text-red-400 italic flex items-center gap-1"><Clock size={10}/> {tgl}</span>
                      </div>
                    );
                  } else {
                    labelStatus = (
                      <div className="flex flex-col items-end gap-1">
                        <span className="bg-emerald-50 border border-emerald-200 text-emerald-600 font-bold text-[10px] px-2.5 py-1 rounded-md whitespace-nowrap shadow-sm">✅ Tepat Waktu</span>
                        <span className="text-[9px] font-bold text-emerald-500 italic flex items-center gap-1"><Clock size={10}/> {tgl}</span>
                      </div>
                    );
                  }
                } else {
                  labelStatus = (
                    <div className="flex flex-col items-end gap-1">
                      <span className="bg-slate-50 border border-slate-200 text-slate-500 font-bold text-[10px] px-2.5 py-1 rounded-md whitespace-nowrap shadow-sm">Sudah Terkirim</span>
                      <span className="text-[9px] font-bold text-slate-400 italic flex items-center gap-1"><Clock size={10}/> {tgl}</span>
                    </div>
                  );
                }
              }

              return (
                <div key={item.id || index} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow flex flex-col">
                  <div className="flex justify-between items-start mb-4 border-b border-slate-100 pb-4">
                    <div>
                      <h3 className="font-black text-lg text-slate-800 line-clamp-1">{item.nama_mahasiswa}</h3>
                      <div className="flex items-center gap-1.5 text-slate-500 text-sm font-bold mt-1"><User size={14} /> {item.nim}</div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <span className="bg-blue-100 text-blue-700 font-black text-[10px] px-2.5 py-1 rounded-md uppercase tracking-widest">{item.minggu}</span>
                      <span className="bg-purple-50 border border-purple-100 text-purple-700 font-bold text-[10px] px-2.5 py-1 rounded-md max-w-[100px] truncate">{kategoriTugas}</span>
                    </div>
                  </div>

                  <div className="flex-1 space-y-4">
                    {Object.entries(jawabanObj).map(([key, value]) => {
                      const isLink = typeof value === 'string' && value.startsWith("http");
                      const pertanyaanAsli = strukturMingguIni.find((q: any) => q.id === key);
                      const teksPertanyaan = pertanyaanAsli ? pertanyaanAsli.label : `Pertanyaan dari Form Lama`;
                      return (
                        <div key={key} className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                          <span className="text-xs font-black text-slate-900 block mb-1.5 uppercase tracking-wider">{teksPertanyaan}</span>
                          {isLink ? (
                            <a href={value} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-blue-600 hover:underline flex items-center gap-1.5">Buka Tautan <ChevronRight size={14} /></a>
                          ) : (
                            <p className="text-sm font-medium text-slate-700 break-words">{value || <span className="italic text-slate-400">Tidak diisi</span>}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-end">
                    {labelStatus}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}