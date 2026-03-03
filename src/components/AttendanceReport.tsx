import { useState, useMemo } from 'react';
import { useAttendance } from '@/context/AttendanceContext';
import { format, subDays, parseISO, eachDayOfInterval } from 'date-fns';
import { Download, Filter, Calendar, BarChart3, BarChart as BarChartIcon } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';
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
import { Skeleton } from '@/components/ui/Skeleton';

export function AttendanceReport() {
  const { courses, students, records, isLoading } = useAttendance();

  const [selectedCourse, setSelectedCourse] = useState<string>('all');
  const [dateRange, setDateRange] = useState<'7' | '14' | '30'>('14');
  const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart');

  const { startDate, endDate } = useMemo(() => {
    return {
      startDate: subDays(new Date(), parseInt(dateRange)),
      endDate: new Date()
    };
  }, [dateRange]);

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

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-64 rounded-xl" />
          <Skeleton className="h-10 w-32 rounded-xl" />
        </div>
        <Skeleton className="h-20 w-full rounded-2xl" />
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          {[1, 2, 3, 4, 5].map(i => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-80 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Attendance Reports</h1>
          <p className="text-sm text-slate-500 mt-1">Analyze attendance patterns and generate reports</p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 w-full sm:w-auto justify-center rounded-xl bg-white border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all shadow-sm active:scale-[0.98]"
        >
          <Download className="h-4 w-4 text-primary-600" />
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400" />
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Filters</span>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <select
              value={selectedCourse}
              onChange={e => setSelectedCourse(e.target.value)}
              className="flex-1 min-w-[160px] rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 focus:border-primary-400 outline-none"
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
                  className={`flex-1 flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-medium transition-colors ${dateRange === range ? 'bg-primary-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                >
                  <Calendar className="h-3 w-3" />
                  {range}d
                </button>
              ))}
            </div>
          </div>
          <div className="flex rounded-xl border border-slate-200 overflow-hidden sm:ml-auto">
            <button
              onClick={() => setViewMode('chart')}
              className={`flex-1 sm:flex-none flex items-center justify-center px-4 py-2 text-xs font-medium transition-colors ${viewMode === 'chart' ? 'bg-primary-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'
                }`}
            >
              <BarChart3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`flex-1 sm:flex-none flex items-center justify-center px-4 py-2 text-xs font-medium transition-colors ${viewMode === 'table' ? 'bg-primary-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'
                }`}
            >
              Table
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Total Records', value: summary.total, color: 'text-slate-900', bgColor: 'bg-slate-50', icon: BarChart3, iconColor: 'text-slate-500' },
          { label: 'Present', value: summary.present, color: 'text-emerald-600', bgColor: 'bg-emerald-50/50', icon: BarChartIcon, iconColor: 'text-emerald-500' },
          { label: 'Absent', value: summary.absent, color: 'text-red-600', bgColor: 'bg-red-50/50', icon: BarChartIcon, iconColor: 'text-red-500' },
          { label: 'Late', value: summary.late, color: 'text-amber-600', bgColor: 'bg-amber-50/50', icon: BarChartIcon, iconColor: 'text-amber-500' },
          { label: 'Rate', value: `${summary.rate}%`, color: summary.rate >= 75 ? 'text-primary-600' : 'text-red-600', bgColor: 'bg-primary-50/50', icon: BarChart3, iconColor: 'text-primary-500' },
        ].map(s => (
          <div key={s.label} className="group relative overflow-hidden rounded-2xl bg-white border border-slate-100 p-5 shadow-sm transition-all hover:shadow-md hover:border-primary-100">
            <div className={`absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity`}>
              <s.icon className={`h-12 w-12 ${s.iconColor}`} />
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em] mb-1">{s.label}</p>
            <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
            <div className={`mt-3 h-1 w-8 rounded-full ${s.bgColor.replace('/50', '')}`} />
          </div>
        ))}
      </div>

      {studentReport.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12">
          <EmptyState
            icon={BarChartIcon}
            title="No records found"
            description="Adjust your filters or select a different date range to see attendance analysis."
          />
        </div>
      ) : (
        viewMode === 'chart' ? (
          /* Chart View */
          <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight flex items-center gap-2">
                <div className="h-4 w-1 bg-primary-600 rounded-full" />
                Daily Attendance Breakdown
              </h3>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="presentGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#22c55e" stopOpacity={0.8} />
                      <stop offset="100%" stopColor="#22c55e" stopOpacity={0.2} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 500 }}
                    axisLine={false}
                    tickLine={false}
                    dy={10}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 500 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{
                      background: 'rgba(255, 255, 255, 0.9)',
                      backdropFilter: 'blur(8px)',
                      border: '1px solid #e2e8f0',
                      borderRadius: '16px',
                      boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
                      fontSize: '12px',
                      padding: '12px',
                    }}
                    itemStyle={{ fontWeight: 600 }}
                  />
                  <Legend
                    verticalAlign="top"
                    align="right"
                    wrapperStyle={{ fontSize: '11px', fontWeight: 600, paddingBottom: '20px' }}
                    iconType="circle"
                  />
                  <Bar dataKey="Present" fill="#22c55e" radius={[4, 4, 0, 0]} stackId="a" barSize={32} />
                  <Bar dataKey="Late" fill="#f59e0b" radius={[0, 0, 0, 0]} stackId="a" barSize={32} />
                  <Bar dataKey="Excused" fill="#3b82f6" radius={[0, 0, 0, 0]} stackId="a" barSize={32} />
                  <Bar dataKey="Absent" fill="#ef4444" radius={[4, 4, 0, 0]} stackId="a" barSize={32} />
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
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${s.rate >= 75 ? 'bg-emerald-50 text-emerald-600' : s.rate >= 60 ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'
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
        )
      )}
    </div>
  );
}
