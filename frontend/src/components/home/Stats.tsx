const STATS = [
  { value: "5,000+", label: "Active Students",   sub: "Across all classes",   icon: "🎓", accent: "hsl(28,95%,52%)",   bar: "bg-[hsl(28,95%,52%)]" },
  { value: "95%",    label: "WAEC Pass Rate",    sub: "Among our students",   icon: "📊", accent: "hsl(158,60%,45%)",  bar: "bg-[hsl(158,60%,45%)]" },
  { value: "10K+",   label: "Past Questions",    sub: "WAEC & JAMB bank",     icon: "📚", accent: "hsl(222,70%,55%)",  bar: "bg-[hsl(222,70%,55%)]" },
  { value: "24/7",   label: "AI Tutor Online",   sub: "Always available",     icon: "🤖", accent: "hsl(28,95%,52%)",   bar: "bg-[hsl(28,95%,52%)]" },
];

const Stats = () => {
  return (
    <section id="stats" className="bg-[hsl(222,65%,12%)] py-16 sm:py-20 border-y border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 bg-white/4 border border-white/10 rounded-full px-4 py-2 mb-4">
            <span className="text-[11px] font-bold tracking-[0.12em] text-white/50">BY THE NUMBERS</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
            Results That Speak for Themselves
          </h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
          {STATS.map((stat, i) => (
            <div key={i} className="relative rounded-2xl p-5 sm:p-7 bg-gradient-to-br from-[hsl(222,60%,15%)] to-[hsl(222,55%,12%)] border border-white/[0.07] overflow-hidden shadow-[0_12px_32px_rgba(0,0,0,0.35)] hover:-translate-y-1 transition-transform duration-300 cursor-default">
              {/* Glow */}
              <div className="absolute bottom-0 right-0 w-28 h-28 rounded-full opacity-[0.08] pointer-events-none"
                style={{ background: `radial-gradient(circle,${stat.accent} 0%,transparent 70%)`, transform: "translate(30%,30%)" }} />
              {/* Left accent bar */}
              <div className={`absolute left-0 top-[20%] bottom-[20%] w-[3px] rounded-r-full ${stat.bar}`} />

              <div className="text-2xl sm:text-3xl mb-2 sm:mb-3">{stat.icon}</div>
              <div className="text-3xl sm:text-4xl md:text-5xl font-black leading-none tracking-tight mb-1.5" style={{ color: stat.accent }}>
                {stat.value}
              </div>
              <div className="text-sm sm:text-base font-bold text-white/85 mb-1">{stat.label}</div>
              <div className="text-xs text-white/35 font-medium">{stat.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats;
