import { useState, useMemo } from 'react';
import { useAttendance } from '@/context/AttendanceContext';
import { Search, Filter, ChevronDown, Eye } from 'lucide-react';
import { avatarColors } from '@/data/mockData';

export function StudentList() {
  const { students, getAttendanceRate, navigateToStudent } = useAttendance();
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'name' | 'attendance' | 'department'>('name');
  const [showFilters, setShowFilters] = useState(false);

  const departments = useMemo(() => {
    return [...new Set(students.map(s => s.department))];
  }, [students]);

  const filteredStudents = useMemo(() => {
    let result = students.filter(s => {
      const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.studentId.includes(search) ||
        s.email.toLowerCase().includes(search.toLowerCase());
      const matchDept = deptFilter === 'all' || s.department === deptFilter;
      return matchSearch && matchDept;
    });

    result = result.map(s => ({ ...s, attendanceRate: getAttendanceRate(s.id) }));

    if (sortBy === 'name') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'attendance') {
      result.sort((a, b) => (a as ReturnType<typeof Object.assign>).attendanceRate - (b as ReturnType<typeof Object.assign>).attendanceRate);
    } else {
      result.sort((a, b) => a.department.localeCompare(b.department));
    }

    return result;
  }, [students, search, deptFilter, sortBy, getAttendanceRate]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Students</h1>
          <p className="text-sm text-slate-500 mt-1">Manage and view student attendance records</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-400 bg-slate-100 px-3 py-1.5 rounded-full">
            {filteredStudents.length} students
          </span>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="space-y-3">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, ID, or email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all ${
              showFilters ? 'border-primary-300 bg-primary-50 text-primary-600' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Filter className="h-4 w-4" />
            Filters
            <ChevronDown className={`h-3 w-3 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {showFilters && (
          <div className="flex gap-3 animate-slide-in-up">
            <select
              value={deptFilter}
              onChange={e => setDeptFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none"
            >
              <option value="all">All Departments</option>
              {departments.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as 'name' | 'attendance' | 'department')}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none"
            >
              <option value="name">Sort by Name</option>
              <option value="attendance">Sort by Attendance</option>
              <option value="department">Sort by Department</option>
            </select>
          </div>
        )}
      </div>

      {/* Student Table */}
      <div className="rounded-2xl bg-white border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Student</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Student ID</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Department</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Semester</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Attendance</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredStudents.map((student, i) => {
                const rate = getAttendanceRate(student.id);
                const color = avatarColors[i % avatarColors.length];
                return (
                  <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div
                          className="flex h-9 w-9 items-center justify-center rounded-full text-white text-xs font-bold shrink-0"
                          style={{ background: color }}
                        >
                          {student.avatar}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900">{student.name}</p>
                          <p className="text-xs text-slate-400">{student.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-sm text-slate-600 font-mono">{student.studentId}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">
                        {student.department}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-sm text-slate-600">Sem {student.semester}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-slate-100 rounded-full">
                          <div
                            className={`h-full rounded-full progress-bar ${
                              rate >= 75 ? 'bg-emerald-500' : rate >= 60 ? 'bg-amber-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${rate}%` }}
                          />
                        </div>
                        <span className={`text-xs font-semibold ${
                          rate >= 75 ? 'text-emerald-600' : rate >= 60 ? 'text-amber-600' : 'text-red-600'
                        }`}>
                          {rate}%
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <button
                        onClick={() => navigateToStudent(student.id)}
                        className="flex items-center gap-1.5 rounded-lg bg-primary-50 px-3 py-1.5 text-xs font-medium text-primary-600 hover:bg-primary-100 transition-colors"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
