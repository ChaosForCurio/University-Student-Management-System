import { useState, useMemo } from 'react';
import { useAttendance } from '@/context/AttendanceContext';
import { AttendanceRecord } from '@/types';
import { format } from 'date-fns';
import { Check, X, Clock, Shield, UserCheck, Save, RotateCcw, Search } from 'lucide-react';
import { avatarColors } from '@/data/mockData';

type Status = AttendanceRecord['status'];

const statusConfig: Record<Status, { label: string; icon: typeof Check; class: string; bgClass: string }> = {
  present: { label: 'Present', icon: Check, class: 'text-emerald-600 border-emerald-300 bg-emerald-50', bgClass: 'bg-emerald-500' },
  absent: { label: 'Absent', icon: X, class: 'text-red-600 border-red-300 bg-red-50', bgClass: 'bg-red-500' },
  late: { label: 'Late', icon: Clock, class: 'text-amber-600 border-amber-300 bg-amber-50', bgClass: 'bg-amber-500' },
  excused: { label: 'Excused', icon: Shield, class: 'text-blue-600 border-blue-300 bg-blue-50', bgClass: 'bg-blue-500' },
};

export function AttendanceMarker() {
  const { courses, students, records, selectedCourseId, setSelectedCourseId, bulkMarkAttendance } = useAttendance();
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [attendanceMap, setAttendanceMap] = useState<Record<string, Status>>({});
  const [saved, setSaved] = useState(false);
  const [search, setSearch] = useState('');

  const selectedCourse = useMemo(() => {
    return courses.find(c => c.id === selectedCourseId);
  }, [courses, selectedCourseId]);

  const courseStudents = useMemo(() => {
    if (!selectedCourse) return [];
    return students
      .filter(s => selectedCourse.enrolledStudents.includes(s.id))
      .filter(s => s.name.toLowerCase().includes(search.toLowerCase()));
  }, [selectedCourse, students, search]);

  // Load existing attendance for selected course and date
  useMemo(() => {
    if (!selectedCourse) return;
    const existing: Record<string, Status> = {};
    records
      .filter(r => r.courseId === selectedCourse.id && r.date === date)
      .forEach(r => {
        existing[r.studentId] = r.status;
      });
    setAttendanceMap(existing);
  }, [selectedCourse, date, records]);

  const setStatus = (studentId: string, status: Status) => {
    setAttendanceMap(prev => ({ ...prev, [studentId]: status }));
    setSaved(false);
  };

  const markAllPresent = () => {
    const all: Record<string, Status> = {};
    courseStudents.forEach(s => { all[s.id] = 'present'; });
    setAttendanceMap(all);
    setSaved(false);
  };

  const handleSave = () => {
    if (!selectedCourse) return;
    bulkMarkAttendance(selectedCourse.id, date, attendanceMap);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const stats = useMemo(() => {
    const values = Object.values(attendanceMap);
    return {
      present: values.filter(v => v === 'present').length,
      absent: values.filter(v => v === 'absent').length,
      late: values.filter(v => v === 'late').length,
      excused: values.filter(v => v === 'excused').length,
      unmarked: courseStudents.length - values.length,
    };
  }, [attendanceMap, courseStudents]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Mark Attendance</h1>
        <p className="text-sm text-slate-500 mt-1">Select a course and date to mark student attendance</p>
      </div>

      {/* Course & Date Selection */}
      <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Course</label>
            <select
              value={selectedCourseId || ''}
              onChange={e => setSelectedCourseId(e.target.value || null)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none"
            >
              <option value="">Select a course...</option>
              {courses.map(c => (
                <option key={c.id} value={c.id}>{c.code} - {c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Date</label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none"
            />
          </div>
        </div>
      </div>

      {selectedCourse && (
        <>
          {/* Quick Stats */}
          <div className="grid grid-cols-5 gap-3">
            {[
              { label: 'Present', value: stats.present, color: 'bg-emerald-500' },
              { label: 'Absent', value: stats.absent, color: 'bg-red-500' },
              { label: 'Late', value: stats.late, color: 'bg-amber-500' },
              { label: 'Excused', value: stats.excused, color: 'bg-blue-500' },
              { label: 'Unmarked', value: stats.unmarked, color: 'bg-slate-400' },
            ].map(s => (
              <div key={s.label} className="rounded-xl bg-white border border-slate-100 p-3 text-center shadow-sm">
                <div className={`inline-flex h-2 w-2 rounded-full ${s.color} mb-1`} />
                <p className="text-lg font-bold text-slate-900">{s.value}</p>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Actions Bar */}
          <div className="flex items-center justify-between">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search students..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white pl-9 pr-4 py-2 text-sm placeholder:text-slate-400 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={markAllPresent}
                className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-600 hover:bg-emerald-100 transition-colors border border-emerald-200"
              >
                <UserCheck className="h-3.5 w-3.5" />
                Mark All Present
              </button>
              <button
                onClick={() => setAttendanceMap({})}
                className="flex items-center gap-2 rounded-xl bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors border border-slate-200"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset
              </button>
              <button
                onClick={handleSave}
                className={`flex items-center gap-2 rounded-xl px-5 py-2 text-xs font-semibold text-white transition-all shadow-sm ${
                  saved
                    ? 'bg-emerald-500 shadow-emerald-200'
                    : 'bg-primary-600 hover:bg-primary-700 shadow-primary-200'
                }`}
              >
                {saved ? <Check className="h-3.5 w-3.5" /> : <Save className="h-3.5 w-3.5" />}
                {saved ? 'Saved!' : 'Save Attendance'}
              </button>
            </div>
          </div>

          {/* Student List */}
          <div className="rounded-2xl bg-white border border-slate-100 shadow-sm overflow-hidden">
            <div className="divide-y divide-slate-50">
              {courseStudents.map((student, i) => {
                const currentStatus = attendanceMap[student.id];
                const color = avatarColors[i % avatarColors.length];
                return (
                  <div key={student.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-9 w-9 items-center justify-center rounded-full text-white text-xs font-bold shrink-0"
                        style={{ background: color }}
                      >
                        {student.avatar}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{student.name}</p>
                        <p className="text-xs text-slate-400">{student.studentId}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {(Object.keys(statusConfig) as Status[]).map(status => {
                        const config = statusConfig[status];
                        const Icon = config.icon;
                        const isActive = currentStatus === status;
                        return (
                          <button
                            key={status}
                            onClick={() => setStatus(student.id, status)}
                            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                              isActive
                                ? config.class + ' shadow-sm'
                                : 'border-slate-200 text-slate-400 hover:border-slate-300 hover:text-slate-600'
                            }`}
                          >
                            <Icon className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">{config.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {!selectedCourse && (
        <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-12 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-50 mx-auto mb-4">
            <UserCheck className="h-8 w-8 text-primary-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">Select a Course</h3>
          <p className="text-sm text-slate-400 mt-1">Choose a course from the dropdown above to start marking attendance</p>
        </div>
      )}
    </div>
  );
}
