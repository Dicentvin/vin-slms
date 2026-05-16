import { useNavigate } from "react-router";
import { useAuth } from "@/hooks/AuthProvider";
import {
  BookOpen, FileText, Trophy, Calendar,
  ArrowRight, GraduationCap, Clock, Users,
} from "lucide-react";

const CLASS_META = [
  { name: "SS1",  route: "/classes/SS1",  gradient: "from-indigo-600 to-indigo-400", text: "text-white" },
  { name: "SS2",  route: "/classes/SS2",  gradient: "from-[#3ecf8e] to-[#059669]",  text: "text-black" },
  { name: "SS3",  route: "/classes/SS3",  gradient: "from-purple-600 to-purple-400", text: "text-white" },
  { name: "WAEC", route: "/classes/WAEC", gradient: "from-amber-500 to-amber-400",   text: "text-white" },
  { name: "JAMB", route: "/classes/JAMB", gradient: "from-red-600 to-red-400",       text: "text-white" },
];

const TERMS = [
  { value: "1", label: "First Term",  gradient: "gradient-navy"   },
  { value: "2", label: "Second Term", gradient: "gradient-orange" },
  { value: "3", label: "Third Term",  gradient: "bg-gradient-to-br from-purple-600 to-purple-400" },
];

export default function ParentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const STAT_CARDS = [
    {
      icon: <FileText className="h-5 w-5 text-white" />,
      label: "Exams",
      sub: "View schedules",
      url: "/lms/exams",
      bg: "gradient-navy",
      iconBg: "bg-white/20",
    },
    {
      icon: <Trophy className="h-5 w-5 text-white" />,
      label: "Results",
      sub: "Latest scores",
      url: "/lms/results",
      bg: "gradient-orange",
      iconBg: "bg-white/20",
    },
    {
      icon: <Calendar className="h-5 w-5 text-black" />,
      label: "Timetable",
      sub: "Class schedule",
      url: "/timetable",
      bg: "bg-gradient-to-br from-[#3ecf8e] to-[#059669]",
      iconBg: "bg-black/15",
    },
    {
      icon: <BookOpen className="h-5 w-5 text-white" />,
      label: "Study Materials",
      sub: "Browse notes",
      url: "/lms/study",
      bg: "bg-gradient-to-br from-purple-700 to-purple-500",
      iconBg: "bg-white/20",
    },
  ];

  return (
    <div className="flex-1 space-y-6 p-6 page-fade">

      {/* ── Hero banner ───────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl gradient-hero p-6 text-white">
        <div className="absolute inset-0 opacity-[0.06]"
          style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-[#3ecf8e]/20 rounded-full blur-2xl" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-9 h-9 bg-[#3ecf8e] rounded-xl flex items-center justify-center text-black font-extrabold text-base">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <h2 className="text-2xl font-extrabold">Welcome, {user?.name?.split(" ")[0]} 👋</h2>
          </div>
          <p className="text-white/70 text-sm">
            Parent Portal · Monitor your child's progress at Chukwudi Academy
          </p>
        </div>
      </div>

      {/* ── Coloured stat cards ───────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {STAT_CARDS.map(s => (
          <div key={s.label} onClick={() => navigate(s.url)}
            className={`group cursor-pointer rounded-2xl p-5 text-white relative overflow-hidden card-hover ${s.bg}`}>
            <div className="absolute inset-0 opacity-10"
              style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "18px 18px" }} />
            <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-white/10 rounded-full blur-xl" />
            <div className="relative z-10 flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.iconBg}`}>{s.icon}</div>
              <ArrowRight className="h-4 w-4 text-white/50 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
            </div>
            <div className="relative z-10">
              <p className="text-base font-extrabold">{s.label}</p>
              <p className="text-xs text-white/60 mt-0.5">{s.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Main grid ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Browse by Class */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
          <div className="h-1 bg-gradient-to-r from-[#3ecf8e] via-purple-500 to-orange-500" />
          <div className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg gradient-navy flex items-center justify-center">
                <GraduationCap className="h-4 w-4 text-white" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">Browse by Class</h3>
                <p className="text-xs text-muted-foreground">View materials for each class</p>
              </div>
            </div>
            <div className="space-y-2">
              {CLASS_META.map(c => (
                <button key={c.name} onClick={() => navigate(c.route)}
                  className="w-full flex items-center gap-3 p-2.5 rounded-xl border border-border hover:border-[#3ecf8e]/40 transition-all group text-left">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${c.gradient} flex items-center justify-center shrink-0 shadow-sm`}>
                    <span className={`text-xs font-extrabold ${c.text}`}>{c.name}</span>
                  </div>
                  <span className="text-sm font-semibold flex-1 text-foreground">{c.name} Materials</span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-0.5 group-hover:text-[#3ecf8e] transition-all" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">

          {/* Browse by Term */}
          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg gradient-orange flex items-center justify-center">
                <Clock className="h-4 w-4 text-white" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">Academic Terms</h3>
                <p className="text-xs text-muted-foreground">Filter materials by term</p>
              </div>
            </div>
            <div className="space-y-2">
              {TERMS.map(t => (
                <button key={t.value} onClick={() => navigate(`/lms/study?term=${t.value}`)}
                  className="w-full flex items-center gap-3 p-2.5 rounded-xl border border-border hover:border-[#3ecf8e]/40 transition-all group text-left">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${t.gradient}`}>
                    <span className="text-sm font-extrabold text-white">{t.value}</span>
                  </div>
                  <span className="text-sm font-semibold flex-1 text-foreground">{t.label}</span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-0.5 group-hover:text-[#3ecf8e] transition-all" />
                </button>
              ))}
            </div>
          </div>

          {/* Upcoming Exams */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
            <div className="h-1 gradient-navy" />
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg gradient-navy flex items-center justify-center">
                    <FileText className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-foreground">Upcoming Exams</h3>
                    <p className="text-xs text-muted-foreground">Prepare your child</p>
                  </div>
                </div>
                <button onClick={() => navigate("/lms/exams")}
                  className="text-xs text-[#3ecf8e] font-bold hover:underline flex items-center gap-1">
                  View all <ArrowRight className="h-3 w-3" />
                </button>
              </div>
              <div className="text-center py-6 border border-dashed border-border rounded-xl bg-muted/20">
                <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">No upcoming exams</p>
              </div>
            </div>
          </div>

          {/* Recent Results */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
            <div className="h-1 gradient-orange" />
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg gradient-orange flex items-center justify-center">
                    <Trophy className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-foreground">Recent Results</h3>
                    <p className="text-xs text-muted-foreground">Latest exam scores</p>
                  </div>
                </div>
                <button onClick={() => navigate("/lms/results")}
                  className="text-xs text-[#3ecf8e] font-bold hover:underline flex items-center gap-1">
                  View all <ArrowRight className="h-3 w-3" />
                </button>
              </div>
              <div className="text-center py-6 border border-dashed border-border rounded-xl bg-muted/20">
                <Trophy className="h-8 w-8 mx-auto mb-2 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">No results yet</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
