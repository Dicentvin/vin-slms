const TESTIMONIALS = [
  {
    name: "Amaka Okafor", role: "SS3 Student — WAEC 2024", result: "8 A1s in WAEC", avatar: "AO",
    color: "hsl(28,95%,52%)",
    quote: "Chukwudi Academy's AI chat literally changed how I study. I uploaded my Chemistry notes and asked it questions for hours. Understood Electrochemistry better than any teacher explained it.",
  },
  {
    name: "Emeka Eze", role: "JAMB Candidate 2024", result: "Score: 312/400", avatar: "EE",
    color: "hsl(222,70%,55%)",
    quote: "The JAMB quiz mode is insane. It generates questions that look exactly like real UTME questions. I went from 220 to 312. Tell your friends about this site.",
  },
  {
    name: "Blessing Adeyemi", role: "SS2 Science Student", result: "Top of class", avatar: "BA",
    color: "hsl(158,60%,45%)",
    quote: "I use the flashcard feature after every class. I upload my notes and get 20 flashcards in seconds. My test scores went up immediately. It just works.",
  },
];

const Testimonials = () => {
  return (
    <section id="testimonial" className="bg-[hsl(222,65%,12%)] py-16 sm:py-24 border-t border-white/[0.05]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 bg-white/4 border border-white/10 rounded-full px-4 py-2 mb-5">
            <span className="text-[11px] font-bold tracking-[0.12em] text-white/40">STUDENT STORIES</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
            Nigerians Who{" "}
            <span className="bg-gradient-to-r from-[hsl(28,95%,52%)] to-[hsl(36,100%,65%)] bg-clip-text text-transparent">
              Passed With Flying Colours
            </span>
          </h2>
          <p className="text-base sm:text-lg text-white/40 max-w-sm mx-auto">
            Real students. Real results. Real improvement.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {TESTIMONIALS.map((t, i) => (
            <div key={i}
              className="relative rounded-2xl p-5 sm:p-7 bg-gradient-to-br from-[hsl(222,60%,15%)] to-[hsl(222,55%,12%)] border border-white/[0.07] shadow-[0_16px_40px_rgba(0,0,0,0.35)] overflow-hidden hover:-translate-y-1 transition-transform duration-300 cursor-default"
            >
              {/* Glow */}
              <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-[0.07] pointer-events-none"
                style={{ background: `radial-gradient(circle,${t.color} 0%,transparent 70%)`, transform: "translate(30%,-30%)" }} />

              {/* Quote mark */}
              <div className="text-6xl sm:text-7xl leading-none font-serif mb-4 opacity-15" style={{ color: t.color }}>"</div>

              {/* Quote */}
              <p className="text-sm sm:text-base text-white/75 leading-relaxed mb-6 relative">"{t.quote}"</p>

              {/* Divider */}
              <div className="h-px bg-white/[0.06] mb-5" />

              {/* Author */}
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center font-black text-xs sm:text-sm text-white shrink-0" style={{ background: t.color }}>
                    {t.avatar}
                  </div>
                  <div>
                    <div className="text-sm font-black text-white">{t.name}</div>
                    <div className="text-xs text-white/40 mt-0.5">{t.role}</div>
                  </div>
                </div>
                <div className="px-3 py-1 rounded-full text-[11px] font-black border" style={{ color: t.color, background: `${t.color}20`, borderColor: `${t.color}40` }}>
                  {t.result}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Social proof bar */}
        <div className="mt-12 sm:mt-16 flex justify-center">
          <div className="inline-flex items-center gap-4 bg-white/4 border border-white/8 rounded-full px-5 sm:px-7 py-3.5 flex-wrap justify-center gap-y-3">
            <div className="flex">
              {["AO", "EE", "BA", "CK", "OA"].map((init, i) => (
                <div key={i} className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black text-white border-2 border-[hsl(222,65%,12%)]"
                  style={{ background: `hsl(${i * 50 + 10},70%,45%)`, marginLeft: i === 0 ? 0 : -8 }}>
                  {init}
                </div>
              ))}
            </div>
            <span className="text-sm text-white/60 font-medium">
              Join <span className="text-[hsl(28,95%,62%)] font-black">5,000+</span> students already studying smarter
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
