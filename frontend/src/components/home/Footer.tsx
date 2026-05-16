import { Link } from "react-router";
import { ArrowRight } from "lucide-react";

const Footer = () => {
  return (
    <>
      {/* ── CTA SECTION ── */}
      <section style={{ background:"hsl(222,70%,10%)", padding:"100px 0" }}>
        <div className="max-w-5xl mx-auto px-6 lg:px-8" style={{ textAlign:"center" }}>

          {/* Card */}
          <div style={{
            position:"relative",
            borderRadius:28,
            padding:"clamp(40px,6vw,72px) clamp(28px,5vw,64px)",
            overflow:"hidden",
            background:"linear-gradient(160deg,hsl(222,65%,16%) 0%,hsl(222,60%,12%) 100%)",
            border:"1px solid rgba(255,255,255,0.08)",
            boxShadow:"0 40px 100px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)",
          }}>
            {/* Orange glow top-right */}
            <div style={{ position:"absolute", top:-60, right:-60, width:300, height:300, borderRadius:"50%", background:"radial-gradient(circle,hsl(28,95%,52%) 0%,transparent 70%)", opacity:0.1, pointerEvents:"none" }}/>
            {/* Navy glow bottom-left */}
            <div style={{ position:"absolute", bottom:-60, left:-60, width:280, height:280, borderRadius:"50%", background:"radial-gradient(circle,hsl(222,70%,40%) 0%,transparent 70%)", opacity:0.12, pointerEvents:"none" }}/>
            {/* Top border gradient */}
            <div style={{ position:"absolute", top:0, left:0, right:0, height:3, background:"linear-gradient(90deg,hsl(222,70%,40%),hsl(28,95%,52%),hsl(222,70%,40%))", borderRadius:"28px 28px 0 0" }}/>

            {/* Content */}
            <div style={{ position:"relative" }}>
              <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(255,165,0,0.08)", border:"1px solid rgba(255,165,0,0.2)", borderRadius:99, padding:"7px 18px", marginBottom:24 }}>
                <span style={{ fontSize:11, fontWeight:700, letterSpacing:"0.12em", color:"hsl(28,95%,62%)" }}>100% FREE TO START</span>
              </div>

              <h2 style={{ fontSize:"clamp(28px,4vw,52px)", fontWeight:900, color:"#fff", lineHeight:1.1, letterSpacing:"-0.02em", margin:"0 0 20px" }}>
                Ready to Ace Your Exams?
              </h2>
              <p style={{ fontSize:18, color:"rgba(255,255,255,0.5)", lineHeight:1.7, maxWidth:520, margin:"0 auto 40px" }}>
                Join 5,000+ Nigerian SS students studying smarter with AI. Upload your first note today — no credit card, no catch.
              </p>

              <div style={{ display:"flex", flexWrap:"wrap", gap:14, justifyContent:"center" }}>
                <Link to="/register">
                  <button style={{
                    display:"flex", alignItems:"center", gap:8,
                    padding:"16px 32px", borderRadius:12,
                    background:"linear-gradient(135deg,hsl(28,88%,42%),hsl(28,95%,58%))",
                    color:"#fff", fontWeight:800, fontSize:16, border:"none", cursor:"pointer",
                    boxShadow:"0 8px 28px hsl(28 95% 52% / 0.45)",
                    transition:"transform 0.2s,box-shadow 0.2s",
                  }}
                    onMouseEnter={e=>{ (e.currentTarget as HTMLButtonElement).style.transform="translateY(-2px)"; (e.currentTarget as HTMLButtonElement).style.boxShadow="0 12px 36px hsl(28 95% 52% / 0.55)"; }}
                    onMouseLeave={e=>{ (e.currentTarget as HTMLButtonElement).style.transform="translateY(0)"; (e.currentTarget as HTMLButtonElement).style.boxShadow="0 8px 28px hsl(28 95% 52% / 0.45)"; }}
                  >
                    Create Free Account <ArrowRight size={18}/>
                  </button>
                </Link>
                <Link to="/login">
                  <button style={{
                    padding:"16px 32px", borderRadius:12,
                    background:"rgba(255,255,255,0.07)",
                    color:"rgba(255,255,255,0.8)",
                    fontWeight:700, fontSize:16,
                    border:"1px solid rgba(255,255,255,0.15)", cursor:"pointer",
                    transition:"background 0.2s",
                  }}
                    onMouseEnter={e=>(e.currentTarget as HTMLButtonElement).style.background="rgba(255,255,255,0.12)"}
                    onMouseLeave={e=>(e.currentTarget as HTMLButtonElement).style.background="rgba(255,255,255,0.07)"}
                  >
                    Sign In
                  </button>
                </Link>
              </div>

              {/* Class pills */}
              <div style={{ display:"flex", flexWrap:"wrap", gap:8, justifyContent:"center", marginTop:32 }}>
                {["SS2","SS3","WAEC","JAMB","Physics","Chemistry","Biology","Maths"].map(tag=>(
                  <span key={tag} style={{ padding:"5px 14px", borderRadius:99, fontSize:11, fontWeight:700, background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.08)", color:"rgba(255,255,255,0.45)" }}>{tag}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background:"hsl(222,70%,8%)", borderTop:"1px solid rgba(255,255,255,0.06)", padding:"60px 0 36px" }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:48, marginBottom:56 }}>

            {/* Brand col */}
            <div>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:18 }}>
                <div style={{ width:36, height:36, borderRadius:10, background:"hsl(28,95%,52%)", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 4px 14px hsl(28 95% 52% / 0.4)" }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                    <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
                  </svg>
                </div>
                <div>
                  <div style={{ fontSize:16, fontWeight:900, letterSpacing:"-0.02em", color:"#fff" }}>CHUKWUDI</div>
                  <div style={{ fontSize:8, fontWeight:700, letterSpacing:"0.22em", color:"hsl(28,95%,60%)" }}>ACADEMY</div>
                </div>
              </div>
              <p style={{ fontSize:13, color:"rgba(255,255,255,0.4)", lineHeight:1.8, maxWidth:240, marginBottom:24 }}>
                AI-powered learning for Nigerian SS students. From SS2 to WAEC and JAMB — we've got you covered.
              </p>
              {/* Social links */}
              <div style={{ display:"flex", gap:10 }}>
                {[
                  { label:"Twitter", path:"M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" },
                  { label:"LinkedIn", path:"M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z M4 4a2 2 0 110 4 2 2 0 010-4z" },
                ].map(s=>(
                  <a key={s.label} href="#" aria-label={s.label} style={{ width:36, height:36, borderRadius:10, background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", display:"flex", alignItems:"center", justifyContent:"center", transition:"background 0.2s" }}
                    onMouseEnter={e=>(e.currentTarget as HTMLAnchorElement).style.background="rgba(255,255,255,0.12)"}
                    onMouseLeave={e=>(e.currentTarget as HTMLAnchorElement).style.background="rgba(255,255,255,0.06)"}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d={s.path}/>
                    </svg>
                  </a>
                ))}
              </div>
            </div>

            {/* Links */}
            {[
              { heading:"Programs", links:["SS2 Science","SS3 Science","WAEC Prep","JAMB / UTME","AI Study Hub"] },
              { heading:"Features", links:["Chat with Docs","AI Flashcards","Smart Quiz","Summaries","Concept Explainer"] },
              { heading:"Company", links:["About Us","Contact","Privacy Policy","Terms of Service","Support"] },
            ].map(col=>(
              <div key={col.heading}>
                <h4 style={{ fontSize:12, fontWeight:700, letterSpacing:"0.12em", color:"rgba(255,255,255,0.35)", marginBottom:18 }}>{col.heading.toUpperCase()}</h4>
                <ul style={{ listStyle:"none", padding:0, margin:0, display:"flex", flexDirection:"column", gap:12 }}>
                  {col.links.map(link=>(
                    <li key={link}>
                      <a href="#" style={{ fontSize:14, color:"rgba(255,255,255,0.5)", textDecoration:"none", fontWeight:500, transition:"color 0.2s" }}
                        onMouseEnter={e=>(e.currentTarget as HTMLAnchorElement).style.color="#fff"}
                        onMouseLeave={e=>(e.currentTarget as HTMLAnchorElement).style.color="rgba(255,255,255,0.5)"}
                      >{link}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom bar */}
          <div style={{ borderTop:"1px solid rgba(255,255,255,0.06)", paddingTop:28, display:"flex", flexWrap:"wrap", alignItems:"center", justifyContent:"space-between", gap:16 }}>
            <span style={{ fontSize:13, color:"rgba(255,255,255,0.3)" }}>© 2025 Chukwudi Academy. All rights reserved.</span>
            <div style={{ display:"flex", gap:8 }}>
              {["SS2","SS3","WAEC","JAMB"].map(c=>(
                <span key={c} style={{ padding:"4px 12px", borderRadius:99, fontSize:11, fontWeight:700, background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.08)", color:"rgba(255,255,255,0.35)" }}>{c}</span>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
