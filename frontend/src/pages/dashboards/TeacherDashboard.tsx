import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@/hooks/AuthProvider";
import { lmsDocs, type LmsDocument } from "@/services/lmsApi";
import {
  Upload, FileText, Clock, CheckCircle2, XCircle,
  Users, Zap, BookOpen, ArrowRight, GraduationCap,
  FlaskConical, Atom, Dna, Sigma, Loader2, BookMarked,
  TrendingUp, Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const SUBJECTS = [
  { name: "Mathematics", icon: <Sigma className="h-4 w-4" />,        bg: "gradient-navy text-white"                                   },
  { name: "English",     icon: <BookOpen className="h-4 w-4" />,     bg: "bg-gradient-to-br from-[#3ecf8e] to-[#059669] text-black"  },
  { name: "Physics",     icon: <Atom className="h-4 w-4" />,         bg: "bg-gradient-to-br from-purple-600 to-purple-400 text-white" },
  { name: "Chemistry",   icon: <FlaskConical className="h-4 w-4" />, bg: "gradient-orange text-white"                                 },
  { name: "Biology",     icon: <Dna className="h-4 w-4" />,          bg: "bg-gradient-to-br from-teal-600 to-teal-400 text-white"    },
];

const CLASSES = [
  { name: "SS1", color: "from-indigo-600 to-indigo-400" },
  { name: "SS2", color: "from-[#3ecf8e] to-[#059669]",  textBlack: true },
  { name: "SS3", color: "from-purple-600 to-purple-400" },
  { name: "WAEC", color: "from-amber-500 to-amber-400"  },
  { name: "JAMB", color: "from-red-600 to-red-400"      },
];

export default function TeacherDashboard() {
  const { user }  = useAuth();
  const navigate  = useNavigate();
  const [pending,   setPending]   = useState<LmsDocument[]>([]);
  const [myMats,    setMyMats]    = useState<LmsDocument[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [approving, setApproving] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([lmsDocs.listPending(), lmsDocs.list()])
      .then(([pRes, mRes]) => {
        setPending(pRes.documents ?? []);
        setMyMats((mRes.documents ?? []).slice(0, 5));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleApprove = async (id: string, action: "approve" | "reject") => {
    setApproving(id);
    try {
      await lmsDocs.approve(id, action);
      setPending(p => p.filter(d => d._id !== id));
      toast.success(action === "approve" ? "Material approved!" : "Material rejected.");
    } catch (err: any) { toast.error(err.message ?? "Failed"); }
    finally { setApproving(null); }
  };

  return (
    <div className="flex-1 space-y-6 p-6 page-fade">

      {/* ── Hero header ──────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl gradient-hero p-6 text-white">
        <div className="absolute inset-0 opacity-[0.06]"
          style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-[#3ecf8e]/20 rounded-full blur-2xl" />
        <div className="relative z-10 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-9 h-9 bg-[#3ecf8e] rounded-xl flex items-center justify-center text-black font-extrabold">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <h2 className="text-2xl font-extrabold">Welcome, {user?.name?.split(" ")[0]} 👋</h2>
            </div>
            <p className="text-white/70 text-sm">Teacher Portal · Chukwudi Academy</p>
            {pending.length > 0 && (
              <div className="mt-3 inline-flex items-center gap-2 bg-orange-500/20 border border-orange-400/30 text-orange-200 text-xs font-bold px-3 py-1.5 rounded-full">
                <Clock className="h-3.5 w-3.5" />
                {pending.length} submission{pending.length > 1 ? "s" : ""} awaiting review
              </div>
            )}
          </div>
          <Button onClick={() => navigate("/lms/study?upload=true")}
            className="bg-[#3ecf8e] hover:bg-[#34b27b] text-black font-bold shrink-0">
            <Upload className="h-4 w-4 mr-2" />Upload Material
          </Button>
        </div>
      </div>

      {/* ── Coloured stat cards ───────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "My Materials", value: myMats.length,
            icon: <FileText className="h-5 w-5 text-white" />,
            bg: "gradient-navy", iconBg: "bg-white/20", url: "/lms/study",
            sub: "Uploaded notes",
          },
          {
            label: "Pending Review", value: pending.length,
            icon: <Clock className="h-5 w-5 text-white" />,
            bg: "gradient-orange", iconBg: "bg-white/20", url: "/lms/study",
            sub: "Student submissions",
          },
          {
            label: "My Students", value: "—",
            icon: <Users className="h-5 w-5 text-black" />,
            bg: "bg-gradient-to-br from-[#3ecf8e] to-[#059669]", iconBg: "bg-black/15", url: "/users/students",
            sub: "View roster",
          },
          {
            label: "Exams Created", value: "—",
            icon: <Zap className="h-5 w-5 text-white" />,
            bg: "bg-gradient-to-br from-purple-700 to-purple-500", iconBg: "bg-white/20", url: "/lms/exams",
            sub: "Active exams",
          },
        ].map(s => (
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
              <p className="text-2xl font-extrabold">{s.value}</p>
              <p className="text-sm font-semibold text-white/80 mt-0.5">{s.label}</p>
              <p className="text-xs text-white/50 mt-0.5">{s.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Main grid ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">

        {/* Left */}
        <div className="lg:col-span-4 space-y-6">

          {/* Student submissions */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
            <div className="h-1 gradient-orange" />
            <div className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg gradient-orange flex items-center justify-center">
                  <Clock className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">Student Submissions</h3>
                  <p className="text-xs text-muted-foreground">Review and approve student notes</p>
                </div>
                {pending.length > 0 && (
                  <span className="bg-orange text-white text-xs font-bold px-2 py-0.5 rounded-full ml-auto">{pending.length}</span>
                )}
              </div>
              {loading ? (
                <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-orange" /></div>
              ) : pending.length === 0 ? (
                <div className="text-center py-8 border border-dashed border-border rounded-xl bg-muted/20">
                  <CheckCircle2 className="h-10 w-10 text-emerald-400 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-muted-foreground">All caught up — no pending submissions.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {pending.slice(0, 4).map(doc => (
                    <div key={doc._id} className="flex items-center gap-3 p-3 rounded-xl border border-amber-200/60 dark:border-amber-800/30 bg-amber-50/40 dark:bg-amber-950/10">
                      <div className="w-9 h-9 rounded-lg gradient-orange flex items-center justify-center shrink-0">
                        <FileText className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate text-foreground">{doc.title}</p>
                        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                          {doc.className && <span className="text-xs bg-navy/10 text-navy dark:bg-white/10 dark:text-white/70 px-1.5 py-0.5 rounded-full font-medium">{doc.className}</span>}
                          {doc.subject   && <span className="text-xs text-muted-foreground">{doc.subject}</span>}
                          <span className="text-xs text-muted-foreground">· {doc.uploaderName ?? "Student"}</span>
                        </div>
                      </div>
                      <div className="flex gap-1.5 shrink-0">
                        <button disabled={approving === doc._id} onClick={() => handleApprove(doc._id, "approve")}
                          className="h-8 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-colors disabled:opacity-50">
                          {approving === doc._id ? <Loader2 className="h-3 w-3 animate-spin" /> : "✓"}
                        </button>
                        <button disabled={approving === doc._id} onClick={() => handleApprove(doc._id, "reject")}
                          className="h-8 px-3 rounded-lg border border-red-400 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 text-xs font-bold transition-colors disabled:opacity-50">
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* My materials */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
            <div className="h-1 gradient-navy" />
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg gradient-navy flex items-center justify-center">
                    <BookMarked className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-foreground">My Materials</h3>
                    <p className="text-xs text-muted-foreground">Your uploaded resources</p>
                  </div>
                </div>
                <button onClick={() => navigate("/lms/study")}
                  className="text-xs text-[#3ecf8e] font-bold flex items-center gap-1 hover:underline">
                  View all <ArrowRight className="h-3 w-3" />
                </button>
              </div>
              {myMats.length === 0 ? (
                <div className="text-center py-6 border border-dashed border-border rounded-xl bg-muted/20">
                  <BookMarked className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No materials yet.</p>
                  <button onClick={() => navigate("/lms/study?upload=true")}
                    className="text-xs text-[#3ecf8e] font-bold mt-2 hover:underline">Upload first →</button>
                </div>
              ) : (
                <div className="space-y-2">
                  {myMats.map(doc => (
                    <div key={doc._id} onClick={() => navigate(`/lms/study/${doc._id}`)}
                      className="flex items-center gap-3 p-3 rounded-xl border border-border/50 hover:border-[#3ecf8e]/40 hover:bg-[#3ecf8e]/5 cursor-pointer transition-all group">
                      <div className="w-8 h-8 rounded-lg bg-navy/10 flex items-center justify-center shrink-0">
                        <FileText className="h-4 w-4 text-navy dark:text-white/70" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate group-hover:text-[#3ecf8e] transition-colors">{doc.title}</p>
                        {doc.className && <span className="text-xs bg-navy/10 text-navy dark:bg-white/10 dark:text-white/70 font-medium px-1.5 py-0.5 rounded-full mt-0.5 inline-block">{doc.className}</span>}
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        doc.approvalStatus === "approved" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" :
                        doc.approvalStatus === "rejected"  ? "bg-red-100 text-red-600 dark:bg-red-900/30" :
                        "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                      }`}>{doc.approvalStatus ?? "pending"}</span>
                      <Eye className="h-4 w-4 text-muted-foreground group-hover:text-[#3ecf8e] transition-colors shrink-0" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="lg:col-span-3 space-y-4">

          {/* Quick actions */}
          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
            <h3 className="text-base font-bold text-foreground mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "Upload", icon: <Upload className="h-4 w-4" />,       url: "/lms/study?upload=true", bg: "bg-gradient-to-br from-[#3ecf8e] to-[#059669] text-black" },
                { label: "New Exam",icon: <Zap className="h-4 w-4" />,         url: "/lms/exams",             bg: "gradient-orange text-white"   },
                { label: "Students",icon: <Users className="h-4 w-4" />,       url: "/users/students",        bg: "gradient-navy text-white"     },
                { label: "Timetable",icon:<BookOpen className="h-4 w-4" />,    url: "/timetable",             bg: "bg-gradient-to-br from-blue-600 to-blue-400 text-white" },
              ].map(a => (
                <button key={a.label} onClick={() => navigate(a.url)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl shadow-sm transition-all hover:scale-105 active:scale-95 ${a.bg}`}>
                  {a.icon}
                  <span className="text-xs font-bold">{a.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Classes */}
          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg gradient-navy flex items-center justify-center">
                <GraduationCap className="h-3.5 w-3.5 text-white" />
              </div>
              <h3 className="text-base font-bold text-foreground">Classes</h3>
            </div>
            <div className="space-y-2">
              {CLASSES.map(c => (
                <button key={c.name} onClick={() => navigate(`/classes/${c.name}`)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl border border-border hover:border-[#3ecf8e]/40 transition-all group text-left">
                  <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${c.color} flex items-center justify-center shrink-0`}>
                    <span className={`text-xs font-extrabold ${c.textBlack ? "text-black" : "text-white"}`}>{c.name}</span>
                  </div>
                  <span className="text-sm font-semibold flex-1 text-foreground">View {c.name} materials</span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-0.5 group-hover:text-[#3ecf8e] transition-all" />
                </button>
              ))}
            </div>
          </div>

          {/* Subjects */}
          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
            <h3 className="text-base font-bold text-foreground mb-4">Subjects</h3>
            <div className="grid grid-cols-1 gap-2">
              {SUBJECTS.map(s => (
                <button key={s.name} onClick={() => navigate(`/lms/study?subject=${s.name}`)}
                  className="flex items-center gap-3 p-2.5 rounded-xl transition-all hover:scale-[1.01] group">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-sm ${s.bg}`}>
                    {s.icon}
                  </div>
                  <span className="text-sm font-semibold text-foreground flex-1 text-left">{s.name}</span>
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
