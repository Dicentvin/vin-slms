const FEATURES = [
  {
    col: "1 / 3",
    title: "Chat with Your Documents",
    desc: "Upload any note, textbook or past paper and have a real conversation with it. Ask questions, request explanations, explore concepts — all in natural language.",
    accent: "hsl(28,95%,52%)",
    icon: (
      <svg viewBox="0 0 48 48" fill="none" width="48" height="48">
        <rect x="4" y="8" width="28" height="20" rx="6" stroke="currentColor" strokeWidth="2.5"/>
        <path d="M4 32 L8 28" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
        <rect x="16" y="20" width="28" height="20" rx="6" fill="currentColor" opacity="0.15" stroke="currentColor" strokeWidth="2.5"/>
        <path d="M22 30 L38 30 M22 34 L32 34" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.6"/>
      </svg>
    ),
    preview: (
      <div style={{ marginTop:20, display:"flex", flexDirection:"column", gap:8 }}>
        {[
          { role:"user", text:"What is Newton's Third Law?" },
          { role:"ai", text:"For every action there is an equal and opposite reaction — forces always come in pairs." },
          { role:"user", text:"Give me an example from WAEC past questions" },
        ].map((m,i)=>(
          <div key={i} style={{ display:"flex", justifyContent:m.role==="user"?"flex-end":"flex-start" }}>
            <div style={{ maxWidth:"85%", padding:"9px 14px", borderRadius:10, fontSize:12, lineHeight:1.6,
              background:m.role==="ai"?"rgba(255,255,255,0.07)":"rgba(255,165,0,0.15)",
              border:m.role==="ai"?"1px solid rgba(255,255,255,0.08)":"1px solid rgba(255,165,0,0.25)",
              color:m.role==="ai"?"rgba(255,255,255,0.75)":"rgba(255,255,255,0.85)",
            }}>{m.text}</div>
          </div>
        ))}
        <div style={{ display:"flex", alignItems:"center", gap:6, opacity:0.4 }}>
          {[0,1,2].map(i=><div key={i} style={{ width:6, height:6, borderRadius:"50%", background:"hsl(28,95%,52%)", animation:`bounce ${0.4+i*0.15}s infinite alternate` }}/>)}
        </div>
      </div>
    ),
  },
  {
    col: "3 / 4",
    title: "AI Flashcards",
    desc: "Auto-generate study flashcards from any document in seconds.",
    accent: "hsl(222,70%,55%)",
    icon: (
      <svg viewBox="0 0 48 48" fill="none" width="48" height="48">
        <rect x="6" y="12" width="36" height="26" rx="5" stroke="currentColor" strokeWidth="2.5"/>
        <line x1="6" y1="20" x2="42" y2="20" stroke="currentColor" strokeWidth="2.5"/>
        <path d="M16 28 L20 32 L32 22" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    preview: (
      <div style={{ marginTop:20 }}>
        <div style={{ borderRadius:12, background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", padding:"16px", textAlign:"center" }}>
          <div style={{ fontSize:11, color:"rgba(255,255,255,0.4)", marginBottom:8, fontWeight:600 }}>QUESTION</div>
          <div style={{ fontSize:13, fontWeight:700, color:"#fff", marginBottom:14 }}>What is the formula for photosynthesis?</div>
          <div style={{ height:1, background:"rgba(255,255,255,0.06)", marginBottom:14 }}/>
          <div style={{ fontSize:11, color:"rgba(255,255,255,0.4)", marginBottom:8, fontWeight:600 }}>ANSWER</div>
          <div style={{ fontSize:13, color:"hsl(28,95%,62%)", fontWeight:700 }}>6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂</div>
          <div style={{ marginTop:14, display:"flex", justifyContent:"center", gap:6 }}>
            {["Know it","Almost","Review"].map((l,i)=>(
              <button key={l} style={{ padding:"6px 12px", borderRadius:8, fontSize:11, fontWeight:700, border:"none", cursor:"pointer",
                background:["hsl(158,60%,35%)","hsl(28,95%,52%)","hsl(340,65%,50%)"][i], color:"#fff",
              }}>{l}</button>
            ))}
          </div>
        </div>
      </div>
    ),
  },
  {
    col: "1 / 2",
    title: "Smart Quiz Engine",
    desc: "WAEC-style and JAMB-style quizzes generated from your actual study material.",
    accent: "hsl(158,60%,45%)",
    icon: (
      <svg viewBox="0 0 48 48" fill="none" width="48" height="48">
        <circle cx="24" cy="24" r="18" stroke="currentColor" strokeWidth="2.5"/>
        <path d="M20 20 C20 17 28 17 28 21 C28 24 24 24 24 27" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
        <circle cx="24" cy="31" r="1.5" fill="currentColor"/>
      </svg>
    ),
    preview: (
      <div style={{ marginTop:16 }}>
        <div style={{ fontSize:12, color:"rgba(255,255,255,0.6)", marginBottom:12, lineHeight:1.6 }}>
          In an experiment to determine g using a simple pendulum, the period T is related to length L by:
        </div>
        {["T = 2π√(L/g)", "T = 2π√(g/L)", "T = √(L/g)", "T = π√(L/g)"].map((opt,i)=>(
          <div key={i} style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 12px", borderRadius:9, marginBottom:6,
            background: i===0 ? "rgba(30,180,120,0.15)" : "rgba(255,255,255,0.04)",
            border: i===0 ? "1px solid rgba(30,180,120,0.35)" : "1px solid rgba(255,255,255,0.07)",
          }}>
            <span style={{ width:20, height:20, borderRadius:"50%", background: i===0?"hsl(158,60%,40%)":"rgba(255,255,255,0.08)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:700, color:"#fff", flexShrink:0 }}>
              {String.fromCharCode(65+i)}
            </span>
            <span style={{ fontSize:12, color: i===0 ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.55)" }}>{opt}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    col: "2 / 4",
    title: "Instant AI Summaries",
    desc: "Paste a 50-page document and get a clean, structured summary in under 10 seconds — key concepts, definitions, and exam tips highlighted.",
    accent: "hsl(28,95%,52%)",
    icon: (
      <svg viewBox="0 0 48 48" fill="none" width="48" height="48">
        <path d="M10 14 L38 14 M10 22 L30 22 M10 30 L34 30 M10 38 L26 38" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
        <circle cx="36" cy="36" r="8" fill="currentColor" opacity="0.15" stroke="currentColor" strokeWidth="2"/>
        <path d="M33 36 L36 39 L41 33" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    preview: (
      <div style={{ marginTop:16, display:"flex", gap:12 }}>
        <div style={{ flex:1, padding:"14px", borderRadius:12, background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ fontSize:10, fontWeight:700, letterSpacing:"0.1em", color:"rgba(255,255,255,0.35)", marginBottom:8 }}>INPUT</div>
          <div style={{ fontSize:11, color:"rgba(255,255,255,0.45)", lineHeight:1.6 }}>Chapter 5: Electrochemistry... [47 pages of dense textbook content]</div>
        </div>
        <div style={{ display:"flex", alignItems:"center" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="hsl(28,95%,52%)" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
        </div>
        <div style={{ flex:1, padding:"14px", borderRadius:12, background:"rgba(255,165,0,0.06)", border:"1px solid rgba(255,165,0,0.2)" }}>
          <div style={{ fontSize:10, fontWeight:700, letterSpacing:"0.1em", color:"hsl(28,95%,62%)", marginBottom:8 }}>AI SUMMARY</div>
          <div style={{ fontSize:11, color:"rgba(255,255,255,0.7)", lineHeight:1.7 }}>
            ✓ Electrolysis: decomposition by current<br/>
            ✓ Faraday's 1st Law: m ∝ Q<br/>
            ✓ Key equation: m = ZIt<br/>
            <span style={{ color:"hsl(28,95%,62%)", fontWeight:700 }}>WAEC tip: Always state units</span>
          </div>
        </div>
      </div>
    ),
  },
];

const Features = () => {
  return (
    <section style={{ background:"hsl(222,70%,10%)", padding:"100px 0" }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">

        {/* Header */}
        <div style={{ textAlign:"center", marginBottom:64 }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(255,165,0,0.08)", border:"1px solid rgba(255,165,0,0.2)", borderRadius:99, padding:"7px 18px", marginBottom:20 }}>
            <span style={{ fontSize:11, fontWeight:700, letterSpacing:"0.12em", color:"hsl(28,95%,62%)" }}>AI FEATURES</span>
          </div>
          <h2 style={{ fontSize:"clamp(30px,4vw,50px)", fontWeight:900, color:"#fff", margin:"0 0 16px", letterSpacing:"-0.02em" }}>
            Every Tool You Need to{" "}
            <span style={{ background:"linear-gradient(90deg,hsl(28,95%,52%),hsl(36,100%,65%))", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
              Score High
            </span>
          </h2>
          <p style={{ fontSize:17, color:"rgba(255,255,255,0.45)", maxWidth:520, margin:"0 auto" }}>
            Upload once. Study smarter with AI-powered tools built for the Nigerian curriculum.
          </p>
        </div>

        {/* Bento grid */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:20 }}>
          {FEATURES.map((feat, i)=>(
            <div key={i} style={{
              gridColumn: feat.col,
              borderRadius:20,
              padding:"28px",
              background:"linear-gradient(160deg,hsl(222,60%,14%) 0%,hsl(222,55%,11%) 100%)",
              border:"1px solid rgba(255,255,255,0.07)",
              boxShadow:"0 16px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)",
              overflow:"hidden",
              position:"relative",
              transition:"transform 0.25s",
              cursor:"default",
            }}
              onMouseEnter={e=>(e.currentTarget as HTMLDivElement).style.transform="translateY(-4px)"}
              onMouseLeave={e=>(e.currentTarget as HTMLDivElement).style.transform="translateY(0)"}
            >
              {/* Top border accent */}
              <div style={{ position:"absolute", top:0, left:0, right:0, height:2, background:`linear-gradient(90deg,${feat.accent},transparent)` }}/>

              <div style={{ color:feat.accent, marginBottom:16 }}>{feat.icon}</div>
              <h3 style={{ fontSize:18, fontWeight:800, color:"#fff", margin:"0 0 10px", letterSpacing:"-0.01em" }}>{feat.title}</h3>
              <p style={{ fontSize:14, color:"rgba(255,255,255,0.5)", lineHeight:1.7, margin:0 }}>{feat.desc}</p>
              {feat.preview}
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes bounce { from { transform: translateY(0); } to { transform: translateY(-4px); } }
        @media (max-width: 768px) {
          .bento-grid > div { grid-column: 1 / -1 !important; }
        }
      `}</style>
    </section>
  );
};

export default Features;
