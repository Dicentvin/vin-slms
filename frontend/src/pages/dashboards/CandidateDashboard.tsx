/**
 * CandidateDashboard — Official Exam Portal
 * Students and candidates take MCQ or Theory exams here.
 */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@/hooks/AuthProvider";
import {
  ClipboardList, CheckSquare, FileText, Clock, Trophy,
  AlertTriangle, ChevronRight, BookOpen, Zap, Lock,
  GraduationCap, LogOut, ArrowLeft, Timer, CheckCircle2,
  Circle, XCircle, Send, RotateCcw, Star, BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/components/provider/theme";
import { Sun, Moon } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
type ExamType = "mcq" | "theory";
type ExamStatus = "upcoming" | "active" | "completed";

interface MockExam {
  _id: string;
  title: string;
  subject: string;
  type: ExamType;
  duration: number; // minutes
  totalQuestions: number;
  totalMarks: number;
  status: ExamStatus;
  scheduledAt?: string;
  score?: number;
  className: string;
}

interface MCQOption { id: string; text: string; }
interface MCQQuestion {
  _id: string; text: string; options: MCQOption[]; marks: number;
}
interface TheoryQuestion {
  _id: string; text: string; marks: number; hint?: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_EXAMS: MockExam[] = [
  {
    _id: "e1", title: "Mathematics Mock WAEC",    subject: "Mathematics",
    type: "mcq",    duration: 60, totalQuestions: 40, totalMarks: 40,
    status: "active",    className: "SS3",
  },
  {
    _id: "e2", title: "English Language Theory",  subject: "English",
    type: "theory", duration: 90, totalQuestions: 3,  totalMarks: 60,
    status: "active",    className: "SS3",
  },
  {
    _id: "e3", title: "Physics MCQ — Term 2",     subject: "Physics",
    type: "mcq",    duration: 45, totalQuestions: 30, totalMarks: 30,
    status: "upcoming", scheduledAt: "2025-06-10T09:00:00", className: "SS2",
  },
  {
    _id: "e4", title: "Chemistry Practical Theory", subject: "Chemistry",
    type: "theory", duration: 120, totalQuestions: 5, totalMarks: 80,
    status: "completed", score: 62, className: "SS3",
  },
  {
    _id: "e5", title: "Biology MCQ — JAMB Prep",  subject: "Biology",
    type: "mcq",    duration: 60, totalQuestions: 50, totalMarks: 50,
    status: "completed", score: 44, className: "JAMB",
  },
];

const MOCK_MCQ: MCQQuestion[] = [
  { _id: "q1", text: "If 2x + 3 = 11, what is x?", marks: 1,
    options: [{ id: "a", text: "3" }, { id: "b", text: "4" }, { id: "c", text: "5" }, { id: "d", text: "6" }] },
  { _id: "q2", text: "Find the area of a circle with radius 7 cm. (π = 22/7)", marks: 1,
    options: [{ id: "a", text: "154 cm²" }, { id: "b", text: "44 cm²" }, { id: "c", text: "49 cm²" }, { id: "d", text: "308 cm²" }] },
  { _id: "q3", text: "Simplify: 3² + 4²", marks: 1,
    options: [{ id: "a", text: "24" }, { id: "b", text: "25" }, { id: "c", text: "49" }, { id: "d", text: "7" }] },
  { _id: "q4", text: "What is the LCM of 12 and 18?", marks: 1,
    options: [{ id: "a", text: "6" }, { id: "b", text: "36" }, { id: "c", text: "216" }, { id: "d", text: "72" }] },
  { _id: "q5", text: "Factorise: x² - 9", marks: 1,
    options: [{ id: "a", text: "(x+3)(x-3)" }, { id: "b", text: "(x-3)²" }, { id: "c", text: "(x+3)²" }, { id: "d", text: "(x-9)(x+1)" }] },
];

const MOCK_THEORY: TheoryQuestion[] = [
  { _id: "t1", text: "Write a letter to your school principal requesting a school library improvement. Your letter should be formal and include at least 3 specific suggestions.", marks: 20, hint: "Use formal letter format: address, date, salutation, body, closing." },
  { _id: "t2", text: "Explain the process of photosynthesis. In your answer, mention the reactants, products, and the role of chlorophyll.", marks: 20, hint: "Use the equation: 6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂" },
  { _id: "t3", text: "Describe THREE major causes of the Nigerian Civil War (1967–1970) and their effects on Nigerian society.", marks: 20, hint: "Consider political, ethnic, and economic factors." },
];

// ─── Sub-components ───────────────────────────────────────────────────────────
function ExamCard({ exam, onStart }: { exam: MockExam; onStart: (e: MockExam) => void }) {
  const typeColor = exam.type === "mcq"
    ? "bg-blue-500" : "bg-purple-500";

  const statusInfo = {
    active:    { label: "Active",    dot: "bg-emerald-500", text: "text-emerald-700 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/30" },
    upcoming:  { label: "Upcoming",  dot: "bg-amber-500",   text: "text-amber-700 dark:text-amber-400",     bg: "bg-amber-50 dark:bg-amber-950/30"   },
    completed: { label: "Completed", dot: "bg-slate-400",   text: "text-slate-600 dark:text-slate-400",     bg: "bg-slate-50 dark:bg-slate-900/30"   },
  }[exam.status];

  return (
    <div className={`bg-card border border-border rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group ${
      exam.status === "active" ? "border-l-4 border-l-[#3ecf8e]" : ""
    }`}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-[10px] font-extrabold text-white px-2 py-0.5 rounded-full uppercase tracking-wide ${typeColor}`}>
            {exam.type === "mcq" ? "MCQ" : "Theory"}
          </span>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusInfo.text} ${statusInfo.bg} flex items-center gap-1`}>
            <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot}`} />
            {statusInfo.label}
          </span>
          <span className="text-[10px] font-bold bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{exam.className}</span>
        </div>
        {exam.status === "completed" && exam.score !== undefined && (
          <div className="text-right shrink-0">
            <p className="text-lg font-extrabold text-foreground">{exam.score}<span className="text-xs text-muted-foreground">/{exam.totalMarks}</span></p>
            <p className="text-[10px] text-muted-foreground">Score</p>
          </div>
        )}
      </div>

      <h3 className="font-bold text-foreground text-sm leading-snug mb-1">{exam.title}</h3>
      <p className="text-xs text-muted-foreground mb-3">{exam.subject}</p>

      <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4 flex-wrap">
        <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{exam.duration} min</span>
        <span className="flex items-center gap-1"><ClipboardList className="h-3 w-3" />{exam.totalQuestions} questions</span>
        <span className="flex items-center gap-1"><Star className="h-3 w-3" />{exam.totalMarks} marks</span>
      </div>

      {exam.status === "active" && (
        <Button onClick={() => onStart(exam)} size="sm"
          className="w-full bg-[#3ecf8e] hover:bg-[#34b27b] text-black font-bold gap-2">
          <Zap className="h-3.5 w-3.5" /> Start Exam
        </Button>
      )}
      {exam.status === "upcoming" && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg p-2">
          <Lock className="h-3 w-3 shrink-0" />
          <span>Opens {exam.scheduledAt ? new Date(exam.scheduledAt).toLocaleDateString("en-NG", { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "soon"}</span>
        </div>
      )}
      {exam.status === "completed" && (
        <button className="w-full flex items-center justify-center gap-2 text-xs font-semibold text-muted-foreground border border-border rounded-lg p-2 hover:bg-muted transition-colors">
          <BarChart3 className="h-3.5 w-3.5" /> View Results
        </button>
      )}
    </div>
  );
}

// ─── MCQ Exam Screen ──────────────────────────────────────────────────────────
function MCQExamScreen({ exam, onExit }: { exam: MockExam; onExit: () => void }) {
  const [current,   setCurrent]   = useState(0);
  const [answers,   setAnswers]   = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [timeLeft,  setTimeLeft]  = useState(exam.duration * 60);

  useEffect(() => {
    if (submitted) return;
    const t = setInterval(() => setTimeLeft(s => s <= 1 ? (setSubmitted(true), 0) : s - 1), 1000);
    return () => clearInterval(t);
  }, [submitted]);

  const mm = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const ss = String(timeLeft % 60).padStart(2, "0");
  const urgent = timeLeft < 300;

  const score = submitted
    ? MOCK_MCQ.filter(q => answers[q._id] === (q._id === "q1" ? "b" : q._id === "q2" ? "a" : q._id === "q3" ? "b" : q._id === "q4" ? "b" : "a")).length
    : 0;

  if (submitted) return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="max-w-sm w-full text-center space-y-6">
        <div className="w-24 h-24 rounded-full bg-[#3ecf8e]/10 border-4 border-[#3ecf8e] flex items-center justify-center mx-auto">
          <Trophy className="h-12 w-12 text-[#3ecf8e]" />
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Exam Submitted</p>
          <h2 className="text-4xl font-extrabold text-foreground">{score}<span className="text-xl text-muted-foreground">/{MOCK_MCQ.length}</span></h2>
          <p className="text-muted-foreground text-sm mt-2">{exam.title}</p>
        </div>
        <div className="grid grid-cols-3 gap-3 text-center">
          {[
            { label: "Score", value: `${score}/${MOCK_MCQ.length}` },
            { label: "Answered", value: `${Object.keys(answers).length}/${MOCK_MCQ.length}` },
            { label: "Time Used", value: `${exam.duration - Math.floor(timeLeft / 60)}m` },
          ].map(s => (
            <div key={s.label} className="bg-muted/60 rounded-xl p-3">
              <p className="text-lg font-extrabold text-foreground">{s.value}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
        <Button onClick={onExit} className="w-full bg-[#3ecf8e] hover:bg-[#34b27b] text-black font-bold">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Portal
        </Button>
      </div>
    </div>
  );

  const q = MOCK_MCQ[current];
  const answered = Object.keys(answers).length;

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Exam header */}
      <div className="sticky top-0 z-20 bg-card border-b border-border px-4 py-3 flex items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-3 min-w-0">
          <button onClick={onExit} className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:bg-muted shrink-0">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="min-w-0">
            <p className="font-bold text-sm truncate">{exam.title}</p>
            <p className="text-xs text-muted-foreground">Q {current + 1} of {MOCK_MCQ.length} · {answered} answered</p>
          </div>
        </div>
        <div className={`flex items-center gap-1.5 font-mono font-extrabold text-sm px-3 py-1.5 rounded-lg shrink-0 ${
          urgent ? "bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400 animate-pulse" : "bg-muted text-foreground"
        }`}>
          <Timer className="h-3.5 w-3.5" />
          {mm}:{ss}
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 md:p-6 max-w-2xl mx-auto w-full">
        {/* Progress bar */}
        <div className="h-1.5 bg-muted rounded-full mb-6 overflow-hidden">
          <div className="h-full bg-[#3ecf8e] rounded-full transition-all" style={{ width: `${(answered / MOCK_MCQ.length) * 100}%` }} />
        </div>

        {/* Question */}
        <div className="bg-card border border-border rounded-2xl p-6 mb-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg gradient-navy flex items-center justify-center shrink-0">
              <span className="text-white font-bold text-xs">{current + 1}</span>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
                {q.marks} mark{q.marks > 1 ? "s" : ""}
              </p>
              <p className="text-sm font-semibold text-foreground leading-relaxed">{q.text}</p>
            </div>
          </div>
        </div>

        {/* Options */}
        <div className="space-y-3 mb-6">
          {q.options.map(opt => {
            const selected = answers[q._id] === opt.id;
            return (
              <button key={opt.id}
                onClick={() => setAnswers(a => ({ ...a, [q._id]: opt.id }))}
                className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all ${
                  selected
                    ? "border-[#3ecf8e] bg-[#3ecf8e]/10"
                    : "border-border bg-card hover:border-[#3ecf8e]/40 hover:bg-muted/50"
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-extrabold text-sm shrink-0 ${
                  selected ? "bg-[#3ecf8e] text-black" : "bg-muted text-muted-foreground"
                }`}>
                  {opt.id.toUpperCase()}
                </div>
                <span className={`text-sm font-medium ${selected ? "text-foreground font-semibold" : "text-muted-foreground"}`}>
                  {opt.text}
                </span>
                {selected && <CheckCircle2 className="h-4 w-4 text-[#3ecf8e] ml-auto shrink-0" />}
              </button>
            );
          })}
        </div>

        {/* Navigation + question palette */}
        <div className="flex items-center justify-between gap-3 mb-6">
          <Button variant="outline" onClick={() => setCurrent(c => Math.max(0, c - 1))} disabled={current === 0}>
            ← Previous
          </Button>
          {current < MOCK_MCQ.length - 1
            ? <Button onClick={() => setCurrent(c => c + 1)} className="bg-[#3ecf8e] hover:bg-[#34b27b] text-black font-bold">Next →</Button>
            : <Button onClick={() => setSubmitted(true)} className="gradient-orange text-white font-bold gap-2">
                <Send className="h-4 w-4" /> Submit Exam
              </Button>
          }
        </div>

        {/* Question grid */}
        <div className="bg-card border border-border rounded-2xl p-4">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3">Question Navigator</p>
          <div className="flex flex-wrap gap-2">
            {MOCK_MCQ.map((question, i) => (
              <button key={question._id} onClick={() => setCurrent(i)}
                className={`w-9 h-9 rounded-lg text-xs font-bold transition-all ${
                  i === current          ? "gradient-navy text-white scale-110"
                  : answers[question._id] ? "bg-[#3ecf8e] text-black"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}>
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Theory Exam Screen ───────────────────────────────────────────────────────
function TheoryExamScreen({ exam, onExit }: { exam: MockExam; onExit: () => void }) {
  const [answers,   setAnswers]   = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [timeLeft,  setTimeLeft]  = useState(exam.duration * 60);
  const [current,   setCurrent]   = useState(0);

  useEffect(() => {
    if (submitted) return;
    const t = setInterval(() => setTimeLeft(s => s <= 1 ? (setSubmitted(true), 0) : s - 1), 1000);
    return () => clearInterval(t);
  }, [submitted]);

  const mm = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const ss = String(timeLeft % 60).padStart(2, "0");
  const urgent = timeLeft < 300;

  if (submitted) return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="max-w-sm w-full text-center space-y-6">
        <div className="w-24 h-24 rounded-full bg-purple-100 dark:bg-purple-950/30 border-4 border-purple-500 flex items-center justify-center mx-auto">
          <CheckCircle2 className="h-12 w-12 text-purple-500" />
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Theory Submitted</p>
          <h2 className="text-2xl font-extrabold text-foreground">Awaiting Marking</h2>
          <p className="text-muted-foreground text-sm mt-2 max-w-xs mx-auto leading-relaxed">
            Your theory answers have been submitted. Your teacher will mark and release your scores.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 text-center">
          <div className="bg-muted/60 rounded-xl p-3">
            <p className="text-lg font-extrabold text-foreground">{Object.keys(answers).filter(k => answers[k].trim()).length}/{MOCK_THEORY.length}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Answered</p>
          </div>
          <div className="bg-muted/60 rounded-xl p-3">
            <p className="text-lg font-extrabold text-foreground">{exam.totalMarks}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Total Marks</p>
          </div>
        </div>
        <Button onClick={onExit} className="w-full bg-[#3ecf8e] hover:bg-[#34b27b] text-black font-bold">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Portal
        </Button>
      </div>
    </div>
  );

  const q = MOCK_THEORY[current];
  const wordCount = (answers[q._id] ?? "").trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-card border-b border-border px-4 py-3 flex items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-3 min-w-0">
          <button onClick={onExit} className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:bg-muted shrink-0">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="min-w-0">
            <p className="font-bold text-sm truncate">{exam.title}</p>
            <p className="text-xs text-muted-foreground">Q {current + 1} of {MOCK_THEORY.length} · Theory</p>
          </div>
        </div>
        <div className={`flex items-center gap-1.5 font-mono font-extrabold text-sm px-3 py-1.5 rounded-lg shrink-0 ${
          urgent ? "bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400 animate-pulse" : "bg-muted text-foreground"
        }`}>
          <Timer className="h-3.5 w-3.5" />
          {mm}:{ss}
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 md:p-6 max-w-3xl mx-auto w-full space-y-4">
        {/* Progress */}
        <div className="flex gap-2">
          {MOCK_THEORY.map((_, i) => (
            <button key={i} onClick={() => setCurrent(i)}
              className={`flex-1 h-1.5 rounded-full transition-all ${
                i === current ? "bg-purple-500"
                : answers[MOCK_THEORY[i]._id]?.trim() ? "bg-[#3ecf8e]"
                : "bg-muted"
              }`} />
          ))}
        </div>

        {/* Question */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-purple-500 flex items-center justify-center shrink-0">
                <span className="text-white font-bold text-xs">{current + 1}</span>
              </div>
              <span className="text-xs font-bold text-purple-600 dark:text-purple-400">{q.marks} marks</span>
            </div>
          </div>
          <p className="text-sm font-semibold text-foreground leading-relaxed mb-3">{q.text}</p>
          {q.hint && (
            <div className="flex items-start gap-2 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-2.5">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700 dark:text-amber-400">{q.hint}</p>
            </div>
          )}
        </div>

        {/* Answer textarea */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
          <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/40">
            <p className="text-xs font-bold text-muted-foreground">Your Answer</p>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              wordCount > 50 ? "bg-[#3ecf8e]/10 text-[#3ecf8e]" : "bg-muted text-muted-foreground"
            }`}>
              {wordCount} words
            </span>
          </div>
          <textarea
            value={answers[q._id] ?? ""}
            onChange={e => setAnswers(a => ({ ...a, [q._id]: e.target.value }))}
            placeholder="Type your answer here. Be thorough and structured..."
            className="w-full min-h-[240px] p-4 text-sm text-foreground bg-card resize-y outline-none placeholder:text-muted-foreground/50 font-[Georgia,serif] leading-relaxed"
          />
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between gap-3">
          <Button variant="outline" onClick={() => setCurrent(c => Math.max(0, c - 1))} disabled={current === 0}>
            ← Previous
          </Button>
          {current < MOCK_THEORY.length - 1
            ? <Button onClick={() => setCurrent(c => c + 1)} className="bg-purple-500 hover:bg-purple-600 text-white font-bold">
                Next →
              </Button>
            : <Button onClick={() => setSubmitted(true)} className="gradient-orange text-white font-bold gap-2">
                <Send className="h-4 w-4" /> Submit Exam
              </Button>
          }
        </div>
      </div>
    </div>
  );
}

// ─── Main CandidateDashboard ──────────────────────────────────────────────────
export default function CandidateDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  const [activeExam, setActiveExam] = useState<MockExam | null>(null);
  const [filter,     setFilter]     = useState<"all" | ExamStatus>("all");
  const [typeFilter, setTypeFilter] = useState<"all" | ExamType>("all");

  const filtered = MOCK_EXAMS.filter(e =>
    (filter === "all" || e.status === filter) &&
    (typeFilter === "all" || e.type === typeFilter)
  );

  const activeCount    = MOCK_EXAMS.filter(e => e.status === "active").length;
  const completedCount = MOCK_EXAMS.filter(e => e.status === "completed").length;
  const avgScore = MOCK_EXAMS
    .filter(e => e.status === "completed" && e.score !== undefined)
    .reduce((a, e, _, arr) => a + (e.score! / e.totalMarks) * 100 / arr.length, 0);

  if (activeExam) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        {activeExam.type === "mcq"
          ? <MCQExamScreen exam={activeExam} onExit={() => setActiveExam(null)} />
          : <TheoryExamScreen exam={activeExam} onExit={() => setActiveExam(null)} />
        }
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Floating theme toggle */}
      <button
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className="fixed top-4 right-4 z-50 w-9 h-9 rounded-full bg-background border border-border shadow-md flex items-center justify-center hover:bg-muted transition-colors"
      >
        {theme === "dark" ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-600" />}
      </button>

      {/* Top nav */}
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
          <div className="absolute -right-8 -top-8 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <ClipboardList className="h-5 w-5" />
              <span className="text-xs font-bold uppercase tracking-widest opacity-80">Official Exam Portal</span>
            </div>
            <h1 className="text-2xl font-extrabold">Welcome, {user?.name?.split(" ")[0]} 👋</h1>
            <p className="text-white/70 text-sm mt-1">
              {activeCount > 0
                ? `You have ${activeCount} active exam${activeCount > 1 ? "s" : ""} available. Good luck!`
                : "No active exams right now. Check back soon."}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Available",  value: activeCount,                     icon: <Zap className="h-5 w-5" />,          bg: "bg-gradient-to-br from-[#3ecf8e] to-[#059669]", iconBg: "bg-black/15", text: "text-black" },
            { label: "Completed",  value: completedCount,                   icon: <CheckCircle2 className="h-5 w-5" />, bg: "gradient-navy",                                 iconBg: "bg-white/20", text: "text-white" },
            { label: "Avg Score",  value: avgScore ? `${avgScore.toFixed(0)}%` : "—", icon: <BarChart3 className="h-5 w-5" />,    bg: "bg-gradient-to-br from-purple-700 to-purple-500", iconBg: "bg-white/20", text: "text-white" },
            { label: "Upcoming",   value: MOCK_EXAMS.filter(e => e.status === "upcoming").length, icon: <Clock className="h-5 w-5" />, bg: "gradient-orange", iconBg: "bg-white/20", text: "text-white" },
          ].map(s => (
            <div key={s.label} className={`rounded-2xl p-5 relative overflow-hidden ${s.bg}`}>
              <div className="absolute inset-0 opacity-10"
                style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "18px 18px" }} />
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${s.iconBg} ${s.text}`}>
                {s.icon}
              </div>
              <p className={`text-2xl font-extrabold ${s.text}`}>{s.value}</p>
              <p className={`text-xs font-semibold mt-0.5 ${s.text} opacity-80`}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Active alert */}
        {activeCount > 0 && (
          <div className="flex items-start gap-3 bg-[#3ecf8e]/10 border border-[#3ecf8e]/30 rounded-2xl p-4">
            <div className="w-8 h-8 rounded-lg bg-[#3ecf8e] flex items-center justify-center shrink-0">
              <Zap className="h-4 w-4 text-black" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">Exams are live!</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                You have active exams ready to take. Click "Start Exam" on any available exam below.
                Make sure you have a stable internet connection before starting.
              </p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          {[
            { key: "all",       label: "All Exams"  },
            { key: "active",    label: "Available"  },
            { key: "upcoming",  label: "Upcoming"   },
            { key: "completed", label: "Completed"  },
          ].map(f => (
            <button key={f.key}
              onClick={() => setFilter(f.key as any)}
              className={`text-xs font-bold px-3 py-1.5 rounded-full border transition-all ${
                filter === f.key
                  ? "bg-foreground text-background border-foreground"
                  : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
              }`}>
              {f.label}
            </button>
          ))}
          <div className="w-px bg-border mx-1 self-stretch" />
          {[
            { key: "all",    label: "All Types" },
            { key: "mcq",    label: "MCQ"       },
            { key: "theory", label: "Theory"    },
          ].map(f => (
            <button key={f.key}
              onClick={() => setTypeFilter(f.key as any)}
              className={`text-xs font-bold px-3 py-1.5 rounded-full border transition-all ${
                typeFilter === f.key
                  ? "bg-foreground text-background border-foreground"
                  : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
              }`}>
              {f.label}
            </button>
          ))}
        </div>

        {/* Exam grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-border rounded-2xl bg-muted/20">
            <ClipboardList className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="font-bold text-foreground">No exams found</p>
            <p className="text-sm text-muted-foreground mt-1">Try a different filter</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(exam => (
              <ExamCard key={exam._id} exam={exam} onStart={setActiveExam} />
            ))}
          </div>
        )}

        {/* Bottom nav back */}
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
