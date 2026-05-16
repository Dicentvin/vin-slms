import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router";
import { useAuth } from "@/hooks/AuthProvider";
import { lmsAuth } from "@/services/lmsApi";
import { Eye, EyeOff, Loader2, GraduationCap } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

// All 5 classes — SS1 included
const ALL_CLASSES = ["SS1", "SS2", "SS3", "WAEC", "JAMB"] as const;

const CLASS_META: Record<string, { label: string; color: string }> = {
  SS1:  { label: "SS1 — Year 1",          color: "bg-indigo-100 text-indigo-700" },
  SS2:  { label: "SS2 — Year 2",          color: "bg-emerald-100 text-emerald-700" },
  SS3:  { label: "SS3 — Final Year",      color: "bg-purple-100 text-purple-700"  },
  WAEC: { label: "WAEC — Exam Prep",      color: "bg-amber-100 text-amber-700"    },
  JAMB: { label: "JAMB — UTME Prep",      color: "bg-red-100 text-red-700"        },
};

export default function Register() {
  const { user, setUser, setYear, setLmsToken } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "", email: "", password: "", confirmPassword: "",
    role: "student", className: "",
  });
  const [showPass,    setShowPass]    = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading,     setLoading]     = useState(false);

  if (user) return <Navigate to="/dashboard" replace />;

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim())        { toast.error("Name is required"); return; }
    if (!form.email.trim())       { toast.error("Email is required"); return; }
    if (form.password.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    if (form.password !== form.confirmPassword) { toast.error("Passwords do not match"); return; }
    if (form.role === "student" && !form.className) {
      toast.error("Please select your class"); return;
    }

    setLoading(true);
    try {
      const { token, user: backendUser } = await lmsAuth.register(
        form.name.trim(), form.email.trim(), form.password, form.role, form.className
      );

      localStorage.setItem("lms_token", token);
      setLmsToken(token);

      const loggedInUser = {
        _id:            backendUser._id,
        name:           backendUser.name,
        email:          backendUser.email,
        role:           (backendUser.role ?? "student") as any,
        className:      (backendUser as any).className ?? "",
        approvalStatus: (backendUser.approvalStatus ?? "pending") as any,
      };

      localStorage.setItem("edunexus_user", JSON.stringify(loggedInUser));
      setUser(loggedInUser);
      setYear({
        _id: "y1", name: "2024-2025",
        fromYear: new Date("2024-09-01"),
        toYear:   new Date("2025-06-30"),
        isCurrent: true,
      });

      toast.success(`Welcome, ${backendUser.name}! Your account is pending approval.`);
      navigate("/dashboard");
    } catch (err: any) {
      toast.error(err.message ?? "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">

      {/* ── Left panel — decorative ──────────────────────────────── */}
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
                Join Chukwudi<br />
                <span className="text-[#3ecf8e]">Academy.</span>
              </h1>
              <p className="text-white/60 mt-3 text-sm leading-relaxed max-w-xs">
                AI-powered study tools for SS1 through JAMB. Upload notes, chat with AI, and ace every exam.
              </p>
            </div>

            {/* Class grid — all 5 */}
            <div className="grid grid-cols-3 gap-2">
              {ALL_CLASSES.map(c => (
                <div key={c} className="bg-white/10 border border-white/10 rounded-xl p-3 text-center">
                  <p className="font-extrabold text-white text-base">{c}</p>
                  <p className="text-[10px] text-white/50 mt-0.5">
                    {c === "WAEC" ? "Exam Prep" : c === "JAMB" ? "UTME Prep" : `Year ${c.replace("SS","")}` }
                  </p>
                </div>
              ))}
              <div className="bg-[#3ecf8e]/20 border border-[#3ecf8e]/30 rounded-xl p-3 text-center">
                <p className="font-extrabold text-[#3ecf8e] text-base">AI</p>
                <p className="text-[10px] text-white/50 mt-0.5">Study Hub</p>
              </div>
            </div>

            <div className="space-y-2">
              {[
                "📚 Upload notes, past papers and slides",
                "🃏 Auto-generate AI flashcards",
                "✅ WAEC & JAMB practice quizzes",
                "💬 Chat with your documents",
                "👨‍💼 Admin-approved access for security",
              ].map(f => <p key={f} className="text-sm text-white/80">{f}</p>)}
            </div>
          </div>

          <div className="border-t border-white/10 pt-6">
            <p className="text-white/50 text-xs italic">
              "The AI tutor explained concepts I'd struggled with for months — in minutes."
            </p>
            <p className="text-[#3ecf8e] text-xs font-bold mt-1">— SS2 Student, Chukwudi Academy</p>
          </div>
        </div>
      </div>

      {/* ── Right panel — form ────────────────────────────────────── */}
      <div className="flex-1 flex flex-col bg-background">
        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-2 p-6 border-b border-border">
          <div className="bg-[#3ecf8e] p-1.5 rounded-lg">
            <GraduationCap className="text-black w-5 h-5" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-extrabold text-base tracking-tight">CHUKWUDI</span>
            <span className="text-[9px] font-bold tracking-[0.2em] text-[#3ecf8e] -mt-0.5">ACADEMY</span>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-6 md:p-10">
          <div className="w-full max-w-md space-y-6">
            <div>
              <h2 className="text-3xl font-extrabold text-foreground">Create account</h2>
              <p className="text-muted-foreground text-sm mt-1">
                Join Chukwudi Academy Portal · All fields required
              </p>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
              <form onSubmit={handleSubmit} className="space-y-4">

                {/* Name */}
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-sm font-semibold">Full Name</Label>
                  <Input id="name" placeholder="e.g. Chukwudi Vincent"
                    value={form.name} onChange={set("name")} disabled={loading}
                    className="h-11 focus-visible:ring-[#3ecf8e] focus-visible:border-[#3ecf8e]" />
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-sm font-semibold">Email Address</Label>
                  <Input id="email" type="email" placeholder="you@school.edu"
                    value={form.email} onChange={set("email")} disabled={loading}
                    className="h-11 focus-visible:ring-[#3ecf8e] focus-visible:border-[#3ecf8e]" />
                </div>

                {/* Role + Class — side by side */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-sm font-semibold">Role</Label>
                    <Select value={form.role}
                      onValueChange={v => setForm(f => ({ ...f, role: v, className: "" }))}>
                      <SelectTrigger className="h-11 focus:ring-[#3ecf8e]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="student">Student</SelectItem>
                        <SelectItem value="teacher">Teacher</SelectItem>
                        <SelectItem value="parent">Parent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {form.role === "student" && (
                    <div className="space-y-1.5">
                      <Label className="text-sm font-semibold">Class</Label>
                      <Select value={form.className}
                        onValueChange={v => setForm(f => ({ ...f, className: v }))}>
                        <SelectTrigger className="h-11 focus:ring-[#3ecf8e]">
                          <SelectValue placeholder="Select class" />
                        </SelectTrigger>
                        <SelectContent>
                          {ALL_CLASSES.map(c => (
                            <SelectItem key={c} value={c}>
                              <div className="flex items-center gap-2">
                                <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded ${CLASS_META[c].color}`}>
                                  {c}
                                </span>
                                <span className="text-xs">{CLASS_META[c].label.split("—")[1]?.trim()}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-sm font-semibold">Password</Label>
                  <div className="relative">
                    <Input id="password" type={showPass ? "text" : "password"}
                      placeholder="Min. 6 characters" className="h-11 pr-10 focus-visible:ring-[#3ecf8e] focus-visible:border-[#3ecf8e]"
                      value={form.password} onChange={set("password")} disabled={loading} />
                    <button type="button" onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm */}
                <div className="space-y-1.5">
                  <Label htmlFor="confirm" className="text-sm font-semibold">Confirm Password</Label>
                  <div className="relative">
                    <Input id="confirm" type={showConfirm ? "text" : "password"}
                      placeholder="Repeat password" className="h-11 pr-10 focus-visible:ring-[#3ecf8e] focus-visible:border-[#3ecf8e]"
                      value={form.confirmPassword} onChange={set("confirmPassword")} disabled={loading} />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button type="submit" disabled={loading}
                  className="w-full h-11 bg-[#3ecf8e] hover:bg-[#34b27b] text-black font-bold shadow-lg shadow-[#3ecf8e]/20">
                  {loading
                    ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Creating account…</>
                    : "Create Account"}
                </Button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-card px-3 text-muted-foreground">Already registered?</span>
                </div>
              </div>

              <Link to="/login" className="block">
                <button className="w-full h-11 border-2 border-border hover:border-[#3ecf8e]/50 rounded-lg text-sm font-semibold text-foreground hover:text-[#3ecf8e] transition-all">
                  Sign In Instead
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
