import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { Student, Course, AttendanceRecord, Page } from '@/types';
import { students as initialStudents, courses as initialCourses, attendanceRecords as initialRecords } from '@/data/mockData';
import { format } from 'date-fns';

interface AttendanceContextType {
  students: Student[];
  courses: Course[];
  records: AttendanceRecord[];
  currentPage: Page;
  selectedStudentId: string | null;
  selectedCourseId: string | null;
  setCurrentPage: (page: Page) => void;
  setSelectedStudentId: (id: string | null) => void;
  setSelectedCourseId: (id: string | null) => void;
  markAttendance: (studentId: string, courseId: string, date: string, status: AttendanceRecord['status']) => void;
  bulkMarkAttendance: (courseId: string, date: string, attendanceMap: Record<string, AttendanceRecord['status']>) => void;
  getStudentAttendance: (studentId: string, courseId?: string) => AttendanceRecord[];
  getCourseAttendance: (courseId: string, date?: string) => AttendanceRecord[];
  getAttendanceRate: (studentId: string, courseId?: string) => number;
  getCourseAttendanceRate: (courseId: string) => number;
  navigateToStudent: (studentId: string) => void;
}

const AttendanceContext = createContext<AttendanceContextType | null>(null);

export function AttendanceProvider({ children }: { children: ReactNode }) {
  const [students] = useState<Student[]>(initialStudents);
  const [courses] = useState<Course[]>(initialCourses);
  const [records, setRecords] = useState<AttendanceRecord[]>(initialRecords);
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

  const markAttendance = useCallback((studentId: string, courseId: string, date: string, status: AttendanceRecord['status']) => {
    setRecords(prev => {
      const existing = prev.findIndex(r => r.studentId === studentId && r.courseId === courseId && r.date === date);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = { ...updated[existing], status, markedAt: new Date().toISOString() };
        return updated;
      }
      return [...prev, {
        id: `ATT-${String(prev.length + 1).padStart(5, '0')}`,
        studentId,
        courseId,
        date,
        status,
        markedAt: new Date().toISOString(),
      }];
    });
  }, []);

  const bulkMarkAttendance = useCallback((courseId: string, date: string, attendanceMap: Record<string, AttendanceRecord['status']>) => {
    Object.entries(attendanceMap).forEach(([studentId, status]) => {
      markAttendance(studentId, courseId, date, status);
    });
  }, [markAttendance]);

  const getStudentAttendance = useCallback((studentId: string, courseId?: string) => {
    return records.filter(r => r.studentId === studentId && (!courseId || r.courseId === courseId));
  }, [records]);

  const getCourseAttendance = useCallback((courseId: string, date?: string) => {
    return records.filter(r => r.courseId === courseId && (!date || r.date === date));
  }, [records]);

  const getAttendanceRate = useCallback((studentId: string, courseId?: string) => {
    const studentRecords = records.filter(r => r.studentId === studentId && (!courseId || r.courseId === courseId));
    if (studentRecords.length === 0) return 0;
    const present = studentRecords.filter(r => r.status === 'present' || r.status === 'late').length;
    return Math.round((present / studentRecords.length) * 100);
  }, [records]);

  const getCourseAttendanceRate = useCallback((courseId: string) => {
    const courseRecords = records.filter(r => r.courseId === courseId);
    if (courseRecords.length === 0) return 0;
    const present = courseRecords.filter(r => r.status === 'present' || r.status === 'late').length;
    return Math.round((present / courseRecords.length) * 100);
  }, [records]);

  const navigateToStudent = useCallback((studentId: string) => {
    setSelectedStudentId(studentId);
    setCurrentPage('student-detail');
  }, []);

  const today = format(new Date(), 'yyyy-MM-dd');
  void today;

  return (
    <AttendanceContext.Provider value={{
      students,
      courses,
      records,
      currentPage,
      selectedStudentId,
      selectedCourseId,
      setCurrentPage,
      setSelectedStudentId,
      setSelectedCourseId,
      markAttendance,
      bulkMarkAttendance,
      getStudentAttendance,
      getCourseAttendance,
      getAttendanceRate,
      getCourseAttendanceRate,
      navigateToStudent,
    }}>
      {children}
    </AttendanceContext.Provider>
  );
}

export function useAttendance() {
  const context = useContext(AttendanceContext);
  if (!context) throw new Error('useAttendance must be used within AttendanceProvider');
  return context;
}
