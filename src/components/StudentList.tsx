import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAttendance } from '@/context/AttendanceContext';
import { Search, Filter, ChevronDown, Eye, Plus, Trash2, X, Users } from 'lucide-react';
import { avatarColors } from '@/constants/ui';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';

export function StudentList() {
  const { students, getAttendanceRate, navigateToStudent, addStudent, deleteStudent, isLoading } = useAttendance();

  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'name' | 'attendance' | 'department'>('name');
  const [showFilters, setShowFilters] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newStudent, setNewStudent] = useState({
    name: '',
    email: '',
    studentId: '',
    department: '',
    semester: 1
  });

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
      result.sort((a, b) => (a as any).attendanceRate - (b as any).attendanceRate);
    } else {
      result.sort((a, b) => a.department.localeCompare(b.department));
    }

    return result;
  }, [students, search, deptFilter, sortBy, getAttendanceRate]);

  const handleAddStudent = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    addStudent(newStudent);
    setIsAddModalOpen(false);
    setNewStudent({ name: '', email: '', studentId: '', department: '', semester: 1 });
  }, [addStudent, newStudent]);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-48 rounded-xl" />
          <Skeleton className="h-10 w-32 rounded-xl" />
        </div>
        <div className="flex gap-4">
          <Skeleton className="h-12 flex-1 rounded-xl" />
          <Skeleton className="h-12 w-32 rounded-xl" />
        </div>
        <div className="rounded-2xl border border-slate-100 p-4 space-y-4">
          {[1, 2, 3, 4, 5].map(i => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const isFilteredEmpty = filteredStudents.length === 0 && (search || deptFilter !== 'all');
  const isAllEmpty = students.length === 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900">Students</h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1">Manage and view student attendance records</p>
        </div>
        <div className="flex items-center justify-between sm:justify-end gap-3">
          <span className="text-[10px] md:text-xs font-medium text-slate-400 bg-slate-100 px-3 py-1.5 rounded-full shrink-0">
            {filteredStudents.length} students
          </span>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-primary-200 hover:bg-primary-700 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden xs:inline">Add Student</span>
            <span className="xs:hidden">Add</span>
          </button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="space-y-3">
        <div className="flex flex-col xs:flex-row gap-3">
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
            className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all ${showFilters ? 'border-primary-300 bg-primary-50 text-primary-600' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
          >
            <Filter className="h-4 w-4" />
            <span>Filters</span>
            <ChevronDown className={`h-3 w-3 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {showFilters && (
          <div className="flex flex-col xs:flex-row gap-3 animate-slide-in-up">
            <select
              value={deptFilter}
              onChange={e => setDeptFilter(e.target.value)}
              className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none"
            >
              <option value="all">All Departments</option>
              {departments.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as 'name' | 'attendance' | 'department')}
              className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none"
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
                            className={`h-full rounded-full progress-bar ${rate >= 75 ? 'bg-emerald-500' : rate >= 60 ? 'bg-amber-500' : 'bg-red-500'
                              }`}
                            style={{ width: `${rate}%` }}
                          />
                        </div>
                        <span className={`text-xs font-semibold ${rate >= 75 ? 'text-emerald-600' : rate >= 60 ? 'text-amber-600' : 'text-red-600'
                          }`}>
                          {rate}%
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => navigateToStudent(student.id)}
                          className="flex items-center gap-1.5 rounded-lg bg-primary-50 px-3 py-1.5 text-xs font-medium text-primary-600 hover:bg-primary-100 transition-colors"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          View
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm('Are you sure you want to delete this student?')) {
                              deleteStudent(student.id);
                            }
                          }}
                          className="flex items-center justify-center h-8 w-8 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                          title="Delete Student"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {(isFilteredEmpty || isAllEmpty) && (
            <div className="border-t border-slate-50">
              <EmptyState
                icon={isFilteredEmpty ? Filter : Users}
                title={isFilteredEmpty ? "No matching students" : "No students added yet"}
                description={isFilteredEmpty
                  ? "Try adjusting your filters or search terms to find what you're looking for."
                  : "Get started by adding your first student to the system."}
                action={isAllEmpty ? {
                  label: "Add First Student",
                  onClick: () => setIsAddModalOpen(true)
                } : undefined}
              />
            </div>
          )}
        </div>
      </div>

      {/* Add Student Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900">Add New Student</h3>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <form onSubmit={handleAddStudent} className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Full Name</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. John Doe"
                    value={newStudent.name}
                    onChange={e => setNewStudent({ ...newStudent, name: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-500 uppercase">Student ID</label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. STU001"
                      value={newStudent.studentId}
                      onChange={e => setNewStudent({ ...newStudent, studentId: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-500 uppercase">Department</label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. CS"
                      value={newStudent.department}
                      onChange={e => setNewStudent({ ...newStudent, department: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Email Address</label>
                  <input
                    required
                    type="email"
                    placeholder="e.g. john@uni.edu"
                    value={newStudent.email}
                    onChange={e => setNewStudent({ ...newStudent, email: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Semester</label>
                  <input
                    required
                    type="number"
                    min="1"
                    max="8"
                    value={newStudent.semester}
                    onChange={e => setNewStudent({ ...newStudent, semester: parseInt(e.target.value) })}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2.5 rounded-xl bg-primary-600 text-sm font-semibold text-white shadow-lg shadow-primary-200 hover:bg-primary-700 transition-all"
                  >
                    Create Student
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
