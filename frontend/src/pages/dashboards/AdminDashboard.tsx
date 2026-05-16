import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@/hooks/AuthProvider";
import { lmsDocs, lmsUsers, type LmsDocument, type LmsUser } from "@/services/lmsApi";
import {
  Users, FileText, Clock, CheckCircle2, XCircle,
  BookMarked, Settings, Upload, Zap, GraduationCap,
  ArrowRight, Loader2, School, Calendar, Trash2,
  UserCheck, Shield, BarChart3, TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// ─── Coloured Stat Card ───────────────────────────────────────────────────────
function StatCard({
  label, value, icon, url, gradient, iconBg, textColor, subLabel,
}: {
  label: string; value: string | number; icon: React.ReactNode;
  url: string; gradient: string; iconBg: string; textColor: string;
  subLabel?: string;
}) {
  const navigate = useNavigate();
  return (
    <div
      onClick={() => navigate(url)}
      className={`group cursor-pointer rounded-2xl p-5 text-white relative overflow-hidden card-hover ${gradient}`}
    >
      {/* Subtle dot pattern */}
      <div className="absolute inset-0 opacity-10"
        style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "18px 18px" }} />
      {/* Glow */}
      <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-white/10 rounded-full blur-xl" />

      <div className="relative z-10 flex items-start justify-between mb-3">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${iconBg}`}>
          {icon}
        </div>
        <ArrowRight className="h-4 w-4 text-white/60 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
      </div>
      <div className="relative z-10">
        <p className="text-3xl font-extrabold text-white">{value}</p>
        <p className="text-sm font-semibold text-white/80 mt-0.5">{label}</p>
        {subLabel && <p className="text-xs text-white/50 mt-1">{subLabel}</p>}
      </div>
    </div>
  );
}

// ─── User Row ─────────────────────────────────────────────────────────────────
function UserRow({
  u, onApprove, onReject, onDelete, busy,
}: {
  u: LmsUser;
  onApprove: (id: string) => void;
  onReject:  (id: string) => void;
  onDelete:  (id: string) => void;
  busy: string | null;
}) {
  const initials = u.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  const statusStyle =
    u.approvalStatus === "approved" ? "text-emerald-700 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400" :
    u.approvalStatus === "rejected"  ? "text-red-600 bg-red-100 dark:bg-red-900/30"    :
    "text-amber-700 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400";

  const avatarColor =
    u.role === "teacher" ? "bg-purple-500" :
    u.role === "student" ? "bg-[#3ecf8e] text-black" :
    "bg-orange-500";

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl border border-border/50 bg-background/50 hover:bg-muted/40 transition-colors">
      <div className={`w-9 h-9 rounded-full ${avatarColor} text-white font-extrabold text-sm flex items-center justify-center shrink-0`}>
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-semibold text-foreground truncate">{u.name}</p>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${statusStyle}`}>
            {u.approvalStatus ?? "pending"}
          </span>
        </div>
        <p className="text-xs text-muted-foreground truncate">{u.email}</p>
        {u.className && (
          <span className="text-[10px] bg-navy/10 text-navy dark:bg-white/10 dark:text-white/70 font-semibold px-1.5 py-0.5 rounded-full mt-0.5 inline-block">
            {u.className}
          </span>
        )}
      </div>
      <div className="flex gap-1.5 shrink-0">
        {u.approvalStatus !== "approved" && (
          <button disabled={busy === u._id} onClick={() => onApprove(u._id)}
            className="w-8 h-8 rounded-lg border border-emerald-400 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 flex items-center justify-center transition-colors disabled:opacity-40"
            title="Approve">
            {busy === u._id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
          </button>
        )}
        {u.approvalStatus !== "rejected" && (
          <button disabled={busy === u._id} onClick={() => onReject(u._id)}
            className="w-8 h-8 rounded-lg border border-red-400 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 flex items-center justify-center transition-colors disabled:opacity-40"
            title="Reject">
            <XCircle className="h-3.5 w-3.5" />
          </button>
        )}
        <button onClick={() => onDelete(u._id)}
          className="w-8 h-8 rounded-lg border border-border text-muted-foreground hover:border-red-400 hover:text-red-500 flex items-center justify-center transition-colors"
          title="Delete">
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [pendingDocs,     setPendingDocs]     = useState<LmsDocument[]>([]);
  const [pendingStudents, setPendingStudents] = useState<LmsUser[]>([]);
  const [pendingTeachers, setPendingTeachers] = useState<LmsUser[]>([]);
  const [allStudents,     setAllStudents]     = useState<LmsUser[]>([]);
  const [allTeachers,     setAllTeachers]     = useState<LmsUser[]>([]);
  const [loading,         setLoading]         = useState(true);
  const [busyDoc,  setBusyDoc]  = useState<string | null>(null);
  const [busyUser, setBusyUser] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"pending" | "all">("pending");

  const reload = useCallback(async () => {
    try {
      const [docsRes, studentsRes, teachersRes] = await Promise.all([
        lmsDocs.listPending(),
        lmsUsers.list({ role: "student" }),
        lmsUsers.list({ role: "teacher" }),
      ]);
      setPendingDocs(docsRes.documents ?? []);
      const stu = studentsRes.users ?? [];
      const tea = teachersRes.users ?? [];
      setAllStudents(stu);
      setAllTeachers(tea);
      setPendingStudents(stu.filter(s => s.approvalStatus === "pending"));
      setPendingTeachers(tea.filter(t => t.approvalStatus === "pending"));
    } catch {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => { reload(); }, [reload]);

  const approveDoc = async (id: string, action: "approve" | "reject") => {
    setBusyDoc(id);
    try {
      await lmsDocs.approve(id, action);
      setPendingDocs(p => p.filter(d => d._id !== id));
      toast.success(action === "approve" ? "Material approved!" : "Material rejected.");
    } catch (err: any) { toast.error(err.message ?? "Failed"); }
    finally { setBusyDoc(null); }
  };

  const approveUser = async (id: string, action: "approve" | "reject") => {
    setBusyUser(id);
    try {
      const { user: updated } = await lmsUsers.approve(id, action);
      const patch = (list: LmsUser[]) =>
        list.map(u => u._id === id ? { ...u, approvalStatus: updated.approvalStatus } : u);
      setAllStudents(patch);
      setAllTeachers(patch);
      setPendingStudents(p => p.filter(u => u._id !== id));
      setPendingTeachers(p => p.filter(u => u._id !== id));
      toast.success(action === "approve" ? `${updated.name} approved!` : `${updated.name} rejected.`);
    } catch (err: any) { toast.error(err.message ?? "Failed"); }
    finally { setBusyUser(null); }
  };

  const deleteUser = async (id: string) => {
    if (!confirm("Delete this user permanently?")) return;
    try {
      await lmsUsers.delete(id);
      const remove = (list: LmsUser[]) => list.filter(u => u._id !== id);
      setAllStudents(remove); setAllTeachers(remove);
      setPendingStudents(remove); setPendingTeachers(remove);
      toast.success("User deleted.");
    } catch (err: any) { toast.error(err.message ?? "Failed"); }
  };

  const totalPending = pendingStudents.length + pendingTeachers.length + pendingDocs.length;
  const approvedStudents = allStudents.filter(s => s.approvalStatus === "approved").length;
  const approvedTeachers = allTeachers.filter(t => t.approvalStatus === "approved").length;

  return (
    <div className="flex-1 space-y-6 p-6 page-fade">

      {/* ── Header ─────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl gradient-hero p-6 text-white">
        <div className="absolute inset-0 opacity-[0.06]"
          style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-[#3ecf8e]/20 rounded-full blur-2xl" />
        <div className="relative z-10 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="bg-[#3ecf8e] p-1.5 rounded-lg">
                <Shield className="w-5 h-5 text-black" />
              </div>
              <h2 className="text-2xl font-extrabold">Admin Dashboard</h2>
            </div>
            <p className="text-white/70 text-sm">
              Welcome back, <span className="font-bold text-white">{user?.name}</span> · Chukwudi Academy
            </p>
            {totalPending > 0 && (
              <div className="mt-3 inline-flex items-center gap-2 bg-orange-500/20 border border-orange-400/30 text-orange-200 text-xs font-bold px-3 py-1.5 rounded-full">
                <Clock className="h-3.5 w-3.5" />
                {totalPending} action{totalPending > 1 ? "s" : ""} need your attention
              </div>
            )}
          </div>
          <div className="flex gap-2 flex-wrap shrink-0">
            <Button variant="outline" size="sm"
              className="border-white/20 text-white hover:bg-white/10 bg-white/5"
              onClick={() => navigate("/classes")}>
              <School className="h-4 w-4 mr-1.5" />Classes
            </Button>
            <Button size="sm"
              className="bg-[#3ecf8e] hover:bg-[#34b27b] text-black font-bold"
              onClick={() => navigate("/lms/study?upload=true")}>
              <Upload className="h-4 w-4 mr-1.5" />Upload
            </Button>
          </div>
        </div>
      </div>

      {/* ── Coloured Stat Cards ─────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Students" value={allStudents.length}
          subLabel={`${approvedStudents} approved`}
          icon={<Users className="h-5 w-5 text-white" />}
          gradient="gradient-navy"
          iconBg="bg-white/20" textColor="text-white"
          url="/users/students"
        />
        <StatCard
          label="Teachers" value={allTeachers.length}
          subLabel={`${approvedTeachers} approved`}
          icon={<GraduationCap className="h-5 w-5 text-black" />}
          gradient="bg-gradient-to-br from-[#3ecf8e] to-[#059669]"
          iconBg="bg-black/15" textColor="text-black"
          url="/users/teachers"
        />
        <StatCard
          label="Pending Actions" value={totalPending}
          subLabel="Needs review"
          icon={<Clock className="h-5 w-5 text-white" />}
          gradient="gradient-orange"
          iconBg="bg-white/20" textColor="text-white"
          url="#"
        />
        <StatCard
          label="Study Materials" value={pendingDocs.length}
          subLabel="Awaiting approval"
          icon={<BookMarked className="h-5 w-5 text-white" />}
          gradient="bg-gradient-to-br from-purple-700 to-purple-500"
          iconBg="bg-white/20" textColor="text-white"
          url="/lms/study"
        />
      </div>

      {/* ── User Approvals ──────────────────────────────────── */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        {/* Panel header */}
        <div className="flex items-center justify-between p-5 border-b border-border bg-gradient-to-r from-navy/5 to-transparent dark:from-white/3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-navy flex items-center justify-center">
              <UserCheck className="h-4 w-4 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">User Approvals</h3>
              <p className="text-xs text-muted-foreground">Approve or reject registrations</p>
            </div>
            {pendingStudents.length + pendingTeachers.length > 0 && (
              <span className="bg-orange text-white text-xs font-bold px-2 py-0.5 rounded-full ml-2">
                {pendingStudents.length + pendingTeachers.length} pending
              </span>
            )}
          </div>
          <div className="flex gap-1 bg-muted rounded-lg p-1">
            {(["pending", "all"] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors capitalize ${
                  activeTab === tab ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}>
                {tab === "pending"
                  ? `Pending${pendingStudents.length + pendingTeachers.length > 0 ? ` (${pendingStudents.length + pendingTeachers.length})` : ""}`
                  : "All Users"}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-[#3ecf8e]" />
          </div>
        ) : (
          <div className="p-5 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Teachers */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-md bg-purple-500 flex items-center justify-center">
                  <GraduationCap className="h-3.5 w-3.5 text-white" />
                </div>
                <h4 className="text-sm font-bold text-foreground">Teachers</h4>
                <span className="text-xs text-muted-foreground">
                  {(activeTab === "pending" ? pendingTeachers : allTeachers).length} total
                </span>
              </div>
              {(activeTab === "pending" ? pendingTeachers : allTeachers).length === 0 ? (
                <div className="text-center py-8 border border-dashed border-border rounded-xl bg-muted/20">
                  <UserCheck className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {activeTab === "pending" ? "No pending teachers" : "No teachers yet"}
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto">
                  {(activeTab === "pending" ? pendingTeachers : allTeachers).map(u => (
                    <UserRow key={u._id} u={u}
                      onApprove={id => approveUser(id, "approve")}
                      onReject={id  => approveUser(id, "reject")}
                      onDelete={deleteUser} busy={busyUser} />
                  ))}
                </div>
              )}
            </div>

            {/* Students */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-md bg-[#3ecf8e] flex items-center justify-center">
                  <Users className="h-3.5 w-3.5 text-black" />
                </div>
                <h4 className="text-sm font-bold text-foreground">Students</h4>
                <span className="text-xs text-muted-foreground">
                  {(activeTab === "pending" ? pendingStudents : allStudents).length} total
                </span>
              </div>
              {(activeTab === "pending" ? pendingStudents : allStudents).length === 0 ? (
                <div className="text-center py-8 border border-dashed border-border rounded-xl bg-muted/20">
                  <Users className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {activeTab === "pending" ? "No pending students" : "No students yet"}
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto">
                  {(activeTab === "pending" ? pendingStudents : allStudents).map(u => (
                    <UserRow key={u._id} u={u}
                      onApprove={id => approveUser(id, "approve")}
                      onReject={id  => approveUser(id, "reject")}
                      onDelete={deleteUser} busy={busyUser} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Bottom grid ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">

        {/* Doc approvals */}
        <div className="lg:col-span-4 bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
          <div className="h-1 gradient-orange" />
          <div className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg gradient-orange flex items-center justify-center">
                <FileText className="h-4 w-4 text-white" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">Document Approvals</h3>
                <p className="text-xs text-muted-foreground">Student-uploaded notes pending review</p>
              </div>
              {pendingDocs.length > 0 && (
                <span className="bg-orange text-white text-xs font-bold px-2 py-0.5 rounded-full ml-auto">
                  {pendingDocs.length}
                </span>
              )}
            </div>

            {loading ? (
              <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-orange" /></div>
            ) : pendingDocs.length === 0 ? (
              <div className="text-center py-8 border border-dashed border-border rounded-xl bg-muted/20">
                <CheckCircle2 className="h-10 w-10 text-emerald-400 mx-auto mb-2" />
                <p className="text-sm font-semibold text-muted-foreground">All clear — no pending documents.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {pendingDocs.map(doc => (
                  <div key={doc._id} className="flex items-center gap-3 p-3 rounded-xl border border-border/60 bg-amber-50/50 dark:bg-amber-950/10">
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
                      <button disabled={busyDoc === doc._id} onClick={() => approveDoc(doc._id, "approve")}
                        className="h-8 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-colors disabled:opacity-50">
                        {busyDoc === doc._id ? <Loader2 className="h-3 w-3 animate-spin" /> : "✓ Approve"}
                      </button>
                      <button disabled={busyDoc === doc._id} onClick={() => approveDoc(doc._id, "reject")}
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

        {/* Right col */}
        <div className="lg:col-span-3 space-y-4">

          {/* Quick links — coloured grid */}
          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
            <h3 className="text-base font-bold text-foreground mb-4">Quick Links</h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "Students",   icon: <Users className="h-4 w-4" />,         url: "/users/students",          bg: "gradient-navy text-white"                    },
                { label: "Teachers",   icon: <GraduationCap className="h-4 w-4" />, url: "/users/teachers",          bg: "bg-gradient-to-br from-purple-600 to-purple-400 text-white" },
                { label: "Study Hub",  icon: <BookMarked className="h-4 w-4" />,    url: "/lms/study",               bg: "bg-gradient-to-br from-[#3ecf8e] to-[#059669] text-black"  },
                { label: "Exams",      icon: <Zap className="h-4 w-4" />,           url: "/lms/exams",               bg: "gradient-orange text-white"                  },
                { label: "Timetable",  icon: <Calendar className="h-4 w-4" />,      url: "/timetable",               bg: "bg-gradient-to-br from-blue-600 to-blue-400 text-white"    },
                { label: "Settings",   icon: <Settings className="h-4 w-4" />,      url: "/settings/academic-years", bg: "bg-gradient-to-br from-slate-600 to-slate-400 text-white"  },
              ].map(a => (
                <button key={a.label} onClick={() => navigate(a.url)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-all hover:scale-105 active:scale-95 shadow-sm ${a.bg}`}>
                  {a.icon}
                  <span className="text-xs font-bold">{a.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Approval summary */}
          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#3ecf8e] to-[#059669] flex items-center justify-center">
                <BarChart3 className="h-3.5 w-3.5 text-black" />
              </div>
              <h3 className="text-base font-bold text-foreground">Approval Summary</h3>
            </div>
            <div className="space-y-3">
              {[
                { label: "Approved Students", value: approvedStudents,                   dot: "bg-emerald-500" },
                { label: "Pending Students",  value: pendingStudents.length,             dot: "bg-amber-500"   },
                { label: "Approved Teachers", value: approvedTeachers,                   dot: "bg-emerald-500" },
                { label: "Pending Teachers",  value: pendingTeachers.length,             dot: "bg-amber-500"   },
              ].map(row => (
                <div key={row.label} className="flex items-center gap-2 py-2 border-b border-border/40 last:border-0">
                  <div className={`w-2 h-2 rounded-full ${row.dot} shrink-0`} />
                  <span className="text-sm text-muted-foreground flex-1">{row.label}</span>
                  <span className="text-sm font-extrabold text-foreground">{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
