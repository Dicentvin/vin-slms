/**
 * CandidateDashboard — Official Exam Portal (Real Backend)
 */
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@/hooks/AuthProvider";
import { officialExams, type OfficialExam, type ExamSubmission } from "@/services/lmsApi";
import {
  ClipboardList, CheckSquare, FileText, Clock, Trophy,
  AlertTriangle, BookOpen, Zap, Lock, LogOut, ArrowLeft,
  Timer, CheckCircle2, XCircle, Send, BarChart3,
  RefreshCw, Loader2, Star, Calendar, School, Camera, User2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/components/provider/theme";
import { Sun, Moon } from "lucide-react";
import { toast } from "sonner";

// ─── Exam Card ────────────────────────────────────────────────────────────────
function ExamCard({
  exam, onStart, myResults,
}: {
  exam: OfficialExam;
  onStart: (e: OfficialExam) => void;
  myResults: ExamSubmission[];
}) {
  const typeColor = exam.type === "mcq" ? "bg-blue-500"
    : exam.type === "theory" ? "bg-purple-500" : "bg-orange-500";

  const myResult = myResults.find(s => s.examId === exam._id);
  const isCompleted = !!myResult && myResult.status !== "in_progress";
  const isActive = exam.status === "active";

  return (
    <div className={`bg-card border border-border rounded-2xl p-5 shadow-sm hover:shadow-md transition-all ${
      isActive && !isCompleted ? "border-l-4 border-l-[#3ecf8e]" : ""
    }`}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-[10px] font-extrabold text-white px-2 py-0.5 rounded-full uppercase tracking-wide ${typeColor}`}>
            {exam.type.toUpperCase()}
          </span>
          {isCompleted ? (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-50 dark:bg-slate-900/30 text-slate-600 dark:text-slate-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" /> Completed
            </span>
          ) : isActive ? (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live
            </span>
          ) : (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> {exam.status === "draft" ? "Draft" : "Closed"}
            </span>
          )}
          {exam.className !== "All" && (
            <span className="text-[10px] font-bold bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{exam.className}</span>
          )}
        </div>
        {isCompleted && myResult && (
          <div className="text-right shrink-0">
            <p className="text-lg font-extrabold text-foreground">
              {myResult.totalScore}<span className="text-xs text-muted-foreground">/{myResult.maxScore}</span>
            </p>
            {myResult.theoryMarkingStatus !== "complete" && (
              <p className="text-[10px] text-amber-500">Pending marking</p>
            )}
          </div>
        )}
      </div>

      <h3 className="font-bold text-foreground text-sm leading-snug mb-1">{exam.title}</h3>
      <p className="text-xs text-muted-foreground mb-3">{exam.subject}</p>

      <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4 flex-wrap">
        <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{exam.duration} min</span>
        <span className="flex items-center gap-1"><ClipboardList className="h-3 w-3" />{exam.questions?.length ?? 0} questions</span>
        <span className="flex items-center gap-1"><Star className="h-3 w-3" />{exam.totalMarks} marks</span>
      </div>

      {isActive && !isCompleted && (
        <Button onClick={() => onStart(exam)} size="sm"
          className="w-full bg-[#3ecf8e] hover:bg-[#34b27b] text-black font-bold gap-2">
          <Zap className="h-3.5 w-3.5" /> Start Exam
        </Button>
      )}
      {isCompleted && (
        <div className="flex items-center gap-2 bg-muted/50 rounded-lg p-2 text-xs text-muted-foreground">
          <CheckCircle2 className="h-3.5 w-3.5 text-[#3ecf8e] shrink-0" />
          {myResult?.percentage !== undefined
            ? `Score: ${myResult.totalScore}/${myResult.maxScore} (${myResult.percentage}%)`
            : "Submitted — awaiting marks"}
        </div>
      )}
      {!isActive && !isCompleted && (
        <div className="flex items-center gap-2 bg-muted/50 rounded-lg p-2 text-xs text-muted-foreground">
          <Lock className="h-3.5 w-3.5 shrink-0" />
          {exam.status === "closed" ? "This exam has closed" : "Not yet available"}
        </div>
      )}
    </div>
  );
}

// ─── MCQ Exam Screen ──────────────────────────────────────────────────────────
function MCQScreen({
  exam, submission, onSubmit,
}: {
  exam: OfficialExam;
  submission: ExamSubmission;
  onSubmit: (answers: { questionId: string; selectedOption: string }[], timeTaken: number) => void;
}) {
  const [current,   setCurrent]   = useState(0);
  const [answers,   setAnswers]   = useState<Record<string, string>>({});
  const [timeLeft,  setTimeLeft]  = useState(exam.duration * 60);
  const [submitting, setSubmitting] = useState(false);
  const [result,    setResult]    = useState<any>(null);

  const startTime = useState(() => Date.now())[0];

  useEffect(() => {
    const t = setInterval(() => {
      setTimeLeft(s => {
        if (s <= 1) {
          handleSubmit(true);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [answers]);

  const handleSubmit = async (auto = false) => {
    if (submitting) return;
    if (!auto && !confirm("Are you sure you want to submit? You cannot change your answers after submission.")) return;
    setSubmitting(true);
    const ans = exam.questions.map(q => ({
      questionId:     q._id,
      selectedOption: answers[q._id] ?? "",
    }));
    const timeTaken = Math.round((Date.now() - startTime) / 1000);
    onSubmit(ans, timeTaken);
  };

  const mm = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const ss = String(timeLeft % 60).padStart(2, "0");
  const urgent = timeLeft < 300;
  const q = exam.questions[current];
  const answered = Object.keys(answers).filter(k => answers[k]).length;

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-card border-b border-border px-4 py-3 flex items-center justify-between gap-3 shadow-sm">
        <div className="min-w-0">
          <p className="font-bold text-sm truncate">{exam.title}</p>
          <p className="text-xs text-muted-foreground">Q {current + 1}/{exam.questions.length} · {answered} answered</p>
        </div>
        <div className={`flex items-center gap-1.5 font-mono font-extrabold text-sm px-3 py-1.5 rounded-lg shrink-0 ${
          urgent ? "bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400 animate-pulse" : "bg-muted text-foreground"
        }`}>
          <Timer className="h-3.5 w-3.5" />{mm}:{ss}
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 md:p-6 max-w-2xl mx-auto w-full">
        {/* Progress */}
        <div className="h-1.5 bg-muted rounded-full mb-6 overflow-hidden">
          <div className="h-full bg-[#3ecf8e] rounded-full transition-all"
            style={{ width: `${(answered / exam.questions.length) * 100}%` }} />
        </div>

        {/* Question */}
        <div className="bg-card border border-border rounded-2xl p-6 mb-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg gradient-navy flex items-center justify-center shrink-0">
              <span className="text-white font-bold text-xs">{current + 1}</span>
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">{q.marks} mark{q.marks > 1 ? "s" : ""}</p>
              <p className="text-sm font-semibold text-foreground leading-relaxed">{q.text}</p>
            </div>
          </div>
        </div>

        {/* Options */}
        <div className="space-y-3 mb-6">
          {q.options?.map(opt => {
            const selected = answers[q._id] === opt.id;
            return (
              <button key={opt.id}
                onClick={() => setAnswers(a => ({ ...a, [q._id]: opt.id }))}
                className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all ${
                  selected ? "border-[#3ecf8e] bg-[#3ecf8e]/10" : "border-border bg-card hover:border-[#3ecf8e]/40"
                }`}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-extrabold text-sm shrink-0 ${
                  selected ? "bg-[#3ecf8e] text-black" : "bg-muted text-muted-foreground"
                }`}>{opt.id.toUpperCase()}</div>
                <span className={`text-sm font-medium ${selected ? "text-foreground font-semibold" : "text-muted-foreground"}`}>
                  {opt.text}
                </span>
                {selected && <CheckCircle2 className="h-4 w-4 text-[#3ecf8e] ml-auto shrink-0" />}
              </button>
            );
          })}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between gap-3 mb-6">
          <Button variant="outline" onClick={() => setCurrent(c => Math.max(0, c - 1))} disabled={current === 0}>
            ← Prev
          </Button>
          {current < exam.questions.length - 1
            ? <Button onClick={() => setCurrent(c => c + 1)} className="bg-[#3ecf8e] hover:bg-[#34b27b] text-black font-bold">Next →</Button>
            : <Button onClick={() => handleSubmit()} disabled={submitting} className="gradient-orange text-white font-bold gap-2">
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Submit
              </Button>
          }
        </div>

        {/* Question palette */}
        <div className="bg-card border border-border rounded-2xl p-4">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3">Question Navigator</p>
          <div className="flex flex-wrap gap-2">
            {exam.questions.map((question, i) => (
              <button key={question._id} onClick={() => setCurrent(i)}
                className={`w-9 h-9 rounded-lg text-xs font-bold transition-all ${
                  i === current          ? "gradient-navy text-white scale-110"
                  : answers[question._id] ? "bg-[#3ecf8e] text-black"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}>{i + 1}</button>
            ))}
          </div>
          <div className="flex items-center gap-4 mt-3 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-[#3ecf8e] inline-block" /> Answered</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-muted inline-block" /> Not answered</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Theory Exam Screen ───────────────────────────────────────────────────────
function TheoryScreen({
  exam, submission, onSubmit,
}: {
  exam: OfficialExam;
  submission: ExamSubmission;
  onSubmit: (answers: { questionId: string; answerText: string }[], timeTaken: number) => void;
}) {
  const [answers,    setAnswers]    = useState<Record<string, string>>({});
  const [current,    setCurrent]    = useState(0);
  const [timeLeft,   setTimeLeft]   = useState(exam.duration * 60);
  const [submitting, setSubmitting] = useState(false);

  const startTime = useState(() => Date.now())[0];

  useEffect(() => {
    const t = setInterval(() => setTimeLeft(s => {
      if (s <= 1) { handleSubmit(true); return 0; }
      return s - 1;
    }), 1000);
    return () => clearInterval(t);
  }, [answers]);

  const handleSubmit = async (auto = false) => {
    if (submitting) return;
    if (!auto && !confirm("Submit your theory answers? This cannot be undone.")) return;
    setSubmitting(true);
    const ans = exam.questions.map(q => ({
      questionId: q._id,
      answerText: answers[q._id] ?? "",
    }));
    const timeTaken = Math.round((Date.now() - startTime) / 1000);
    onSubmit(ans, timeTaken);
  };

  const mm = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const ss = String(timeLeft % 60).padStart(2, "0");
  const urgent = timeLeft < 300;
  const q = exam.questions[current];
  const wordCount = (answers[q._id] ?? "").trim().split(/\s+/).filter(Boolean).length;
  const answeredCount = Object.values(answers).filter(v => v.trim()).length;

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="sticky top-0 z-20 bg-card border-b border-border px-4 py-3 flex items-center justify-between gap-3 shadow-sm">
        <div className="min-w-0">
          <p className="font-bold text-sm truncate">{exam.title}</p>
          <p className="text-xs text-muted-foreground">Q {current + 1}/{exam.questions.length} · {answeredCount} answered</p>
        </div>
        <div className={`flex items-center gap-1.5 font-mono font-extrabold text-sm px-3 py-1.5 rounded-lg shrink-0 ${
          urgent ? "bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400 animate-pulse" : "bg-muted text-foreground"
        }`}>
          <Timer className="h-3.5 w-3.5" />{mm}:{ss}
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 md:p-6 max-w-3xl mx-auto w-full space-y-4">
        {/* Progress strips */}
        <div className="flex gap-2">
          {exam.questions.map((question, i) => (
            <button key={i} onClick={() => setCurrent(i)}
              className={`flex-1 h-1.5 rounded-full transition-all ${
                i === current ? "bg-purple-500"
                : answers[exam.questions[i]._id]?.trim() ? "bg-[#3ecf8e]"
                : "bg-muted"
              }`} />
          ))}
        </div>

        {/* Question */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-purple-500 flex items-center justify-center shrink-0">
              <span className="text-white font-bold text-xs">{current + 1}</span>
            </div>
            <span className="text-xs font-bold text-purple-600 dark:text-purple-400">{q.marks} marks</span>
          </div>
          <p className="text-sm font-semibold text-foreground leading-relaxed mb-3">{q.text}</p>
          {q.hint && (
            <div className="flex items-start gap-2 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-2.5">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700 dark:text-amber-400">{q.hint}</p>
            </div>
          )}
        </div>

        {/* Answer box */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
          <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/40">
            <p className="text-xs font-bold text-muted-foreground">Your Answer</p>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              wordCount > 50 ? "bg-[#3ecf8e]/10 text-[#3ecf8e]" : "bg-muted text-muted-foreground"
            }`}>{wordCount} words</span>
          </div>
          <textarea
            value={answers[q._id] ?? ""}
            onChange={e => setAnswers(a => ({ ...a, [q._id]: e.target.value }))}
            placeholder="Type your answer here..."
            className="w-full min-h-[240px] p-4 text-sm text-foreground bg-card resize-y outline-none placeholder:text-muted-foreground/50 leading-relaxed"
          />
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between gap-3">
          <Button variant="outline" onClick={() => setCurrent(c => Math.max(0, c - 1))} disabled={current === 0}>← Prev</Button>
          {current < exam.questions.length - 1
            ? <Button onClick={() => setCurrent(c => c + 1)} className="bg-purple-500 hover:bg-purple-600 text-white font-bold">Next →</Button>
            : <Button onClick={() => handleSubmit()} disabled={submitting} className="gradient-orange text-white font-bold gap-2">
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Submit
              </Button>
          }
        </div>
      </div>
    </div>
  );
}

// ─── Result Screen ────────────────────────────────────────────────────────────
function ResultScreen({ result, onBack }: { result: any; onBack: () => void }) {
  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="max-w-sm w-full text-center space-y-6">
        <div className="w-24 h-24 rounded-full bg-[#3ecf8e]/10 border-4 border-[#3ecf8e] flex items-center justify-center mx-auto">
          <Trophy className="h-12 w-12 text-[#3ecf8e]" />
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
            {result.hasTheory ? "Submitted — Awaiting Theory Marking" : "Exam Complete"}
          </p>
          <h2 className="text-4xl font-extrabold text-foreground">
            {result.totalScore}<span className="text-xl text-muted-foreground">/{result.maxScore}</span>
          </h2>
          {result.percentage !== undefined && (
            <p className="text-lg font-bold text-[#3ecf8e] mt-1">{result.percentage}%</p>
          )}
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "MCQ Score",    value: result.mcqScore    ?? "—" },
            { label: "Theory Score", value: result.hasTheory ? "Pending" : (result.theoryScore ?? "—") },
          ].map(s => (
            <div key={s.label} className="bg-muted/60 rounded-xl p-3">
              <p className="text-lg font-extrabold text-foreground">{s.value}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
        {result.hasTheory && (
          <div className="flex items-start gap-2 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-3 text-left">
            <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700 dark:text-amber-400">
              Your theory answers are being marked by your teacher. Check back later for your full score.
            </p>
          </div>
        )}
        <Button onClick={onBack} className="w-full bg-[#3ecf8e] hover:bg-[#34b27b] text-black font-bold">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Portal
        </Button>
      </div>
    </div>
  );
}

// ─── Main CandidateDashboard ──────────────────────────────────────────────────
export default function CandidateDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  const [exams,     setExams]     = useState<OfficialExam[]>([]);
  const [myResults, setMyResults] = useState<ExamSubmission[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [filter,    setFilter]    = useState<"all" | "active" | "closed">("all");
  const [typeFilter, setTypeFilter] = useState<"all" | "mcq" | "theory" | "mixed">("all");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<"exams" | "profile">("exams");
  const [selectedClass, setSelectedClass] = useState<string>("all");
  const [selectedTerm, setSelectedTerm] = useState<string>("all");
  const [profileImg, setProfileImg] = useState<string>("");
  const [profileDob, setProfileDob] = useState<string>("");

  // Initialise profile fields from user context
  useEffect(() => {
    if (user) {
      if ((user as any).image)       setProfileImg((user as any).image);
      if ((user as any).dateOfBirth) setProfileDob((user as any).dateOfBirth);
    }
  }, [user]);

  // Exam session state
  const [activeExam,   setActiveExam]   = useState<OfficialExam | null>(null);
  const [submission,   setSubmission]   = useState<ExamSubmission | null>(null);
  const [examResult,   setExamResult]   = useState<any>(null);
  const [starting,     setStarting]     = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [examRes, resultRes] = await Promise.all([
        officialExams.list(),
        officialExams.getMyResults().catch(() => ({ submissions: [] })),
      ]);
      setExams(examRes.exams ?? []);
      setMyResults(resultRes.submissions ?? []);
    } catch (err: any) {
      toast.error(err.message ?? "Failed to load exams");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleStart = async (exam: OfficialExam) => {
    setStarting(true);
    try {
      const { submission: sub, exam: fullExam, resumed } = await officialExams.start(exam._id);
      setSubmission(sub);
      setActiveExam(fullExam);
      if (resumed) toast.info("Resuming your previous attempt...");
    } catch (err: any) {
      toast.error(err.message ?? "Failed to start exam");
    } finally {
      setStarting(false);
    }
  };

  const handleSubmit = async (
    answers: { questionId: string; selectedOption?: string; answerText?: string }[],
    timeTaken: number
  ) => {
    if (!activeExam || !submission) return;
    try {
      const { result } = await officialExams.submit(activeExam._id, submission._id, answers, timeTaken);
      setExamResult(result);
      setSubmission(null);
      load(); // refresh results
    } catch (err: any) {
      toast.error(err.message ?? "Failed to submit exam");
    }
  };

  const handleBack = () => {
    setActiveExam(null);
    setSubmission(null);
    setExamResult(null);
  };

  // ── Active exam session ──
  if (examResult) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <ResultScreen result={examResult} onBack={handleBack} />
      </div>
    );
  }

  if (activeExam && submission) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        {(activeExam.type === "mcq") ? (
          <MCQScreen exam={activeExam} submission={submission} onSubmit={handleSubmit} />
        ) : (activeExam.type === "theory") ? (
          <TheoryScreen exam={activeExam} submission={submission} onSubmit={handleSubmit} />
        ) : (
          // Mixed — show MCQ first then theory (simplified: treat as MCQ for now)
          <MCQScreen exam={activeExam} submission={submission} onSubmit={handleSubmit} />
        )}
      </div>
    );
  }

  // ── Filter ──
  const CLASSES = ["SS1","SS2","SS3","WAEC","JAMB"];
  const TERMS   = ["First Term","Second Term","Third Term"];

  const filtered = exams.filter(e => {
    const classMatch = selectedClass === "all" || e.className === selectedClass || e.className === "All";
    const statusMatch = filter === "all" || e.status === filter;
    const typeMatch   = typeFilter === "all" || e.type === typeFilter;
    return classMatch && statusMatch && typeMatch;
  });

  const activeCount    = exams.filter(e => e.status === "active").length;
  const completedCount = myResults.filter(s => s.status !== "in_progress").length;
  const avgPct = myResults.length
    ? Math.round(myResults.filter(s => s.percentage).reduce((a, s) => a + s.percentage, 0) / myResults.length)
    : 0;

  const initials = (user?.name ?? "C").split(" ").map(n => n[0]).join("").toUpperCase().slice(0,2);

  return (
    <div className="min-h-screen bg-background flex">

      {/* ── Sidebar ──────────────────────────────────────────────── */}
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`
        fixed top-0 left-0 h-full z-50 w-64 bg-card border-r border-border flex flex-col shadow-xl
        transition-transform duration-300
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        lg:relative lg:translate-x-0 lg:shadow-none lg:z-auto
      `}>
        {/* Sidebar header */}
        <div className="flex items-center gap-2 px-4 py-4 border-b border-border shrink-0">
          <div className="w-8 h-8 rounded-lg gradient-orange flex items-center justify-center">
            <ClipboardList className="h-4 w-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-extrabold text-sm text-foreground leading-none">Exam Portal</p>
            <p className="text-[10px] text-muted-foreground">Chukwudi Academy</p>
          </div>
          <button className="lg:hidden w-7 h-7 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground"
            onClick={() => setSidebarOpen(false)}>
            <XCircle className="h-4 w-4" />
          </button>
        </div>

        {/* Sidebar nav */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {/* Exams section */}
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground px-2 pt-2 pb-1">Exams</p>
          <button
            onClick={() => { setActiveSection("exams"); setSelectedClass("all"); setSidebarOpen(false); }}
            className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors text-left ${
              activeSection === "exams" && selectedClass === "all"
                ? "bg-[#3ecf8e]/10 text-[#3ecf8e]"
                : "text-foreground hover:bg-muted"
            }`}>
            <FileText className="h-4 w-4 shrink-0" /> All Exams
          </button>

          {/* Class filter */}
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground px-2 pt-3 pb-1">By Class</p>
          {CLASSES.map(cls => (
            <button key={cls}
              onClick={() => { setActiveSection("exams"); setSelectedClass(cls); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-colors text-left ${
                activeSection === "exams" && selectedClass === cls
                  ? "bg-[#3ecf8e]/10 text-[#3ecf8e]"
                  : "text-foreground hover:bg-muted"
              }`}>
              <BookOpen className="h-3.5 w-3.5 shrink-0 opacity-60" />
              {cls}
              <span className="ml-auto text-[10px] text-muted-foreground">
                {exams.filter(e => e.className === cls || e.className === "All").length}
              </span>
            </button>
          ))}

          {/* Term filter */}
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground px-2 pt-3 pb-1">By Term</p>
          {TERMS.map(term => (
            <button key={term}
              onClick={() => { setSelectedTerm(term); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-colors text-left ${
                selectedTerm === term
                  ? "bg-[#3ecf8e]/10 text-[#3ecf8e]"
                  : "text-foreground hover:bg-muted"
              }`}>
              <Trophy className="h-3.5 w-3.5 shrink-0 opacity-60" />
              {term}
            </button>
          ))}

          {/* Profile */}
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground px-2 pt-3 pb-1">Account</p>
          <button
            onClick={() => { setActiveSection("profile"); setSidebarOpen(false); }}
            className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors text-left ${
              activeSection === "profile"
                ? "bg-[#3ecf8e]/10 text-[#3ecf8e]"
                : "text-foreground hover:bg-muted"
            }`}>
            <User2 className="h-4 w-4 shrink-0" /> My Profile
          </button>
        </nav>

        {/* Sidebar footer */}
        <div className="border-t border-border p-3 space-y-2 shrink-0">
          <button onClick={() => navigate("/dashboard")}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-muted-foreground hover:bg-muted transition-colors">
            <ArrowLeft className="h-4 w-4" /> Study Dashboard
          </button>
          <button onClick={() => { logout(); navigate("/login"); }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </div>
      </aside>

      {/* ── Main content ────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Top bar */}
        <div className="sticky top-0 z-30 bg-card border-b border-border shadow-sm shrink-0">
          <div className="px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button className="lg:hidden w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:bg-muted transition-colors"
                onClick={() => setSidebarOpen(true)}>
                <ClipboardList className="h-4 w-4" />
              </button>
              <div>
                <p className="font-extrabold text-sm text-foreground leading-none">
                  {activeSection === "profile" ? "My Profile" : selectedClass === "all" ? "All Exams" : `${selectedClass} Exams`}
                </p>
                <p className="text-[10px] text-muted-foreground">{selectedTerm !== "all" ? selectedTerm : "All Terms"}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={load} className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground">
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              </button>
              <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="w-8 h-8 rounded-full bg-background border border-border flex items-center justify-center hover:bg-muted transition-colors">
                {theme === "dark" ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-600" />}
              </button>
            </div>
          </div>
        </div>

        {/* ── Profile Section ─────────────────────────── */}
        {activeSection === "profile" && (
          <div className="flex-1 overflow-auto p-6">
            <div className="max-w-2xl mx-auto space-y-6">

              {/* Profile card */}
              <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                <div className="h-24 gradient-orange relative">
                  <div className="absolute inset-0 opacity-10"
                    style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
                </div>
                <div className="px-6 pb-6">
                  {/* Avatar */}
                  <div className="relative -mt-12 mb-4">
                    <div className="w-24 h-24 rounded-2xl border-4 border-card overflow-hidden bg-muted shadow-lg">
                      {profileImg ? (
                        <img src={profileImg} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full gradient-navy flex items-center justify-center">
                          <span className="text-white font-extrabold text-2xl">{initials}</span>
                        </div>
                      )}
                    </div>
                    <label className="absolute bottom-0 right-0 w-8 h-8 bg-[#3ecf8e] rounded-full flex items-center justify-center cursor-pointer shadow-md hover:bg-[#34b27b] transition-colors" title="Upload photo">
                      <input type="file" accept="image/*" className="hidden"
                        onChange={e => {
                          const f = e.target.files?.[0];
                          if (f) { const r = new FileReader(); r.onload = ev => setProfileImg(ev.target?.result as string); r.readAsDataURL(f); }
                        }} />
                      <Camera className="h-3.5 w-3.5 text-black" />
                    </label>
                  </div>

                  <h2 className="text-xl font-extrabold text-foreground">{user?.name}</h2>
                  {user?.className && (
                    <span className="inline-block text-xs font-bold bg-[#3ecf8e]/10 text-[#3ecf8e] px-2 py-0.5 rounded-full mt-1">{user.className}</span>
                  )}
                </div>
              </div>

              {/* Info grid */}
              <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
                <h3 className="font-bold text-foreground">Personal Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Full Name</p>
                    <p className="text-sm font-semibold text-foreground">{user?.name ?? "—"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Email Address</p>
                    <p className="text-sm font-semibold text-foreground">{user?.email ?? "—"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Phone Number</p>
                    <p className="text-sm font-semibold text-foreground">{user?.phone ?? "Not provided"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Date of Birth</p>
                    {profileDob ? (
                      <p className="text-sm font-semibold text-foreground">{new Date(profileDob).toLocaleDateString("en-GB", { day:"numeric", month:"long", year:"numeric" })}</p>
                    ) : (
                      <input type="date" value={profileDob} onChange={e => setProfileDob(e.target.value)}
                        className="text-sm font-semibold text-foreground bg-transparent border-b border-dashed border-border focus:outline-none focus:border-[#3ecf8e] w-full" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Class</p>
                    <p className="text-sm font-semibold text-foreground">{user?.className ?? "—"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Role</p>
                    <p className="text-sm font-semibold text-foreground capitalize">{user?.role ?? "Student"}</p>
                  </div>
                </div>
              </div>

              {/* Exam results summary */}
              <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                <h3 className="font-bold text-foreground mb-4">My Exam Results</h3>
                {myResults.length === 0 ? (
                  <div className="text-center py-8 border border-dashed border-border rounded-xl bg-muted/20">
                    <Trophy className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No completed exams yet</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left text-xs font-bold text-muted-foreground pb-2 pr-3">Exam</th>
                          <th className="text-left text-xs font-bold text-muted-foreground pb-2 pr-3">Score</th>
                          <th className="text-left text-xs font-bold text-muted-foreground pb-2 pr-3">%</th>
                          <th className="text-left text-xs font-bold text-muted-foreground pb-2">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {myResults.map(r => (
                          <tr key={r._id}>
                            <td className="py-2.5 pr-3 font-semibold text-foreground text-xs max-w-[160px] truncate">{r.examTitle ?? r.examId}</td>
                            <td className="py-2.5 pr-3 text-muted-foreground text-xs">{r.totalScore}/{r.maxScore}</td>
                            <td className="py-2.5 pr-3 text-xs font-bold text-foreground">{r.percentage ?? "—"}%</td>
                            <td className="py-2.5">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                r.status === "submitted" || r.status === "graded"
                                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                                  : "bg-amber-100 text-amber-700"
                              }`}>{r.status}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Exams Section ──────────────────────────── */}
        {activeSection === "exams" && (
          <div className="flex-1 overflow-auto p-4 md:p-6 space-y-5">

            {/* Stats row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "Available",   value: loading ? "…" : activeCount,    bg: "bg-gradient-to-br from-[#3ecf8e] to-[#059669]", t: "text-black" },
                { label: "Completed",   value: loading ? "…" : completedCount, bg: "gradient-navy",                                   t: "text-white" },
                { label: "Avg Score",   value: loading ? "…" : (avgPct ? `${avgPct}%` : "—"), bg: "bg-gradient-to-br from-purple-700 to-purple-500", t: "text-white" },
                { label: "Total",       value: loading ? "…" : exams.length,   bg: "gradient-orange",                                 t: "text-white" },
              ].map(s => (
                <div key={s.label} className={`rounded-2xl p-4 relative overflow-hidden ${s.bg}`}>
                  <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "16px 16px" }} />
                  <p className={`text-xl font-extrabold ${s.t} relative z-10`}>{s.value}</p>
                  <p className={`text-xs font-semibold mt-0.5 ${s.t} opacity-80 relative z-10`}>{s.label}</p>
                </div>
              ))}
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2">
              {(["all","active","closed"] as const).map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-full border transition-all ${
                    filter === f ? "bg-foreground text-background border-foreground" : "border-border text-muted-foreground hover:border-foreground"
                  }`}>{f === "all" ? "All Status" : f.charAt(0).toUpperCase() + f.slice(1)}</button>
              ))}
              <div className="w-px bg-border mx-1 self-stretch" />
              {(["all","mcq","theory","mixed"] as const).map(f => (
                <button key={f} onClick={() => setTypeFilter(f)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-full border transition-all ${
                    typeFilter === f ? "bg-foreground text-background border-foreground" : "border-border text-muted-foreground hover:border-foreground"
                  }`}>{f === "all" ? "All Types" : f.toUpperCase()}</button>
              ))}
            </div>

            {/* Exams Table */}
            {loading ? (
              <div className="space-y-2">
                {[1,2,3,4].map(i => <div key={i} className="h-14 bg-muted rounded-xl animate-pulse" />)}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-border rounded-2xl bg-muted/20">
                <ClipboardList className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="font-bold text-foreground">No exams found</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {exams.length === 0 ? "No exams published yet. Check back soon." : "Try a different filter."}
                </p>
              </div>
            ) : (
              <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/30">
                        <th className="text-left text-xs font-bold text-muted-foreground px-4 py-3 pr-3">Exam Title</th>
                        <th className="text-left text-xs font-bold text-muted-foreground py-3 pr-3">Subject</th>
                        <th className="text-left text-xs font-bold text-muted-foreground py-3 pr-3">Class</th>
                        <th className="text-left text-xs font-bold text-muted-foreground py-3 pr-3">Type</th>
                        <th className="text-left text-xs font-bold text-muted-foreground py-3 pr-3">Duration</th>
                        <th className="text-left text-xs font-bold text-muted-foreground py-3 pr-3">Marks</th>
                        <th className="text-left text-xs font-bold text-muted-foreground py-3 pr-3">Status</th>
                        <th className="text-right text-xs font-bold text-muted-foreground py-3 px-4">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filtered.map(exam => {
                        const myResult = myResults.find(s => s.examId === exam._id);
                        const isCompleted = !!myResult && myResult.status !== "in_progress";
                        const isActive = exam.status === "active";
                        return (
                          <tr key={exam._id} className="hover:bg-muted/30 transition-colors">
                            <td className="px-4 py-3 pr-3">
                              <p className="font-semibold text-foreground text-sm leading-tight max-w-[180px] truncate">{exam.title}</p>
                              {isCompleted && myResult && (
                                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">
                                  Score: {myResult.totalScore}/{myResult.maxScore} ({myResult.percentage}%)
                                </p>
                              )}
                            </td>
                            <td className="py-3 pr-3 text-muted-foreground text-xs">{exam.subject}</td>
                            <td className="py-3 pr-3">
                              <span className="text-[10px] font-bold bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{exam.className ?? "All"}</span>
                            </td>
                            <td className="py-3 pr-3">
                              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase text-white ${
                                exam.type === "mcq" ? "bg-blue-500" : exam.type === "theory" ? "bg-purple-500" : "bg-orange-500"
                              }`}>{exam.type}</span>
                            </td>
                            <td className="py-3 pr-3 text-muted-foreground text-xs">{exam.duration}m</td>
                            <td className="py-3 pr-3 text-muted-foreground text-xs font-semibold">{exam.totalMarks}</td>
                            <td className="py-3 pr-3">
                              {isCompleted ? (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 flex items-center gap-1 w-fit">
                                  <CheckCircle2 className="h-2.5 w-2.5" /> Done
                                </span>
                              ) : isActive ? (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 flex items-center gap-1 w-fit">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live
                                </span>
                              ) : (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 w-fit block">
                                  {exam.status === "draft" ? "Draft" : "Closed"}
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-right">
                              {isActive && !isCompleted ? (
                                <Button size="sm" onClick={() => handleStart(exam)} disabled={starting}
                                  className="h-8 px-4 bg-[#3ecf8e] hover:bg-[#34b27b] text-black font-bold text-xs gap-1">
                                  {starting ? <Loader2 className="h-3 w-3 animate-spin" /> : <><Zap className="h-3 w-3" /> Start</>}
                                </Button>
                              ) : isCompleted ? (
                                <span className="text-xs text-muted-foreground font-semibold">Submitted</span>
                              ) : (
                                <span className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
                                  <Lock className="h-3 w-3" /> Locked
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
