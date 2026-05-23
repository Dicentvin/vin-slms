/**
 * StudentExamPage — JAMB CBT-style exam page
 *
 * Features:
 *  - Student passport photo visible at top-left throughout the exam
 *  - Question numbers palette below question: red = unanswered, green = answered
 *  - Paginated: one question per page
 *  - Prev / Next at the extremes of the navigation bar
 *  - Countdown timer with urgent state
 *  - Auto-submit on timeout
 */

import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router";
import { useAuth } from "@/hooks/AuthProvider";
import { officialExams, type OfficialExam, type ExamSubmission } from "@/services/lmsApi";
import {
  Timer, Send, Loader2, AlertTriangle, CheckCircle2,
  User2, ChevronLeft, ChevronRight, Trophy, ArrowLeft,
  XCircle, BookOpen, ChevronDown, ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// ─────────────────────────────────────────────────────────────────────────────
// Helper: format seconds → MM:SS
// ─────────────────────────────────────────────────────────────────────────────
function fmt(secs: number) {
  const m = String(Math.floor(secs / 60)).padStart(2, "0");
  const s = String(secs % 60).padStart(2, "0");
  return `${m}:${s}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Passport photo widget — always visible
// ─────────────────────────────────────────────────────────────────────────────
function PassportPhoto({ name, imageUrl }: { name: string; imageUrl?: string }) {
  const initials = name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  return (
    <div className="flex flex-col items-center gap-1 shrink-0">
      <div className="w-14 h-16 rounded-lg overflow-hidden border-2 border-[#3ecf8e] shadow-md bg-muted flex items-center justify-center">
        {imageUrl ? (
          <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-foreground font-extrabold text-lg">{initials}</span>
        )}
      </div>
      <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wide text-center max-w-[56px] truncate">
        {name.split(" ")[0]}
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Result Screen shown after submission
// ─────────────────────────────────────────────────────────────────────────────
// Single question review card
// ─────────────────────────────────────────────────────────────────────────────
function ReviewCard({ question, answer, index }: { question: any; answer: any; index: number }) {
  const [showExplanation, setShowExplanation] = useState(false);
  const selected   = answer?.selectedOption ?? "";
  const correct    = question.correctAnswer ?? "";
  const isCorrect  = answer?.isCorrect ?? (selected === correct);
  const isMCQ      = question.type === "mcq";

  const optionStyle = (optId: string) => {
    if (!isMCQ) return "";
    if (optId === correct) return "border-[#3ecf8e] bg-[#3ecf8e]/10";
    if (optId === selected && !isCorrect) return "border-red-400 bg-red-50 dark:bg-red-950/30";
    return "border-border bg-card";
  };

  const optionBadge = (optId: string) => {
    if (!isMCQ) return null;
    if (optId === correct) return <CheckCircle2 className="h-4 w-4 text-[#3ecf8e] shrink-0" />;
    if (optId === selected && !isCorrect) return <XCircle className="h-4 w-4 text-red-500 shrink-0" />;
    return null;
  };

  return (
    <div className={`rounded-2xl border-2 overflow-hidden ${
      isMCQ
        ? isCorrect ? "border-[#3ecf8e]/40" : "border-red-300 dark:border-red-800"
        : "border-border"
    }`}>
      {/* Question header */}
      <div className="flex items-start gap-3 p-4 border-b border-border bg-muted/20">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-extrabold text-sm text-white shrink-0 ${
          isMCQ
            ? isCorrect ? "bg-[#3ecf8e]" : "bg-red-500"
            : "bg-purple-500"
        }`}>
          {isMCQ
            ? isCorrect
              ? <CheckCircle2 className="h-4 w-4" />
              : <XCircle className="h-4 w-4" />
            : index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-[10px] font-bold text-muted-foreground uppercase">Q{index + 1}</span>
            <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full text-white ${
              isMCQ ? "bg-blue-500" : "bg-purple-500"
            }`}>{question.type.toUpperCase()}</span>
            <span className="text-[10px] text-muted-foreground font-medium">{question.marks} mark{question.marks > 1 ? "s" : ""}</span>
            {isMCQ && (
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ml-auto ${
                isCorrect
                  ? "bg-[#3ecf8e]/15 text-[#3ecf8e]"
                  : "bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400"
              }`}>
                {isCorrect ? `+${question.marks}` : "0"} / {question.marks}
              </span>
            )}
          </div>
          <p className="text-sm font-semibold text-foreground leading-relaxed">{question.text}</p>
        </div>
      </div>

      {/* MCQ options */}
      {isMCQ && question.options && (
        <div className="p-4 space-y-2">
          {question.options.map((opt: any) => (
            <div
              key={opt.id}
              className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-colors ${optionStyle(opt.id)}`}
            >
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-extrabold text-xs shrink-0 ${
                opt.id === correct
                  ? "bg-[#3ecf8e] text-black"
                  : opt.id === selected && !isCorrect
                  ? "bg-red-500 text-white"
                  : "bg-muted text-muted-foreground"
              }`}>
                {opt.id.toUpperCase()}
              </div>
              <span className={`text-sm flex-1 ${
                opt.id === correct ? "font-semibold text-foreground" : "text-muted-foreground"
              }`}>
                {opt.text}
              </span>
              {opt.id === selected && opt.id !== correct && (
                <span className="text-[10px] font-bold text-red-500 shrink-0">Your answer</span>
              )}
              {optionBadge(opt.id)}
            </div>
          ))}
        </div>
      )}

      {/* Theory — show student's answer */}
      {!isMCQ && (
        <div className="p-4">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">Your Answer</p>
          <div className="bg-muted/40 rounded-xl p-3 border border-border">
            <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
              {answer?.answerText?.trim() || <span className="italic text-muted-foreground">No answer provided</span>}
            </p>
          </div>
          {question.sampleAnswer && (
            <div className="mt-3 bg-[#3ecf8e]/5 border border-[#3ecf8e]/30 rounded-xl p-3">
              <p className="text-xs font-bold text-[#3ecf8e] uppercase tracking-wide mb-1">Sample Answer</p>
              <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{question.sampleAnswer}</p>
            </div>
          )}
        </div>
      )}

      {/* Explanation toggle */}
      {question.explanation && (
        <div className="border-t border-border">
          <button
            onClick={() => setShowExplanation(s => !s)}
            className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
          >
            <span className="flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5" />
              Explanation
            </span>
            {showExplanation
              ? <ChevronUp className="h-3.5 w-3.5" />
              : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
          {showExplanation && (
            <div className="px-4 pb-4">
              <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl p-3">
                <p className="text-xs text-blue-800 dark:text-blue-300 leading-relaxed">{question.explanation}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Result Screen — score summary + full question review
// ─────────────────────────────────────────────────────────────────────────────
function ResultScreen({
  result, examTitle, onBack,
}: {
  result: any;
  examTitle: string;
  onBack: () => void;
}) {
  const passed    = result.percentage >= (result.passMark ?? 50);
  const questions = result.questions ?? [];   // full question list (with correct answers)
  const answers   = result.answers   ?? [];   // student's answer records

  // Build a fast lookup: questionId → answer record
  const answerMap = Object.fromEntries(
    answers.map((a: any) => [String(a.questionId), a])
  );

  const correct  = answers.filter((a: any) => a.isCorrect).length;
  const wrong    = answers.filter((a: any) => a.type === "mcq" && !a.isCorrect && a.selectedOption).length;
  const skipped  = answers.filter((a: any) => a.type === "mcq" && !a.selectedOption).length;
  const hasReview = questions.length > 0;

  return (
    <div className="min-h-screen bg-background">
      {/* ── Score Summary Card ── */}
      <div className="sticky top-0 z-10 bg-card border-b border-border shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4 flex-wrap">
            {/* Trophy */}
            <div className={`w-16 h-16 rounded-2xl border-2 flex items-center justify-center shrink-0 ${
              passed ? "border-[#3ecf8e] bg-[#3ecf8e]/10" : "border-red-500 bg-red-500/10"
            }`}>
              <Trophy className={`h-8 w-8 ${passed ? "text-[#3ecf8e]" : "text-red-500"}`} />
            </div>

            {/* Score */}
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                {result.hasTheory ? "Submitted — Awaiting Theory Marking" : "Exam Complete"}
              </p>
              <div className="flex items-baseline gap-2 flex-wrap mt-0.5">
                <span className="text-3xl font-extrabold text-foreground">
                  {result.totalScore}
                  <span className="text-lg font-normal text-muted-foreground">/{result.maxScore}</span>
                </span>
                <span className={`text-xl font-extrabold ${passed ? "text-[#3ecf8e]" : "text-red-500"}`}>
                  {result.percentage}%
                </span>
                <span className={`text-sm font-bold px-2 py-0.5 rounded-full ${
                  passed
                    ? "bg-[#3ecf8e]/15 text-[#3ecf8e]"
                    : "bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400"
                }`}>
                  {passed ? "PASSED" : "FAILED"}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 truncate">{examTitle}</p>
            </div>

            {/* Back button */}
            <Button
              onClick={onBack}
              className="bg-[#3ecf8e] hover:bg-[#34b27b] text-black font-bold gap-1.5 shrink-0"
            >
              <ArrowLeft className="h-4 w-4" /> Dashboard
            </Button>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-4 gap-2 mt-3">
            {[
              { label: "MCQ Score",  value: result.mcqScore ?? "—",              color: "text-foreground" },
              { label: "Correct",    value: correct,                              color: "text-[#3ecf8e]" },
              { label: "Wrong",      value: wrong,                                color: "text-red-500" },
              { label: "Skipped",    value: skipped,                              color: "text-amber-500" },
            ].map(s => (
              <div key={s.label} className="bg-muted/50 rounded-xl p-2.5 text-center">
                <p className={`text-lg font-extrabold ${s.color}`}>{s.value}</p>
                <p className="text-[10px] text-muted-foreground font-medium mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {result.hasTheory && (
            <div className="flex items-start gap-2 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-3 mt-3">
              <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700 dark:text-amber-400">
                Your theory answers are being marked by your teacher. Check back later for your full score.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Question Review ── */}
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
        {hasReview ? (
          <>
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm font-bold text-foreground">Full Review</p>
              <span className="text-xs text-muted-foreground">— click "Explanation" on each question to learn more</span>
            </div>
            {questions.map((q: any, i: number) => (
              <ReviewCard
                key={q._id ?? i}
                question={q}
                answer={answerMap[String(q._id)]}
                index={i}
              />
            ))}
            <Button
              onClick={onBack}
              className="w-full bg-[#3ecf8e] hover:bg-[#34b27b] text-black font-bold gap-2 mt-4"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Dashboard
            </Button>
          </>
        ) : (
          <div className="text-center py-16 space-y-3">
            <BookOpen className="h-12 w-12 text-muted-foreground/30 mx-auto" />
            <p className="text-sm font-semibold text-muted-foreground">
              {result.hasTheory
                ? "Review will be available after theory answers are marked."
                : "Question review is not enabled for this exam."}
            </p>
            <Button onClick={onBack} className="bg-[#3ecf8e] hover:bg-[#34b27b] text-black font-bold gap-2">
              <ArrowLeft className="h-4 w-4" /> Back to Dashboard
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Exam Page
// ─────────────────────────────────────────────────────────────────────────────
export default function StudentExamPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  // ── State ──
  const [exam,       setExam]       = useState<OfficialExam | null>(null);
  const [submission, setSubmission] = useState<ExamSubmission | null>(null);
  const [loading,    setLoading]    = useState(true);
  const [starting,   setStarting]   = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result,     setResult]     = useState<any>(null);

  // current question index (0-based)
  const [current,    setCurrent]    = useState(0);
  // answers: questionId → selectedOption (MCQ) or answerText (Theory)
  const [answers,    setAnswers]    = useState<Record<string, string>>({});
  // countdown (seconds)
  const [timeLeft,   setTimeLeft]   = useState(0);

  const startTime = useState(() => Date.now())[0];
  const userImage = (user as any)?.image ?? "";

  // ── Load exam info ──
  useEffect(() => {
    if (!id) return;
    officialExams.get(id)
      .then(res => {
        setExam(res.exam);
        setTimeLeft(res.exam.duration * 60);
      })
      .catch(() => {
        toast.error("Failed to load exam");
        navigate("/dashboard");
      })
      .finally(() => setLoading(false));
  }, [id]);

  // ── Countdown ──
  useEffect(() => {
    if (!submission || result) return;
    if (timeLeft <= 0) { handleSubmit(true); return; }
    const t = setTimeout(() => setTimeLeft(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, submission, result]);

  // ── Start exam ──
  const handleStart = async () => {
    if (!id) return;
    setStarting(true);
    try {
      const res = await officialExams.start(id);
      setSubmission(res.submission);
      setExam(res.exam); // full exam with questions
      setTimeLeft(res.exam.duration * 60);
      if (res.resumed) toast.info("Resuming your previous attempt…");
    } catch (err: any) {
      toast.error(err.message ?? "Failed to start exam");
    } finally {
      setStarting(false);
    }
  };

  // ── Submit exam ──
  const handleSubmit = useCallback(async (auto = false) => {
    if (!exam || !submission || submitting) return;
    if (!auto) {
      const unanswered = exam.questions.filter(q => !answers[q._id]?.trim()).length;
      if (unanswered > 0) {
        const ok = confirm(`You have ${unanswered} unanswered question${unanswered > 1 ? "s" : ""}. Submit anyway?`);
        if (!ok) return;
      } else {
        if (!confirm("Submit exam? This cannot be undone.")) return;
      }
    }
    setSubmitting(true);
    try {
      const ans = exam.questions.map(q => ({
        questionId:     q._id,
        selectedOption: answers[q._id] ?? "",
        answerText:     answers[q._id] ?? "",
      }));
      const timeTaken = Math.round((Date.now() - startTime) / 1000);
      const { result: r } = await officialExams.submit(exam._id, submission._id, ans, timeTaken);
      setResult(r);
    } catch (err: any) {
      toast.error(err.message ?? "Submission failed");
      setSubmitting(false);
    }
  }, [exam, submission, answers, submitting, startTime]);

  // ─────────────────────────────────────────────────────────────────────────
  // LOADING STATE
  // ─────────────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-[#3ecf8e]" />
      </div>
    );
  }

  if (!exam) return null;

  // ─────────────────────────────────────────────────────────────────────────
  // RESULT SCREEN
  // ─────────────────────────────────────────────────────────────────────────
  if (result) {
    return <ResultScreen result={result} examTitle={exam.title} onBack={() => navigate("/dashboard")} />;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // PRE-EXAM BRIEFING (before "Start Exam" is clicked)
  // ─────────────────────────────────────────────────────────────────────────
  if (!submission) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="max-w-lg w-full bg-card border border-border rounded-2xl shadow-xl overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-purple-600 via-blue-500 to-[#3ecf8e]" />
          <div className="p-8 space-y-6">
            {/* Passport + title */}
            <div className="flex items-center gap-5">
              <div className="w-20 h-24 rounded-xl overflow-hidden border-2 border-[#3ecf8e] shadow-lg bg-muted flex items-center justify-center shrink-0">
                {userImage ? (
                  <img src={userImage} alt={user?.name} className="w-full h-full object-cover" />
                ) : (
                  <User2 className="h-10 w-10 text-muted-foreground" />
                )}
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-[#3ecf8e] mb-1">Candidate</p>
                <h2 className="text-xl font-extrabold text-foreground leading-tight">{user?.name}</h2>
                {user?.className && (
                  <span className="text-xs bg-muted text-muted-foreground font-semibold px-2 py-0.5 rounded-full mt-1 inline-block">
                    {user.className}
                  </span>
                )}
              </div>
            </div>

            {/* Exam info */}
            <div className="border border-border rounded-xl p-4 space-y-2 bg-muted/30">
              <h3 className="text-base font-extrabold text-foreground">{exam.title}</h3>
              {exam.description && <p className="text-xs text-muted-foreground">{exam.description}</p>}
              <div className="grid grid-cols-2 gap-2 pt-2">
                {[
                  { label: "Subject",    value: exam.subject },
                  { label: "Duration",   value: `${exam.duration} minutes` },
                  { label: "Questions",  value: exam.questions?.length ?? "—" },
                  { label: "Total Marks",value: exam.totalMarks },
                  { label: "Type",       value: exam.type.toUpperCase() },
                  { label: "Class",      value: exam.className },
                ].map(i => (
                  <div key={i.label} className="bg-card rounded-lg p-2.5 border border-border">
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wide">{i.label}</p>
                    <p className="text-sm font-extrabold text-foreground mt-0.5">{i.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-4 space-y-1.5">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
                <p className="text-xs font-extrabold text-amber-700 dark:text-amber-400 uppercase tracking-wide">Instructions</p>
              </div>
              {[
                "Read each question carefully before answering.",
                "Use the question palette to track answered and unanswered questions.",
                "Green = answered · Red = unanswered.",
                "The timer starts once you click Start Exam.",
                "Your exam auto-submits when time runs out.",
                "You cannot change answers after submission.",
              ].map((ins, i) => (
                <p key={i} className="text-xs text-amber-700 dark:text-amber-400 flex items-start gap-2">
                  <span className="font-extrabold shrink-0">{i + 1}.</span> {ins}
                </p>
              ))}
            </div>

            <Button
              onClick={handleStart}
              disabled={starting}
              className="w-full bg-[#3ecf8e] hover:bg-[#34b27b] text-black font-extrabold text-base py-6 gap-2">
              {starting ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
              {starting ? "Starting…" : "Start Exam"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // EXAM SCREEN
  // ─────────────────────────────────────────────────────────────────────────
  const questions = exam.questions;
  const total     = questions.length;
  const q         = questions[current];
  const urgent    = timeLeft < 300; // < 5 min
  const answeredCount = Object.keys(answers).filter(k => answers[k]?.trim()).length;
  const isMCQ     = q.type === "mcq";

  return (
    <div className="min-h-screen bg-background flex flex-col">

      {/* ══════════════════════════════════════════════════
          TOP HEADER — passport + title + timer
      ══════════════════════════════════════════════════ */}
      <header className="sticky top-0 z-30 bg-card border-b border-border shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-2.5 flex items-center gap-3">

          {/* Passport photo */}
          <PassportPhoto name={user?.name ?? "Student"} imageUrl={userImage} />

          {/* Divider */}
          <div className="w-px h-12 bg-border shrink-0" />

          {/* Exam info */}
          <div className="flex-1 min-w-0">
            <p className="font-extrabold text-sm text-foreground truncate leading-tight">{exam.title}</p>
            <p className="text-xs text-muted-foreground truncate">{exam.subject} · {user?.name}</p>
            <div className="flex items-center gap-3 mt-0.5">
              <span className="text-[10px] text-muted-foreground font-medium">
                Q <span className="font-extrabold text-foreground">{current + 1}</span>/{total}
              </span>
              <span className="text-[10px] text-muted-foreground font-medium">
                Answered: <span className="font-extrabold text-[#3ecf8e]">{answeredCount}</span>/{total}
              </span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="hidden sm:flex flex-col items-end gap-1 shrink-0 w-28">
            <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-[#3ecf8e] rounded-full transition-all"
                style={{ width: `${(answeredCount / total) * 100}%` }}
              />
            </div>
            <p className="text-[10px] text-muted-foreground font-medium">
              {Math.round((answeredCount / total) * 100)}% done
            </p>
          </div>

          {/* Timer */}
          <div className={`flex items-center gap-1.5 font-mono font-extrabold text-sm px-3 py-2 rounded-xl shrink-0 ${
            urgent
              ? "bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400 animate-pulse"
              : "bg-muted text-foreground"
          }`}>
            <Timer className="h-3.5 w-3.5" />
            {fmt(timeLeft)}
          </div>
        </div>
      </header>

      {/* ══════════════════════════════════════════════════
          MAIN CONTENT
      ══════════════════════════════════════════════════ */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">

          {/* ── Question card ── */}
          <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
            <div className={`h-1 ${isMCQ ? "bg-gradient-to-r from-blue-500 to-blue-400" : "bg-gradient-to-r from-purple-600 to-purple-400"}`} />
            <div className="p-6">
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-extrabold text-sm text-white ${
                  isMCQ ? "bg-gradient-to-br from-blue-600 to-blue-400" : "bg-gradient-to-br from-purple-600 to-purple-400"
                }`}>
                  {current + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <span className={`text-[10px] font-extrabold text-white px-2 py-0.5 rounded-full uppercase tracking-wide ${
                      isMCQ ? "bg-blue-500" : "bg-purple-500"
                    }`}>{q.type}</span>
                    <span className="text-[10px] text-muted-foreground font-bold">
                      {q.marks} mark{q.marks > 1 ? "s" : ""}
                    </span>
                  </div>
                  <p className="text-base font-semibold text-foreground leading-relaxed">{q.text}</p>
                </div>
              </div>
            </div>
          </div>

          {/* ── MCQ options ── */}
          {isMCQ && q.options && (
            <div className="space-y-3">
              {q.options.map(opt => {
                const selected = answers[q._id] === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => setAnswers(a => ({ ...a, [q._id]: opt.id }))}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all ${
                      selected
                        ? "border-[#3ecf8e] bg-[#3ecf8e]/10"
                        : "border-border bg-card hover:border-[#3ecf8e]/40 hover:bg-[#3ecf8e]/5"
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-extrabold text-sm shrink-0 ${
                      selected ? "bg-[#3ecf8e] text-black" : "bg-muted text-muted-foreground"
                    }`}>
                      {opt.id.toUpperCase()}
                    </div>
                    <span className={`text-sm flex-1 ${selected ? "font-semibold text-foreground" : "text-muted-foreground"}`}>
                      {opt.text}
                    </span>
                    {selected && <CheckCircle2 className="h-5 w-5 text-[#3ecf8e] shrink-0" />}
                  </button>
                );
              })}
            </div>
          )}

          {/* ── Theory answer box ── */}
          {!isMCQ && (
            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-muted/40">
                <p className="text-xs font-bold text-muted-foreground">Your Answer</p>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  (answers[q._id] ?? "").trim().split(/\s+/).filter(Boolean).length > 50
                    ? "bg-[#3ecf8e]/10 text-[#3ecf8e]"
                    : "bg-muted text-muted-foreground"
                }`}>
                  {(answers[q._id] ?? "").trim().split(/\s+/).filter(Boolean).length} words
                </span>
              </div>
              <textarea
                value={answers[q._id] ?? ""}
                onChange={e => setAnswers(a => ({ ...a, [q._id]: e.target.value }))}
                placeholder="Type your answer here…"
                className="w-full min-h-[220px] p-4 text-sm text-foreground bg-card resize-y outline-none placeholder:text-muted-foreground/50 leading-relaxed"
              />
            </div>
          )}

          {/* ══════════════════════════════════════════════
              QUESTION NUMBER PALETTE
              Red = unanswered, Green = answered
          ══════════════════════════════════════════════ */}
          <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
            <p className="text-xs font-extrabold text-muted-foreground uppercase tracking-wide mb-3">
              Question Palette
            </p>

            <div className="flex flex-wrap gap-2 mb-4">
              {questions.map((question, i) => {
                const isAnswered = !!answers[question._id]?.trim();
                const isCurrent  = i === current;
                return (
                  <button
                    key={question._id}
                    onClick={() => setCurrent(i)}
                    title={isAnswered ? "Answered" : "Not answered"}
                    className={`w-9 h-9 rounded-lg text-xs font-extrabold transition-all border-2 ${
                      isCurrent
                        ? "scale-110 border-foreground text-foreground bg-card shadow-md"
                        : isAnswered
                          ? "border-transparent bg-emerald-500 text-white hover:bg-emerald-600"
                          : "border-transparent bg-red-500 text-white hover:bg-red-600"
                    }`}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-5 text-[10px] text-muted-foreground font-semibold">
              <span className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded bg-emerald-500 inline-block" />
                Answered ({answeredCount})
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded bg-red-500 inline-block" />
                Not Answered ({total - answeredCount})
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded border-2 border-foreground bg-card inline-block" />
                Current
              </span>
            </div>
          </div>

        </div>
      </main>

      {/* ══════════════════════════════════════════════════
          BOTTOM NAV — Prev (far left) · Submit · Next (far right)
      ══════════════════════════════════════════════════ */}
      <footer className="sticky bottom-0 z-30 bg-card border-t border-border shadow-lg">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-3">

          {/* PREV — far left */}
          <Button
            variant="outline"
            onClick={() => setCurrent(c => Math.max(0, c - 1))}
            disabled={current === 0}
            className="flex items-center gap-1.5 font-bold min-w-[90px]"
          >
            <ChevronLeft className="h-4 w-4" /> Prev
          </Button>

          {/* Centre — question counter + submit */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground font-semibold hidden sm:inline">
              {current + 1} / {total}
            </span>
            <Button
              onClick={() => handleSubmit(false)}
              disabled={submitting}
              className="gradient-orange text-white font-extrabold gap-2 px-5"
            >
              {submitting
                ? <Loader2 className="h-4 w-4 animate-spin" />
                : <Send className="h-4 w-4" />}
              {submitting ? "Submitting…" : "Submit Exam"}
            </Button>
          </div>

          {/* NEXT — far right */}
          <Button
            onClick={() => setCurrent(c => Math.min(total - 1, c + 1))}
            disabled={current === total - 1}
            className="flex items-center gap-1.5 font-bold bg-[#3ecf8e] hover:bg-[#34b27b] text-black min-w-[90px] justify-end"
          >
            Next <ChevronRight className="h-4 w-4" />
          </Button>

        </div>
      </footer>
    </div>
  );
}
