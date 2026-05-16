/**
 * api.ts
 *
 * The school management side (classes, subjects, users, exams, timetable)
 * still uses the mock API since that backend is not built yet.
 *
 * The LMS/Study Hub side uses the real lms-backend via lmsApi.ts.
 *
 * When you are ready to connect the school management backend,
 * set USE_MOCK = false and point VITE_API_URL to it.
 */
import { mockApi } from "./mockApi";

const USE_MOCK = true;

let api: typeof mockApi;

if (USE_MOCK) {
  api = mockApi;
} else {
  // Replace with real axios instance when backend is ready
  const axios = await import("axios");
  api = axios.default.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
    withCredentials: true,
  }) as any;
}

export { api };
