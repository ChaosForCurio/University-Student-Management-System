import { Student, Course, AttendanceRecord } from '@/types';
import { format, subDays } from 'date-fns';

const firstNames = ['James', 'Emma', 'Liam', 'Olivia', 'Noah', 'Ava', 'Ethan', 'Sophia', 'Mason', 'Isabella', 'Lucas', 'Mia', 'Alexander', 'Charlotte', 'Benjamin', 'Amelia', 'Daniel', 'Harper', 'Henry', 'Evelyn', 'Sebastian', 'Abigail', 'Jack', 'Emily', 'Aiden', 'Luna', 'Owen', 'Chloe', 'Samuel', 'Grace'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson'];

const departments = ['Computer Science', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'Electrical Engineering', 'Mechanical Engineering'];

const avatarColors = ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e', '#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6', '#0ea5e9'];

function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('');
}

function generateStudents(): Student[] {
  const students: Student[] = [];
  for (let i = 0; i < 30; i++) {
    const name = `${firstNames[i]} ${lastNames[i]}`;
    students.push({
      id: `STU-${String(i + 1).padStart(3, '0')}`,
      name,
      email: `${firstNames[i].toLowerCase()}.${lastNames[i].toLowerCase()}@university.edu`,
      studentId: `2024${String(Math.floor(Math.random() * 9000) + 1000)}`,
      department: departments[i % departments.length],
      semester: Math.floor(Math.random() * 8) + 1,
      avatar: getInitials(name),
      enrolledCourses: [],
    });
  }
  return students;
}

const courseData = [
  { code: 'CS101', name: 'Introduction to Programming', dept: 'Computer Science', instructor: 'Dr. Alan Turing', schedule: 'Mon, Wed 9:00-10:30', color: '#6366f1' },
  { code: 'CS201', name: 'Data Structures & Algorithms', dept: 'Computer Science', instructor: 'Dr. Ada Lovelace', schedule: 'Tue, Thu 10:00-11:30', color: '#8b5cf6' },
  { code: 'CS301', name: 'Database Systems', dept: 'Computer Science', instructor: 'Dr. Edgar Codd', schedule: 'Mon, Wed 14:00-15:30', color: '#a855f7' },
  { code: 'MATH201', name: 'Linear Algebra', dept: 'Mathematics', instructor: 'Dr. Carl Gauss', schedule: 'Tue, Thu 9:00-10:30', color: '#3b82f6' },
  { code: 'MATH301', name: 'Probability & Statistics', dept: 'Mathematics', instructor: 'Dr. Pierre Laplace', schedule: 'Mon, Fri 11:00-12:30', color: '#0ea5e9' },
  { code: 'PHY101', name: 'Classical Mechanics', dept: 'Physics', instructor: 'Dr. Isaac Newton', schedule: 'Wed, Fri 9:00-10:30', color: '#14b8a6' },
  { code: 'PHY201', name: 'Electromagnetism', dept: 'Physics', instructor: 'Dr. James Maxwell', schedule: 'Tue, Thu 14:00-15:30', color: '#22c55e' },
  { code: 'EE101', name: 'Circuit Analysis', dept: 'Electrical Engineering', instructor: 'Dr. Nikola Tesla', schedule: 'Mon, Wed 10:00-11:30', color: '#f97316' },
  { code: 'EE201', name: 'Digital Electronics', dept: 'Electrical Engineering', instructor: 'Dr. Claude Shannon', schedule: 'Tue, Thu 11:00-12:30', color: '#ef4444' },
  { code: 'BIO101', name: 'Cell Biology', dept: 'Biology', instructor: 'Dr. Charles Darwin', schedule: 'Mon, Fri 14:00-15:30', color: '#22c55e' },
];

function generateCourses(students: Student[]): Course[] {
  const courses: Course[] = courseData.map((c, i) => ({
    id: `CRS-${String(i + 1).padStart(3, '0')}`,
    code: c.code,
    name: c.name,
    department: c.dept,
    instructor: c.instructor,
    schedule: c.schedule,
    totalSessions: Math.floor(Math.random() * 10) + 20,
    enrolledStudents: [],
    color: c.color,
  }));

  // Assign students to courses
  students.forEach(student => {
    const numCourses = Math.floor(Math.random() * 3) + 2;
    const shuffled = [...courses].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, numCourses);
    selected.forEach(course => {
      student.enrolledCourses.push(course.id);
      course.enrolledStudents.push(student.id);
    });
  });

  return courses;
}

function generateAttendanceRecords(_students: Student[], courses: Course[]): AttendanceRecord[] {
  const records: AttendanceRecord[] = [];
  const statuses: Array<'present' | 'absent' | 'late' | 'excused'> = ['present', 'absent', 'late', 'excused'];
  const weights = [0.70, 0.12, 0.10, 0.08];
  let id = 1;

  for (let dayOffset = 0; dayOffset < 30; dayOffset++) {
    const date = format(subDays(new Date(), dayOffset), 'yyyy-MM-dd');
    const dayOfWeek = subDays(new Date(), dayOffset).getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) continue;

    courses.forEach(course => {
      course.enrolledStudents.forEach(studentId => {
        const rand = Math.random();
        let cumulative = 0;
        let status: 'present' | 'absent' | 'late' | 'excused' = 'present';
        for (let i = 0; i < statuses.length; i++) {
          cumulative += weights[i];
          if (rand < cumulative) {
            status = statuses[i];
            break;
          }
        }

        records.push({
          id: `ATT-${String(id++).padStart(5, '0')}`,
          studentId,
          courseId: course.id,
          date,
          status,
          markedAt: `${date}T${String(8 + Math.floor(Math.random() * 8)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}:00`,
        });
      });
    });
  }

  return records;
}

export const students = generateStudents();
export const courses = generateCourses(students);
export const attendanceRecords = generateAttendanceRecords(students, courses);
export { avatarColors };
