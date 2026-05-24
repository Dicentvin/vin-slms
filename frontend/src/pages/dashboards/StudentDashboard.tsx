import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@/hooks/AuthProvider";
import { lmsDocs, officialExams, type LmsDocument, type OfficialExam } from "@/services/lmsApi";
import EmailVerificationBanner from "@/components/global/EmailVerificationBanner";
import {
  BookMarked, FileText, Trophy, Upload, ArrowRight,
  Atom, FlaskConical, Dna, Sigma, Clock,
  GraduationCap, Eye, Zap, BookOpen, ChevronRight,
  PlayCircle, CheckCircle2, Lock, Loader2, AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

const CLASS_META = [
  { name: "SS1",  route: "/classes/SS1",  gradient: "from-indigo-600 to-indigo-400",           text: "text-white"  },
  { name: "SS2",  route: "/classes/SS2",  gradient: "from-[#3ecf8e] to-[#059669]",             text: "text-black"  },
  { name: "SS3",  route: "/classes/SS3",  gradient: "from-purple-600 to-purple-400",            text: "text-white"  },
  { name: "WAEC", route: "/classes/WAEC", gradient: "from-amber-500 to-amber-400",              text: "text-white"  },
  { name: "JAMB", route: "/classes/JAMB", gradient: "from-red-600 to-red-400",                  text: "text-white"  },
];

const TERMS = [
  { value: "1", label: "First Term",  gradient: "gradient-navy"  },
  { value: "2", label: "Second Term", gradient: "gradient-orange" },
  { value: "3", label: "Third Term",  gradient: "bg-gradient-to-br from-purple-600 to-purple-400" },
];

const SUBJECTS = [
  { name: "Mathematics", icon: <Sigma className="h-4 w-4" />,        bg: "gradient-navy text-white"                                   },
  { name: "English",     icon: <BookOpen className="h-4 w-4" />,     bg: "bg-gradient-to-br from-[#3ecf8e] to-[#059669] text-black"  },
  { name: "Physics",     icon: <Atom className="h-4 w-4" />,         bg: "bg-gradient-to-br from-purple-600 to-purple-400 text-white" },
  { name: "Chemistry",   icon: <FlaskConical className="h-4 w-4" />, bg: "gradient-orange text-white"                                 },
  { name: "Biology",     icon: <Dna className="h-4 w-4" />,          bg: "bg-gradient-to-br from-teal-600 to-teal-400 text-white"    },
];

function ChatIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
    </svg>
  );
}

export default function StudentDashboard() {
  const { user }  = useAuth();
  const navigate  = useNavigate();
  const [myDocs,     setMyDocs]     = useState<LmsDocument[]>([]);
  const [sharedDocs, setSharedDocs] = useState<LmsDocument[]>([]);
  const [allExams, setAllExams] = useState<OfficialExam[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [examsLoading, setExamsLoading] = useState(true);

  useEffect(() => {
    Promise.all([lmsDocs.list(), lmsDocs.listShared()])
      .then(([my, shared]) => {
        setMyDocs(my.documents ?? []);
        setSharedDocs(shared.documents ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    officialExams.list()
      .then(res => setAllExams(res.exams ?? []))
      .catch(() => {})
      .finally(() => setExamsLoading(false));
  }, []);

  const recentShared = sharedDocs.slice(0, 4);
  const pendingCount = myDocs.filter(d => d.approvalStatus === "pending").length;

  const typeColor = (t: string) =>
    t === "mcq" ? "bg-blue-500" : t === "theory" ? "bg-purple-500" : "bg-orange-500";

  return (
    <div className="flex-1 space-y-6 p-6 page-fade">

      {/* ── Email verification banner ──────────────────────── */}
      <EmailVerificationBanner />

      {/* ── Hero banner ───────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl gradient-hero p-6 text-white">
        <div className="absolute inset-0 opacity-[0.06]"
          style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-[#3ecf8e]/20 rounded-full blur-2xl" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-orange/10 rounded-full blur-2xl" />
        <div className="relative z-10 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-9 h-9 bg-[#3ecf8e] rounded-xl flex items-center justify-center text-black font-extrabold text-base">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <h2 className="text-2xl font-extrabold">Hello, {user?.name?.split(" ")[0]} 👋</h2>
            </div>
            <p className="text-white/70 text-sm">
              Your AI study companion is ready.
              {user?.className && (
                <span className="ml-2 bg-[#3ecf8e]/20 border border-[#3ecf8e]/30 text-[#3ecf8e] text-xs font-bold px-2 py-0.5 rounded-full">
                  {user.className}
                </span>
              )}
            </p>
            {pendingCount > 0 && (
              <div className="mt-3 inline-flex items-center gap-2 bg-orange-500/20 border border-orange-400/30 text-orange-200 text-xs font-bold px-3 py-1.5 rounded-full">
                <Clock className="h-3.5 w-3.5" />
                {pendingCount} note{pendingCount > 1 ? "s" : ""} awaiting teacher approval
              </div>
            )}
          </div>
          <Button onClick={() => navigate("/lms/study?upload=true")}
            className="bg-[#3ecf8e] hover:bg-[#34b27b] text-black font-bold shrink-0">
            <Upload className="h-4 w-4 mr-2" />Upload Note
          </Button>
        </div>
      </div>

      {/* ── Coloured stat cards ───────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "My Uploads",    value: myDocs.length,
            icon:  <Upload className="h-5 w-5 text-black" />,
            bg:    "bg-gradient-to-br from-[#3ecf8e] to-[#059669]",
            iconBg:"bg-black/15", sub: "Notes uploaded", url: "/lms/study",
          },
          {
            label: "Teacher Notes", value: sharedDocs.length,
            icon:  <GraduationCap className="h-5 w-5 text-white" />,
            bg:    "gradient-navy",
            iconBg:"bg-white/20",  sub: "Shared materials", url: "/lms/study",
          },
          {
            label: "Active Exams",  value: examsLoading ? "…" : allExams.filter(e => e.status === "active").length,
            icon:  <FileText className="h-5 w-5 text-white" />,
            bg:    "bg-gradient-to-br from-purple-700 to-purple-500",
            iconBg:"bg-white/20",  sub: "Available now",   url: "#active-exams",
          },
          {
            label: "Exam Results",  value: "—",
            icon:  <Trophy className="h-5 w-5 text-white" />,
            bg:    "gradient-orange",
            iconBg:"bg-white/20",  sub: "Latest scores",    url: "/candidate",
          },
        ].map(s => (
          <div key={s.label}
            onClick={() => s.url.startsWith("#") ? document.getElementById("active-exams")?.scrollIntoView({ behavior: "smooth" }) : navigate(s.url)}
            className={`group cursor-pointer rounded-2xl p-5 text-white relative overflow-hidden card-hover ${s.bg}`}>
            <div className="absolute inset-0 opacity-10"
              style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "18px 18px" }} />
            <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-white/10 rounded-full blur-xl" />
            <div className="relative z-10 flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.iconBg}`}>{s.icon}</div>
              <ArrowRight className="h-4 w-4 text-white/50 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
            </div>
            <div className="relative z-10">
              <p className="text-2xl font-extrabold">{s.value}</p>
              <p className="text-sm font-semibold text-white/80 mt-0.5">{s.label}</p>
              <p className="text-xs text-white/50 mt-0.5">{s.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Active Exams Table ─────────────────────────────── */}
      <div id="active-exams" className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="h-1 bg-gradient-to-r from-purple-600 via-blue-500 to-[#3ecf8e]" />
        <div className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-purple-400 flex items-center justify-center">
                <FileText className="h-4 w-4 text-white" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">All Exams</h3>
                <p className="text-xs text-muted-foreground">Active exams can be attempted · Others are not yet available</p>
              </div>
            </div>
            <button onClick={() => navigate("/candidate")}
              className="text-xs text-[#3ecf8e] font-bold flex items-center gap-1 hover:underline">
              View all <ChevronRight className="h-3 w-3" />
            </button>
          </div>

          {examsLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : allExams.length === 0 ? (
            <div className="text-center py-10 border border-dashed border-border rounded-xl bg-muted/20">
              <FileText className="h-10 w-10 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground font-medium">No exams assigned yet.</p>
              <p className="text-xs text-muted-foreground mt-1">Check back later — your teacher will publish exams when ready.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50 border-b border-border">
                    <th className="text-left text-xs font-bold uppercase tracking-wider text-muted-foreground px-4 py-3">Exam</th>
                    <th className="text-left text-xs font-bold uppercase tracking-wider text-muted-foreground px-4 py-3 hidden sm:table-cell">Subject</th>
                    <th className="text-left text-xs font-bold uppercase tracking-wider text-muted-foreground px-4 py-3 hidden md:table-cell">Type</th>
                    <th className="text-left text-xs font-bold uppercase tracking-wider text-muted-foreground px-4 py-3 hidden md:table-cell">Duration</th>
                    <th className="text-left text-xs font-bold uppercase tracking-wider text-muted-foreground px-4 py-3 hidden lg:table-cell">Questions</th>
                    <th className="text-left text-xs font-bold uppercase tracking-wider text-muted-foreground px-4 py-3 hidden lg:table-cell">Marks</th>
                    <th className="text-right text-xs font-bold uppercase tracking-wider text-muted-foreground px-4 py-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {allExams.map((exam, idx) => {
                    const isActive = exam.status === "active";
                    const rowBg = isActive
                      ? "hover:bg-muted/30 cursor-pointer"
                      : "opacity-60 cursor-default bg-muted/10";
                    const handleRowClick = () => {
                      if (isActive) navigate(`/student/exam/${exam._id}`);
                      else toast.error(`"${exam.title}" is not active yet. Wait for your teacher to activate it.`);
                    };
                    return (
                    <tr key={exam._id}
                      className={`transition-colors group ${rowBg}`}
                      onClick={handleRowClick}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isActive ? "bg-gradient-to-br from-purple-600 to-purple-400" : "bg-muted"}`}>
                            {isActive
                              ? <span className="text-white font-extrabold text-xs">{idx + 1}</span>
                              : <Lock className="h-3.5 w-3.5 text-muted-foreground" />}
                          </div>
                          <div>
                            <p className={`font-semibold text-sm leading-snug transition-colors ${isActive ? "text-foreground group-hover:text-[#3ecf8e]" : "text-muted-foreground"}`}>
                              {exam.title}
                            </p>
                            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                              {exam.className !== "All" && (
                                <span className="text-[10px] bg-navy/10 text-navy dark:bg-white/10 dark:text-white/70 font-semibold px-1.5 py-0.5 rounded-full">
                                  {exam.className}
                                </span>
                              )}
                              {!isActive && (
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full capitalize ${exam.status === "draft" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"}`}>
                                  {exam.status}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span className="text-muted-foreground text-xs font-medium">{exam.subject}</span>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className={`text-[10px] font-extrabold text-white px-2 py-0.5 rounded-full uppercase tracking-wide ${typeColor(exam.type)}`}>
                          {exam.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {exam.duration} min
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <span className="text-xs text-muted-foreground">{exam.questions?.length ?? 0}</span>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <span className="text-xs font-bold text-foreground">{exam.totalMarks}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {isActive ? (
                          <button
                            onClick={e => { e.stopPropagation(); navigate(`/student/exam/${exam._id}`); }}
                            className="inline-flex items-center gap-1.5 bg-[#3ecf8e] hover:bg-[#34b27b] text-black text-xs font-bold px-3 py-1.5 rounded-lg transition-colors">
                            <PlayCircle className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">Start</span>
                          </button>
                        ) : (
                          <button
                            onClick={e => { e.stopPropagation(); toast.error(`"${exam.title}" is not active yet.`); }}
                            className="inline-flex items-center gap-1.5 bg-muted text-muted-foreground text-xs font-bold px-3 py-1.5 rounded-lg transition-colors cursor-not-allowed">
                            <AlertCircle className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">Locked</span>
                          </button>
                        )}
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ── Main grid ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">

        {/* Left col */}
        <div className="lg:col-span-4 space-y-6">

          {/* Quick actions — coloured grid */}
          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
            <h3 className="text-base font-bold text-foreground mb-4">Quick Actions</h3>
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: <Upload className="h-5 w-5" />,    label: "Upload",     url: "/lms/study?upload=true", bg: "bg-gradient-to-br from-[#3ecf8e] to-[#059669] text-black"  },
                { icon: <ChatIcon />,                       label: "AI Tutor",   url: "/lms/study",             bg: "gradient-navy text-white"                                   },
                { icon: <Zap className="h-5 w-5" />,       label: "Quiz",       url: "/lms/quiz",              bg: "gradient-orange text-white"                                 },
                { icon: <BookOpen className="h-5 w-5" />,  label: "Flashcards", url: "/lms/flashcards",        bg: "bg-gradient-to-br from-purple-600 to-purple-400 text-white" },
                { icon: <FileText className="h-5 w-5" />,  label: "Exams",      url: "/candidate",             bg: "bg-gradient-to-br from-blue-600 to-blue-400 text-white"     },
                { icon: <Trophy className="h-5 w-5" />,    label: "Results",    url: "/lms/results",           bg: "bg-gradient-to-br from-teal-600 to-teal-400 text-white"     },
              ].map(a => (
                <button key={a.label} onClick={() => navigate(a.url)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-all hover:scale-105 active:scale-95 shadow-sm ${a.bg}`}>
                  {a.icon}
                  <span className="text-xs font-bold">{a.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Teacher materials */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
            <div className="h-1 gradient-navy" />
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg gradient-navy flex items-center justify-center">
                    <GraduationCap className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-foreground">Teacher Materials</h3>
                    <p className="text-xs text-muted-foreground">Published by your teachers</p>
                  </div>
                </div>
                <button onClick={() => navigate("/lms/study")}
                  className="text-xs text-[#3ecf8e] font-bold flex items-center gap-1 hover:underline">
                  View all <ArrowRight className="h-3 w-3" />
                </button>
              </div>
              {loading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map(i => <div key={i} className="h-14 bg-muted rounded-xl animate-pulse" />)}
                </div>
              ) : recentShared.length === 0 ? (
                <div className="text-center py-8 border border-dashed border-border rounded-xl bg-muted/20">
                  <GraduationCap className="h-10 w-10 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No teacher materials yet.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {recentShared.map(doc => (
                    <div key={doc._id} onClick={() => navigate(`/lms/study/${doc._id}`)}
                      className="flex items-center gap-3 p-3 rounded-xl border border-border/50 hover:border-[#3ecf8e]/40 hover:bg-[#3ecf8e]/5 cursor-pointer transition-all group">
                      <div className="w-8 h-8 rounded-lg gradient-navy flex items-center justify-center shrink-0">
                        <FileText className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate group-hover:text-[#3ecf8e] transition-colors">{doc.title}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {doc.className && (
                            <span className="text-xs bg-navy/10 text-navy dark:bg-white/10 dark:text-white/70 font-medium px-1.5 py-0.5 rounded-full">
                              {doc.className}
                            </span>
                          )}
                          {doc.subject && <span className="text-xs text-muted-foreground">{doc.subject}</span>}
                        </div>
                      </div>
                      <Eye className="h-4 w-4 text-muted-foreground group-hover:text-[#3ecf8e] transition-colors shrink-0" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right col */}
        <div className="lg:col-span-3 space-y-4">

          {/* Browse by Class */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
            <div className="h-1 bg-gradient-to-r from-[#3ecf8e] via-purple-500 to-orange-500" />
            <div className="p-5">
              <h3 className="text-base font-bold text-foreground mb-4">Browse by Class</h3>
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

          {/* Browse by Term */}
          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
            <h3 className="text-base font-bold text-foreground mb-4">Browse by Term</h3>
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

          {/* Subjects */}
          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
            <h3 className="text-base font-bold text-foreground mb-4">Subjects</h3>
            <div className="space-y-2">
              {SUBJECTS.map(s => (
                <button key={s.name} onClick={() => navigate(`/lms/study?subject=${s.name}`)}
                  className="w-full flex items-center gap-3 p-2.5 rounded-xl border border-border hover:border-[#3ecf8e]/40 transition-all group text-left">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-sm shrink-0 ${s.bg}`}>
                    {s.icon}
                  </div>
                  <span className="text-sm font-semibold flex-1 text-foreground">{s.name}</span>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:translate-x-0.5 group-hover:text-[#3ecf8e] transition-all" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
