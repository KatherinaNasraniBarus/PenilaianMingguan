import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import MentorLayout from './components/MentorLayout';
import Dashboard from './pages/Dashboard';
import SubmitReport from './pages/SubmitReport';
import RoleSelection from './pages/RoleSelection';
import MentorLogin from './pages/MentorLogin';
import StudentLogin from './pages/StudentLogin';
import MentorDashboard from './pages/MentorDashboard';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RoleSelection />} />
        <Route path="/mentor-login" element={<MentorLogin />} />
        <Route path="/student-login" element={<StudentLogin />} />

        {/* Mentor — sidebar mentor */}
        <Route element={<MentorLayout />}>
          <Route path="/mentor/dashboard" element={<MentorDashboard />} />
        </Route>

        {/* Student — sidebar mahasiswa */}
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/submit-report" element={<SubmitReport />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}