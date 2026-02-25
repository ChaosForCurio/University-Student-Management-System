import { sql } from '@/lib/db';
import { Student, Course, AttendanceRecord } from '@/types';

export const dbService = {
    // Students
    async getAllStudents(): Promise<Student[]> {
        const result = await sql`
            SELECT s.*, 
                   array_remove(array_agg(e.course_id), NULL) as enrolled_courses
            FROM students s
            LEFT JOIN enrolments e ON s.id = e.student_id
            GROUP BY s.id
        `;

        return result.map(s => ({
            ...s,
            studentId: s.student_id,
            enrolledCourses: s.enrolled_courses || []
        })) as Student[];
    },

    async addStudent(student: Student): Promise<void> {
        await sql`
      INSERT INTO students (id, name, email, student_id, department, semester, avatar)
      VALUES (${student.id}, ${student.name}, ${student.email}, ${student.studentId}, ${student.department}, ${student.semester}, ${student.avatar})
    `;

        if (student.enrolledCourses.length > 0) {
            for (const courseId of student.enrolledCourses) {
                await sql`INSERT INTO enrolments (student_id, course_id) VALUES (${student.id}, ${courseId})`;
            }
        }
    },

    async deleteStudent(id: string): Promise<void> {
        await sql`DELETE FROM students WHERE id = ${id}`;
    },

    async addEnrolment(studentId: string, courseId: string): Promise<void> {
        await sql`INSERT INTO enrolments (student_id, course_id) VALUES (${studentId}, ${courseId}) ON CONFLICT DO NOTHING`;
    },

    async removeEnrolment(studentId: string, courseId: string): Promise<void> {
        await sql`DELETE FROM enrolments WHERE student_id = ${studentId} AND course_id = ${courseId}`;
    },

    // Courses
    async getAllCourses(): Promise<Course[]> {
        const result = await sql`
            SELECT c.*, 
                   array_remove(array_agg(e.student_id), NULL) as enrolled_students
            FROM courses c
            LEFT JOIN enrolments e ON c.id = e.course_id
            GROUP BY c.id
        `;

        return result.map(c => ({
            ...c,
            totalSessions: c.total_sessions,
            enrolledStudents: c.enrolled_students || []
        })) as Course[];
    },

    async addCourse(course: Course, studentIds: string[] = []): Promise<void> {
        await sql`
      INSERT INTO courses (id, code, name, department, instructor, schedule, total_sessions, color)
      VALUES (${course.id}, ${course.code}, ${course.name}, ${course.department}, ${course.instructor}, ${course.schedule}, ${course.totalSessions}, ${course.color})
    `;

        if (studentIds.length > 0) {
            for (const studentId of studentIds) {
                await sql`INSERT INTO enrolments (student_id, course_id) VALUES (${studentId}, ${course.id})`;
            }
        }
    },

    async deleteCourse(id: string): Promise<void> {
        await sql`DELETE FROM courses WHERE id = ${id}`;
    },

    // Attendance Records
    async getAllRecords(): Promise<AttendanceRecord[]> {
        const records = await sql`SELECT * FROM attendance_records`;
        return records.map(r => ({
            ...r,
            studentId: r.student_id,
            courseId: r.course_id,
            markedAt: r.marked_at
        })) as AttendanceRecord[];
    },

    async addRecord(record: AttendanceRecord): Promise<void> {
        await sql`
      INSERT INTO attendance_records (id, student_id, course_id, date, status, marked_at)
      VALUES (${record.id}, ${record.studentId}, ${record.courseId}, ${record.date}, ${record.status}, ${record.markedAt})
    `;
    },

    async bulkAddRecords(records: AttendanceRecord[]): Promise<void> {
        // Neon's simple `sql` tag doesn't easily support bulk inserts with an array of objects
        // for simplicity and reliability, we'll iterate
        for (const record of records) {
            await this.addRecord(record);
        }
    }
};
