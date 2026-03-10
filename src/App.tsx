import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import SubmitReport from './pages/SubmitReport';
import MyReports from './pages/MyReports';
import ReportDetails from './pages/ReportDetails';
import ActivityPoints from './pages/ActivityPoints';
import MentorFeedback from './pages/MentorFeedback';
import ProfileSettings from './pages/ProfileSettings';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="submit-report" element={<SubmitReport />} />
          <Route path="my-reports" element={<MyReports />} />
          <Route path="my-reports/:id" element={<ReportDetails />} />
          <Route path="activity-points" element={<ActivityPoints />} />
          <Route path="mentor-feedback" element={<MentorFeedback />} />
          <Route path="profile-settings" element={<ProfileSettings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
