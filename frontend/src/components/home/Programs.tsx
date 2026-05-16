const PROGRAMS = [
  {
    id: "ss2",
    label: "SS2", sublabel: "Year Two", tagline: "Build the Foundation",
    desc: "Master SS2 Physics, Chemistry, Biology, Mathematics and English with AI-powered notes analysis, auto-generated flashcards and personalised quizzes.",
    subjects: ["Physics", "Chemistry", "Biology", "Maths", "English"],
    accent: "hsl(222,70%,55%)",
    topBar: "from-[hsl(222,70%,24%)] to-[hsl(222,60%,32%)]",
    featured: false,
  },
  {
    id: "ss3",
    label: "SS3", sublabel: "Final Year", tagline: "Intensive Revision",
    desc: "Your most critical year. Every topic, every past question — analysed by AI. Mock exams, gap analysis and revision schedules built around your weaknesses.",
    subjects: ["Intensive Revision", "Past Questions", "Mock Exams", "All Subjects"],
    accent: "hsl(28,95%,52%)",
    topBar: "from-[hsl(28,85%,40%)] to-[hsl(28,95%,56%)]",
    featured: true,
  },
  {
    id: "waec",
    label: "WAEC", sublabel: "Exam Prep", tagline: "Pass With Flying Colours",
    desc: "Thousands of official WAEC past questions, topic-by-topic analysis, and AI explanations for every tricky question. SSCE coverage across all subjects.",
    subjects: ["Past Papers", "SSCE Topics", "MCQ Drills", "Flashcards"],
    accent: "hsl(158,60%,40%)",
    topBar: "from-[hsl(158,55%,28%)] to-[hsl(158,60%,42%)]",
    featured: false,
  },
  {
    id: "jamb",
    label: "JAMB", sublabel: "UTME Prep", tagline: "Score 300+",
    desc: "Crack the JAMB UTME. Our AI generates JAMB-style questions on demand, identifies weak areas and creates personalised study plans to hit your target score.",
    subjects: ["UTME Practice", "Use of English", "CBT Mode", "Score Tracker"],
    accent: "hsl(340,70%,50%)",
    topBar: "from-[hsl(340,60%,36%)] to-[hsl(340,70%,52%)]",
    featured: false,
  },
];

const Programs = () => {
  return (
    <section id="programs" className="bg-[hsl(222,70%,10%)] py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 bg-[rgba(255,165,0,0.08)] border border-[rgba(255,165,0,0.2)] rounded-full px-4 py-2 mb-5">
            <span className="text-[11px] font-bold tracking-[0.12em] text-[hsl(28,95%,62%)]">ACADEMIC PROGRAMS</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white leading-tight tracking-tight mb-4">
            Your Level.{" "}
            <span className="bg-gradient-to-r from-[hsl(28,95%,52%)] to-[hsl(36,100%,65%)] bg-clip-text text-transparent">
              Your Path.
            </span>
          </h2>
          <p className="text-base sm:text-lg text-white/50 max-w-md mx-auto leading-relaxed">
            Purpose-built for every stage — from SS2 foundations to WAEC and JAMB victory.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {PROGRAMS.map((program) => (
            <div key={program.id}
              className={`relative rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1.5 cursor-pointer ${
                program.featured
                  ? "bg-gradient-to-br from-[hsl(222,65%,16%)] to-[hsl(222,60%,12%)] border border-[rgba(255,165,0,0.35)] shadow-[0_0_0_1px_rgba(255,165,0,0.15),0_24px_60px_rgba(0,0,0,0.5)]"
                  : "bg-gradient-to-br from-[hsl(222,60%,13%)] to-[hsl(222,55%,10%)] border border-white/[0.07] shadow-[0_16px_40px_rgba(0,0,0,0.4)]"
              }`}
            >
              {/* Top stripe */}
              <div className={`h-1 bg-gradient-to-r ${program.topBar}`} />

              {/* Inner glow */}
              <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-[0.06] pointer-events-none"
                style={{ background: `radial-gradient(circle,${program.accent} 0%,transparent 70%)`, transform: "translate(30%,-30%)" }} />

              <div className="p-5 sm:p-6">
                {/* Badge row */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="text-xl sm:text-2xl font-black text-white tracking-tight">{program.label}</div>
                    <div className="text-[10px] font-semibold text-white/40 tracking-widest mt-0.5">{program.sublabel.toUpperCase()}</div>
                  </div>
                  {program.featured && (
                    <span className="px-2.5 py-1 rounded-full bg-[hsl(28,95%,52%)] text-white text-[10px] font-black tracking-wide shrink-0">POPULAR</span>
                  )}
                </div>

                {/* Tagline */}
                <div className="text-[11px] font-bold tracking-[0.06em] mb-2.5" style={{ color: program.accent }}>
                  {program.tagline.toUpperCase()}
                </div>

                {/* Description */}
                <p className="text-[13px] text-white/55 leading-relaxed mb-4">{program.desc}</p>

                {/* Divider */}
                <div className="h-px bg-white/[0.06] mb-4" />

                {/* Subject tags */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {program.subjects.map(s => (
                    <span key={s} className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-white/5 border border-white/10 text-white/60">
                      {s}
                    </span>
                  ))}
                </div>

                {/* CTA */}
                <div className="flex items-center gap-1.5 text-[13px] font-bold" style={{ color: program.accent }}>
                  <span>Explore {program.label}</span>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Programs;
