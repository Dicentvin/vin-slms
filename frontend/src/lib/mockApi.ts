import {
  mockStudents,
  mockTeachers,
  mockParents,
  mockAdmins,
  mockClasses,
  mockSubjects,
  mockYears,
  mockExams,
  mockDashboardStats,
} from "./mockData";

const delay = (ms = 300) => new Promise((res) => setTimeout(res, ms));

export const mockApi = {
  get: async (url: string) => {
    await delay();

    if (url.includes("/users/profile")) {
      return { data: { user: mockAdmins[0] } };
    }
    if (url.includes("/academic-years/current")) {
      return { data: mockYears[0] };
    }
    if (url.includes("/academic-years")) {
      return {
        data: {
          years: mockYears,
          pagination: { total: mockYears.length, page: 1, pages: 1, limit: 10 },
        },
      };
    }
    if (url.includes("/users") && url.includes("role=student")) {
      return {
        data: {
          users: mockStudents,
          pagination: { total: mockStudents.length, page: 1, pages: 1, limit: 10 },
        },
      };
    }
    if (url.includes("/users") && url.includes("role=teacher")) {
      return {
        data: {
          users: mockTeachers,
          pagination: { total: mockTeachers.length, page: 1, pages: 1, limit: 10 },
        },
      };
    }
    if (url.includes("/users") && url.includes("role=parent")) {
      return {
        data: {
          users: mockParents,
          pagination: { total: mockParents.length, page: 1, pages: 1, limit: 10 },
        },
      };
    }
    if (url.includes("/users") && url.includes("role=admin")) {
      return {
        data: {
          users: mockAdmins,
          pagination: { total: mockAdmins.length, page: 1, pages: 1, limit: 10 },
        },
      };
    }
    if (url.includes("/classes")) {
      return {
        data: {
          classes: mockClasses,
          pagination: { total: mockClasses.length, page: 1, pages: 1, limit: 10 },
        },
      };
    }
    if (url.includes("/subjects")) {
      return {
        data: {
          subjects: mockSubjects,
          pagination: { total: mockSubjects.length, page: 1, pages: 1, limit: 10 },
        },
      };
    }
    if (url.includes("/exams") && !url.match(/\/exams\/[^/]+/)) {
      return {
        data: {
          exams: mockExams,
          pagination: { total: mockExams.length, page: 1, pages: 1, limit: 10 },
        },
      };
    }
    if (url.match(/\/exams\/[^/]+/)) {
      const id = url.split("/exams/")[1];
      const exam = mockExams.find((e) => e._id === id) ?? mockExams[0];
      return { data: { exam } };
    }
    if (url.includes("/dashboard/stats")) {
      return { data: mockDashboardStats };
    }
    if (url.includes("/timetable")) {
      return { data: { timetable: [] } };
    }

    return { data: {} };
  },

  post: async (url: string, body?: unknown) => {
    await delay();
    console.log("Mock POST", url, body);
    return { data: { success: true } };
  },

  put: async (url: string, body?: unknown) => {
    await delay();
    console.log("Mock PUT", url, body);
    return { data: { success: true } };
  },

  delete: async (url: string) => {
    await delay();
    console.log("Mock DELETE", url);
    return { data: { success: true } };
  },
};
