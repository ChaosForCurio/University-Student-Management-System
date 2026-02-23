import { useAttendance } from '@/context/AttendanceContext';
import { format, subDays } from 'date-fns';
import {
  Users,
  BookOpen,
  TrendingUp,
  UserCheck,
  UserX,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export function Dashboard() {
  const { students, courses, records, getCourseAttendanceRate, navigateToStudent } = useAttendance();

  const today = format(new Date(), 'yyyy-MM-dd');
  const todayRecords = records.filter(r => r.date === today);
  const todayPresent = todayRecords.filter(r => r.status === 'present').length;
  const todayAbsent = todayRecords.filter(r => r.status === 'absent').length;
  const todayLate = todayRecords.filter(r => r.status === 'late').length;
  const todayTotal = todayRecords.length || 1;

  // Weekly trend data
  const weeklyData = Array.from({ length: 14 }, (_, i) => {
    const date = subDays(new Date(), 13 - i);
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) return null;
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayRecords = records.filter(r => r.date === dateStr);
    const present = dayRecords.filter(r => r.status === 'present' || r.status === 'late').length;
    const total = dayRecords.length || 1;
    return {
      date: format(date, 'MMM dd'),
      rate: Math.round((present / total) * 100),
      present: dayRecords.filter(r => r.status === 'present').length,
      absent: dayRecords.filter(r => r.status === 'absent').length,
    };
  }).filter(Boolean);

  // Course attendance rates
  const courseRates = courses.map(c => ({
    name: c.code,
    rate: getCourseAttendanceRate(c.id),
    color: c.color,
    fullName: c.name,
  })).sort((a, b) => b.rate - a.rate);

  // Status distribution
  const statusData = [
    { name: 'Present', value: records.filter(r => r.status === 'present').length, color: '#22c55e' },
    { name: 'Absent', value: records.filter(r => r.status === 'absent').length, color: '#ef4444' },
    { name: 'Late', value: records.filter(r => r.status === 'late').length, color: '#f59e0b' },
    { name: 'Excused', value: records.filter(r => r.status === 'excused').length, color: '#3b82f6' },
  ];

  // Average attendance
  const allPresent = records.filter(r => r.status === 'present' || r.status === 'late').length;
  const avgAttendance = Math.round((allPresent / (records.length || 1)) * 100);

  // Low attendance students
  const studentAttendance = students.map(s => {
    const sRecords = records.filter(r => r.studentId === s.id);
    const present = sRecords.filter(r => r.status === 'present' || r.status === 'late').length;
    const rate = sRecords.length > 0 ? Math.round((present / sRecords.length) * 100) : 0;
    return { ...s, rate, totalRecords: sRecords.length };
  }).sort((a, b) => a.rate - b.rate);

  const lowAttendance = studentAttendance.filter(s => s.rate < 75).slice(0, 5);

  const stats = [
    {
      label: 'Total Students',
      value: students.length,
      icon: Users,
      color: 'from-primary-500 to-primary-600',
      bgColor: 'bg-primary-50',
      textColor: 'text-primary-600',
      change: '+3',
      up: true,
    },
    {
      label: 'Active Courses',
      value: courses.length,
      icon: BookOpen,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
      change: '+1',
      up: true,
    },
    {
      label: 'Avg Attendance',
      value: `${avgAttendance}%`,
      icon: TrendingUp,
      color: 'from-emerald-500 to-emerald-600',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-600',
      change: '+2.5%',
      up: true,
    },
    {
      label: 'Today Present',
      value: `${Math.round((todayPresent / todayTotal) * 100)}%`,
      icon: Activity,
      color: 'from-amber-500 to-orange-500',
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-600',
      change: '-1.2%',
      up: false,
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">
          Welcome back! Here's what's happening today, {format(new Date(), 'EEEE, MMMM d, yyyy')}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div
            key={stat.label}
            className={`animate-slide-in-up stagger-${i + 1} card-hover rounded-2xl bg-white p-5 border border-slate-100 shadow-sm`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{stat.label}</p>
                <p className="text-2xl font-bold text-slate-900 mt-2">{stat.value}</p>
              </div>
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${stat.color} shadow-lg`}>
                <stat.icon className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-3">
              {stat.up ? (
                <ArrowUpRight className="h-3.5 w-3.5 text-emerald-500" />
              ) : (
                <ArrowDownRight className="h-3.5 w-3.5 text-red-500" />
              )}
              <span className={`text-xs font-semibold ${stat.up ? 'text-emerald-500' : 'text-red-500'}`}>
                {stat.change}
              </span>
              <span className="text-xs text-slate-400 ml-1">vs last week</span>
            </div>
          </div>
        ))}
      </div>

      {/* Today's Quick Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="flex items-center gap-4 rounded-2xl bg-success-50 p-4 border border-green-100">
          <UserCheck className="h-8 w-8 text-success-600" />
          <div>
            <p className="text-2xl font-bold text-success-600">{todayPresent}</p>
            <p className="text-xs text-green-600/70">Present Today</p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-2xl bg-danger-50 p-4 border border-red-100">
          <UserX className="h-8 w-8 text-danger-600" />
          <div>
            <p className="text-2xl font-bold text-danger-600">{todayAbsent}</p>
            <p className="text-xs text-red-600/70">Absent Today</p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-2xl bg-warning-50 p-4 border border-amber-100">
          <Clock className="h-8 w-8 text-warning-600" />
          <div>
            <p className="text-2xl font-bold text-warning-600">{todayLate}</p>
            <p className="text-xs text-amber-600/70">Late Today</p>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance Trend */}
        <div className="lg:col-span-2 rounded-2xl bg-white p-5 border border-slate-100 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Attendance Trend (Last 2 Weeks)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyData}>
                <defs>
                  <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    background: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    fontSize: '12px',
                  }}
                />
                <Area type="monotone" dataKey="rate" stroke="#6366f1" strokeWidth={2.5} fill="url(#colorRate)" name="Attendance %" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution */}
        <div className="rounded-2xl bg-white p-5 border border-slate-100 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Overall Distribution</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value">
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {statusData.map(s => (
              <div key={s.name} className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full" style={{ background: s.color }} />
                <span className="text-xs text-slate-500">{s.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Course Attendance Rates */}
        <div className="rounded-2xl bg-white p-5 border border-slate-100 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Course Attendance Rates</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={courseRates} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#64748b', fontWeight: 500 }} axisLine={false} tickLine={false} width={65} />
                <Tooltip
                  contentStyle={{
                    background: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    fontSize: '12px',
                  }}
                  formatter={(value) => [`${value}%`, 'Attendance Rate']}
                />
                <Bar dataKey="rate" radius={[0, 6, 6, 0]} barSize={18}>
                  {courseRates.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Low Attendance Alert */}
        <div className="rounded-2xl bg-white p-5 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-900">⚠️ Low Attendance Students</h3>
            <span className="text-xs text-red-500 font-medium bg-red-50 px-2.5 py-1 rounded-full">
              {lowAttendance.length} students below 75%
            </span>
          </div>
          <div className="space-y-3">
            {lowAttendance.map((student, i) => (
              <button
                key={student.id}
                onClick={() => navigateToStudent(student.id)}
                className={`flex w-full items-center gap-3 rounded-xl p-3 hover:bg-slate-50 transition-colors animate-slide-in-up stagger-${i + 1}`}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-red-400 to-red-600 text-white text-xs font-bold">
                  {student.avatar}
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-slate-900">{student.name}</p>
                  <p className="text-xs text-slate-400">{student.department}</p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-bold ${student.rate < 60 ? 'text-red-500' : 'text-amber-500'}`}>
                    {student.rate}%
                  </p>
                  <div className="w-20 h-1.5 bg-slate-100 rounded-full mt-1">
                    <div
                      className={`h-full rounded-full progress-bar ${student.rate < 60 ? 'bg-red-500' : 'bg-amber-500'}`}
                      style={{ width: `${student.rate}%` }}
                    />
                  </div>
                </div>
              </button>
            ))}
            {lowAttendance.length === 0 && (
              <div className="text-center py-8 text-slate-400 text-sm">
                🎉 All students have attendance above 75%!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
