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
  RefreshCw, Loader2, Star,
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
  const filtered = exams.filter(e =>
    (filter === "all" || e.status === filter) &&
    (typeFilter === "all" || e.type === typeFilter)
  );

  const activeCount    = exams.filter(e => e.status === "active").length;
  const completedCount = myResults.filter(s => s.status !== "in_progress").length;
  const avgPct = myResults.length
    ? Math.round(myResults.filter(s => s.percentage).reduce((a, s) => a + s.percentage, 0) / myResults.length)
    : 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Theme toggle */}
      <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className="fixed top-4 right-4 z-50 w-9 h-9 rounded-full bg-background border border-border shadow-md flex items-center justify-center hover:bg-muted transition-colors">
        {theme === "dark" ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-600" />}
      </button>

      {/* Nav */}
      <div className="sticky top-0 z-30 bg-card border-b border-border shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/dashboard")}
              className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:bg-muted transition-colors">
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg gradient-orange flex items-center justify-center">
                <ClipboardList className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="font-extrabold text-sm text-foreground leading-none">Exam Portal</p>
                <p className="text-[10px] text-muted-foreground">Chukwudi Academy</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={load} className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground">
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </button>
            <div className="hidden sm:flex items-center gap-2 bg-muted/60 rounded-xl px-3 py-1.5">
              <div className="w-6 h-6 rounded-full gradient-navy flex items-center justify-center text-white font-extrabold text-[10px]">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <span className="text-xs font-semibold text-foreground">{user?.name?.split(" ")[0]}</span>
              {user?.className && (
                <span className="text-[10px] font-bold bg-[#3ecf8e]/10 text-[#3ecf8e] px-1.5 py-0.5 rounded-full">{user.className}</span>
              )}
            </div>
            <button onClick={() => { logout(); navigate("/login"); }}
              className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:bg-red-50 hover:border-red-300 hover:text-red-500 transition-colors text-muted-foreground">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Hero */}
        <div className="relative overflow-hidden rounded-2xl gradient-orange p-6 text-white">
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <ClipboardList className="h-5 w-5" />
              <span className="text-xs font-bold uppercase tracking-widest opacity-80">Official Exam Portal</span>
            </div>
            <h1 className="text-2xl font-extrabold">Welcome, {user?.name?.split(" ")[0]} 👋</h1>
            <p className="text-white/70 text-sm mt-1">
              {loading ? "Loading your exams…"
                : activeCount > 0 ? `${activeCount} exam${activeCount > 1 ? "s" : ""} available. Good luck!`
                : "No active exams right now. Check back soon."}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Available",  value: loading ? "…" : activeCount,    icon: <Zap className="h-5 w-5" />,          bg: "bg-gradient-to-br from-[#3ecf8e] to-[#059669]", ic: "bg-black/15", t: "text-black" },
            { label: "Completed",  value: loading ? "…" : completedCount,  icon: <CheckCircle2 className="h-5 w-5" />, bg: "gradient-navy",                                 ic: "bg-white/20", t: "text-white" },
            { label: "Avg Score",  value: loading ? "…" : (avgPct ? `${avgPct}%` : "—"), icon: <BarChart3 className="h-5 w-5" />, bg: "bg-gradient-to-br from-purple-700 to-purple-500", ic: "bg-white/20", t: "text-white" },
            { label: "Total Exams", value: loading ? "…" : exams.length,  icon: <ClipboardList className="h-5 w-5" />, bg: "gradient-orange", ic: "bg-white/20", t: "text-white" },
          ].map(s => (
            <div key={s.label} className={`rounded-2xl p-5 relative overflow-hidden ${s.bg}`}>
              <div className="absolute inset-0 opacity-10"
                style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "18px 18px" }} />
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${s.ic} ${s.t}`}>{s.icon}</div>
              <p className={`text-2xl font-extrabold ${s.t}`}>{s.value}</p>
              <p className={`text-xs font-semibold mt-0.5 ${s.t} opacity-80`}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          {[
            { k: "all", l: "All" }, { k: "active", l: "Available" }, { k: "closed", l: "Closed" },
          ].map(f => (
            <button key={f.k} onClick={() => setFilter(f.k as any)}
              className={`text-xs font-bold px-3 py-1.5 rounded-full border transition-all ${
                filter === f.k ? "bg-foreground text-background border-foreground" : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
              }`}>{f.l}</button>
          ))}
          <div className="w-px bg-border mx-1 self-stretch" />
          {[
            { k: "all", l: "All Types" }, { k: "mcq", l: "MCQ" }, { k: "theory", l: "Theory" }, { k: "mixed", l: "Mixed" },
          ].map(f => (
            <button key={f.k} onClick={() => setTypeFilter(f.k as any)}
              className={`text-xs font-bold px-3 py-1.5 rounded-full border transition-all ${
                typeFilter === f.k ? "bg-foreground text-background border-foreground" : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
              }`}>{f.l}</button>
          ))}
        </div>

        {/* Exam grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3].map(i => <div key={i} className="h-52 bg-muted rounded-2xl animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-border rounded-2xl bg-muted/20">
            <ClipboardList className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="font-bold text-foreground">No exams found</p>
            <p className="text-sm text-muted-foreground mt-1">
              {exams.length === 0 ? "Your teacher hasn't published any exams yet." : "Try a different filter."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(exam => (
              <ExamCard key={exam._id} exam={exam} onStart={handleStart} myResults={myResults} />
            ))}
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-border">
          <button onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Study Dashboard
          </button>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-[#3ecf8e] animate-pulse" />
            <span className="text-xs text-muted-foreground">Portal Active</span>
          </div>
        </div>
      </div>
    </div>
  );
}
