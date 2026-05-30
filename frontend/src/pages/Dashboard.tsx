import { useAuth }          from "@/hooks/AuthProvider";
import StudentDashboard     from "./dashboards/StudentDashboard";
import TeacherDashboard     from "./dashboards/TeacherDashboard";
import AdminDashboard       from "./dashboards/AdminDashboard";
import ParentDashboard      from "./dashboards/ParentDashboard";
import MBBSDashboard        from "./dashboards/MBBSDashboard";

export default function Dashboard() {
  const { user } = useAuth();

  switch (user?.role) {
    case "teacher": return <TeacherDashboard />;
    case "admin":   return <AdminDashboard />;
    case "parent":  return <ParentDashboard />;
    case "mbbs":    return <MBBSDashboard />;
    default:        return <StudentDashboard />;
  }
}
