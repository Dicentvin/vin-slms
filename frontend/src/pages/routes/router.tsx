import { createBrowserRouter, isRouteErrorResponse, useRouteError } from "react-router";
import Home               from "@/pages/Home";
import Login              from "@/pages/Login";
import Register           from "@/pages/Register";
import PrivateRoutes      from "@/pages/routes/PrivateRoutes";
import Dashboard          from "@/pages/Dashboard";
import AcademicYear       from "@/pages/settings/academic-year";
import UserManagementPage from "@/pages/users";
import Classes            from "@/pages/academics/Classes";
import { Subjects }       from "@/pages/academics/Subjects";
import Timetable          from "@/pages/academics/Timetable";
import Exams              from "@/pages/lms/Exams";
import Exam               from "@/pages/lms/Exam";
import ExamResults        from "@/pages/lms/ExamResults";
import QuizPanel          from "@/pages/lms/QuizPanel";
import Flashcards         from "@/pages/lms/Flashcards";
import StudyHub           from "@/pages/lms/StudyHub";
import StudyDocument      from "@/pages/lms/StudyDocument";
import FeeCollection      from "@/pages/finance/FeeCollection";
import Salary             from "@/pages/finance/Salary";
import Expenses           from "@/pages/finance/Expenses";
import ClassPage          from "@/pages/classes/ClassPage";

// ─── Global Error Boundary ────────────────────────────────────────────────────
function RootErrorBoundary() {
  const error = useRouteError();
  const is404 = isRouteErrorResponse(error) && error.status === 404;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      {/* Background blobs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#3ecf8e] opacity-5 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#3ecf8e] opacity-5 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 text-center max-w-md space-y-6">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-2xl gradient-navy flex items-center justify-center shadow-lg">
            <span className="text-4xl">{is404 ? "🔍" : "⚠️"}</span>
          </div>
        </div>

        {/* Heading */}
        <div>
          <p className="text-[#3ecf8e] font-bold text-sm uppercase tracking-widest mb-2">
            {is404 ? "404 — Page Not Found" : "Something went wrong"}
          </p>
          <h1 className="text-3xl font-extrabold text-foreground">
            {is404 ? "This page doesn't exist." : "An error occurred."}
          </h1>
          <p className="text-muted-foreground text-sm mt-3 leading-relaxed">
            {is404
              ? "The page you're looking for couldn't be found. It may have been moved or the link is incorrect."
              : "An unexpected error occurred. Please try refreshing the page or going back."}
          </p>
        </div>

        {/* Error detail (dev only) */}
        {!is404 && error instanceof Error && (
          <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl p-4 text-left">
            <p className="text-xs font-mono text-red-700 dark:text-red-400 break-all">
              {error.message}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => window.history.back()}
            className="px-6 py-3 rounded-xl border border-border text-foreground font-semibold hover:bg-muted transition-colors text-sm"
          >
            ← Go Back
          </button>
          <a href="/dashboard">
            <button className="px-6 py-3 rounded-xl bg-[#3ecf8e] hover:bg-[#34b27b] text-black font-bold transition-colors text-sm w-full">
              Go to Dashboard
            </button>
          </a>
        </div>

        <p className="text-xs text-muted-foreground">
          Chukwudi Academy Portal
        </p>
      </div>
    </div>
  );
}

// ─── Router ───────────────────────────────────────────────────────────────────
export const router = createBrowserRouter([
  {
    errorElement: <RootErrorBoundary />,
    children: [
      { index: true, element: <Home /> },
      { path: "login",    element: <Login /> },
      { path: "register", element: <Register /> },
      {
        element: <PrivateRoutes />,
        errorElement: <RootErrorBoundary />,
        children: [
          { path: "dashboard",               element: <Dashboard /> },
          { path: "activities-log",          element: <Dashboard /> },
          { path: "settings/academic-years", element: <AcademicYear /> },

          // Users
          { path: "users/students", element: <UserManagementPage role="student" title="Students" description="Manage student directory." /> },
          { path: "users/teachers", element: <UserManagementPage role="teacher" title="Teachers" description="Manage teaching staff." /> },
          { path: "users/parents",  element: <UserManagementPage role="parent"  title="Parents"  description="Manage parents." /> },
          { path: "users/admins",   element: <UserManagementPage role="admin"   title="Admins"   description="Manage admins." /> },

          // Academics
          { path: "classes",   element: <Classes /> },
          { path: "subjects",  element: <Subjects /> },
          { path: "timetable", element: <Timetable /> },

          // ── Class content pages (SS1, SS2, SS3, WAEC, JAMB) ──────
          { path: "classes/SS1",  element: <ClassPage /> },
          { path: "classes/SS2",  element: <ClassPage /> },
          { path: "classes/SS3",  element: <ClassPage /> },
          { path: "classes/WAEC", element: <ClassPage /> },
          { path: "classes/JAMB", element: <ClassPage /> },
          // ─────────────────────────────────────────────────────────

          // LMS / Study Hub
          { path: "lms/study",      element: <StudyHub /> },
          { path: "lms/study/:id",  element: <StudyDocument /> },
          { path: "lms/exams",      element: <Exams /> },
          { path: "lms/exams/:id",  element: <Exam /> },
          { path: "lms/results",    element: <ExamResults /> },
          { path: "lms/quiz",       element: <QuizPanel /> },
          { path: "lms/flashcards", element: <Flashcards /> },

          // Finance
          { path: "finance/fees",     element: <FeeCollection /> },
          { path: "finance/salary",   element: <Salary /> },
          { path: "finance/expenses", element: <Expenses /> },
        ],
      },
    ],
  },
]);
