import { useState, useMemo } from 'react';
import { useAttendance } from '@/context/AttendanceContext';
import { format, subDays, parseISO, eachDayOfInterval } from 'date-fns';
import { Download, Filter, Calendar, BarChart3 } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

export function AttendanceReport() {
  const { courses, students, records } = useAttendance();
  const [selectedCourse, setSelectedCourse] = useState<string>('all');
  const [dateRange, setDateRange] = useState<'7' | '14' | '30'>('14');
  const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart');

  const startDate = subDays(new Date(), parseInt(dateRange));
  const endDate = new Date();

  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      const recordDate = parseISO(r.date);
      const inRange = recordDate >= startDate && recordDate <= endDate;
      const matchCourse = selectedCourse === 'all' || r.courseId === selectedCourse;
      return inRange && matchCourse;
    });
  }, [records, selectedCourse, startDate, endDate]);

  // Daily breakdown data
  const dailyData = useMemo(() => {
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    return days
      .filter(d => d.getDay() !== 0 && d.getDay() !== 6)
      .map(day => {
        const dateStr = format(day, 'yyyy-MM-dd');
        const dayRecords = filteredRecords.filter(r => r.date === dateStr);
        return {
          date: format(day, 'MMM dd'),
          Present: dayRecords.filter(r => r.status === 'present').length,
          Absent: dayRecords.filter(r => r.status === 'absent').length,
          Late: dayRecords.filter(r => r.status === 'late').length,
          Excused: dayRecords.filter(r => r.status === 'excused').length,
        };
      });
  }, [filteredRecords, startDate, endDate]);

  // Summary stats
  const summary = useMemo(() => {
    const total = filteredRecords.length || 1;
    return {
      total: filteredRecords.length,
      present: filteredRecords.filter(r => r.status === 'present').length,
      absent: filteredRecords.filter(r => r.status === 'absent').length,
      late: filteredRecords.filter(r => r.status === 'late').length,
      excused: filteredRecords.filter(r => r.status === 'excused').length,
      rate: Math.round((filteredRecords.filter(r => r.status === 'present' || r.status === 'late').length / total) * 100),
    };
  }, [filteredRecords]);

  // Student-wise report
  const studentReport = useMemo(() => {
    const report = students.map(s => {
      const sRecords = filteredRecords.filter(r => r.studentId === s.id);
      const present = sRecords.filter(r => r.status === 'present').length;
      const absent = sRecords.filter(r => r.status === 'absent').length;
      const late = sRecords.filter(r => r.status === 'late').length;
      const excused = sRecords.filter(r => r.status === 'excused').length;
      const total = sRecords.length || 1;
      const rate = Math.round(((present + late) / total) * 100);
      return { ...s, present, absent, late, excused, total: sRecords.length, rate };
    }).filter(s => s.total > 0);
    return report.sort((a, b) => b.rate - a.rate);
  }, [students, filteredRecords]);

  const handleExport = () => {
    const header = 'Name,Student ID,Department,Present,Absent,Late,Excused,Total,Rate\n';
    const rows = studentReport.map(s =>
      `${s.name},${s.studentId},${s.department},${s.present},${s.absent},${s.late},${s.excused},${s.total},${s.rate}%`
    ).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-report-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Attendance Reports</h1>
          <p className="text-sm text-slate-500 mt-1">Analyze attendance patterns and generate reports</p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-primary-700 transition-colors shadow-sm shadow-primary-200"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-5">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400" />
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Filters</span>
          </div>
          <select
            value={selectedCourse}
            onChange={e => setSelectedCourse(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 focus:border-primary-400 outline-none"
          >
            <option value="all">All Courses</option>
            {courses.map(c => (
              <option key={c.id} value={c.id}>{c.code} - {c.name}</option>
            ))}
          </select>
          <div className="flex rounded-xl border border-slate-200 overflow-hidden">
            {(['7', '14', '30'] as const).map(range => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium transition-colors ${
                  dateRange === range ? 'bg-primary-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Calendar className="h-3 w-3" />
                {range}d
              </button>
            ))}
          </div>
          <div className="flex rounded-xl border border-slate-200 overflow-hidden ml-auto">
            <button
              onClick={() => setViewMode('chart')}
              className={`px-3.5 py-2 text-xs font-medium transition-colors ${
                viewMode === 'chart' ? 'bg-primary-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              <BarChart3 className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3.5 py-2 text-xs font-medium transition-colors ${
                viewMode === 'table' ? 'bg-primary-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              Table
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Total Records', value: summary.total, color: 'text-slate-900' },
          { label: 'Present', value: summary.present, color: 'text-emerald-600' },
          { label: 'Absent', value: summary.absent, color: 'text-red-600' },
          { label: 'Late', value: summary.late, color: 'text-amber-600' },
          { label: 'Overall Rate', value: `${summary.rate}%`, color: summary.rate >= 75 ? 'text-emerald-600' : 'text-red-600' },
        ].map(s => (
          <div key={s.label} className="rounded-xl bg-white border border-slate-100 p-4 shadow-sm text-center">
            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {viewMode === 'chart' ? (
        /* Chart View */
        <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Daily Attendance Breakdown</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="Present" fill="#22c55e" radius={[2, 2, 0, 0]} stackId="a" />
                <Bar dataKey="Late" fill="#f59e0b" radius={[0, 0, 0, 0]} stackId="a" />
                <Bar dataKey="Excused" fill="#3b82f6" radius={[0, 0, 0, 0]} stackId="a" />
                <Bar dataKey="Absent" fill="#ef4444" radius={[2, 2, 0, 0]} stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        /* Table View */
        <div className="rounded-2xl bg-white border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Student</th>
                  <th className="px-5 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Present</th>
                  <th className="px-5 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Absent</th>
                  <th className="px-5 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Late</th>
                  <th className="px-5 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Excused</th>
                  <th className="px-5 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Total</th>
                  <th className="px-5 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {studentReport.slice(0, 20).map(s => (
                  <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3">
                      <div>
                        <p className="text-sm font-medium text-slate-900">{s.name}</p>
                        <p className="text-xs text-slate-400">{s.department}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className="text-sm font-medium text-emerald-600">{s.present}</span>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className="text-sm font-medium text-red-600">{s.absent}</span>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className="text-sm font-medium text-amber-600">{s.late}</span>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className="text-sm font-medium text-blue-600">{s.excused}</span>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className="text-sm text-slate-600">{s.total}</span>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                        s.rate >= 75 ? 'bg-emerald-50 text-emerald-600' : s.rate >= 60 ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'
                      }`}>
                        {s.rate}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
