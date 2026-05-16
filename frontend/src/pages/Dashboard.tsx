import { useAuth }          from "@/hooks/AuthProvider";
import StudentDashboard     from "./dashboards/StudentDashboard";
import TeacherDashboard     from "./dashboards/TeacherDashboard";
import AdminDashboard       from "./dashboards/AdminDashboard";
import ParentDashboard      from "./dashboards/ParentDashboard";

export default function Dashboard() {
  const { user } = useAuth();

  switch (user?.role) {
    case "teacher": return <TeacherDashboard />;
    case "admin":   return <AdminDashboard />;
    case "parent":  return <ParentDashboard />;
    default:        return <StudentDashboard />;
  }
}
