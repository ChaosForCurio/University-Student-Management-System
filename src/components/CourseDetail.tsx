import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAttendance } from '@/context/AttendanceContext';
import {
    BookOpen, Users, Clock, TrendingUp, ChevronLeft,
    Search, Plus, X, UserMinus, CheckCircle2, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';

export function CourseDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const {
        courses, students, getCourseAttendanceRate, enrollStudentInCourse,
        unenrollStudentFromCourse, isLoading, setSelectedCourseId
    } = useAttendance();

    const [searchTerm, setSearchTerm] = useState('');
    const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);

    const course = useMemo(() => courses.find(c => c.id === id), [courses, id]);

    const enrolledStudents = useMemo(() => {
        if (!course) return [];
        return students.filter(s => course.enrolledStudents.includes(s.id));
    }, [course, students]);

    const availableStudents = useMemo(() => {
        if (!course) return [];
        return students.filter(s => !course.enrolledStudents.includes(s.id));
    }, [course, students]);

    const filteredAvailableStudents = useMemo(() => {
        return availableStudents.filter(s =>
            s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.studentId.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [availableStudents, searchTerm]);

    if (isLoading) {
        return (
            <div className="space-y-6 animate-fade-in">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-10 w-10 rounded-xl" />
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-8 w-48" />
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Skeleton className="h-96 w-full rounded-2xl" />
                    <Skeleton className="lg:col-span-2 h-96 w-full rounded-2xl" />
                </div>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
                <div className="h-16 w-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mb-4">
                    <AlertCircle className="h-8 w-8" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">Course Not Found</h2>
                <p className="text-slate-500 mt-2 max-w-md">
                    The course you're looking for doesn't exist or has been removed.
                </p>
                <button
                    onClick={() => navigate('/courses')}
                    className="mt-6 flex items-center gap-2 px-6 py-2.5 bg-slate-100 text-slate-600 font-semibold rounded-xl hover:bg-slate-200 transition-all"
                >
                    <ChevronLeft className="h-4 w-4" />
                    Back to Courses
                </button>
            </div>
        );
    }

    const attendanceRate = getCourseAttendanceRate(course.id);

    const handleEnroll = async (studentId: string) => {
        await enrollStudentInCourse(studentId, course.id);
    };

    const handleUnenroll = async (studentId: string) => {
        if (window.confirm('Are you sure you want to unenroll this student?')) {
            await unenrollStudentFromCourse(studentId, course.id);
        }
    };

    const handleMarkAttendance = () => {
        setSelectedCourseId(course.id);
        navigate('/mark-attendance');
    };

    return (
        <div className="space-y-6 animate-fade-in pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/courses')}
                        className="h-10 w-10 flex items-center justify-center rounded-xl bg-white border border-slate-100 shadow-sm text-slate-500 hover:text-primary-600 hover:border-primary-100 transition-all"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </button>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-400 tracking-wider uppercase">{course.code}</span>
                            <span className="h-1 w-1 rounded-full bg-slate-300" />
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: `${course.color}15`, color: course.color }}>
                                {course.department}
                            </span>
                        </div>
                        <h1 className="text-xl md:text-2xl font-bold text-slate-900 mt-0.5">{course.name}</h1>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleMarkAttendance}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary-200 hover:bg-primary-700 transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                        <CheckCircle2 className="h-4 w-4" />
                        Mark Attendance
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Course Info Card */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                        <div className="h-2" style={{ background: course.color }} />
                        <div className="p-6">
                            <h3 className="text-lg font-bold text-slate-900 mb-4">Course Overview</h3>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-500 shrink-0">
                                        <TrendingUp className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Instructor</p>
                                        <p className="text-sm font-semibold text-slate-700">{course.instructor}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-500 shrink-0">
                                        <Clock className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Schedule</p>
                                        <p className="text-sm font-semibold text-slate-700">{course.schedule}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-500 shrink-0">
                                        <Users className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Total Sessions</p>
                                        <p className="text-sm font-semibold text-slate-700">{course.totalSessions} sessions planned</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 pt-6 border-t border-slate-50">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-bold text-slate-900">Overall Attendance</span>
                                    <span className={`text-sm font-bold ${attendanceRate >= 75 ? 'text-emerald-600' : attendanceRate >= 60 ? 'text-amber-600' : 'text-red-600'}`}>
                                        {attendanceRate}%
                                    </span>
                                </div>
                                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${attendanceRate}%` }}
                                        transition={{ duration: 1, ease: "easeOut" }}
                                        className={`h-full rounded-full ${attendanceRate >= 75 ? 'bg-emerald-500' : attendanceRate >= 60 ? 'bg-amber-500' : 'bg-red-500'}`}
                                    />
                                </div>
                                <p className="text-[10px] text-slate-400 mt-2 text-center uppercase font-bold tracking-wider">
                                    Target: 75% for exam eligibility
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Enrolled Students List */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">Enrolled Students</h2>
                            <p className="text-xs text-slate-500">{enrolledStudents.length} students currently enrolled</p>
                        </div>
                        <button
                            onClick={() => setIsAddStudentOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-primary-50 text-primary-600 hover:bg-primary-100 font-semibold text-sm rounded-xl transition-all"
                        >
                            <Plus className="h-4 w-4" />
                            Enroll Student
                        </button>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                        {enrolledStudents.length === 0 ? (
                            <div className="p-6">
                                <EmptyState
                                    icon={Users}
                                    title="No students enrolled"
                                    description="Add students to this course to start tracking their attendance and monitoring performance."
                                    action={{
                                        label: "Enroll First Student",
                                        onClick: () => setIsAddStudentOpen(true)
                                    }}
                                />
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-slate-50">
                                            <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Student</th>
                                            <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider hidden sm:table-cell">ID</th>
                                            <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Department</th>
                                            <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {enrolledStudents.map((student) => (
                                            <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div
                                                            className="flex h-8 w-8 items-center justify-center rounded-full text-white text-[10px] font-bold shrink-0"
                                                            style={{ background: '#6366f1' }}
                                                        >
                                                            {student.avatar}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-sm font-semibold text-slate-900 truncate">{student.name}</p>
                                                            <p className="text-[10px] text-slate-400 truncate sm:hidden">{student.studentId}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 hidden sm:table-cell">
                                                    <span className="text-xs font-medium text-slate-600">{student.studentId}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-xs font-medium text-slate-600">{student.department}</span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button
                                                        onClick={() => handleUnenroll(student.id)}
                                                        className="h-8 w-8 inline-flex items-center justify-center rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
                                                        title="Unenroll student"
                                                    >
                                                        <UserMinus className="h-4 w-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Enroll Student Drawer/Side Panel */}
            <AnimatePresence>
                {isAddStudentOpen && (
                    <div className="fixed inset-0 z-[70] flex justify-end">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsAddStudentOpen(false)}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col"
                        >
                            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900">Enroll Students</h3>
                                    <p className="text-xs text-slate-500">Search and add students to {course.name}</p>
                                </div>
                                <button
                                    onClick={() => setIsAddStudentOpen(false)}
                                    className="h-10 w-10 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-400 transition-colors"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="p-6 space-y-6 flex-1 overflow-y-auto">
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="Search by name or ID..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full bg-slate-50 border-none rounded-2xl py-3 pl-11 pr-4 text-sm focus:ring-2 focus:ring-primary-100 outline-none transition-all"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">Available Students</h4>
                                    {filteredAvailableStudents.length === 0 ? (
                                        <div className="p-8 text-center text-slate-400">
                                            <Users className="h-8 w-8 mx-auto mb-3 opacity-20" />
                                            <p className="text-xs">No students found</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            {filteredAvailableStudents.map(student => (
                                                <div
                                                    key={student.id}
                                                    className="flex items-center justify-between p-3 rounded-2xl border border-slate-50 hover:border-primary-100 hover:bg-primary-50/30 transition-all group"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div
                                                            className="flex h-10 w-10 items-center justify-center rounded-full text-white text-xs font-bold shrink-0"
                                                            style={{ background: '#6366f1' }}
                                                        >
                                                            {student.avatar}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-semibold text-slate-900">{student.name}</p>
                                                            <p className="text-[10px] text-slate-500">{student.studentId} • {student.department}</p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => handleEnroll(student.id)}
                                                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-white border border-slate-100 text-primary-600 shadow-sm hover:bg-primary-600 hover:text-white hover:border-primary-600 transition-all"
                                                    >
                                                        <Plus className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
