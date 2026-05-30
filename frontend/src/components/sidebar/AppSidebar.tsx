"use client";
import {
  Settings2, School, GraduationCap, Users, LayoutDashboard,
  Banknote, LogOut, BookMarked, FileText, Trophy, ClipboardList,
  BookOpen, Calendar, Menu, Stethoscope, FlaskConical, Brain,
  type LucideIcon,
} from "lucide-react";
import { NavMain }      from "@/components/sidebar/nav-main";
import { NavUser }      from "@/components/sidebar/nav-user";
import { TeamSwitcher } from "@/components/sidebar/team-switcher";
import {
  Sidebar, SidebarContent, SidebarFooter,
  SidebarHeader, SidebarMenuItem, SidebarRail,
  SidebarTrigger, useSidebar,
} from "@/components/ui/sidebar";
import type { UserRole } from "@/types";
import { useLocation, useNavigate } from "react-router";
import { useAuth }  from "@/hooks/AuthProvider";
import { useMemo }  from "react";
import { toast }    from "sonner";
import { cn }       from "@/lib/utils";
import { Button }   from "@/components/ui/button";
import { ThemeToogle } from "./ThemeToogle";

export interface NavItem {
  title: string; url: string; icon?: LucideIcon;
  isActive?: boolean; roles?: UserRole[];
  items?: { title: string; url: string; roles?: UserRole[] }[];
}

// All 5 classes — SS1 first
const CLASS_ITEMS = [
  { title: "SS1",  url: "/classes/SS1"  },
  { title: "SS2",  url: "/classes/SS2"  },
  { title: "SS3",  url: "/classes/SS3"  },
  { title: "WAEC", url: "/classes/WAEC" },
  { title: "JAMB", url: "/classes/JAMB" },
];

const studentNav: NavItem[] = [
  {
    title: "Dashboard", url: "/dashboard", icon: LayoutDashboard,
    items: [{ title: "My Dashboard", url: "/dashboard" }],
  },
  { title: "Classes", url: "#", icon: School, items: CLASS_ITEMS },
  {
    title: "My Study Notes", url: "/lms/study", icon: BookMarked,
    items: [
      { title: "All Notes",   url: "/lms/study"              },
      { title: "Upload Note", url: "/lms/study?upload=true"  },
    ],
  },
  {
    title: "Exams", url: "/lms/exams", icon: FileText,
    items: [{ title: "My Exams", url: "/lms/exams" }],
  },
  {
    title: "Exam Results", url: "/lms/results", icon: Trophy,
    items: [{ title: "View Results", url: "/lms/results" }],
  },
  {
    title: "Test", url: "#", icon: ClipboardList,
    items: [
      { title: "Flashcards", url: "/lms/flashcards" },
      { title: "Quiz Panel", url: "/lms/quiz"       },
    ],
  },
];

const teacherNav: NavItem[] = [
  {
    title: "Dashboard", url: "/dashboard", icon: LayoutDashboard,
    items: [{ title: "My Dashboard", url: "/dashboard" }],
  },
  { title: "Classes", url: "#", icon: School, items: CLASS_ITEMS },
  {
    title: "Study Materials", url: "/lms/study", icon: BookMarked,
    items: [
      { title: "All Materials",   url: "/lms/study"              },
      { title: "Upload Material", url: "/lms/study?upload=true"  },
    ],
  },
  {
    title: "Exams", url: "#", icon: FileText,
    items: [
      { title: "All Exams",    url: "/lms/exams"   },
      { title: "Exam Results", url: "/lms/results" },
    ],
  },
  {
    title: "Test Tools", url: "#", icon: ClipboardList,
    items: [
      { title: "Flashcards", url: "/lms/flashcards" },
      { title: "Quiz Panel", url: "/lms/quiz"       },
    ],
  },
  {
    title: "Students", url: "/users/students", icon: Users,
    items: [{ title: "My Students", url: "/users/students" }],
  },
  {
    title: "Timetable", url: "/timetable", icon: Calendar,
    items: [{ title: "View Timetable", url: "/timetable" }],
  },
];

const adminNav: NavItem[] = [
  {
    title: "Dashboard", url: "/dashboard", icon: LayoutDashboard,
    items: [{ title: "Overview", url: "/dashboard" }],
  },
  {
    title: "Academics", url: "#", icon: School,
    items: [
      { title: "Classes",   url: "/classes"   },
      { title: "SS1",       url: "/classes/SS1"  },
      { title: "SS2",       url: "/classes/SS2"  },
      { title: "SS3",       url: "/classes/SS3"  },
      { title: "WAEC",      url: "/classes/WAEC" },
      { title: "JAMB",      url: "/classes/JAMB" },
      { title: "Subjects",  url: "/subjects"  },
      { title: "Timetable", url: "/timetable" },
    ],
  },
  {
    title: "Study Hub (AI)", url: "/lms/study", icon: BookMarked,
    items: [
      { title: "All Documents", url: "/lms/study"   },
      { title: "Exams",         url: "/lms/exams"   },
      { title: "Exam Results",  url: "/lms/results" },
    ],
  },
  {
    title: "Test Tools", url: "#", icon: ClipboardList,
    items: [
      { title: "Flashcards", url: "/lms/flashcards" },
      { title: "Quiz Panel", url: "/lms/quiz"       },
    ],
  },
  {
    title: "People", url: "#", icon: Users,
    items: [
      { title: "Students", url: "/users/students" },
      { title: "Teachers", url: "/users/teachers" },
      { title: "Parents",  url: "/users/parents"  },
      { title: "Admins",   url: "/users/admins"   },
    ],
  },
  {
    title: "Finance", url: "#", icon: Banknote,
    items: [
      { title: "Fee Collection", url: "/finance/fees"     },
      { title: "Expenses",       url: "/finance/expenses" },
      { title: "Salary",         url: "/finance/salary"   },
    ],
  },
  {
    title: "System", url: "#", icon: Settings2,
    items: [{ title: "Academic Years", url: "/settings/academic-years" }],
  },
];

const parentNav: NavItem[] = [
  {
    title: "Dashboard", url: "/dashboard", icon: LayoutDashboard,
    items: [{ title: "Overview", url: "/dashboard" }],
  },
  { title: "Classes", url: "#", icon: School, items: CLASS_ITEMS },
  {
    title: "Academics", url: "#", icon: GraduationCap,
    items: [
      { title: "Timetable",    url: "/timetable"   },
      { title: "Exams",        url: "/lms/exams"   },
      { title: "Results",      url: "/lms/results" },
    ],
  },
  {
    title: "Study Materials", url: "/lms/study", icon: BookOpen,
    items: [{ title: "View Materials", url: "/lms/study" }],
  },
];

const candidateNav: NavItem[] = [
  {
    title: "Exam Portal", url: "/candidate", icon: ClipboardList,
    items: [{ title: "My Exams", url: "/candidate" }],
  },
  {
    title: "By Class", url: "#", icon: School,
    items: [
      { title: "SS1 Exams",  url: "/candidate?class=SS1"  },
      { title: "SS2 Exams",  url: "/candidate?class=SS2"  },
      { title: "SS3 Exams",  url: "/candidate?class=SS3"  },
      { title: "WAEC Exams", url: "/candidate?class=WAEC" },
      { title: "JAMB Exams", url: "/candidate?class=JAMB" },
    ],
  },
  {
    title: "By Term", url: "#", icon: Calendar,
    items: [
      { title: "First Term",  url: "/candidate?term=first"  },
      { title: "Second Term", url: "/candidate?term=second" },
      { title: "Third Term",  url: "/candidate?term=third"  },
    ],
  },
  {
    title: "Exam Results", url: "/lms/results", icon: Trophy,
    items: [{ title: "My Results", url: "/lms/results" }],
  },
];

// ─── MBBS Nav ────────────────────────────────────────────────────────────────
const MBBS_COURSES = [
  "Anatomy", "Embryology", "Histology", "Biochemistry", "Physiology",
  "Histopathology", "Microbiology", "Hematology", "Immunology",
  "Chemical Pathology", "Pediatrics", "Gynaecology", "Medicine", "Surgery",
];

const mbbsNav: NavItem[] = [
  {
    title: "Dashboard", url: "/dashboard", icon: LayoutDashboard,
    items: [{ title: "MBBS Dashboard", url: "/dashboard" }],
  },
  {
    title: "Courses", url: "#", icon: Brain,
    items: MBBS_COURSES.map(c => ({
      title: c,
      url: `/lms/study?subject=${encodeURIComponent(c)}`,
    })),
  },
  {
    title: "Study Materials", url: "/lms/study", icon: BookMarked,
    items: [
      { title: "All Notes",    url: "/lms/study"             },
      { title: "Upload Note",  url: "/lms/study?upload=true" },
    ],
  },
  {
    title: "Exams", url: "/lms/exams", icon: FileText,
    items: [{ title: "My Exams", url: "/lms/exams" }],
  },
  {
    title: "Exam Results", url: "/lms/results", icon: Trophy,
    items: [{ title: "View Results", url: "/lms/results" }],
  },
  {
    title: "Test Tools", url: "#", icon: ClipboardList,
    items: [
      { title: "Flashcards", url: "/lms/flashcards" },
      { title: "Quiz Panel", url: "/lms/quiz"       },
    ],
  },
  {
    title: "Clinical Hub", url: "#", icon: Stethoscope,
    items: [
      { title: "Case Studies",   url: "/lms/study?subject=Clinical+Cases" },
      { title: "Drug Reference", url: "/lms/study?subject=Pharmacology"   },
      { title: "Lab Values",     url: "/lms/study?subject=Lab+Reference"  },
    ],
  },
];

function getNavByRole(role: string): NavItem[] {
  switch (role) {
    case "teacher":   return teacherNav;
    case "admin":     return adminNav;
    case "parent":    return parentNav;
    case "candidate": return candidateNav;
    case "mbbs":      return mbbsNav;
    default:          return studentNav;
  }
}

const ROLE_LABEL: Record<string, string> = {
  student:   "Student Portal",
  teacher:   "Teacher Portal",
  admin:     "Admin Portal",
  parent:    "Parent Portal",
  candidate: "Exam Portal",
  mbbs:      "MBBS Portal",
};

// ─── Mobile top bar (shown only on mobile) ────────────────────────────────────
export function MobileHeader() {
  const { toggleSidebar } = useSidebar();
  const { user } = useAuth();

  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-background sticky top-0 z-40 lg:hidden">
      <div className="flex items-center gap-2">
        <div className="bg-[#3ecf8e] p-1.5 rounded-lg">
          <GraduationCap className="text-black w-5 h-5" />
        </div>
        <div className="flex flex-col leading-none">
          <span className="font-extrabold text-sm tracking-tight text-foreground">CHUKWUDI</span>
          <span className="text-[9px] font-bold tracking-[0.2em] text-[#3ecf8e] -mt-0.5">ACADEMY</span>
        </div>
      </div>
      <button
        onClick={toggleSidebar}
        className="w-9 h-9 flex items-center justify-center rounded-lg border border-border hover:bg-muted transition-colors"
      >
        <Menu className="w-5 h-5 text-foreground" />
      </button>
    </div>
  );
}

// ─── Main sidebar ─────────────────────────────────────────────────────────────
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, year, logout } = useAuth();
  const location   = useLocation();
  const pathname   = location.pathname + location.search;
  const { state, isMobile, setOpenMobile } = useSidebar();
  const isCollapsed = state === "collapsed" && !isMobile;
  const navigate   = useNavigate();
  const userRole   = user?.role || "student";

  const navItems = useMemo(() => {
    return getNavByRole(userRole).map(item => {
      const isChildActive = item.items?.some(
        sub => sub.url !== "#" && pathname.startsWith(sub.url.split("?")[0])
      );
      const isMainActive = item.url !== "#" && pathname.startsWith(item.url.split("?")[0]);
      return {
        ...item,
        isActive: isMainActive || !!isChildActive,
        items: item.items?.map(sub => ({
          ...sub,
          isActive:
            sub.url !== "#" &&
            (pathname === sub.url || pathname.startsWith(sub.url.split("?")[0] + "?")),
        })),
      };
    });
  }, [pathname, userRole]);

  const handleLogout = () => {
    logout();
    navigate("/login");
    toast.success("Logged out successfully");
  };

  const handleNavClick = () => {
    // Close mobile sidebar when navigating
    if (isMobile) setOpenMobile(false);
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      {/* ── Header ─────────────────────────────────────────── */}
      <SidebarHeader className="border-b border-sidebar-border pb-2">
        <TeamSwitcher
          teams={[{ name: "Chukwudi Academy", logo: School }]}
          yearName={year?.name ?? "2024-2025"}
        />
        {!isCollapsed && (
          <div className="px-3 pb-1 flex items-center justify-between">
            <span className="text-[10px] font-extrabold text-sidebar-primary uppercase tracking-widest">
              {ROLE_LABEL[userRole] ?? "Portal"}
            </span>
            {/* Desktop collapse toggle */}
            <SidebarTrigger className="hidden lg:flex h-6 w-6 text-sidebar-foreground/50 hover:text-sidebar-foreground" />
          </div>
        )}
      </SidebarHeader>

      {/* ── Scrollable nav ─────────────────────────────────── */}
      <SidebarContent
        className="overflow-y-auto overflow-x-hidden flex-1"
        style={{ scrollbarWidth: "thin", scrollbarColor: "hsl(var(--sidebar-border)) transparent" }}
      >
        <NavMain items={navItems} onNavigate={handleNavClick} />
      </SidebarContent>

      {/* ── Footer ─────────────────────────────────────────── */}
      <SidebarFooter className="border-t border-sidebar-border pt-2">
        <div className={cn(
          "flex items-center gap-1 px-1",
          isCollapsed ? "flex-col" : "flex-row justify-between"
        )}>
          <SidebarMenuItem title="Logout" className="list-none">
            <Button
              onClick={handleLogout}
              variant="ghost" size="icon"
              className="h-8 w-8 text-sidebar-foreground hover:text-red-400 hover:bg-red-500/10"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </SidebarMenuItem>
          <ThemeToogle />
        </div>
        <NavUser user={{ name: user?.name || "User", email: user?.email || "", avatar: "" }} />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
