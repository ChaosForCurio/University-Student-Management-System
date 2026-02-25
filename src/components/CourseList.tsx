import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAttendance } from '@/context/AttendanceContext';
import { BookOpen, Users, Clock, TrendingUp, Plus, Trash2, X } from 'lucide-react';

export function CourseList() {
  const { courses, getCourseAttendanceRate, setSelectedCourseId, addCourse, deleteCourse, isLoading } = useAttendance();
  const navigate = useNavigate();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newCourse, setNewCourse] = useState({
    name: '',
    code: '',
    instructor: '',
    schedule: '',
    department: '',
    totalSessions: 30,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
          <p className="text-slate-500 font-medium animate-pulse">Loading courses...</p>
        </div>
      </div>
    );
  }

  const handleMarkAttendance = (courseId: string) => {
    setSelectedCourseId(courseId);
    navigate('/mark-attendance');
  };

  const handleAddCourse = (e: React.FormEvent) => {
    e.preventDefault();
    addCourse(newCourse);
    setIsAddModalOpen(false);
    setNewCourse({ name: '', code: '', instructor: '', schedule: '', department: '', totalSessions: 30 });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Courses</h1>
          <p className="text-sm text-slate-500 mt-1">View all courses and their attendance statistics</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary-200 hover:bg-primary-700 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" />
          Add Course
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {courses.map((course, i) => {
          const rate = getCourseAttendanceRate(course.id);
          return (
            <div
              key={course.id}
              className={`animate-slide-in-up stagger-${Math.min(i + 1, 6)} card-hover rounded-2xl bg-white border border-slate-100 shadow-sm overflow-hidden group`}
            >
              {/* Color bar */}
              <div className="h-1.5" style={{ background: course.color }} />

              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className="text-xs font-bold text-slate-400 tracking-wider">{course.code}</span>
                    <h3 className="text-sm font-semibold text-slate-900 mt-0.5 leading-snug">{course.name}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete this course?')) {
                          deleteCourse(course.id);
                        }
                      }}
                      className="hidden group-hover:flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                      title="Delete Course"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-xl shrink-0"
                      style={{ background: `${course.color}15`, color: course.color }}
                    >
                      <BookOpen className="h-5 w-5" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Users className="h-3.5 w-3.5" />
                    <span>{course.enrolledStudents?.length || 0} students enrolled</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{course.schedule}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <TrendingUp className="h-3.5 w-3.5" />
                    <span>{course.instructor}</span>
                  </div>
                </div>

                {/* Attendance Rate */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-slate-400">Attendance Rate</span>
                    <span className={`text-xs font-bold ${rate >= 75 ? 'text-emerald-600' : rate >= 60 ? 'text-amber-600' : 'text-red-600'
                      }`}>
                      {rate}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full progress-bar transition-all duration-1000 ${rate >= 75 ? 'bg-emerald-500' : rate >= 60 ? 'bg-amber-500' : 'bg-red-500'
                        }`}
                      style={{ width: `${rate}%` }}
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleMarkAttendance(course.id)}
                    className="flex-1 rounded-xl py-2 text-xs font-semibold text-white transition-all hover:opacity-90 shadow-sm"
                    style={{ background: course.color }}
                  >
                    Mark Attendance
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Course Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-in">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">Add New Course</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleAddCourse} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase">Course Name</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Data Structures"
                  value={newCourse.name}
                  onChange={e => setNewCourse({ ...newCourse, name: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase">Department</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Computer Science"
                  value={newCourse.department}
                  onChange={e => setNewCourse({ ...newCourse, department: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Course Code</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. CS101"
                    value={newCourse.code}
                    onChange={e => setNewCourse({ ...newCourse, code: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Total Sessions</label>
                  <input
                    required
                    type="number"
                    min="1"
                    value={newCourse.totalSessions}
                    onChange={e => setNewCourse({ ...newCourse, totalSessions: parseInt(e.target.value) || 0 })}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Instructor</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Dr. Smith"
                    value={newCourse.instructor}
                    onChange={e => setNewCourse({ ...newCourse, instructor: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Schedule</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Mon, Wed"
                    value={newCourse.schedule}
                    onChange={e => setNewCourse({ ...newCourse, schedule: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
                  />
                </div>
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
                  Create Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
