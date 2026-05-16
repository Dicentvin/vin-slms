import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "@/hooks/AuthProvider";

const NAV_LINKS = [
  ["#home", "Overview"],
  ["#programs", "Programs"],
  ["#stats", "Results"],
  ["#testimonial", "Stories"],
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const handleLogout = () => { logout(); navigate("/login"); };

  return (
    <nav className={`fixed w-full z-50 transition-all duration-500 ${scrolled ? "bg-[hsl(222,70%,14%)] border-b border-white/8 py-3" : "bg-transparent py-5"}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[hsl(28,95%,52%)] flex items-center justify-center shadow-[0_4px_14px_hsl(28,95%,52%,0.45)] shrink-0">
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="17" height="17">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" />
              </svg>
            </div>
            <div className="leading-none">
              <div className="text-[15px] font-black tracking-tight text-white">CHUKWUDI</div>
              <div className="text-[8px] font-bold tracking-[0.25em] text-[hsl(28,95%,62%)] mt-0.5">ACADEMY</div>
            </div>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map(([href, label]) => (
              <a key={href} href={href} className="text-white/75 hover:text-white font-medium text-sm transition-colors duration-200 no-underline">
                {label}
              </a>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <Link to="/dashboard">
                  <button className="px-5 py-2 rounded-lg bg-[hsl(28,95%,52%)] text-white font-bold text-sm shadow-[0_4px_14px_hsl(28,95%,52%,0.35)] hover:brightness-110 transition-all cursor-pointer border-0">
                    Dashboard
                  </button>
                </Link>
                <button onClick={handleLogout} className="px-4 py-2 rounded-lg border border-white/20 text-white/70 text-sm font-medium hover:bg-white/10 transition-all cursor-pointer bg-transparent">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <button className="text-white/75 hover:text-white text-sm font-medium transition-colors bg-transparent border-0 cursor-pointer">
                    Sign In
                  </button>
                </Link>
                <Link to="/register">
                  <button className="px-5 py-2.5 rounded-lg bg-[hsl(28,95%,52%)] text-white font-bold text-sm shadow-[0_4px_14px_hsl(28,95%,52%,0.4)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_hsl(28,95%,52%,0.5)] transition-all cursor-pointer border-0">
                    Get Started Free
                  </button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Toggle */}
          <button className="md:hidden text-white bg-transparent border-0 cursor-pointer p-1" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden mt-4 pt-4 border-t border-white/10">
            <div className="flex flex-col gap-1">
              {NAV_LINKS.map(([href, label]) => (
                <a key={href} href={href} onClick={() => setIsOpen(false)}
                  className="text-white/80 font-medium text-base py-2.5 no-underline hover:text-white transition-colors">
                  {label}
                </a>
              ))}
            </div>
            <div className="mt-4 flex flex-col gap-2.5">
              {user ? (
                <>
                  <Link to="/dashboard" onClick={() => setIsOpen(false)}>
                    <button className="w-full py-3 rounded-lg bg-[hsl(28,95%,52%)] text-white font-bold text-sm border-0 cursor-pointer">Dashboard</button>
                  </Link>
                  <button onClick={handleLogout} className="w-full py-3 rounded-lg bg-white/8 text-white font-semibold text-sm border-0 cursor-pointer">Logout</button>
                </>
              ) : (
                <>
                  <Link to="/register" onClick={() => setIsOpen(false)}>
                    <button className="w-full py-3 rounded-lg bg-[hsl(28,95%,52%)] text-white font-bold text-sm border-0 cursor-pointer">Get Started Free</button>
                  </Link>
                  <Link to="/login" onClick={() => setIsOpen(false)}>
                    <button className="w-full py-3 rounded-lg bg-white/8 text-white font-semibold text-sm border-0 cursor-pointer">Sign In</button>
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
