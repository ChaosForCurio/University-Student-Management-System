import { sql } from '@/lib/db';
import { Student, Course, AttendanceRecord } from '@/types';

export const dbService = {
    // Students
    async getAllStudents(): Promise<Student[]> {
        try {
            const result = await sql`
                SELECT s.*, 
                       array_remove(array_agg(e.course_id), NULL) as enrolled_courses
                FROM students s
                LEFT JOIN enrolments e ON s.id = e.student_id
                GROUP BY s.id
            `;

            return result.map(s => ({
                id: s.id,
                name: s.name,
                email: s.email,
                studentId: s.student_id,
                department: s.department,
                semester: s.semester,
                avatar: s.avatar,
                enrolledCourses: s.enrolled_courses || []
            })) as Student[];
        } catch (error) {
            console.error('Error in getAllStudents:', error);
            throw new Error('Could not fetch students from the database.');
        }
    },

    async addStudent(student: Student): Promise<void> {
        try {
            await sql`
                INSERT INTO students (id, name, email, student_id, department, semester, avatar)
                VALUES (${student.id}, ${student.name}, ${student.email}, ${student.studentId}, ${student.department}, ${student.semester}, ${student.avatar})
            `;

            if (student.enrolledCourses.length > 0) {
                for (const courseId of student.enrolledCourses) {
                    await sql`INSERT INTO enrolments (student_id, course_id) VALUES (${student.id}, ${courseId})`;
                }
            }
        } catch (error) {
            console.error('Error in addStudent:', error);
            throw new Error('Could not add student to the database. Check if Student ID or Email already exists.');
        }
    },

    async deleteStudent(id: string): Promise<void> {
        try {
            await sql`DELETE FROM students WHERE id = ${id}`;
        } catch (error) {
            console.error('Error in deleteStudent:', error);
            throw new Error('Could not delete student from the database.');
        }
    },

    async updateStudent(student: Student): Promise<void> {
        try {
            await sql`
                UPDATE students 
                SET name = ${student.name}, 
                    email = ${student.email}, 
                    student_id = ${student.studentId}, 
                    department = ${student.department}, 
                    semester = ${student.semester}, 
                    avatar = ${student.avatar}
                WHERE id = ${student.id}
            `;
        } catch (error) {
            console.error('Error in updateStudent:', error);
            throw new Error('Could not update student in the database.');
        }
    },

    async addEnrolment(studentId: string, courseId: string): Promise<void> {
        try {
            await sql`INSERT INTO enrolments (student_id, course_id) VALUES (${studentId}, ${courseId}) ON CONFLICT DO NOTHING`;
        } catch (error) {
            console.error('Error in addEnrolment:', error);
            throw new Error('Could not enroll student in course.');
        }
    },

    async removeEnrolment(studentId: string, courseId: string): Promise<void> {
        try {
            await sql`DELETE FROM enrolments WHERE student_id = ${studentId} AND course_id = ${courseId}`;
        } catch (error) {
            console.error('Error in removeEnrolment:', error);
            throw new Error('Could not remove student from course.');
        }
    },

    // Courses
    async getAllCourses(): Promise<Course[]> {
        try {
            const result = await sql`
                SELECT c.*, 
                       array_remove(array_agg(e.student_id), NULL) as enrolled_students
                FROM courses c
                LEFT JOIN enrolments e ON c.id = e.course_id
                GROUP BY c.id
            `;

            return result.map(c => ({
                id: c.id,
                code: c.code,
                name: c.name,
                department: c.department,
                instructor: c.instructor,
                schedule: c.schedule,
                totalSessions: c.total_sessions,
                color: c.color,
                enrolledStudents: c.enrolled_students || []
            })) as Course[];
        } catch (error) {
            console.error('Error in getAllCourses:', error);
            throw new Error('Could not fetch courses from the database.');
        }
    },

    async addCourse(course: Course, studentIds: string[] = []): Promise<void> {
        try {
            await sql`
                INSERT INTO courses (id, code, name, department, instructor, schedule, total_sessions, color)
                VALUES (${course.id}, ${course.code}, ${course.name}, ${course.department}, ${course.instructor}, ${course.schedule}, ${course.totalSessions}, ${course.color})
            `;

            if (studentIds.length > 0) {
                for (const studentId of studentIds) {
                    await sql`INSERT INTO enrolments (student_id, course_id) VALUES (${studentId}, ${course.id})`;
                }
            }
        } catch (error) {
            console.error('Error in addCourse:', error);
            throw new Error('Could not add course to the database. Check if course code already exists.');
        }
    },

    async deleteCourse(id: string): Promise<void> {
        try {
            await sql`DELETE FROM courses WHERE id = ${id}`;
        } catch (error) {
            console.error('Error in deleteCourse:', error);
            throw new Error('Could not delete course from the database.');
        }
    },

    async updateCourse(course: Course): Promise<void> {
        try {
            await sql`
                UPDATE courses 
                SET code = ${course.code}, 
                    name = ${course.name}, 
                    department = ${course.department}, 
                    instructor = ${course.instructor}, 
                    schedule = ${course.schedule}, 
                    total_sessions = ${course.totalSessions}, 
                    color = ${course.color}
                WHERE id = ${course.id}
            `;
        } catch (error) {
            console.error('Error in updateCourse:', error);
            throw new Error('Could not update course in the database.');
        }
    },

    // Attendance Records
    async getAllRecords(): Promise<AttendanceRecord[]> {
        try {
            const records = await sql`SELECT * FROM attendance_records`;
            return records.map(r => ({
                id: r.id,
                studentId: r.student_id,
                courseId: r.course_id,
                date: r.date,
                status: r.status,
                markedAt: r.marked_at
            })) as AttendanceRecord[];
        } catch (error) {
            console.error('Error in getAllRecords:', error);
            throw new Error('Could not fetch attendance records from the database.');
        }
    },

    async addRecord(record: AttendanceRecord): Promise<void> {
        try {
            await sql`
                INSERT INTO attendance_records (id, student_id, course_id, date, status, marked_at)
                VALUES (${record.id}, ${record.studentId}, ${record.courseId}, ${record.date}, ${record.status}, ${record.markedAt})
            `;
        } catch (error) {
            console.error('Error in addRecord:', error);
            throw new Error('Could not add attendance record to the database.');
        }
    },

    async bulkAddRecords(records: AttendanceRecord[]): Promise<void> {
        try {
            for (const record of records) {
                await this.addRecord(record);
            }
        } catch (error) {
            console.error('Error in bulkAddRecords:', error);
            throw new Error('Could not add bulk attendance records. Some records might have been saved.');
        }
    }
};
