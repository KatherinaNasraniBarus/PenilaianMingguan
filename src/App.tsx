import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LayoutDashboard, ClipboardList, Laptop, FilePlus, History } from 'lucide-react';
import { useState, useEffect } from 'react';
import AppLayout from './components/AppLayout';
import Dashboard from './pages/Dashboard';
import SubmitReport from './pages/SubmitReport';
import RoleSelection from './pages/RoleSelection';
import MentorLogin from './pages/MentorLogin';
import StudentLogin from './pages/StudentLogin';
import MentorDashboard from './pages/MentorDashboard';
import MentorRekap from './pages/MentorRekap';
import StudentRegister from './pages/StudentRegister';
import RiwayatAbsen from './pages/RiwayatAbsen';
import LaporDigitalisasi from './pages/LaporDigitalisasi';
import FormBuilder from './pages/FormBuilder';
import MentorLaporanDigital from './pages/MentorLaporanDigital';
import MentorRiwayatForm from './pages/MentorRiwayatForm';

const studentMenuItems = [
  { name: "Dashboard",          path: "/dashboard",          icon: LayoutDashboard },
  { name: "Submit Report",      path: "/submit-report",      icon: ClipboardList   },
  { name: "Lapor Digitalisasi", path: "/lapor-digitalisasi", icon: Laptop        },
];

// 🚀 KOMPONEN PEMBUNGKUS KHUSUS MENTOR & ADMIN
function MentorLayoutWrapper() {
  // Menu dasar (Default) untuk mentor biasa
  const [menuItems, setMenuItems] = useState([
    { name: "Dashboard", path: "/mentor/dashboard", icon: LayoutDashboard },
    { name: "Penilaian", path: "/mentor/rekap",     icon: ClipboardList   }
  ]);

  useEffect(() => {
    // Ambil data dari penyimpanan lokal browser
    const mentorData = localStorage.getItem("mentor_data") || "";
    const userName = localStorage.getItem("userName") || "";

    // Gabungkan teksnya jadi satu biar gampang dicek
    const dataStr = mentorData.toLowerCase() + " " + userName.toLowerCase();

    // 🚀 CEK VIP: Apakah ini akun Boy Tobing ATAU Admin?
    const isVIP = dataStr.includes("boy_tobing") || 
                  dataStr.includes("boy tobing") || 
                  dataStr.includes("admin");

    // Jika masuk VIP, buka semua menu rahasia!
    if (isVIP) {
      setMenuItems([
        { name: "Dashboard",          path: "/mentor/dashboard",          icon: LayoutDashboard },
        { name: "Penilaian",          path: "/mentor/rekap",              icon: ClipboardList   },
        { name: "Cek Digitalisasi",   path: "/mentor/digitalisasi",       icon: Laptop          },
        { name: "Buat Form",          path: "/mentor/form-builder",       icon: FilePlus        },
        // 🚀 IKON "RIWAYAT FORM" DIGANTI JADI HISTORY (JAM)
        { name: "Riwayat Form",       path: "/mentor/riwayat-form",       icon: History         }, 
      ]);
    }
  }, []);

  return (
    <AppLayout
      authStorageKey="mentor_data"
      loginPath="/mentor-login"
      menuItems={menuItems} 
      userStorageKey="mentor_data" 
      roleLabel="Mentor / Admin"
    />
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ─── HALAMAN TANPA SIDEBAR ─── */}
        <Route path="/" element={<RoleSelection />} />
        <Route path="/mentor-login" element={<MentorLogin />} />
        <Route path="/student-login" element={<StudentLogin />} />
        <Route path="/register" element={<StudentRegister />} />
        <Route path="/riwayat-absen" element={<RiwayatAbsen />} />

        {/* ─── HALAMAN MENTOR & ADMIN ─── */}
        <Route element={<MentorLayoutWrapper />}>
          <Route path="/mentor/dashboard"    element={<MentorDashboard />} />
          <Route path="/mentor/rekap"        element={<MentorRekap />} />
          <Route path="/mentor/form-builder" element={<FormBuilder />} />
          <Route path="/mentor/digitalisasi" element={<MentorLaporanDigital />} />
          <Route path="/mentor/riwayat-form" element={<MentorRiwayatForm />} />
        </Route>

        {/* ─── HALAMAN MAHASISWA ─── */}
        <Route element={
          <AppLayout
            authStorageKey="userNim"
            loginPath="/student-login"
            menuItems={studentMenuItems}
            userStorageKey="userName"
            roleLabel="Mahasiswa"
          />
        }>
          <Route path="/dashboard"          element={<Dashboard />} />
          <Route path="/submit-report"      element={<SubmitReport />} />
          <Route path="/lapor-digitalisasi" element={<LaporDigitalisasi />} />
        </Route>

        {/* ─── REDIRECT JIKA URL NGASAL ─── */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}