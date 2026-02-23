import { useAttendance } from '@/context/AttendanceContext';
import { BookOpen, Users, Clock, TrendingUp } from 'lucide-react';

export function CourseList() {
  const { courses, getCourseAttendanceRate, setCurrentPage, setSelectedCourseId } = useAttendance();

  const handleMarkAttendance = (courseId: string) => {
    setSelectedCourseId(courseId);
    setCurrentPage('mark-attendance');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Courses</h1>
        <p className="text-sm text-slate-500 mt-1">View all courses and their attendance statistics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {courses.map((course, i) => {
          const rate = getCourseAttendanceRate(course.id);
          return (
            <div
              key={course.id}
              className={`animate-slide-in-up stagger-${Math.min(i + 1, 6)} card-hover rounded-2xl bg-white border border-slate-100 shadow-sm overflow-hidden`}
            >
              {/* Color bar */}
              <div className="h-1.5" style={{ background: course.color }} />

              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className="text-xs font-bold text-slate-400 tracking-wider">{course.code}</span>
                    <h3 className="text-sm font-semibold text-slate-900 mt-0.5 leading-snug">{course.name}</h3>
                  </div>
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl shrink-0"
                    style={{ background: `${course.color}15`, color: course.color }}
                  >
                    <BookOpen className="h-5 w-5" />
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Users className="h-3.5 w-3.5" />
                    <span>{course.enrolledStudents.length} students enrolled</span>
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
                    <span className={`text-xs font-bold ${
                      rate >= 75 ? 'text-emerald-600' : rate >= 60 ? 'text-amber-600' : 'text-red-600'
                    }`}>
                      {rate}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full progress-bar transition-all duration-1000 ${
                        rate >= 75 ? 'bg-emerald-500' : rate >= 60 ? 'bg-amber-500' : 'bg-red-500'
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
    </div>
  );
}
