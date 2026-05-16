import { Link } from "react-router";
import { ArrowRight } from "lucide-react";

const Footer = () => {
  return (
    <>
      {/* CTA Section */}
      <section className="bg-[hsl(222,70%,10%)] py-16 sm:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl p-8 sm:p-12 lg:p-16 overflow-hidden bg-gradient-to-br from-[hsl(222,65%,16%)] to-[hsl(222,60%,12%)] border border-white/8 shadow-[0_40px_100px_rgba(0,0,0,0.5)] text-center">
            {/* Glows */}
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10 pointer-events-none"
              style={{ background: "radial-gradient(circle,hsl(28,95%,52%) 0%,transparent 70%)", transform: "translate(30%,-30%)" }} />
            <div className="absolute bottom-0 left-0 w-56 h-56 rounded-full opacity-12 pointer-events-none"
              style={{ background: "radial-gradient(circle,hsl(222,70%,40%) 0%,transparent 70%)", transform: "translate(-30%,30%)" }} />
            {/* Top border */}
            <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-3xl bg-gradient-to-r from-[hsl(222,70%,40%)] via-[hsl(28,95%,52%)] to-[hsl(222,70%,40%)]" />

            <div className="relative">
              <div className="inline-flex items-center gap-2 bg-[rgba(255,165,0,0.08)] border border-[rgba(255,165,0,0.2)] rounded-full px-4 py-2 mb-6">
                <span className="text-[11px] font-bold tracking-[0.12em] text-[hsl(28,95%,62%)]">100% FREE TO START</span>
              </div>

              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white leading-tight tracking-tight mb-5">
                Ready to Ace Your Exams?
              </h2>
              <p className="text-base sm:text-lg text-white/50 leading-relaxed max-w-lg mx-auto mb-8">
                Join 5,000+ Nigerian SS students studying smarter with AI. Upload your first note today — no credit card, no catch.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link to="/register" className="w-full sm:w-auto">
                  <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-4 rounded-xl bg-gradient-to-r from-[hsl(28,88%,42%)] to-[hsl(28,95%,58%)] text-white font-black text-base shadow-[0_8px_28px_hsl(28,95%,52%,0.45)] hover:-translate-y-0.5 hover:shadow-[0_12px_36px_hsl(28,95%,52%,0.55)] transition-all border-0 cursor-pointer">
                    Create Free Account <ArrowRight size={18} />
                  </button>
                </Link>
                <Link to="/login" className="w-full sm:w-auto">
                  <button className="w-full sm:w-auto px-7 py-4 rounded-xl bg-white/7 text-white/80 font-bold text-base border border-white/15 hover:bg-white/12 transition-all cursor-pointer">
                    Sign In
                  </button>
                </Link>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 justify-center mt-8">
                {["SS2", "SS3", "WAEC", "JAMB", "Physics", "Chemistry", "Biology", "Maths"].map(tag => (
                  <span key={tag} className="px-3 py-1 rounded-full text-[11px] font-bold bg-white/5 border border-white/8 text-white/45">{tag}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[hsl(222,70%,8%)] border-t border-white/[0.06] pt-12 sm:pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12 mb-12">

            {/* Brand — full width on mobile */}
            <div className="col-span-2 sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 rounded-xl bg-[hsl(28,95%,52%)] flex items-center justify-center shadow-[0_4px_14px_hsl(28,95%,52%,0.4)] shrink-0">
                  <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                    <path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" />
                  </svg>
                </div>
                <div className="leading-none">
                  <div className="text-base font-black tracking-tight text-white">CHUKWUDI</div>
                  <div className="text-[8px] font-bold tracking-[0.22em] text-[hsl(28,95%,60%)] mt-0.5">ACADEMY</div>
                </div>
              </div>
              <p className="text-sm text-white/40 leading-relaxed max-w-xs mb-5">
                AI-powered learning for Nigerian SS students. From SS2 to WAEC and JAMB — we've got you covered.
              </p>
              <div className="flex gap-2">
                {[
                  { label: "Twitter", d: "M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" },
                  { label: "LinkedIn", d: "M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z M4 4a2 2 0 110 4 2 2 0 010-4z" },
                ].map(s => (
                  <a key={s.label} href="#" aria-label={s.label}
                    className="w-9 h-9 rounded-xl bg-white/6 border border-white/10 flex items-center justify-center hover:bg-white/12 transition-colors">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d={s.d} />
                    </svg>
                  </a>
                ))}
              </div>
            </div>

            {/* Link columns */}
            {[
              { heading: "Programs", links: ["SS2 Science", "SS3 Science", "WAEC Prep", "JAMB / UTME", "AI Study Hub"] },
              { heading: "Features", links: ["Chat with Docs", "AI Flashcards", "Smart Quiz", "Summaries", "Concept Explainer"] },
              { heading: "Company", links: ["About Us", "Contact", "Privacy Policy", "Terms of Service", "Support"] },
            ].map(col => (
              <div key={col.heading}>
                <h4 className="text-[11px] font-bold tracking-[0.12em] text-white/35 mb-4">{col.heading.toUpperCase()}</h4>
                <ul className="flex flex-col gap-3 list-none p-0 m-0">
                  {col.links.map(link => (
                    <li key={link}>
                      <a href="#" className="text-sm text-white/50 no-underline font-medium hover:text-white transition-colors">{link}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom bar */}
          <div className="border-t border-white/[0.06] pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs sm:text-sm text-white/30 text-center sm:text-left">© 2025 Chukwudi Academy. All rights reserved.</span>
            <div className="flex gap-2 flex-wrap justify-center">
              {["SS2", "SS3", "WAEC", "JAMB"].map(c => (
                <span key={c} className="px-3 py-1 rounded-full text-[11px] font-bold bg-white/5 border border-white/8 text-white/35">{c}</span>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
