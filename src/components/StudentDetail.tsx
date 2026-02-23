import { useMemo } from 'react';
import { useAttendance } from '@/context/AttendanceContext';
import { format, parseISO } from 'date-fns';
import { ArrowLeft, Mail, Hash, Building2, GraduationCap, BookOpen, TrendingUp } from 'lucide-react';
import { avatarColors } from '@/data/mockData';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export function StudentDetail() {
  const { students, courses, records, selectedStudentId, setCurrentPage, getAttendanceRate } = useAttendance();

  const student = useMemo(() => {
    return students.find(s => s.id === selectedStudentId);
  }, [students, selectedStudentId]);

  const studentRecords = useMemo(() => {
    if (!student) return [];
    return records.filter(r => r.studentId === student.id).sort((a, b) => b.date.localeCompare(a.date));
  }, [student, records]);

  const enrolledCourses = useMemo(() => {
    if (!student) return [];
    return courses.filter(c => student.enrolledCourses.includes(c.id));
  }, [student, courses]);

  const courseAttendance = useMemo(() => {
    return enrolledCourses.map(course => {
      const cRecords = studentRecords.filter(r => r.courseId === course.id);
      const present = cRecords.filter(r => r.status === 'present').length;
      const absent = cRecords.filter(r => r.status === 'absent').length;
      const late = cRecords.filter(r => r.status === 'late').length;
      const excused = cRecords.filter(r => r.status === 'excused').length;
      const total = cRecords.length || 1;
      const rate = Math.round(((present + late) / total) * 100);
      return { ...course, present, absent, late, excused, total: cRecords.length, rate };
    });
  }, [enrolledCourses, studentRecords]);

  // Build timeline data - group by date
  const timelineData = useMemo(() => {
    const dateMap = new Map<string, { present: number; total: number }>();
    studentRecords.forEach(r => {
      const entry = dateMap.get(r.date) || { present: 0, total: 0 };
      entry.total++;
      if (r.status === 'present' || r.status === 'late') entry.present++;
      dateMap.set(r.date, entry);
    });
    return Array.from(dateMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-14)
      .map(([date, data]) => ({
        date: format(parseISO(date), 'MMM dd'),
        rate: Math.round((data.present / (data.total || 1)) * 100),
      }));
  }, [studentRecords]);

  // Recent records
  const recentRecords = useMemo(() => {
    return studentRecords.slice(0, 15).map(r => {
      const course = courses.find(c => c.id === r.courseId);
      return { ...r, courseName: course?.name || '', courseCode: course?.code || '', courseColor: course?.color || '#6366f1' };
    });
  }, [studentRecords, courses]);

  if (!student) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-400">Student not found</p>
        <button onClick={() => setCurrentPage('students')} className="mt-4 text-primary-600 text-sm hover:underline">
          Back to Students
        </button>
      </div>
    );
  }

  const overallRate = getAttendanceRate(student.id);
  const colorIdx = students.indexOf(student);
  const avatarColor = avatarColors[colorIdx % avatarColors.length];

  const statusCounts = {
    present: studentRecords.filter(r => r.status === 'present').length,
    absent: studentRecords.filter(r => r.status === 'absent').length,
    late: studentRecords.filter(r => r.status === 'late').length,
    excused: studentRecords.filter(r => r.status === 'excused').length,
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Back button */}
      <button
        onClick={() => setCurrentPage('students')}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Students
      </button>

      {/* Student Header */}
      <div className="rounded-2xl bg-white border border-slate-100 shadow-sm overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-primary-500 via-purple-500 to-pink-500" />
        <div className="px-6 pb-6 -mt-10">
          <div className="flex items-end gap-4">
            <div
              className="flex h-20 w-20 items-center justify-center rounded-2xl text-white text-2xl font-bold border-4 border-white shadow-lg"
              style={{ background: avatarColor }}
            >
              {student.avatar}
            </div>
            <div className="flex-1 pb-1">
              <h1 className="text-xl font-bold text-slate-900">{student.name}</h1>
              <p className="text-sm text-slate-500">{student.department}</p>
            </div>
            <div className="pb-1">
              <div className={`text-2xl font-bold ${overallRate >= 75 ? 'text-emerald-600' : overallRate >= 60 ? 'text-amber-600' : 'text-red-600'}`}>
                {overallRate}%
              </div>
              <p className="text-xs text-slate-400 text-right">Overall Attendance</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Mail className="h-4 w-4 text-slate-400" />
              <span className="truncate">{student.email}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Hash className="h-4 w-4 text-slate-400" />
              <span className="font-mono">{student.studentId}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Building2 className="h-4 w-4 text-slate-400" />
              <span>{student.department}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <GraduationCap className="h-4 w-4 text-slate-400" />
              <span>Semester {student.semester}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Present', value: statusCounts.present, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Absent', value: statusCounts.absent, color: 'text-red-600', bg: 'bg-red-50' },
          { label: 'Late', value: statusCounts.late, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Excused', value: statusCounts.excused, color: 'text-blue-600', bg: 'bg-blue-50' },
        ].map(s => (
          <div key={s.label} className={`rounded-xl ${s.bg} p-4 text-center border border-slate-100`}>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Chart + Course Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Trend */}
        <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-4 w-4 text-primary-500" />
            <h3 className="text-sm font-semibold text-slate-900">Attendance Trend</h3>
          </div>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData}>
                <defs>
                  <linearGradient id="studentGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                />
                <Area type="monotone" dataKey="rate" stroke="#6366f1" strokeWidth={2} fill="url(#studentGrad)" name="Attendance %" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Course Breakdown */}
        <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="h-4 w-4 text-primary-500" />
            <h3 className="text-sm font-semibold text-slate-900">Course-wise Attendance</h3>
          </div>
          <div className="space-y-3">
            {courseAttendance.map(course => (
              <div key={course.id} className="rounded-xl border border-slate-100 p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full" style={{ background: course.color }} />
                    <span className="text-xs font-bold text-slate-700">{course.code}</span>
                    <span className="text-xs text-slate-400">{course.name}</span>
                  </div>
                  <span className={`text-xs font-bold ${
                    course.rate >= 75 ? 'text-emerald-600' : course.rate >= 60 ? 'text-amber-600' : 'text-red-600'
                  }`}>
                    {course.rate}%
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full progress-bar"
                    style={{ width: `${course.rate}%`, background: course.color }}
                  />
                </div>
                <div className="flex gap-3 mt-1.5">
                  <span className="text-[10px] text-emerald-500">P:{course.present}</span>
                  <span className="text-[10px] text-red-500">A:{course.absent}</span>
                  <span className="text-[10px] text-amber-500">L:{course.late}</span>
                  <span className="text-[10px] text-blue-500">E:{course.excused}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-5">
        <h3 className="text-sm font-semibold text-slate-900 mb-4">Recent Attendance Records</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Course</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {recentRecords.map(record => (
                <tr key={record.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-2.5 text-sm text-slate-600">
                    {format(parseISO(record.date), 'EEE, MMM d, yyyy')}
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full" style={{ background: record.courseColor }} />
                      <span className="text-sm font-medium text-slate-700">{record.courseCode}</span>
                      <span className="text-xs text-slate-400">{record.courseName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium status-${record.status}`}>
                      {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
