export interface Student {
  id: string;
  name: string;
  email: string;
  studentId: string;
  department: string;
  semester: number;
  avatar: string;
  enrolledCourses: string[];
}

export interface Course {
  id: string;
  code: string;
  name: string;
  department: string;
  instructor: string;
  schedule: string;
  totalSessions: number;
  enrolledStudents: string[];
  color: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  courseId: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  markedAt: string;
}

export type Page = 'dashboard' | 'students' | 'courses' | 'mark-attendance' | 'reports' | 'student-detail';

export interface AttendanceStats {
  totalStudents: number;
  totalCourses: number;
  averageAttendance: number;
  todayPresent: number;
  todayAbsent: number;
  todayLate: number;
}
