const PROGRAMS = [
  {
    id: "ss2",
    label: "SS2",
    sublabel: "Year Two",
    tagline: "Build the Foundation",
    desc: "Master SS2 Physics, Chemistry, Biology, Mathematics and English with AI-powered notes analysis, auto-generated flashcards and personalised quizzes.",
    subjects: ["Physics","Chemistry","Biology","Maths","English"],
    icon: (
      <svg viewBox="0 0 40 40" fill="none" width="40" height="40">
        <rect x="6" y="10" width="28" height="20" rx="3" stroke="currentColor" strokeWidth="2"/>
        <line x1="6" y1="16" x2="34" y2="16" stroke="currentColor" strokeWidth="2"/>
        <circle cx="20" cy="24" r="3" fill="currentColor"/>
      </svg>
    ),
    accent: "hsl(222,70%,35%)",
    glow: "hsl(222,70%,20%)",
    topBar: "linear-gradient(90deg,hsl(222,70%,24%),hsl(222,60%,32%))",
  },
  {
    id: "ss3",
    label: "SS3",
    sublabel: "Final Year",
    tagline: "Intensive Revision",
    desc: "Your most critical year. Every topic, every past question — analysed by AI. Mock exams, gap analysis and revision schedules built around your weaknesses.",
    subjects: ["Intensive Revision","Past Questions","Mock Exams","All Subjects"],
    icon: (
      <svg viewBox="0 0 40 40" fill="none" width="40" height="40">
        <path d="M20 6 L34 14 L34 26 L20 34 L6 26 L6 14 Z" stroke="currentColor" strokeWidth="2"/>
        <path d="M20 14 L26 18 L26 24 L20 28 L14 24 L14 18 Z" fill="currentColor" opacity="0.3"/>
      </svg>
    ),
    accent: "hsl(28,95%,52%)",
    glow: "hsl(28,70%,20%)",
    topBar: "linear-gradient(90deg,hsl(28,85%,40%),hsl(28,95%,56%))",
    featured: true,
  },
  {
    id: "waec",
    label: "WAEC",
    sublabel: "Exam Prep",
    tagline: "Pass With Flying Colours",
    desc: "Thousands of official WAEC past questions, topic-by-topic analysis, and AI explanations for every tricky question. SSCE coverage across all subjects.",
    subjects: ["Past Papers","SSCE Topics","MCQ Drills","Flashcards"],
    icon: (
      <svg viewBox="0 0 40 40" fill="none" width="40" height="40">
        <circle cx="20" cy="20" r="12" stroke="currentColor" strokeWidth="2"/>
        <path d="M15 20 L18 23 L25 16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    accent: "hsl(158,60%,40%)",
    glow: "hsl(158,60%,15%)",
    topBar: "linear-gradient(90deg,hsl(158,55%,28%),hsl(158,60%,42%))",
  },
  {
    id: "jamb",
    label: "JAMB",
    sublabel: "UTME Prep",
    tagline: "Score 300+",
    desc: "Crack the JAMB UTME. Our AI generates JAMB-style questions on demand, identifies weak areas and creates personalised study plans to hit your target score.",
    subjects: ["UTME Practice","Use of English","CBT Mode","Score Tracker"],
    icon: (
      <svg viewBox="0 0 40 40" fill="none" width="40" height="40">
        <path d="M10 34 L10 14 L20 8 L30 14 L30 34" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
        <rect x="16" y="24" width="8" height="10" stroke="currentColor" strokeWidth="2"/>
        <rect x="13" y="18" width="6" height="6" stroke="currentColor" strokeWidth="2"/>
        <rect x="21" y="18" width="6" height="6" stroke="currentColor" strokeWidth="2"/>
      </svg>
    ),
    accent: "hsl(340,70%,50%)",
    glow: "hsl(340,60%,15%)",
    topBar: "linear-gradient(90deg,hsl(340,60%,36%),hsl(340,70%,52%))",
  },
];

const Programs = () => {
  return (
    <section id="programs" style={{ background: "hsl(222,70%,10%)", padding: "100px 0 120px" }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">

        {/* Header */}
        <div style={{ textAlign:"center", marginBottom: 72 }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap: 8, background:"rgba(255,165,0,0.08)", border:"1px solid rgba(255,165,0,0.2)", borderRadius: 99, padding:"7px 18px", marginBottom: 20 }}>
            <span style={{ fontSize:11, fontWeight:700, letterSpacing:"0.12em", color:"hsl(28,95%,62%)" }}>ACADEMIC PROGRAMS</span>
          </div>
          <h2 style={{ fontSize:"clamp(32px,4vw,52px)", fontWeight:900, color:"#fff", lineHeight:1.1, letterSpacing:"-0.02em", margin:"0 0 18px" }}>
            Your Level.{" "}
            <span style={{ background:"linear-gradient(90deg,hsl(28,95%,52%),hsl(36,100%,65%))", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
              Your Path.
            </span>
          </h2>
          <p style={{ fontSize:17, color:"rgba(255,255,255,0.5)", maxWidth: 520, margin:"0 auto", lineHeight:1.7 }}>
            Purpose-built for every stage — from SS2 foundations to WAEC and JAMB victory.
          </p>
        </div>

        {/* Cards grid */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))", gap: 24 }}>
          {PROGRAMS.map((program) => (
            <div
              key={program.id}
              style={{
                position:"relative",
                borderRadius: 20,
                overflow:"hidden",
                background: program.featured
                  ? "linear-gradient(160deg,hsl(222,65%,16%) 0%,hsl(222,60%,12%) 100%)"
                  : "linear-gradient(160deg,hsl(222,60%,13%) 0%,hsl(222,55%,10%) 100%)",
                border: program.featured
                  ? "1px solid rgba(255,165,0,0.35)"
                  : "1px solid rgba(255,255,255,0.07)",
                boxShadow: program.featured
                  ? "0 0 0 1px rgba(255,165,0,0.15), 0 24px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)"
                  : "0 16px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)",
                transition:"transform 0.3s, box-shadow 0.3s",
                cursor:"pointer",
              }}
              onMouseEnter={e=>{
                const el = e.currentTarget as HTMLDivElement;
                el.style.transform="translateY(-6px)";
                el.style.boxShadow = program.featured
                  ? "0 0 0 1px rgba(255,165,0,0.3), 0 32px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08)"
                  : "0 24px 60px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.06)";
              }}
              onMouseLeave={e=>{
                const el = e.currentTarget as HTMLDivElement;
                el.style.transform="translateY(0)";
                el.style.boxShadow = program.featured
                  ? "0 0 0 1px rgba(255,165,0,0.15), 0 24px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)"
                  : "0 16px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)";
              }}
            >
              {/* Coloured top stripe */}
              <div style={{ height: 4, background: program.topBar }}/>

              {/* Inner glow */}
              <div style={{ position:"absolute", top: 0, right: 0, width: 180, height: 180, borderRadius:"50%", background:`radial-gradient(circle,${program.accent} 0%,transparent 70%)`, opacity: 0.06, pointerEvents:"none" }}/>

              <div style={{ padding: "26px 26px 28px" }}>

                {/* Top row: badge + featured chip */}
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom: 20 }}>
                  <div style={{ display:"flex", alignItems:"center", gap: 10 }}>
                    <div style={{ width:48, height:48, borderRadius:14, display:"flex", alignItems:"center", justifyContent:"center", background:`${program.accent}18`, border:`1px solid ${program.accent}30`, color:program.accent }}>
                      {program.icon}
                    </div>
                    <div>
                      <div style={{ fontSize:22, fontWeight:900, color:"#fff", letterSpacing:"-0.02em" }}>{program.label}</div>
                      <div style={{ fontSize:11, fontWeight:600, color:"rgba(255,255,255,0.4)", letterSpacing:"0.06em" }}>{program.sublabel.toUpperCase()}</div>
                    </div>
                  </div>
                  {program.featured && (
                    <span style={{ padding:"5px 12px", borderRadius:99, background:"hsl(28,95%,52%)", color:"#fff", fontSize:10, fontWeight:800, letterSpacing:"0.08em" }}>POPULAR</span>
                  )}
                </div>

                {/* Tagline */}
                <div style={{ fontSize:13, fontWeight:700, color:program.accent, marginBottom: 10, letterSpacing:"0.04em" }}>
                  {program.tagline.toUpperCase()}
                </div>

                {/* Description */}
                <p style={{ fontSize:14, color:"rgba(255,255,255,0.55)", lineHeight:1.75, marginBottom: 22 }}>
                  {program.desc}
                </p>

                {/* Separator */}
                <div style={{ height:1, background:"rgba(255,255,255,0.06)", marginBottom: 18 }}/>

                {/* Subject tags */}
                <div style={{ display:"flex", flexWrap:"wrap", gap: 7 }}>
                  {program.subjects.map(s=>(
                    <span key={s} style={{
                      padding:"5px 12px", borderRadius: 99, fontSize:11, fontWeight:600,
                      background:"rgba(255,255,255,0.05)",
                      border:"1px solid rgba(255,255,255,0.1)",
                      color:"rgba(255,255,255,0.6)",
                    }}>{s}</span>
                  ))}
                </div>

                {/* Bottom CTA */}
                <div style={{ marginTop: 22, display:"flex", alignItems:"center", gap: 6, fontSize:13, fontWeight:700, color:program.accent }}>
                  <span>Explore {program.label}</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
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
