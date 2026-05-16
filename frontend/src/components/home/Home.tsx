import Navbar   from "@/components/home/Navbar";
import Hero     from "@/components/home/Hero";
import Stats    from "@/components/home/Stats";
import Programs from "@/components/home/Programs";
import Footer   from "@/components/home/Footer";
import { Link } from "react-router";

// All 5 classes
const CLASSES = ["SS1", "SS2", "SS3", "WAEC", "JAMB"];

const CLASS_COLORS: Record<string, string> = {
  SS1:  "bg-indigo-600 text-white",
  SS2:  "bg-[#3ecf8e] text-black",
  SS3:  "bg-purple-600 text-white",
  WAEC: "bg-amber-500 text-white",
  JAMB: "bg-red-500 text-white",
};

const Home = () => {
  return (
    <div>
      <Navbar />
      <main>
        <Hero />

        {/* ── Classes strip ─────────────────────────────────── */}
        <section className="py-10 border-y border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
          <div className="max-w-5xl mx-auto px-4 text-center space-y-4">
            <p className="text-sm font-bold uppercase tracking-widest text-gray-400">
              Built for Nigerian Senior Secondary Science
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {CLASSES.map(c => (
                <Link key={c} to={`/classes/${c}`}>
                  <span className={`text-sm font-extrabold px-5 py-2 rounded-full cursor-pointer hover:opacity-90 transition-all hover:-translate-y-0.5 inline-block ${CLASS_COLORS[c]}`}>
                    {c}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <Stats />
        <Programs />

        {/* ── Testimonial ───────────────────────────────────── */}
        <section className="py-24 bg-white dark:bg-[#121212] overflow-hidden relative">
          <div className="absolute top-0 right-0 w-1/3 h-full bg-[#3ecf8e]/5 blur-[100px] rounded-full" />
          <div className="max-w-5xl mx-auto px-4 relative z-10 text-center">
            <div className="mb-8 flex justify-center">
              <div className="w-16 h-1 bg-[#3ecf8e] rounded-full" />
            </div>
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-10 leading-tight">
              "Chukwudi Academy helped me understand my Physics notes in a way no textbook could. The AI chat answered every question I had before my WAEC exam."
            </h3>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-[#3ecf8e] flex items-center justify-center text-2xl font-bold text-black mb-3">
                AC
              </div>
              <p className="text-lg font-bold text-gray-900 dark:text-white">Amaka Chukwudi</p>
              <p className="text-[#3ecf8e] font-medium">SS3 Student · Top WAEC Scorer</p>
            </div>
          </div>
        </section>

        {/* ── CTA ──────────────────────────────────────────── */}
        <section className="py-24 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4">
            <div className="bg-gradient-to-r from-gray-50 to-white dark:from-[#1c1c1c] dark:to-[#2a2a2a] rounded-[3rem] p-12 md:p-20 text-center border border-gray-200 dark:border-gray-800 relative overflow-hidden shadow-xl dark:shadow-none">
              <div className="absolute top-0 left-0 w-full h-1 bg-[#3ecf8e]" />
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                Ready to Ace Your Exams?
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
                Join thousands of Nigerian SS students using AI to study smarter — from SS1 right through to JAMB.
              </p>
              {/* Class links */}
              <div className="flex flex-wrap justify-center gap-2 mb-10">
                {CLASSES.map(c => (
                  <Link key={c} to={`/classes/${c}`}>
                    <span className={`text-sm font-extrabold px-4 py-1.5 rounded-full cursor-pointer hover:opacity-90 transition-all hover:-translate-y-0.5 inline-block ${CLASS_COLORS[c]}`}>
                      {c}
                    </span>
                  </Link>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link to="/register">
                  <button className="bg-[#3ecf8e] text-black px-10 py-5 rounded-xl font-bold text-lg hover:bg-[#34b27b] transition-all hover:scale-105 shadow-lg shadow-[#3ecf8e]/20">
                    Create Free Account
                  </button>
                </Link>
                <Link to="/login">
                  <button className="bg-transparent border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white px-10 py-5 rounded-xl font-bold text-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">
                    Sign In
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Home;
