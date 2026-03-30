import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LayoutDashboard, ClipboardList } from 'lucide-react';
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
const mentorMenuItems = [
  { name: "Dashboard", path: "/mentor/dashboard", icon: LayoutDashboard },
  { name: "Penilaian", path: "/mentor/rekap",     icon: ClipboardList   },
];

const studentMenuItems = [
  { name: "Dashboard",     path: "/dashboard",     icon: LayoutDashboard },
  { name: "Submit Report", path: "/submit-report", icon: ClipboardList   },
];

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
        {/* ─── HALAMAN MENTOR ─── */}
        <Route element={
          <AppLayout
            authStorageKey="mentor_data"
            loginPath="/mentor-login"
            menuItems={mentorMenuItems}
            userStorageKey="mentor_data"
            roleLabel="Mentor"
          />
        }>
          <Route path="/mentor/dashboard" element={<MentorDashboard />} />
          <Route path="/mentor/rekap"     element={<MentorRekap />} />
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
          <Route path="/dashboard"     element={<Dashboard />} />
          <Route path="/submit-report" element={<SubmitReport />} />
        </Route>

        {/* ─── REDIRECT ─── */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}