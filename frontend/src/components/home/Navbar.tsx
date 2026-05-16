import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "@/hooks/AuthProvider";

const Navbar = () => {
  const [isOpen, setIsOpen]     = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, logout }        = useAuth();
  const navigate                = useNavigate();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const handleLogout = () => { logout(); navigate("/login"); };

  return (
    <nav
      className="fixed w-full z-50 transition-all duration-500"
      style={{
        background: scrolled
          ? "hsl(222,70%,14%)"
          : "transparent",
        borderBottom: scrolled ? "1px solid rgba(255,255,255,0.08)" : "none",
        padding: scrolled ? "12px 0" : "20px 0",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div style={{
              width: 38, height: 38, borderRadius: 10,
              background: "hsl(28,95%,52%)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 14px hsl(28 95% 52% / 0.45)",
            }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
              </svg>
            </div>
            <div style={{ lineHeight: 1 }}>
              <div style={{ fontSize: 17, fontWeight: 800, letterSpacing: "-0.02em", color: "#fff" }}>CHUKWUDI</div>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.25em", color: "hsl(28,95%,62%)", marginTop: 1 }}>ACADEMY</div>
            </div>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8">
            {[["#home","Overview"],["#programs","Programs"],["#stats","Results"],["#testimonial","Stories"]].map(([href,label])=>(
              <a key={href} href={href}
                style={{ color: "rgba(255,255,255,0.75)", fontWeight: 500, fontSize: 14, textDecoration: "none", transition: "color 0.2s" }}
                onMouseEnter={e=>(e.currentTarget.style.color="#fff")}
                onMouseLeave={e=>(e.currentTarget.style.color="rgba(255,255,255,0.75)")}
              >{label}</a>
            ))}
          </div>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <Link to="/dashboard">
                  <button style={{ padding: "9px 20px", borderRadius: 8, background: "hsl(28,95%,52%)", color: "#fff", fontWeight: 700, fontSize: 13, border: "none", cursor: "pointer", boxShadow: "0 4px 14px hsl(28 95% 52% / 0.35)" }}>
                    Dashboard
                  </button>
                </Link>
                <button onClick={handleLogout} style={{ background: "none", border: "1px solid rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.7)", padding: "9px 16px", borderRadius: 8, fontSize: 13, cursor: "pointer" }}>
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <button style={{ background: "none", border: "none", color: "rgba(255,255,255,0.75)", fontSize: 14, fontWeight: 500, cursor: "pointer" }}>
                    Sign In
                  </button>
                </Link>
                <Link to="/register">
                  <button style={{ padding: "10px 22px", borderRadius: 8, background: "hsl(28,95%,52%)", color: "#fff", fontWeight: 700, fontSize: 14, border: "none", cursor: "pointer", transition: "transform 0.2s, box-shadow 0.2s", boxShadow: "0 4px 14px hsl(28 95% 52% / 0.4)" }}
                    onMouseEnter={e=>{ (e.currentTarget as HTMLButtonElement).style.transform="translateY(-1px)"; (e.currentTarget as HTMLButtonElement).style.boxShadow="0 6px 20px hsl(28 95% 52% / 0.5)"; }}
                    onMouseLeave={e=>{ (e.currentTarget as HTMLButtonElement).style.transform="translateY(0)"; (e.currentTarget as HTMLButtonElement).style.boxShadow="0 4px 14px hsl(28 95% 52% / 0.4)"; }}
                  >
                    Get Started Free
                  </button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Toggle */}
          <button className="md:hidden" onClick={()=>setIsOpen(!isOpen)} style={{ color: "#fff", background: "none", border: "none", cursor: "pointer" }}>
            {isOpen ? <X size={22}/> : <Menu size={22}/>}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.1)" }}>
            {[["#home","Overview"],["#programs","Programs"],["#stats","Results"]].map(([href,label])=>(
              <a key={href} href={href} onClick={()=>setIsOpen(false)}
                style={{ display: "block", color: "rgba(255,255,255,0.8)", fontWeight: 500, fontSize: 15, padding: "10px 0", textDecoration: "none" }}
              >{label}</a>
            ))}
            <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 10 }}>
              {user ? (
                <>
                  <Link to="/dashboard" onClick={()=>setIsOpen(false)}>
                    <button style={{ width: "100%", padding: "12px", borderRadius: 8, background: "hsl(28,95%,52%)", color: "#fff", fontWeight: 700, fontSize: 14, border: "none", cursor: "pointer" }}>Dashboard</button>
                  </Link>
                  <button onClick={handleLogout} style={{ width: "100%", padding: "12px", borderRadius: 8, background: "rgba(255,255,255,0.08)", color: "#fff", fontWeight: 600, fontSize: 14, border: "none", cursor: "pointer" }}>Logout</button>
                </>
              ) : (
                <>
                  <Link to="/register" onClick={()=>setIsOpen(false)}>
                    <button style={{ width: "100%", padding: "12px", borderRadius: 8, background: "hsl(28,95%,52%)", color: "#fff", fontWeight: 700, fontSize: 14, border: "none", cursor: "pointer" }}>Get Started Free</button>
                  </Link>
                  <Link to="/login" onClick={()=>setIsOpen(false)}>
                    <button style={{ width: "100%", padding: "12px", borderRadius: 8, background: "rgba(255,255,255,0.08)", color: "#fff", fontWeight: 600, fontSize: 14, border: "none", cursor: "pointer" }}>Sign In</button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
