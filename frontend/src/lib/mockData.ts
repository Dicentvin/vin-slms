import type { user, Class, subject, academicYear, exam } from "@/types";

export const mockYears: academicYear[] = [
  {
    _id: "y1",
    name: "2024-2025",
    fromYear: new Date("2024-09-01"),
    toYear: new Date("2025-06-30"),
    isCurrent: true,
  },
  {
    _id: "y2",
    name: "2023-2024",
    fromYear: new Date("2023-09-01"),
    toYear: new Date("2024-06-30"),
    isCurrent: false,
  },
];

// ─── Subjects (SS Science stream) ───────────────────────────────────────────
export const mockSubjects: subject[] = [
  { _id: "s1", name: "Mathematics", code: "MATH-101", isActive: true },
  { _id: "s2", name: "English",     code: "ENG-101",  isActive: true },
  { _id: "s3", name: "Physics",     code: "PHY-201",  isActive: true },
  { _id: "s4", name: "Chemistry",   code: "CHEM-301", isActive: true },
  { _id: "s5", name: "Biology",     code: "BIO-101",  isActive: true },
];

const SS_SUBJECTS = mockSubjects; // all 5 assigned to every class

// ─── Teachers ───────────────────────────────────────────────────────────────
export const mockTeachers: user[] = [
  {
    _id: "t1",
    name: "Mr. James Johnson",
    email: "johnson@school.edu",
    role: "teacher",
    teacherSubjects: [mockSubjects[0], mockSubjects[2]], // Maths & Physics
  },
  {
    _id: "t2",
    name: "Ms. Sarah Williams",
    email: "williams@school.edu",
    role: "teacher",
    teacherSubjects: [mockSubjects[3], mockSubjects[4]], // Chemistry & Biology
  },
  {
    _id: "t3",
    name: "Mr. Robert Davis",
    email: "davis@school.edu",
    role: "teacher",
    teacherSubjects: [mockSubjects[1]], // English
  },
];

// ─── Classes: SS1, SS2, SS3 ─────────────────────────────────────────────────
export const mockClasses: Class[] = [
  {
    _id: "c1",
    name: "SS1",
    academicYear: mockYears[0],
    classTeacher: mockTeachers[0],
    subjects: SS_SUBJECTS,
    students: [],
    capacity: 45,
  },
  {
    _id: "c2",
    name: "SS2",
    academicYear: mockYears[0],
    classTeacher: mockTeachers[1],
    subjects: SS_SUBJECTS,
    students: [],
    capacity: 45,
  },
  {
    _id: "c3",
    name: "SS3",
    academicYear: mockYears[0],
    classTeacher: mockTeachers[2],
    subjects: SS_SUBJECTS,
    students: [],
    capacity: 45,
  },
];

// ─── Students ────────────────────────────────────────────────────────────────
export const mockStudents: user[] = [
  { _id: "st1",  name: "Alice Johnson",   email: "alice@school.edu",   role: "student", studentClass: mockClasses[0] },
  { _id: "st2",  name: "Bob Martinez",    email: "bob@school.edu",     role: "student", studentClass: mockClasses[0] },
  { _id: "st3",  name: "Carol White",     email: "carol@school.edu",   role: "student", studentClass: mockClasses[0] },
  { _id: "st4",  name: "David Lee",       email: "david@school.edu",   role: "student", studentClass: mockClasses[0] },
  { _id: "st5",  name: "Eva Brown",       email: "eva@school.edu",     role: "student", studentClass: mockClasses[1] },
  { _id: "st6",  name: "Frank Wilson",    email: "frank@school.edu",   role: "student", studentClass: mockClasses[1] },
  { _id: "st7",  name: "Grace Taylor",    email: "grace@school.edu",   role: "student", studentClass: mockClasses[1] },
  { _id: "st8",  name: "Henry Anderson",  email: "henry@school.edu",   role: "student", studentClass: mockClasses[1] },
  { _id: "st9",  name: "Iris Thomas",     email: "iris@school.edu",    role: "student", studentClass: mockClasses[2] },
  { _id: "st10", name: "Jack Jackson",    email: "jack@school.edu",    role: "student", studentClass: mockClasses[2] },
  { _id: "st11", name: "Karen Harris",    email: "karen@school.edu",   role: "student", studentClass: mockClasses[2] },
  { _id: "st12", name: "Liam Martin",     email: "liam@school.edu",    role: "student", studentClass: mockClasses[2] },
];

// ─── Parents ─────────────────────────────────────────────────────────────────
export const mockParents: user[] = [
  { _id: "p1", name: "Mr. Johnson Sr.", email: "johnsonsr@gmail.com", role: "parent" },
  { _id: "p2", name: "Mrs. Martinez",   email: "martinez@gmail.com",  role: "parent" },
  { _id: "p3", name: "Mr. White",       email: "white@gmail.com",     role: "parent" },
];

// ─── Admins ──────────────────────────────────────────────────────────────────
export const mockAdmins: user[] = [
  { _id: "a1", name: "Admin User",     email: "admin@school.edu", role: "admin" },
  { _id: "a2", name: "Vice Principal", email: "vice@school.edu",  role: "admin" },
];

// ─── Exams ───────────────────────────────────────────────────────────────────
export const mockExams: exam[] = [
  {
    _id: "e1",
    title: "Mathematics Mid-Term",
    subject: mockSubjects[0],
    class: mockClasses[0],
    teacher: mockTeachers[0],
    duration: 60,
    questions: [],
    dueDate: new Date("2025-05-10"),
    isActive: true,
  },
  {
    _id: "e2",
    title: "Physics Quiz — Newton's Laws",
    subject: mockSubjects[2],
    class: mockClasses[1],
    teacher: mockTeachers[0],
    duration: 30,
    questions: [],
    dueDate: new Date("2025-05-12"),
    isActive: true,
  },
  {
    _id: "e3",
    title: "Chemistry End-of-Term",
    subject: mockSubjects[3],
    class: mockClasses[2],
    teacher: mockTeachers[1],
    duration: 90,
    questions: [],
    dueDate: new Date("2025-05-20"),
    isActive: true,
  },
  {
    _id: "e4",
    title: "Biology — Cell Structure",
    subject: mockSubjects[4],
    class: mockClasses[0],
    teacher: mockTeachers[1],
    duration: 45,
    questions: [],
    dueDate: new Date("2025-05-15"),
    isActive: false,
  },
];

// ─── Dashboard stats ─────────────────────────────────────────────────────────
export const mockDashboardStats = {
  totalStudents: 135,
  totalTeachers: 3,
  avgAttendance: "89%",
  activeExams: 3,
  recentActivity: [
    "Alice Johnson enrolled in SS1",
    "Mr. Johnson updated Mathematics Mid-Term",
    "Timetable generated for SS3",
    "Academic year 2024-2025 set as active",
    "Biology subject assigned to Ms. Williams",
  ],
};
