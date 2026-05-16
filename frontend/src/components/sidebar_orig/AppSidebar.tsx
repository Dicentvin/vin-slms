"use client";

import {
  Settings2, School, GraduationCap, Users,
  LayoutDashboard, Banknote, LogOut, type LucideIcon,
} from "lucide-react";

import { NavMain } from "@/components/sidebar/nav-main";
import { NavUser } from "@/components/sidebar/nav-user";
import { TeamSwitcher } from "@/components/sidebar/team-switcher";
import {
  Sidebar, SidebarContent, SidebarFooter,
  SidebarHeader, SidebarMenuItem, SidebarRail, useSidebar,
} from "@/components/ui/sidebar";
import type { UserRole } from "@/types";
import { useLocation, useNavigate } from "react-router";
import { useAuth } from "@/hooks/AuthProvider";
import { useMemo } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ThemeToogle } from "./ThemeToogle";

export interface NavItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  isActive?: boolean;
  roles?: UserRole[];
  items?: { title: string; url: string; roles?: UserRole[] }[];
}

export const sidebardata = {
  teams: [{ name: "Springfield High", logo: School }],
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
      isActive: true,
      roles: ["admin", "teacher", "student", "parent"],
      items: [
        { title: "Dashboard", url: "/dashboard", roles: ["admin", "teacher", "student", "parent"] },
        { title: "Activities Log", url: "/activies-log", roles: ["admin"] },
      ],
    },
    {
      title: "Academics",
      url: "#",
      icon: School,
      roles: ["admin", "teacher", "student", "parent"],
      items: [
        { title: "Classes", url: "/classes", roles: ["admin", "teacher"] },
        { title: "Subjects", url: "/subjects", roles: ["admin", "teacher"] },
        { title: "Timetable", url: "/timetable" },
        { title: "Attendance", url: "/attendance" },
      ],
    },
    {
      title: "Learning (LMS)",
      url: "#",
      icon: GraduationCap,
      roles: ["teacher", "student", "admin"],
      items: [
        { title: "Assignments", url: "/lms/assignments" },
        { title: "Exams", url: "/lms/exams" },
        { title: "Exam Results", url: "/lms/results" },
        // ✅ Removed role restriction — visible to all LMS roles
        { title: "Quiz Panel", url: "/lms/quiz" },
        { title: "Flashcards", url: "/lms/flashcards" },
        { title: "Study Materials", url: "/lms/materials" },
      ],
    },
    {
      title: "People",
      url: "#",
      icon: Users,
      roles: ["admin", "teacher"],
      items: [
        { title: "Students", url: "/users/students" },
        { title: "Teachers", url: "/users/teachers", roles: ["admin"] },
        { title: "Parents", url: "/users/parents", roles: ["admin"] },
        { title: "Admins", url: "/users/admins", roles: ["admin"] },
      ],
    },
    {
      title: "Finance",
      url: "#",
      icon: Banknote,
      roles: ["admin"],
      items: [
        { title: "Fee Collection", url: "/finance/fees" },
        { title: "Expenses", url: "/finance/expenses" },
        { title: "Salary", url: "/finance/salary" },
      ],
    },
    {
      title: "System",
      url: "#",
      icon: Settings2,
      roles: ["admin"],
      items: [
        { title: "School Settings", url: "/settings/general" },
        { title: "Academic Years", url: "/settings/academic-years" },
        { title: "Roles & Permissions", url: "/settings/roles" },
      ],
    },
  ] as NavItem[],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, year, setUser } = useAuth();
  const location = useLocation();
  const pathname = location.pathname;
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const navigate = useNavigate();

  const userData = {
    name: user?.name || "User",
    email: user?.email || "",
    avatar: "",
  };

  const userRole = (user?.role || "student") as UserRole;

  const filteredNav = useMemo(() => {
    return sidebardata.navMain
      .filter((item) => !item.roles || item.roles.includes(userRole))
      .map((item) => {
        const isChildActive = item.items?.some((sub) => sub.url === pathname);
        const isMainActive = item.url === pathname;
        return {
          ...item,
          isActive: isMainActive || isChildActive,
          items: item.items
            ?.filter((subItem) => !subItem.roles || subItem.roles.includes(userRole))
            .map((subItem) => ({ ...subItem, isActive: subItem.url === pathname })),
        };
      });
  }, [pathname, userRole]);

  const logout = async () => {
    try {
      await api.post("/users/logout").finally(() => {
        setUser(null);
        navigate("/login");
        toast.success("Logged out successfully");
      });
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Logout failed. Please try again.");
    }
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={sidebardata.teams} yearName={year?.name!} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={filteredNav} />
      </SidebarContent>
      <SidebarFooter>
        <div className={cn("gap-2", isCollapsed ? "flex-row space-y-2" : "flex justify-between")}>
          <SidebarMenuItem title="Logout">
            <Button onClick={logout} variant={"ghost"} size={"icon" as any}>
              <LogOut />
            </Button>
          </SidebarMenuItem>
          <ThemeToogle />
        </div>
        <NavUser user={userData} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}