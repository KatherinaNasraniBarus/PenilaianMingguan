import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import MentorLayout from './components/MentorLayout';
import Dashboard from './pages/Dashboard';
import SubmitReport from './pages/SubmitReport';
import RoleSelection from './pages/RoleSelection';
import MentorLogin from './pages/MentorLogin';
import StudentLogin from './pages/StudentLogin';
import MentorDashboard from './pages/MentorDashboard';
import StudentRegister from './pages/StudentRegister';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ─── HALAMAN TANPA SIDEBAR ─── */}
        <Route path="/" element={<RoleSelection />} />
        <Route path="/mentor-login" element={<MentorLogin />} />
        <Route path="/student-login" element={<StudentLogin />} />
        
        {/* Rute baru untuk Register diletakkan di sini */}
        <Route path="/register" element={<StudentRegister />} />

        {/* ─── HALAMAN MENTOR (DENGAN SIDEBAR) ─── */}
        <Route element={<MentorLayout />}>
          <Route path="/mentor/dashboard" element={<MentorDashboard />} />
        </Route>

        {/* ─── HALAMAN MAHASISWA (DENGAN SIDEBAR) ─── */}
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/submit-report" element={<SubmitReport />} />
        </Route>

        {/* ─── REDIRECT JIKA URL TIDAK DITEMUKAN ─── */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}