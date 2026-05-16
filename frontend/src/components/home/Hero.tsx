import { ArrowRight, BookOpen, Brain, Zap } from "lucide-react";
import { Link } from "react-router";

const FEATURES = [
  { icon: BookOpen, label: "AI Flashcards & Quizzes" },
  { icon: Brain,    label: "Chat with Documents"     },
  { icon: Zap,      label: "WAEC & JAMB Practice"    },
];

// All 5 classes
const CLASSES = ["SS1", "SS2", "SS3", "WAEC", "JAMB"];

const CLASS_COLORS: Record<string, string> = {
  SS1:  "bg-indigo-600 text-white",
  SS2:  "bg-[#3ecf8e] text-black",
  SS3:  "bg-purple-600 text-white",
  WAEC: "bg-amber-500 text-white",
  JAMB: "bg-red-500 text-white",
};

const Hero = () => {
  return (
    <section id="home" className="relative pt-32 pb-20 overflow-hidden min-h-screen flex items-center">
      {/* Background blobs */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[500px] h-[500px] bg-[#3ecf8e] opacity-5 blur-[140px] rounded-full" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-[#3ecf8e] opacity-10 blur-[120px] rounded-full" />
      {/* Grid texture */}
      <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.04]"
        style={{
          backgroundImage: "linear-gradient(rgba(62,207,142,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(62,207,142,0.4) 1px, transparent 1px)",
          backgroundSize: "50px 50px",
        }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* ── Left — copy ───────────────────────────────── */}
          <div className="space-y-8">
            {/* Live badge */}
            <div className="inline-flex items-center space-x-2 bg-[#3ecf8e]/10 border border-[#3ecf8e]/20 px-3 py-1.5 rounded-full text-[#3ecf8e] text-sm font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#3ecf8e] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#3ecf8e]" />
              </span>
              <span>AI-powered learning — SS1, SS2, SS3, WAEC &amp; JAMB</span>
            </div>

            <div>
              <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 dark:text-white leading-tight">
                Chukwudi{" "}
                <span className="text-[#3ecf8e] relative">
                  Academy
                  <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" fill="none">
                    <path d="M3 9C50 3 100 1 150 3C200 5 250 9 297 6" stroke="#3ecf8e" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
                  </svg>
                </span>
              </h1>
              <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white leading-tight mt-3">
                Your AI Tutor for{" "}
                <span className="text-[#3ecf8e]">Exam Success.</span>
              </h2>
            </div>

            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-xl leading-relaxed">
              Upload your notes, textbooks and past papers. Our AI generates
              flashcards, quizzes, summaries and answers your questions —
              purpose-built for SS1, SS2, SS3, WAEC and JAMB students.
            </p>

            {/* Class badges — all 5 */}
            <div className="flex flex-wrap gap-2">
              {CLASSES.map(c => (
                <Link key={c} to={`/classes/${c}`}>
                  <span className={`text-sm font-bold px-4 py-1.5 rounded-full cursor-pointer hover:opacity-90 transition-opacity ${CLASS_COLORS[c]}`}>
                    {c}
                  </span>
                </Link>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <Link to="/register">
                <button className="flex items-center space-x-2 bg-[#3ecf8e] text-black px-8 py-4 rounded-lg font-bold hover:bg-[#34b27b] transition-all hover:-translate-y-0.5 shadow-lg shadow-[#3ecf8e]/20">
                  <span>Start for Free</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </Link>
              <Link to="/login">
                <button className="flex items-center space-x-2 bg-transparent text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 hover:border-[#3ecf8e] px-8 py-4 rounded-lg font-bold transition-all">
                  <span>Sign In</span>
                </button>
              </Link>
            </div>

            {/* Feature chips */}
            <div className="flex flex-wrap gap-3">
              {FEATURES.map(({ icon: Icon, label }) => (
                <div key={label}
                  className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  <Icon className="w-4 h-4 text-[#3ecf8e]" />
                  {label}
                </div>
              ))}
            </div>
          </div>

          {/* ── Right — visual mockup ──────────────────────── */}
          <div className="relative hidden lg:block">
            <div className="absolute inset-0 bg-[#3ecf8e]/5 blur-[80px] rounded-3xl" />

            <div className="relative bg-white dark:bg-[#111] rounded-2xl border border-gray-200 dark:border-gray-700/60 shadow-2xl p-6 space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-[#3ecf8e] rounded-lg flex items-center justify-center">
                    <span className="text-black text-xs font-black">CA</span>
                  </div>
                  <div>
                    <p className="font-bold text-sm text-gray-900 dark:text-white">Chukwudi Academy</p>
                    <p className="text-xs text-gray-500">AI Study Hub</p>
                  </div>
                </div>
                <span className="text-xs bg-[#3ecf8e]/10 text-[#3ecf8e] font-bold px-2 py-1 rounded-full">SS3</span>
              </div>

              {/* Doc card */}
              <div className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-950/30 rounded-xl">
                <div className="w-9 h-9 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-gray-900 dark:text-white">SS3 Physics — Newton's Laws.pdf</p>
                  <p className="text-xs text-gray-500">28 pages · Ready</p>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex gap-2 text-xs font-medium flex-wrap">
                {["Chat", "Summary", "Flashcards", "Quiz", "Explain"].map((t, i) => (
                  <span key={t} className={`px-3 py-1.5 rounded-full ${i === 0 ? "bg-[#3ecf8e] text-black" : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"}`}>
                    {t}
                  </span>
                ))}
              </div>

              {/* Mock chat */}
              <div className="space-y-3">
                <div className="flex gap-2">
                  <div className="w-7 h-7 rounded-full bg-[#3ecf8e] flex items-center justify-center text-xs font-bold text-black shrink-0">AI</div>
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-xl rounded-tl-sm px-3 py-2 text-xs text-gray-700 dark:text-gray-300 max-w-[85%]">
                    Hi! I've read your Physics notes. Ask me anything about Newton's Laws.
                  </div>
                </div>
                <div className="flex gap-2 flex-row-reverse">
                  <div className="w-7 h-7 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-xs font-bold shrink-0">You</div>
                  <div className="bg-[#3ecf8e]/10 border border-[#3ecf8e]/20 rounded-xl rounded-tr-sm px-3 py-2 text-xs text-gray-700 dark:text-gray-300 max-w-[85%]">
                    What is Newton's Second Law?
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="w-7 h-7 rounded-full bg-[#3ecf8e] flex items-center justify-center text-xs font-bold text-black shrink-0">AI</div>
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-xl rounded-tl-sm px-3 py-2 text-xs text-gray-700 dark:text-gray-300 max-w-[85%]">
                    Newton's Second Law: <strong>F = ma</strong> — Force equals mass × acceleration.
                  </div>
                </div>
              </div>

              {/* All 5 class + subject badges */}
              <div className="flex flex-wrap gap-1.5 pt-1 border-t border-gray-100 dark:border-gray-800">
                {CLASSES.map(c => (
                  <span key={c} className={`text-xs font-semibold px-2 py-0.5 rounded-full ${CLASS_COLORS[c]}`}>{c}</span>
                ))}
                {["Maths", "Physics", "Chemistry"].map(s => (
                  <span key={s} className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full">{s}</span>
                ))}
              </div>
            </div>

            {/* Floating badges */}
            <div className="absolute -top-4 -right-4 bg-[#3ecf8e] text-black text-xs font-bold px-3 py-2 rounded-full shadow-lg">
              🤖 Groq AI Powered
            </div>
            <div className="absolute -bottom-4 -left-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-xs font-bold px-3 py-2 rounded-full shadow-lg text-gray-900 dark:text-white">
              ✅ Free to use
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
