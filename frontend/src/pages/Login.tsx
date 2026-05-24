import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router";
import { useAuth } from "@/hooks/AuthProvider";
import { lmsAuth } from "@/services/lmsApi";
import {
  GraduationCap, Eye, EyeOff, Loader2,
  BookOpen, Brain, Zap, Shield, Moon, Sun,
  ClipboardList, Users, ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "@/components/provider/theme";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const ALL_CLASSES = ["SS1", "SS2", "SS3", "WAEC", "JAMB"];

const FEATURES = [
  { icon: BookOpen,      label: "Study Notes & Past Papers"  },
  { icon: Brain,         label: "AI-Powered Tutor"           },
  { icon: Zap,           label: "WAEC & JAMB Practice"       },
  { icon: ClipboardList, label: "Official Exam Portal"       },
  { icon: Shield,        label: "Admin-Secured Access"        },
];

type LoginMode = "student" | "candidate";

export default function Login() {
  const { user, loading: authLoading, setUser, setYear, setLmsToken } = useAuth();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  const [mode,     setMode]     = useState<LoginMode>("student");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);

  if (!authLoading && user) return <Navigate to="/dashboard" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) { toast.error("Enter your email and password"); return; }

    setLoading(true);
    try {
      const { token, user: backendUser } = await lmsAuth.login(email.trim(), password);

      localStorage.setItem("lms_token", token);
      setLmsToken(token);

      const loggedInUser = {
        _id:             backendUser._id,
        name:            backendUser.name,
        email:           backendUser.email,
        role:            (backendUser.role ?? "student") as any,
        className:       (backendUser as any).className ?? "",
        approvalStatus:  (backendUser.approvalStatus ?? "pending") as any,
        isEmailVerified: (backendUser as any).isEmailVerified ?? false,
      };

      localStorage.setItem("edunexus_user", JSON.stringify(loggedInUser));
      setUser(loggedInUser);
      setYear({
        _id: "y1", name: "2024-2025",
        fromYear: new Date("2024-09-01"), toYear: new Date("2025-06-30"), isCurrent: true,
      });

      toast.success(`Welcome back, ${backendUser.name}!`);
      // Candidate mode goes straight to exam portal
      navigate(mode === "candidate" ? "/candidate" : "/dashboard");
    } catch (err: any) {
      toast.error(err.message ?? "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Floating theme toggle */}
      <button
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className="fixed top-4 right-4 z-50 w-9 h-9 rounded-full bg-background border border-border shadow-md flex items-center justify-center hover:bg-muted transition-colors"
        title="Toggle theme"
      >
        {theme === "dark" ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-600" />}
      </button>

      {/* ── Left panel ─────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden flex-col gradient-hero">
        <div className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: "linear-gradient(rgba(62,207,142,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(62,207,142,0.5) 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }} />
        <div className="absolute top-1/4 -left-20 w-64 h-64 bg-[#3ecf8e] opacity-20 blur-[100px] rounded-full" />
        <div className="absolute bottom-1/4 right-0 w-48 h-48 bg-[#3ecf8e] opacity-15 blur-[80px] rounded-full" />

        <div className="relative z-10 flex flex-col h-full p-10">
          <div className="flex items-center gap-2">
            <div className="bg-[#3ecf8e] p-2 rounded-xl">
              <GraduationCap className="text-black w-6 h-6" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-xl font-extrabold tracking-tight text-white">CHUKWUDI</span>
              <span className="text-[10px] font-bold tracking-[0.2em] text-[#3ecf8e]">ACADEMY</span>
            </div>
          </div>

          <div className="flex-1 flex flex-col justify-center space-y-8">
            <div>
              <h1 className="text-4xl font-extrabold text-white leading-tight">
                Nigeria's Smartest<br />
                <span className="text-[#3ecf8e]">Study Portal.</span>
              </h1>
              <p className="text-white/60 mt-3 text-sm leading-relaxed max-w-xs">
                AI-powered tools built for SS1 to JAMB students. Upload notes, chat with AI, and ace your exams.
              </p>
            </div>

            <div className="space-y-3">
              {FEATURES.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#3ecf8e]/20 border border-[#3ecf8e]/30 flex items-center justify-center shrink-0">
                    <Icon className="h-4 w-4 text-[#3ecf8e]" />
                  </div>
                  <span className="text-white/80 text-sm font-medium">{label}</span>
                </div>
              ))}
            </div>

            <div>
              <p className="text-white/40 text-xs uppercase tracking-widest font-bold mb-3">Available for</p>
              <div className="flex flex-wrap gap-2">
                {ALL_CLASSES.map(c => (
                  <span key={c} className="bg-[#3ecf8e]/15 border border-[#3ecf8e]/30 text-[#3ecf8e] text-xs font-bold px-3 py-1.5 rounded-full">
                    {c}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 pt-6">
            <p className="text-white/50 text-xs italic leading-relaxed">
              "Chukwudi Academy helped me understand Physics in a way no textbook could. I scored A1 in WAEC!"
            </p>
            <p className="text-[#3ecf8e] text-xs font-bold mt-2">— Amaka C., SS3 Student</p>
          </div>
        </div>
      </div>

      {/* ── Right panel ─────────────────────────────────────── */}
      <div className="flex-1 flex flex-col bg-background">

        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-2 p-6 border-b border-border">
          <div className="bg-[#3ecf8e] p-1.5 rounded-lg">
            <GraduationCap className="text-black w-5 h-5" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-extrabold text-base tracking-tight text-foreground">CHUKWUDI</span>
            <span className="text-[9px] font-bold tracking-[0.2em] text-[#3ecf8e] -mt-0.5">ACADEMY</span>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-6 md:p-10">
          <div className="w-full max-w-md space-y-6">

            <div>
              <h2 className="text-3xl font-extrabold text-foreground">Sign in</h2>
              <p className="text-muted-foreground text-sm mt-1.5">Welcome back to Chukwudi Academy Portal</p>
            </div>

            {/* ── Mode selector ──────────────────────────────── */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setMode("student")}
                className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                  mode === "student"
                    ? "border-[#3ecf8e] bg-[#3ecf8e]/10"
                    : "border-border bg-card hover:border-[#3ecf8e]/40"
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${mode === "student" ? "gradient-navy" : "bg-muted"}`}>
                  <Users className={`h-5 w-5 ${mode === "student" ? "text-white" : "text-muted-foreground"}`} />
                </div>
                <div className="text-center">
                  <p className={`text-sm font-bold ${mode === "student" ? "text-foreground" : "text-muted-foreground"}`}>Student / Staff</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Study Hub & AI Tools</p>
                </div>
                {mode === "student" && (
                  <div className="w-2 h-2 rounded-full bg-[#3ecf8e]" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setMode("candidate")}
                className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                  mode === "candidate"
                    ? "border-orange bg-orange/10"
                    : "border-border bg-card hover:border-orange/40"
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${mode === "candidate" ? "gradient-orange" : "bg-muted"}`}>
                  <ClipboardList className={`h-5 w-5 ${mode === "candidate" ? "text-white" : "text-muted-foreground"}`} />
                </div>
                <div className="text-center">
                  <p className={`text-sm font-bold ${mode === "candidate" ? "text-foreground" : "text-muted-foreground"}`}>Candidate</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Official Exam Portal</p>
                </div>
                {mode === "candidate" && (
                  <div className="w-2 h-2 rounded-full bg-orange" />
                )}
              </button>
            </div>

            {/* Mode banner */}
            {mode === "candidate" && (
              <div className="flex items-start gap-3 bg-orange/10 border border-orange/30 rounded-xl p-3">
                <ClipboardList className="h-4 w-4 text-orange shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-orange">Candidate Mode</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    You'll be taken directly to the Exam Portal to take official MCQ and Theory exams.
                  </p>
                </div>
              </div>
            )}

            {/* Form */}
            <div className={`bg-card border-2 rounded-2xl p-6 shadow-sm space-y-5 transition-colors ${
              mode === "candidate" ? "border-orange/30" : "border-border"
            }`}>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-sm font-semibold">Email Address</Label>
                  <Input
                    id="email" type="email" placeholder="you@school.edu"
                    value={email} onChange={e => setEmail(e.target.value)}
                    disabled={loading} autoComplete="email"
                    className={`h-11 border-border ${mode === "candidate"
                      ? "focus-visible:ring-orange focus-visible:border-orange"
                      : "focus-visible:ring-[#3ecf8e] focus-visible:border-[#3ecf8e]"
                    }`}
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-sm font-semibold">Password</Label>
                    <Link
                      to="/forgot-password"
                      className="text-xs text-[#3ecf8e] font-semibold hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Input
                      id="password" type={showPass ? "text" : "password"} placeholder="Your password"
                      className={`h-11 pr-10 border-border ${mode === "candidate"
                        ? "focus-visible:ring-orange focus-visible:border-orange"
                        : "focus-visible:ring-[#3ecf8e] focus-visible:border-[#3ecf8e]"
                      }`}
                      value={password} onChange={e => setPassword(e.target.value)}
                      disabled={loading} autoComplete="current-password"
                    />
                    <button type="button" onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                      {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button type="submit" disabled={loading}
                  className={`w-full h-11 font-bold text-sm transition-all hover:shadow-lg mt-1 ${
                    mode === "candidate"
                      ? "gradient-orange hover:opacity-90 hover:shadow-orange/20 text-white"
                      : "bg-[#3ecf8e] hover:bg-[#34b27b] text-black hover:shadow-[#3ecf8e]/20"
                  }`}
                >
                  {loading
                    ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Signing in…</>
                    : mode === "candidate"
                      ? <><ClipboardList className="h-4 w-4 mr-2" />Enter Exam Portal</>
                      : "Sign In to Portal"
                  }
                </Button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-card px-3 text-muted-foreground">New to Chukwudi Academy?</span>
                </div>
              </div>

              <Link to="/register" className="block">
                <button className="w-full h-11 border-2 border-border hover:border-[#3ecf8e]/50 rounded-lg text-sm font-semibold text-foreground hover:text-[#3ecf8e] transition-all flex items-center justify-center gap-2">
                  Create an Account <ChevronRight className="h-4 w-4" />
                </button>
              </Link>
            </div>

            <div className="flex flex-wrap gap-2 justify-center lg:hidden">
              {ALL_CLASSES.map(c => (
                <span key={c} className="bg-[#3ecf8e]/10 border border-[#3ecf8e]/20 text-[#3ecf8e] text-xs font-bold px-3 py-1 rounded-full">
                  {c}
                </span>
              ))}
            </div>

            <p className="text-center text-xs text-muted-foreground">
              By signing in you agree to Chukwudi Academy's{" "}
              <span className="text-[#3ecf8e] font-medium cursor-pointer hover:underline">Terms of Use</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
