const STATS = [
  { value:"5,000+",  label:"Active Students",         sub:"Across all classes",          icon:"\uD83C\uDF93", accent:"hsl(28,95%,52%)" },
  { value:"95%",     label:"WAEC Pass Rate",           sub:"Among our students",          icon:"\uD83D\uDCCA", accent:"hsl(158,60%,45%)" },
  { value:"10K+",    label:"Past Questions",           sub:"WAEC & JAMB bank",            icon:"\uD83D\uDCDA", accent:"hsl(222,70%,55%)" },
  { value:"24/7",    label:"AI Tutor Online",          sub:"Always available",            icon:"\uD83E\uDD16", accent:"hsl(28,95%,52%)" },
];

const Stats = () => {
  return (
    <section id="stats" style={{ background:"hsl(222,65%,12%)", padding:"80px 0", borderTop:"1px solid rgba(255,255,255,0.06)", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">

        {/* Header row */}
        <div style={{ textAlign:"center", marginBottom: 60 }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap: 8, background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:99, padding:"7px 18px", marginBottom:18 }}>
            <span style={{ fontSize:11, fontWeight:700, letterSpacing:"0.12em", color:"rgba(255,255,255,0.5)" }}>BY THE NUMBERS</span>
          </div>
          <h2 style={{ fontSize:"clamp(28px,3.5vw,42px)", fontWeight:900, color:"#fff", margin:0, letterSpacing:"-0.02em" }}>
            Results That Speak for Themselves
          </h2>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))", gap:20 }}>
          {STATS.map((stat, i) => (
            <div key={i} style={{
              position:"relative",
              borderRadius:18,
              padding:"32px 28px",
              background:"linear-gradient(160deg,hsl(222,60%,15%) 0%,hsl(222,55%,12%) 100%)",
              border:"1px solid rgba(255,255,255,0.07)",
              overflow:"hidden",
              boxShadow:"0 12px 32px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.04)",
              transition:"transform 0.3s",
              cursor:"default",
            }}
              onMouseEnter={e=>(e.currentTarget as HTMLDivElement).style.transform="translateY(-4px)"}
              onMouseLeave={e=>(e.currentTarget as HTMLDivElement).style.transform="translateY(0)"}
            >
              {/* Background glow */}
              <div style={{ position:"absolute", bottom:-30, right:-20, width:120, height:120, borderRadius:"50%", background:`radial-gradient(circle,${stat.accent} 0%,transparent 70%)`, opacity:0.08, pointerEvents:"none" }}/>
              {/* Left accent bar */}
              <div style={{ position:"absolute", left:0, top:"20%", bottom:"20%", width:3, borderRadius:"0 3px 3px 0", background:stat.accent }}/>

              <div style={{ fontSize:32, marginBottom:12 }}>{stat.icon}</div>
              <div style={{ fontSize:"clamp(34px,4vw,48px)", fontWeight:900, color:stat.accent, lineHeight:1, letterSpacing:"-0.03em", marginBottom:8 }}>
                {stat.value}
              </div>
              <div style={{ fontSize:15, fontWeight:700, color:"rgba(255,255,255,0.85)", marginBottom:4 }}>
                {stat.label}
              </div>
              <div style={{ fontSize:12, color:"rgba(255,255,255,0.35)", fontWeight:500 }}>
                {stat.sub}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats;
