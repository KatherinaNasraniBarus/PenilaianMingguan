import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import SubmitReport from './pages/SubmitReport';
import RoleSelection from './pages/RoleSelection';
import MentorLogin from './pages/MentorLogin';
import StudentLogin from './pages/StudentLogin';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing Page: Role Selection */}
        <Route path="/" element={<RoleSelection />} />
        
        {/* Mentor Login */}
        <Route path="/mentor-login" element={<MentorLogin />} />

        {/* Student Login */}
        <Route path="/student-login" element={<StudentLogin />} />

        {/* Main Application Layout for Dashboard & Reports */}
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/submit-report" element={<SubmitReport />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
