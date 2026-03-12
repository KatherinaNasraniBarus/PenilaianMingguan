import { Outlet } from 'react-router-dom';
import MentorSidebar from './MentorSidebar';

export default function MentorLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-emerald-50/20 font-sans">
      <MentorSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
