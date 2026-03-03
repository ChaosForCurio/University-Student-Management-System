import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Student, Course, AttendanceRecord, Page } from '@/types';
import { dbService } from '@/services/db.service';
import toast from 'react-hot-toast';

interface AttendanceContextType {
  students: Student[];
  courses: Course[];
  records: AttendanceRecord[];
  currentPage: Page;
  selectedStudentId: string | null;
  selectedCourseId: string | null;
  isLoading: boolean;
  setCurrentPage: (page: Page) => void;
  setSelectedStudentId: (id: string | null) => void;
  setSelectedCourseId: (id: string | null) => void;
  markAttendance: (studentId: string, courseId: string, date: string, status: AttendanceRecord['status']) => Promise<void>;
  bulkMarkAttendance: (courseId: string, date: string, attendanceMap: Record<string, AttendanceRecord['status']>) => Promise<void>;
  getStudentAttendance: (studentId: string, courseId?: string) => AttendanceRecord[];
  getCourseAttendance: (courseId: string, date?: string) => AttendanceRecord[];
  getAttendanceRate: (studentId: string, courseId?: string) => number;
  getCourseAttendanceRate: (courseId: string) => number;
  navigateToStudent: (studentId: string) => void;
  addStudent: (student: Omit<Student, 'id' | 'avatar' | 'enrolledCourses'>) => Promise<void>;
  deleteStudent: (studentId: string) => Promise<void>;
  updateStudent: (student: Student) => Promise<void>;
  addCourse: (course: Omit<Course, 'id' | 'enrolledStudents' | 'color'>) => Promise<void>;
  deleteCourse: (courseId: string) => Promise<void>;
  updateCourse: (course: Course) => Promise<void>;
  enrollStudentInCourse: (studentId: string, courseId: string) => Promise<void>;
  unenrollStudentFromCourse: (studentId: string, courseId: string) => Promise<void>;
  refreshData: () => Promise<void>;
  error: string | null;
  clearError: () => void;
}

const AttendanceContext = createContext<AttendanceContextType | null>(null);

export function AttendanceProvider({ children }: { children: ReactNode }) {
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const clearError = useCallback(() => setError(null), []);

  const refreshData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [dbStudents, dbCourses, dbRecords] = await Promise.all([
        dbService.getAllStudents(),
        dbService.getAllCourses(),
        dbService.getAllRecords(),
      ]);
      setStudents(dbStudents);
      setCourses(dbCourses);
      setRecords(dbRecords);
    } catch (err) {
      console.error('Failed to fetch data from Neon DB:', err);
      const msg = err instanceof Error ? err.message : 'Failed to load data from the database. Please check your connection.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const addStudent = useCallback(async (newStudent: Omit<Student, 'id' | 'avatar' | 'enrolledCourses'>) => {
    // Find matching courses for auto-enrollment
    const matchingCourses = courses.filter(
      c => c.department.toLowerCase().trim() === newStudent.department.toLowerCase().trim()
    );

    // More robust ID generation
    const lastNum = students.reduce((max, s) => {
      const num = parseInt(s.id.split('-')[1]);
      return num > max ? num : max;
    }, 0);

    const studentWithId: Student = {
      ...newStudent,
      id: `S-${String(lastNum + 1).padStart(5, '0')}`,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${newStudent.name}`,
      enrolledCourses: matchingCourses.map(c => c.id)
    };

    try {
      await dbService.addStudent(studentWithId);
      setStudents(prev => [...prev, studentWithId]);
      toast.success('Student added successfully!');

      // Update courses local state to reflect new enrollment
      if (matchingCourses.length > 0) {
        setCourses(prevCourses => prevCourses.map(course => {
          if (matchingCourses.some(mc => mc.id === course.id)) {
            return {
              ...course,
              enrolledStudents: [...(course.enrolledStudents || []), studentWithId.id]
            };
          }
          return course;
        }));
      }
    } catch (err) {
      console.error('Failed to add student:', err);
      const msg = err instanceof Error ? err.message : 'Unknown database error';
      setError(`Failed to add student: ${msg}`);
      toast.error('Failed to add student.');
    }
  }, [students, courses]);

  const deleteStudent = useCallback(async (studentId: string) => {
    try {
      await dbService.deleteStudent(studentId);
      setStudents(prev => prev.filter(s => s.id !== studentId));
      setRecords(prev => prev.filter(r => r.studentId !== studentId));
      // Also update courses local state
      setCourses(prev => prev.map(c => ({
        ...c,
        enrolledStudents: c.enrolledStudents.filter(id => id !== studentId)
      })));
      toast.success('Student deleted successfully');
    } catch (err) {
      console.error('Failed to delete student:', err);
      setError('Failed to delete student from the database.');
      toast.error('Failed to delete student.');
    }
  }, []);

  const updateStudent = useCallback(async (updatedStudent: Student) => {
    try {
      await dbService.updateStudent(updatedStudent);
      setStudents(prev => prev.map(s => s.id === updatedStudent.id ? updatedStudent : s));
      toast.success('Student updated successfully');
    } catch (err) {
      console.error('Failed to update student:', err);
      setError('Failed to update student in the database.');
      toast.error('Failed to update student.');
    }
  }, []);

  const addCourse = useCallback(async (newCourse: Omit<Course, 'id' | 'enrolledStudents' | 'color'>) => {
    // Find matching students for auto-enrollment
    const matchingStudents = students.filter(
      s => s.department.toLowerCase().trim() === newCourse.department.toLowerCase().trim()
    );

    // More robust ID generation
    const lastNum = courses.reduce((max, c) => {
      const num = parseInt(c.id.split('-')[1]);
      return num > max ? num : max;
    }, 0);

    const colors = ['indigo', 'blue', 'rose', 'amber', 'emerald'];
    const courseWithId: Course = {
      ...newCourse,
      id: `C-${String(lastNum + 1).padStart(5, '0')}`,
      enrolledStudents: matchingStudents.map(s => s.id),
      color: colors[courses.length % colors.length]
    };

    try {
      await dbService.addCourse(courseWithId, matchingStudents.map(s => s.id));
      setCourses(prev => [...prev, courseWithId]);
      toast.success('Course added successfully!');

      // Update students local state to reflect new enrollment
      if (matchingStudents.length > 0) {
        setStudents(prevStudents => prevStudents.map(student => {
          if (matchingStudents.some(ms => ms.id === student.id)) {
            return {
              ...student,
              enrolledCourses: [...(student.enrolledCourses || []), courseWithId.id]
            };
          }
          return student;
        }));
      }
    } catch (err) {
      console.error('Failed to add course:', err);
      const msg = err instanceof Error ? err.message : 'Unknown database error';
      setError(`Failed to add course: ${msg}. Check if the course code already exists.`);
      toast.error('Failed to add course.');
    }
  }, [courses, students]);

  const deleteCourse = useCallback(async (courseId: string) => {
    try {
      await dbService.deleteCourse(courseId);
      setCourses(prev => prev.filter(c => c.id !== courseId));
      setRecords(prev => prev.filter(r => r.courseId !== courseId));
      toast.success('Course deleted successfully');
    } catch (err) {
      console.error('Failed to delete course:', err);
      setError('Failed to delete course from the database.');
      toast.error('Failed to delete course.');
    }
  }, []);

  const updateCourse = useCallback(async (updatedCourse: Course) => {
    try {
      await dbService.updateCourse(updatedCourse);
      setCourses(prev => prev.map(c => c.id === updatedCourse.id ? updatedCourse : c));
      toast.success('Course updated successfully');
    } catch (err) {
      console.error('Failed to update course:', err);
      setError('Failed to update course in the database.');
      toast.error('Failed to update course.');
    }
  }, []);

  const enrollStudentInCourse = useCallback(async (studentId: string, courseId: string) => {
    try {
      await dbService.addEnrolment(studentId, courseId);
      setStudents(prev => prev.map(s => {
        if (s.id === studentId) {
          return { ...s, enrolledCourses: [...(s.enrolledCourses || []), courseId] };
        }
        return s;
      }));
      setCourses(prev => prev.map(c => {
        if (c.id === courseId) {
          return { ...c, enrolledStudents: [...(c.enrolledStudents || []), studentId] };
        }
        return c;
      }));
      toast.success('Student enrolled successfully');
    } catch (err) {
      console.error('Failed to enroll student:', err);
      setError('Failed to enroll student in the course.');
      toast.error('Failed to enroll student.');
    }
  }, []);

  const unenrollStudentFromCourse = useCallback(async (studentId: string, courseId: string) => {
    try {
      await dbService.removeEnrolment(studentId, courseId);
      setStudents(prev => prev.map(s => {
        if (s.id === studentId) {
          return { ...s, enrolledCourses: (s.enrolledCourses || []).filter(id => id !== courseId) };
        }
        return s;
      }));
      setCourses(prev => prev.map(c => {
        if (c.id === courseId) {
          return { ...c, enrolledStudents: (c.enrolledStudents || []).filter(id => id !== studentId) };
        }
        return c;
      }));
      toast.success('Student unenrolled successfully');
    } catch (err) {
      console.error('Failed to unenroll student:', err);
      setError('Failed to unenroll student from the course.');
      toast.error('Failed to unenroll student.');
    }
  }, []);


  const markAttendance = useCallback(async (studentId: string, courseId: string, date: string, status: AttendanceRecord['status']) => {
    const newRecord: AttendanceRecord = {
      id: `ATT-${String(records.length + 1).padStart(5, '0')}`,
      studentId,
      courseId,
      date,
      status,
      markedAt: new Date().toISOString(),
    };

    try {
      await dbService.addRecord(newRecord);
      setRecords(prev => {
        const existing = prev.findIndex(r => r.studentId === studentId && r.courseId === courseId && r.date === date);
        if (existing >= 0) {
          const updated = [...prev];
          updated[existing] = { ...updated[existing], status, markedAt: newRecord.markedAt };
          return updated;
        }
        return [...prev, newRecord];
      });
      toast.success(`Attendance marked as ${status}`);
    } catch (err) {
      console.error('Failed to mark attendance:', err);
      setError('Failed to save attendance record.');
      toast.error('Failed to mark attendance.');
    }
  }, [records.length]);

  const bulkMarkAttendance = useCallback(async (courseId: string, date: string, attendanceMap: Record<string, AttendanceRecord['status']>) => {
    const newRecords = Object.entries(attendanceMap).map(([studentId, status], index) => ({
      id: `ATT-${String(records.length + index + 1).padStart(5, '0')}`,
      studentId,
      courseId,
      date,
      status,
      markedAt: new Date().toISOString(),
    }));

    try {
      await dbService.bulkAddRecords(newRecords);
      setRecords(prev => [...prev, ...newRecords]);
      toast.success(`Marked attendance for ${newRecords.length} students`);
    } catch (err) {
      console.error('Failed bulk attendance mark:', err);
      setError('Failed to save bulk attendance records.');
      toast.error('Failed to save bulk attendance.');
    }
  }, [records.length]);

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
    navigate(`/students/${studentId}`);
  }, [navigate]);

  return (
    <AttendanceContext.Provider value={{
      students,
      courses,
      records,
      currentPage,
      selectedStudentId,
      selectedCourseId,
      isLoading,
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
      addStudent,
      deleteStudent,
      updateStudent,
      addCourse,
      deleteCourse,
      updateCourse,
      enrollStudentInCourse,
      unenrollStudentFromCourse,
      refreshData,
      error,
      clearError,
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
