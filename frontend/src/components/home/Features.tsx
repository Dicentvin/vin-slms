const FEATURES = [
  {
    span: "lg:col-span-2",
    title: "Chat with Your Documents",
    desc: "Upload any note, textbook or past paper and have a real conversation with it. Ask questions, request explanations, explore concepts — all in natural language.",
    accent: "hsl(28,95%,52%)",
    accentClass: "from-[hsl(28,95%,52%)]",
    icon: (
      <svg viewBox="0 0 48 48" fill="none" width="40" height="40" className="sm:w-12 sm:h-12">
        <rect x="4" y="8" width="28" height="20" rx="6" stroke="currentColor" strokeWidth="2.5" />
        <path d="M4 32 L8 28" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        <rect x="16" y="20" width="28" height="20" rx="6" fill="currentColor" opacity="0.15" stroke="currentColor" strokeWidth="2.5" />
        <path d="M22 30 L38 30 M22 34 L32 34" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
      </svg>
    ),
    preview: (
      <div className="mt-4 flex flex-col gap-2">
        {[
          { role: "user", text: "What is Newton's Third Law?" },
          { role: "ai", text: "For every action there is an equal and opposite reaction — forces always come in pairs." },
          { role: "user", text: "Give me an example from WAEC past questions" },
        ].map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] px-3 py-2 rounded-xl text-xs leading-relaxed ${
              m.role === "ai"
                ? "bg-white/7 border border-white/8 text-white/75"
                : "bg-[rgba(255,165,0,0.15)] border border-[rgba(255,165,0,0.25)] text-white/85"
            }`}>{m.text}</div>
          </div>
        ))}
        <div className="flex items-center gap-1.5 opacity-40">
          {[0, 1, 2].map(i => (
            <div key={i} className="w-1.5 h-1.5 rounded-full bg-[hsl(28,95%,52%)] animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
      </div>
    ),
  },
  {
    span: "lg:col-span-1",
    title: "AI Flashcards",
    desc: "Auto-generate study flashcards from any document in seconds.",
    accent: "hsl(222,70%,55%)",
    accentClass: "from-[hsl(222,70%,55%)]",
    icon: (
      <svg viewBox="0 0 48 48" fill="none" width="40" height="40" className="sm:w-12 sm:h-12">
        <rect x="6" y="12" width="36" height="26" rx="5" stroke="currentColor" strokeWidth="2.5" />
        <line x1="6" y1="20" x2="42" y2="20" stroke="currentColor" strokeWidth="2.5" />
        <path d="M16 28 L20 32 L32 22" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    preview: (
      <div className="mt-4">
        <div className="rounded-xl bg-white/6 border border-white/10 p-4 text-center">
          <div className="text-[10px] text-white/40 mb-2 font-bold tracking-widest">QUESTION</div>
          <div className="text-sm font-bold text-white mb-3">What is the formula for photosynthesis?</div>
          <div className="h-px bg-white/6 mb-3" />
          <div className="text-[10px] text-white/40 mb-2 font-bold tracking-widest">ANSWER</div>
          <div className="text-sm font-bold text-[hsl(28,95%,62%)]">6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂</div>
          <div className="mt-3 flex justify-center gap-2 flex-wrap">
            {[["Know it", "hsl(158,60%,35%)"], ["Almost", "hsl(28,95%,52%)"], ["Review", "hsl(340,65%,50%)"]].map(([l, bg]) => (
              <button key={l} className="px-3 py-1.5 rounded-lg text-[11px] font-bold text-white border-0 cursor-pointer" style={{ background: bg }}>{l}</button>
            ))}
          </div>
        </div>
      </div>
    ),
  },
  {
    span: "lg:col-span-1",
    title: "Smart Quiz Engine",
    desc: "WAEC-style and JAMB-style quizzes generated from your actual study material.",
    accent: "hsl(158,60%,45%)",
    accentClass: "from-[hsl(158,60%,45%)]",
    icon: (
      <svg viewBox="0 0 48 48" fill="none" width="40" height="40" className="sm:w-12 sm:h-12">
        <circle cx="24" cy="24" r="18" stroke="currentColor" strokeWidth="2.5" />
        <path d="M20 20 C20 17 28 17 28 21 C28 24 24 24 24 27" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="24" cy="31" r="1.5" fill="currentColor" />
      </svg>
    ),
    preview: (
      <div className="mt-4">
        <div className="text-xs text-white/60 mb-3 leading-relaxed">
          In an experiment to determine g using a simple pendulum, the period T is related to length L by:
        </div>
        {["T = 2π√(L/g)", "T = 2π√(g/L)", "T = √(L/g)", "T = π√(L/g)"].map((opt, i) => (
          <div key={i} className={`flex items-center gap-2.5 px-3 py-2 rounded-xl mb-1.5 border ${
            i === 0 ? "bg-[rgba(30,180,120,0.15)] border-[rgba(30,180,120,0.35)]" : "bg-white/4 border-white/7"
          }`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0 ${i === 0 ? "bg-[hsl(158,60%,40%)]" : "bg-white/8"}`}>
              {String.fromCharCode(65 + i)}
            </span>
            <span className={`text-xs ${i === 0 ? "text-white/90" : "text-white/55"}`}>{opt}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    span: "lg:col-span-2",
    title: "Instant AI Summaries",
    desc: "Paste a 50-page document and get a clean, structured summary in under 10 seconds — key concepts, definitions, and exam tips highlighted.",
    accent: "hsl(28,95%,52%)",
    accentClass: "from-[hsl(28,95%,52%)]",
    icon: (
      <svg viewBox="0 0 48 48" fill="none" width="40" height="40" className="sm:w-12 sm:h-12">
        <path d="M10 14 L38 14 M10 22 L30 22 M10 30 L34 30 M10 38 L26 38" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="36" cy="36" r="8" fill="currentColor" opacity="0.15" stroke="currentColor" strokeWidth="2" />
        <path d="M33 36 L36 39 L41 33" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    preview: (
      <div className="mt-4 flex flex-col sm:flex-row gap-3">
        <div className="flex-1 p-3.5 rounded-xl bg-white/5 border border-white/8">
          <div className="text-[10px] font-bold tracking-widest text-white/35 mb-2">INPUT</div>
          <div className="text-xs text-white/45 leading-relaxed">Chapter 5: Electrochemistry... [47 pages of dense textbook content]</div>
        </div>
        <div className="flex sm:flex-col items-center justify-center sm:justify-center">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="hsl(28,95%,52%)" strokeWidth="2.5" strokeLinecap="round" className="rotate-90 sm:rotate-0">
            <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
          </svg>
        </div>
        <div className="flex-1 p-3.5 rounded-xl bg-[rgba(255,165,0,0.06)] border border-[rgba(255,165,0,0.2)]">
          <div className="text-[10px] font-bold tracking-widest text-[hsl(28,95%,62%)] mb-2">AI SUMMARY</div>
          <div className="text-xs text-white/70 leading-relaxed">
            ✓ Electrolysis: decomposition by current<br />
            ✓ Faraday's 1st Law: m ∝ Q<br />
            ✓ Key equation: m = ZIt<br />
            <span className="text-[hsl(28,95%,62%)] font-bold">WAEC tip: Always state units</span>
          </div>
        </div>
      </div>
    ),
  },
];

const Features = () => {
  return (
    <section className="bg-[hsl(222,70%,10%)] py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 bg-[rgba(255,165,0,0.08)] border border-[rgba(255,165,0,0.2)] rounded-full px-4 py-2 mb-5">
            <span className="text-[11px] font-bold tracking-[0.12em] text-[hsl(28,95%,62%)]">AI FEATURES</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
            Every Tool You Need to{" "}
            <span className="bg-gradient-to-r from-[hsl(28,95%,52%)] to-[hsl(36,100%,65%)] bg-clip-text text-transparent">
              Score High
            </span>
          </h2>
          <p className="text-base sm:text-lg text-white/45 max-w-md mx-auto">
            Upload once. Study smarter with AI-powered tools built for the Nigerian curriculum.
          </p>
        </div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {FEATURES.map((feat, i) => (
            <div key={i}
              className={`${feat.span} relative rounded-2xl p-5 sm:p-7 bg-gradient-to-br from-[hsl(222,60%,14%)] to-[hsl(222,55%,11%)] border border-white/[0.07] shadow-[0_16px_40px_rgba(0,0,0,0.4)] overflow-hidden hover:-translate-y-1 transition-transform duration-300 cursor-default`}
            >
              {/* Top accent */}
              <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${feat.accentClass} to-transparent`} />

              <div className="mb-4" style={{ color: feat.accent }}>{feat.icon}</div>
              <h3 className="text-base sm:text-lg font-black text-white mb-2 tracking-tight">{feat.title}</h3>
              <p className="text-sm text-white/50 leading-relaxed">{feat.desc}</p>
              {feat.preview}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
