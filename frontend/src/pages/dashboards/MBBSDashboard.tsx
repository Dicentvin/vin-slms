import { useAuth } from "@/hooks/AuthProvider";
import { useNavigate } from "react-router";
import {
  BookOpen, Brain, FlaskConical, Microscope, Heart, Dna,
  Bug, Droplets, Shield, TestTube2, Baby, Users,
  Stethoscope, Scissors, GraduationCap, ArrowRight,
  FileText, Loader2, Trophy,
} from "lucide-react";
import { useState, useEffect } from "react";
import { lmsDocs, officialExams, type OfficialExam } from "@/services/lmsApi";
import EmailVerificationBanner from "@/components/global/EmailVerificationBanner";

// ── MBBS Courses ──────────────────────────────────────────────────────────────
const MBBS_COURSES = [
  { name: "Anatomy",           icon: BookOpen,     color: "from-red-500 to-rose-600",       bg: "bg-red-50 dark:bg-red-950/30",     border: "border-red-200 dark:border-red-800",     text: "text-red-700 dark:text-red-400" },
  { name: "Embryology",        icon: Dna,          color: "from-pink-500 to-fuchsia-600",   bg: "bg-pink-50 dark:bg-pink-950/30",   border: "border-pink-200 dark:border-pink-800",   text: "text-pink-700 dark:text-pink-400" },
  { name: "Histology",         icon: Microscope,   color: "from-violet-500 to-purple-600",  bg: "bg-violet-50 dark:bg-violet-950/30", border: "border-violet-200 dark:border-violet-800", text: "text-violet-700 dark:text-violet-400" },
  { name: "Biochemistry",      icon: FlaskConical, color: "from-blue-500 to-cyan-600",      bg: "bg-blue-50 dark:bg-blue-950/30",   border: "border-blue-200 dark:border-blue-800",   text: "text-blue-700 dark:text-blue-400" },
  { name: "Physiology",        icon: Heart,        color: "from-[#3ecf8e] to-emerald-600",  bg: "bg-emerald-50 dark:bg-emerald-950/30", border: "border-emerald-200 dark:border-emerald-800", text: "text-emerald-700 dark:text-emerald-400" },
  { name: "Histopathology",    icon: Microscope,   color: "from-amber-500 to-orange-600",   bg: "bg-amber-50 dark:bg-amber-950/30", border: "border-amber-200 dark:border-amber-800", text: "text-amber-700 dark:text-amber-400" },
  { name: "Microbiology",      icon: Bug,          color: "from-lime-500 to-green-600",     bg: "bg-lime-50 dark:bg-lime-950/30",   border: "border-lime-200 dark:border-lime-800",   text: "text-lime-700 dark:text-lime-400" },
  { name: "Hematology",        icon: Droplets,     color: "from-red-600 to-pink-700",       bg: "bg-red-50 dark:bg-red-950/30",     border: "border-red-300 dark:border-red-700",     text: "text-red-800 dark:text-red-300" },
  { name: "Immunology",        icon: Shield,       color: "from-indigo-500 to-blue-600",    bg: "bg-indigo-50 dark:bg-indigo-950/30", border: "border-indigo-200 dark:border-indigo-800", text: "text-indigo-700 dark:text-indigo-400" },
  { name: "Chemical Pathology",icon: TestTube2,    color: "from-teal-500 to-cyan-600",      bg: "bg-teal-50 dark:bg-teal-950/30",   border: "border-teal-200 dark:border-teal-800",   text: "text-teal-700 dark:text-teal-400" },
  { name: "Pediatrics",        icon: Baby,         color: "from-sky-500 to-blue-500",       bg: "bg-sky-50 dark:bg-sky-950/30",     border: "border-sky-200 dark:border-sky-800",     text: "text-sky-700 dark:text-sky-400" },
  { name: "Gynaecology",       icon: Users,        color: "from-fuchsia-500 to-pink-600",   bg: "bg-fuchsia-50 dark:bg-fuchsia-950/30", border: "border-fuchsia-200 dark:border-fuchsia-800", text: "text-fuchsia-700 dark:text-fuchsia-400" },
  { name: "Medicine",          icon: Stethoscope,  color: "from-slate-600 to-slate-700",    bg: "bg-slate-50 dark:bg-slate-900/50", border: "border-slate-200 dark:border-slate-700", text: "text-slate-700 dark:text-slate-300" },
  { name: "Surgery",           icon: Scissors,     color: "from-orange-500 to-red-600",     bg: "bg-orange-50 dark:bg-orange-950/30", border: "border-orange-200 dark:border-orange-800", text: "text-orange-700 dark:text-orange-400" },
];

export default function MBBSDashboard() {
  const { user } = useAuth();
  const navigate  = useNavigate();

  const [exams,        setExams]        = useState<OfficialExam[]>([]);
  const [examsLoading, setExamsLoading] = useState(true);
  const [docCount,     setDocCount]     = useState(0);

  useEffect(() => {
    officialExams.list({ status: "active" })
      .then(r => setExams(r.exams ?? []))
      .catch(() => {})
      .finally(() => setExamsLoading(false));
    lmsDocs.list()
      .then(r => setDocCount((r.documents ?? []).length))
      .catch(() => {});
  }, []);

  const activeExams = exams.filter(e => e.status === "active");
  const firstName   = user?.name?.split(" ")[0] ?? "Student";

  return (
    <div className="flex-1 space-y-6 p-6 page-fade">
      <EmailVerificationBanner />

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 p-6 text-white border border-blue-900/50">
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
        <div className="absolute -right-10 -top-10 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#3ecf8e]/10 rounded-full blur-2xl" />

        <div className="relative z-10 flex items-start justify-between gap-4 flex-wrap">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#3ecf8e] flex items-center justify-center">
                <GraduationCap className="h-4 w-4 text-black" />
              </div>
              <span className="text-xs font-bold text-[#3ecf8e] uppercase tracking-widest">MBBS Portal</span>
            </div>
            <h1 className="text-2xl font-extrabold">
              Welcome back, <span className="text-[#3ecf8e]">{firstName}</span> 👨‍⚕️
            </h1>
            <p className="text-white/60 text-sm max-w-md">
              Your medical school study hub. Browse courses, access materials, and take practice exams.
            </p>
            {user?.className && (
              <span className="inline-block text-xs font-bold px-3 py-1 rounded-full bg-white/10 text-white/80">
                📚 {user.className}
              </span>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Active Exams",  value: examsLoading ? "…" : activeExams.length, color: "text-[#3ecf8e]" },
              { label: "Study Notes",   value: docCount || "—",                           color: "text-blue-400"  },
              { label: "Courses",       value: MBBS_COURSES.length,                       color: "text-amber-400" },
              { label: "Your Level",    value: user?.className || "—",                    color: "text-white"     },
            ].map(s => (
              <div key={s.label} className="bg-white/5 border border-white/10 rounded-xl p-3 text-center min-w-[80px]">
                <p className={`text-xl font-extrabold ${s.color}`}>{s.value}</p>
                <p className="text-[10px] text-white/50 mt-0.5 font-medium">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Active Exams ──────────────────────────────────────────────── */}
      {(examsLoading || activeExams.length > 0) && (
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#3ecf8e] to-emerald-600 flex items-center justify-center">
                <Trophy className="h-3.5 w-3.5 text-white" />
              </div>
              <h3 className="text-sm font-bold text-foreground">Active Exams</h3>
            </div>
            <button onClick={() => navigate("/lms/exams")} className="text-xs text-[#3ecf8e] font-semibold hover:underline flex items-center gap-1">
              View all <ArrowRight className="h-3 w-3" />
            </button>
          </div>
          {examsLoading ? (
            <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-[#3ecf8e]" /></div>
          ) : (
            <div className="space-y-2">
              {activeExams.slice(0, 3).map(exam => (
                <div key={exam._id}
                  onClick={() => navigate(`/student/exam/${exam._id}`)}
                  className="flex items-center gap-3 p-3 rounded-xl border border-border hover:bg-muted/40 cursor-pointer transition-colors group">
                  <div className="w-8 h-8 rounded-lg bg-[#3ecf8e]/10 border border-[#3ecf8e]/30 flex items-center justify-center shrink-0">
                    <FileText className="h-4 w-4 text-[#3ecf8e]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground group-hover:text-[#3ecf8e] truncate">{exam.title}</p>
                    <p className="text-xs text-muted-foreground">{exam.subject} · {exam.duration} min · {exam.totalMarks} marks</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-[#3ecf8e] shrink-0" />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Course Grid ───────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Brain className="h-5 w-5 text-[#3ecf8e]" />
          <h2 className="text-lg font-extrabold text-foreground">MBBS Courses</h2>
          <span className="text-xs text-muted-foreground ml-1">— tap to browse study materials</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {MBBS_COURSES.map(course => {
            const Icon = course.icon;
            return (
              <button
                key={course.name}
                onClick={() => navigate(`/lms/study?subject=${encodeURIComponent(course.name)}`)}
                className={`group flex flex-col items-center gap-3 p-4 rounded-2xl border-2 ${course.bg} ${course.border} hover:shadow-md transition-all text-left hover:scale-[1.02] active:scale-[0.98]`}
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${course.color} flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div className="text-center">
                  <p className={`text-xs font-extrabold leading-tight ${course.text}`}>{course.name}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Quick actions ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { label: "Browse Notes",    icon: BookOpen,    color: "bg-blue-500",    action: () => navigate("/lms/study")     },
          { label: "Practice Exams",  icon: FileText,    color: "bg-[#3ecf8e]",   action: () => navigate("/lms/exams")    },
          { label: "My Results",      icon: Trophy,      color: "bg-purple-500",  action: () => navigate("/lms/results")  },
        ].map(a => {
          const Icon = a.icon;
          return (
            <button
              key={a.label}
              onClick={a.action}
              className="flex items-center gap-3 p-4 rounded-2xl border border-border bg-card hover:bg-muted/40 transition-colors group"
            >
              <div className={`w-10 h-10 rounded-xl ${a.color} flex items-center justify-center shrink-0`}>
                <Icon className="h-5 w-5 text-white" />
              </div>
              <span className="font-semibold text-sm text-foreground group-hover:text-[#3ecf8e] transition-colors">{a.label}</span>
              <ArrowRight className="h-4 w-4 text-muted-foreground ml-auto group-hover:text-[#3ecf8e]" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
