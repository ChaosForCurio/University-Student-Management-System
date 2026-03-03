import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAttendance } from '@/context/AttendanceContext';
import { BookOpen, Users, Clock, TrendingUp, Plus, Trash2, X, Edit2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Course } from '@/types';

export function CourseList() {
  const {
    courses,
    getCourseAttendanceRate,
    setSelectedCourseId,
    addCourse,
    deleteCourse,
    updateCourse,
    isLoading
  } = useAttendance();
  const navigate = useNavigate();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<string | null>(null);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

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
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-48 rounded-xl" />
          <Skeleton className="h-10 w-32 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Skeleton key={i} className="h-64 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  const handleMarkAttendance = (courseId: string) => {
    setSelectedCourseId(courseId);
    navigate('/mark-attendance');
  };

  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addCourse(newCourse);
      setIsAddModalOpen(false);
      setNewCourse({ name: '', code: '', instructor: '', schedule: '', department: '', totalSessions: 30 });
      // Toast is handled in context
    } catch (error) {
      // Error is handled in context
    }
  };

  const handleUpdateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourse) return;
    try {
      await updateCourse(editingCourse);
      setIsEditModalOpen(false);
      setEditingCourse(null);
    } catch (error) {
      // Handled in context
    }
  };

  const openDeleteDialog = (id: string) => {
    setCourseToDelete(id);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!courseToDelete) return;
    try {
      await deleteCourse(courseToDelete);
    } catch (error) {
      // Handled in context
    }
  };

  const openEditModal = (course: Course) => {
    setEditingCourse(course);
    setIsEditModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900">Courses</h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1">View all courses and their attendance statistics</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary-200 hover:bg-primary-700 transition-all hover:scale-[1.02] active:scale-[0.98] w-full sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          Add Course
        </button>
      </div>

      {courses.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
          <EmptyState
            icon={BookOpen}
            title="No courses yet"
            description="Start by adding your first course to manage students and track attendance."
            action={{
              label: "Add First Course",
              onClick: () => setIsAddModalOpen(true)
            }}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
          {courses.map((course, i) => {
            const rate = getCourseAttendanceRate(course.id);
            return (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                key={course.id}
                className="card-hover rounded-2xl bg-white border border-slate-100 shadow-sm overflow-hidden group"
              >
                {/* Color bar */}
                <div className="h-1.5" style={{ background: course.color }} />

                <div className="p-4 md:p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0 pr-2">
                      <span className="text-[10px] md:text-xs font-bold text-slate-400 tracking-wider truncate block">{course.code}</span>
                      <h3 className="text-sm font-semibold text-slate-900 mt-0.5 leading-snug truncate">{course.name}</h3>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => openEditModal(course)}
                        className="flex lg:hidden lg:group-hover:flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 text-slate-500 hover:bg-slate-100 transition-colors"
                        title="Edit Course"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => openDeleteDialog(course.id)}
                        className="flex lg:hidden lg:group-hover:flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                        title="Delete Course"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                      <div
                        className="flex h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-xl shrink-0 ml-1"
                        style={{ background: `${course.color}15`, color: course.color }}
                      >
                        <BookOpen className="h-4 w-4 md:h-5 md:w-5" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-[11px] md:text-xs text-slate-500">
                      <Users className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{course.enrolledStudents?.length || 0} students enrolled</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] md:text-xs text-slate-500">
                      <Clock className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{course.schedule}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] md:text-xs text-slate-500">
                      <TrendingUp className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{course.instructor}</span>
                    </div>
                  </div>

                  {/* Attendance Rate */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] md:text-xs text-slate-400">Attendance Rate</span>
                      <span className={`text-[10px] md:text-xs font-bold ${rate >= 75 ? 'text-emerald-600' : rate >= 60 ? 'text-amber-600' : 'text-red-600'
                        }`}>
                        {rate}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 md:h-2 bg-slate-100 rounded-full overflow-hidden">
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
                    <button
                      onClick={() => navigate(`/courses/${course.id}`)}
                      className="flex-1 rounded-xl py-2 text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-100 transition-all hover:bg-slate-100"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Add Course Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            >
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
            </motion.div>
          </div>
        )}

        {/* Edit Course Modal */}
        {isEditModalOpen && editingCourse && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900">Edit Course</h3>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <form onSubmit={handleUpdateCourse} className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Course Name</label>
                  <input
                    required
                    type="text"
                    value={editingCourse.name}
                    onChange={e => setEditingCourse({ ...editingCourse, name: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Department</label>
                  <input
                    required
                    type="text"
                    value={editingCourse.department}
                    onChange={e => setEditingCourse({ ...editingCourse, department: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-500 uppercase">Course Code</label>
                    <input
                      required
                      type="text"
                      value={editingCourse.code}
                      onChange={e => setEditingCourse({ ...editingCourse, code: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-500 uppercase">Total Sessions</label>
                    <input
                      required
                      type="number"
                      min="1"
                      value={editingCourse.totalSessions}
                      onChange={e => setEditingCourse({ ...editingCourse, totalSessions: parseInt(e.target.value) || 0 })}
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
                      value={editingCourse.instructor}
                      onChange={e => setEditingCourse({ ...editingCourse, instructor: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-500 uppercase">Schedule</label>
                    <input
                      required
                      type="text"
                      value={editingCourse.schedule}
                      onChange={e => setEditingCourse({ ...editingCourse, schedule: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
                    />
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2.5 rounded-xl bg-primary-600 text-sm font-semibold text-white shadow-lg shadow-primary-200 hover:bg-primary-700 transition-all"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Course"
        message="Are you sure you want to delete this course? This will also remove all associated attendance records. This action cannot be undone."
        confirmLabel="Delete Course"
      />
    </div>
  );
}
