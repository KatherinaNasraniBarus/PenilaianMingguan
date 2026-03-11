import { useState } from "react";
import { ChevronRight, Info, Activity, Link as LinkIcon, CheckCircle, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";

export default function SubmitReport() {

  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    nama: "",
    seminar: "",
    pu: "",
    bpu: "",
    sosialisasi: "",
    video: "",
    administrasi: "",
    kunjunganPu: "",
    kunjunganBpu: "",
    drive: ""
  });

  const [errors, setErrors] = useState({});

  const now = new Date();
  const day = now.getDay();
  const hour = now.getHours();
  const minute = now.getMinutes();

  const passedDeadline =
    day > 2 || (day === 2 && (hour > 23 || (hour === 23 && minute > 59)));

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });

    setErrors({
      ...errors,
      [e.target.name]: ""
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    let newErrors = {};

    Object.keys(formData).forEach((key) => {
      if (!formData[key]) {
        newErrors[key] = "Tidak boleh kosong";
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSubmitted(true);
  };

  return (
   <div className="flex flex-col h-full">

  <header className="h-16 bg-white border-b border-slate-200 flex items-center px-8">
    <div className="flex items-center gap-2 text-base">

      <Link 
        to="/dashboard" 
        className="text-slate-500 hover:text-blue-600 font-medium"
      >
        Reports
      </Link>
      <ChevronRight size={18} className="text-slate-400" />
      <span className="text-slate-900 font-semibold">
        Submit Weekly Report
      </span>
    </div>
  </header>

      <div className="p-8 max-w-4xl mx-auto w-full">

        <h2 className="text-3xl font-bold text-slate-900 mb-3">
          Laporan Mingguan Mahasiswa
        </h2>

        <p className="text-sm text-slate-500 mb-1">
          Deadline submit laporan: <b>Setiap Selasa 23:59</b>
        </p>

        {passedDeadline && !submitted && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-600">
            <AlertCircle size={18} />
            Deadline minggu ini sudah lewat. Laporan yang dibuat akan masuk minggu berikutnya.
          </div>
        )}

        {submitted && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-600">
            <CheckCircle size={18} />
            Laporan berhasil dikirim.
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>

          {/* NAMA */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">

            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Info size={20} className="text-blue-600" />
              Data Mahasiswa
            </h3>

            <label className="text-sm font-semibold text-slate-700">
              Nama Lengkap
            </label>

            <input
              type="text"
              name="nama"
              value={formData.nama}
              onChange={handleChange}
              className="w-full rounded-lg border px-4 py-2 border-slate-300"
            />

            {errors.nama && (
              <p className="text-red-500 text-sm mt-1">{errors.nama}</p>
            )}

          </div>

          {/* AKTIVITAS */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">

            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Activity size={20} className="text-blue-600" />
              Aktivitas Mingguan
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {[
                { label: "Kehadiran Seminar", name: "seminar" },
                { label: "Akuisisi PU", name: "pu" },
                { label: "Akuisisi BPU", name: "bpu" },
                { label: "Jumlah Sosialisasi", name: "sosialisasi" },
                { label: "Jumlah Video Viralisasi", name: "video" },
                { label: "Administrasi dan Laporan", name: "administrasi" },
                { label: "Kunjungan PU", name: "kunjunganPu" },
                { label: "Kunjungan BPU", name: "kunjunganBpu" }
              ].map((item, index) => (
                <div key={index}>

                  <label className="text-sm font-semibold text-slate-700">
                    {item.label}
                  </label>

                  <input
                    type="number"
                    min="0"
                    name={item.name}
                    value={formData[item.name]}
                    onChange={handleChange}
                    className="w-full border rounded-lg px-4 py-2 mt-1 border-slate-300"
                  />

                  {errors[item.name] && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors[item.name]}
                    </p>
                  )}

                </div>
              ))}

            </div>

          </div>

          {/* LINK DRIVE */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">

            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <LinkIcon size={20} className="text-blue-600" />
              Link Evidence
            </h3>

            <label className="text-sm font-semibold text-slate-700">
              Link Google Drive
            </label>

            <input
              type="url"
              name="drive"
              value={formData.drive}
              onChange={handleChange}
              placeholder="https://drive.google.com/..."
              className="w-full border rounded-lg px-4 py-2 mt-1 border-slate-300"
            />

            {errors.drive && (
              <p className="text-red-500 text-sm mt-1">{errors.drive}</p>
            )}

          </div>

          {/* BUTTON */}
          <div className="flex justify-end pt-4 pb-12">

            <button
              type="submit"
              disabled={submitted}
              className={`px-8 py-2.5 rounded-lg text-white font-bold flex items-center gap-2
              ${submitted ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
            >
              <CheckCircle size={20} />
              Submit Report
            </button>

          </div>

        </form>

      </div>
    </div>
  );
}