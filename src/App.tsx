import { AttendanceProvider } from '@/context/AttendanceContext';
import { Sidebar } from '@/components/Sidebar';
import { Dashboard } from '@/components/Dashboard';
import { StudentList } from '@/components/StudentList';
import { CourseList } from '@/components/CourseList';
import { AttendanceMarker } from '@/components/AttendanceMarker';
import { AttendanceReport } from '@/components/AttendanceReport';
import { StudentDetail } from '@/components/StudentDetail';
import { Bell, Search } from 'lucide-react';
import { format } from 'date-fns';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

function PageRenderer() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
      >
        <Routes location={location}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/students" element={<StudentList />} />
          <Route path="/students/:id" element={<StudentDetail />} />
          <Route path="/courses" element={<CourseList />} />
          <Route path="/mark-attendance" element={<AttendanceMarker />} />
          <Route path="/reports" element={<AttendanceReport />} />
          <Route path="*" element={<Dashboard />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

function TopBar() {
  const location = useLocation();

  const pageTitle: Record<string, string> = {
    '/': 'Dashboard',
    '/students': 'Students',
    '/courses': 'Courses',
    '/mark-attendance': 'Mark Attendance',
    '/reports': 'Reports',
  };

  const getTitle = () => {
    if (location.pathname.startsWith('/students/')) return 'Student Detail';
    return pageTitle[location.pathname] || 'Dashboard';
  };

  return (
    <header className="sticky top-0 z-40 glass border-b border-slate-200/50">
      <div className="flex items-center justify-between px-6 py-3">
        <div className="flex items-center gap-4">
          <div>
            <nav className="text-xs text-slate-400">
              <span>UniTrack</span>
              <span className="mx-1.5">/</span>
              <span className="text-slate-600 font-medium">{getTitle()}</span>
            </nav>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Quick search..."
              className="w-56 rounded-xl border border-slate-200 bg-white/80 pl-9 pr-4 py-2 text-sm placeholder:text-slate-400 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
            />
          </div>

          {/* Notifications */}
          <button className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white/80 text-slate-500 hover:bg-slate-50 transition-colors">
            <Bell className="h-4 w-4" />
            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
              3
            </span>
          </button>

          {/* Date */}
          <div className="hidden lg:flex items-center gap-2 rounded-xl border border-slate-200 bg-white/80 px-3 py-2">
            <span className="text-xs text-slate-500">{format(new Date(), 'EEE, MMM d, yyyy')}</span>
          </div>

          {/* User Avatar */}
          <div className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white/80 px-3 py-1.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 text-white text-xs font-bold">
              AD
            </div>
            <div className="hidden md:block">
              <p className="text-xs font-semibold text-slate-700">Admin</p>
              <p className="text-[10px] text-slate-400">admin@uni.edu</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

function AppLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <Sidebar />
      <div className="ml-64 transition-all duration-300">
        <TopBar />
        <main className="p-6">
          <PageRenderer />
        </main>
      </div>
    </div>
  );
}

export function App() {
  return (
    <AttendanceProvider>
      <AppLayout />
    </AttendanceProvider>
  );
}
