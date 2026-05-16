const TESTIMONIALS = [
  {
    name: "Amaka Okafor",
    role: "SS3 Student — WAEC 2024",
    result: "8 A1s in WAEC",
    avatar: "AO",
    color: "hsl(28,95%,52%)",
    quote: "Chukwudi Academy's AI chat literally changed how I study. I uploaded my Chemistry notes and asked it questions for hours. Understood Electrochemistry better than any teacher explained it.",
  },
  {
    name: "Emeka Eze",
    role: "JAMB Candidate 2024",
    result: "Score: 312/400",
    avatar: "EE",
    color: "hsl(222,70%,55%)",
    quote: "The JAMB quiz mode is insane. It generates questions that look exactly like real UTME questions. I went from 220 to 312. Tell your friends about this site.",
  },
  {
    name: "Blessing Adeyemi",
    role: "SS2 Science Student",
    result: "Top of class",
    avatar: "BA",
    color: "hsl(158,60%,45%)",
    quote: "I use the flashcard feature after every class. I upload my notes and get 20 flashcards in seconds. My test scores went up immediately. It just works.",
  },
];

const Testimonials = () => {
  return (
    <section id="testimonial" style={{ background:"hsl(222,65%,12%)", padding:"100px 0", borderTop:"1px solid rgba(255,255,255,0.05)" }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">

        {/* Header */}
        <div style={{ textAlign:"center", marginBottom:64 }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:99, padding:"7px 18px", marginBottom:20 }}>
            <span style={{ fontSize:11, fontWeight:700, letterSpacing:"0.12em", color:"rgba(255,255,255,0.4)" }}>STUDENT STORIES</span>
          </div>
          <h2 style={{ fontSize:"clamp(28px,3.5vw,46px)", fontWeight:900, color:"#fff", margin:"0 0 16px", letterSpacing:"-0.02em" }}>
            Nigerians Who{" "}
            <span style={{ background:"linear-gradient(90deg,hsl(28,95%,52%),hsl(36,100%,65%))", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>Passed With Flying Colours</span>
          </h2>
          <p style={{ fontSize:17, color:"rgba(255,255,255,0.4)", maxWidth:440, margin:"0 auto" }}>
            Real students. Real results. Real improvement.
          </p>
        </div>

        {/* Cards */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))", gap:24 }}>
          {TESTIMONIALS.map((t, i)=>(
            <div key={i} style={{
              borderRadius:20,
              padding:"28px",
              background:"linear-gradient(160deg,hsl(222,60%,15%) 0%,hsl(222,55%,12%) 100%)",
              border:"1px solid rgba(255,255,255,0.07)",
              boxShadow:"0 16px 40px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.04)",
              position:"relative",
              overflow:"hidden",
              transition:"transform 0.3s",
              cursor:"default",
            }}
              onMouseEnter={e=>(e.currentTarget as HTMLDivElement).style.transform="translateY(-4px)"}
              onMouseLeave={e=>(e.currentTarget as HTMLDivElement).style.transform="translateY(0)"}
            >
              {/* Glow */}
              <div style={{ position:"absolute", top:-40, right:-40, width:160, height:160, borderRadius:"50%", background:`radial-gradient(circle,${t.color} 0%,transparent 70%)`, opacity:0.07, pointerEvents:"none" }}/>

              {/* Quote mark */}
              <div style={{ fontSize:72, lineHeight:0.8, color:t.color, opacity:0.15, fontFamily:"Georgia,serif", marginBottom:20 }}>"</div>

              {/* Quote */}
              <p style={{ fontSize:15, color:"rgba(255,255,255,0.75)", lineHeight:1.8, margin:"0 0 28px", position:"relative" }}>
                "{t.quote}"
              </p>

              {/* Separator */}
              <div style={{ height:1, background:"rgba(255,255,255,0.06)", marginBottom:20 }}/>

              {/* Author row */}
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                  <div style={{ width:42, height:42, borderRadius:12, background:t.color, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:900, fontSize:13, color:"#fff" }}>
                    {t.avatar}
                  </div>
                  <div>
                    <div style={{ fontSize:14, fontWeight:800, color:"#fff" }}>{t.name}</div>
                    <div style={{ fontSize:11, color:"rgba(255,255,255,0.4)", marginTop:2 }}>{t.role}</div>
                  </div>
                </div>
                <div style={{ padding:"6px 14px", borderRadius:99, background:`${t.color}20`, border:`1px solid ${t.color}40`, fontSize:11, fontWeight:800, color:t.color }}>
                  {t.result}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Social proof bar */}
        <div style={{ marginTop:60, textAlign:"center" }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:16, background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:99, padding:"14px 28px" }}>
            <div style={{ display:"flex" }}>
              {["AO","EE","BA","CK","OA"].map((init,i)=>(
                <div key={i} style={{ width:32, height:32, borderRadius:"50%", background:`hsl(${i*50+10},70%,45%)`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:800, color:"#fff", marginLeft: i===0?0:-8, border:"2px solid hsl(222,65%,12%)" }}>
                  {init}
                </div>
              ))}
            </div>
            <span style={{ fontSize:13, color:"rgba(255,255,255,0.6)", fontWeight:600 }}>
              Join <span style={{ color:"hsl(28,95%,62%)", fontWeight:800 }}>5,000+</span> students already studying smarter
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
