import { useState, useRef } from "react";
import { Link, Navigate, useNavigate } from "react-router";
import { useAuth } from "@/hooks/AuthProvider";
import { lmsAuth } from "@/services/lmsApi";
import { Eye, EyeOff, Loader2, GraduationCap, Moon, Sun, Camera, X, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useTheme } from "@/components/provider/theme";

const ALL_CLASSES = ["SS1", "SS2", "SS3", "WAEC", "JAMB"] as const;
const CLASS_META: Record<string, { label: string; color: string }> = {
  SS1:  { label: "SS1 — Year 1",      color: "bg-indigo-100 text-indigo-700"   },
  SS2:  { label: "SS2 — Year 2",      color: "bg-emerald-100 text-emerald-700" },
  SS3:  { label: "SS3 — Final Year",  color: "bg-purple-100 text-purple-700"   },
  WAEC: { label: "WAEC — Exam Prep",  color: "bg-amber-100 text-amber-700"     },
  JAMB: { label: "JAMB — UTME Prep",  color: "bg-red-100 text-red-700"         },
};

export default function Register() {
  const { user, setUser, setYear, setLmsToken } = useAuth();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: "", email: "", password: "", confirmPassword: "",
    role: "student", className: "", phone: "",
  });
  const [passportFile,    setPassportFile]    = useState<File | null>(null);
  const [passportPreview, setPassportPreview] = useState<string>("");
  const [showPass,        setShowPass]        = useState(false);
  const [showConfirm,     setShowConfirm]     = useState(false);
  const [loading,         setLoading]         = useState(false);

  if (user) return <Navigate to="/dashboard" replace />;

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const handlePassport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast.error("Passport photo must be under 2MB"); return; }
    if (!file.type.startsWith("image/")) { toast.error("Please select an image file"); return; }
    setPassportFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPassportPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const removePassport = () => {
    setPassportFile(null);
    setPassportPreview("");
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim())         { toast.error("Name is required"); return; }
    if (!form.email.trim())        { toast.error("Email is required"); return; }
    if (form.password.length < 6)  { toast.error("Password must be at least 6 characters"); return; }
    if (form.password !== form.confirmPassword) { toast.error("Passwords do not match"); return; }
    if (form.role === "student" && !form.className) { toast.error("Please select your class"); return; }

    setLoading(true);
    try {
      // Upload passport to Cloudinary first if provided
      let imageUrl = "";
      if (passportFile) {
        const fd = new FormData();
        fd.append("file", passportFile);
        fd.append("upload_preset", "lms_passports"); // set this in your Cloudinary dashboard
        const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "dwyjrxtq9";
        try {
          const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
            method: "POST", body: fd,
          });
          const data = await res.json();
          if (data.secure_url) imageUrl = data.secure_url;
        } catch {
          // Passport upload failed but don't block registration
          toast("Passport upload failed — you can add it later in your profile.", { icon: "⚠️" });
        }
      }

      const { token, user: backendUser } = await lmsAuth.register(
        form.name.trim(), form.email.trim(), form.password,
        form.role, form.className, form.phone, imageUrl,
      );

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
        image:           (backendUser as any).image ?? imageUrl,
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
      {/* Theme toggle */}
      <button
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className="fixed top-4 right-4 z-50 w-9 h-9 rounded-full bg-background border border-border shadow-md flex items-center justify-center hover:bg-muted transition-colors"
      >
        {theme === "dark" ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-600" />}
      </button>

      {/* ── Left decorative panel ─────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden flex-col gradient-hero">
        <div className="absolute inset-0 opacity-[0.06]"
          style={{ backgroundImage: "linear-gradient(rgba(62,207,142,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(62,207,142,0.5) 1px, transparent 1px)", backgroundSize: "50px 50px" }} />
        <div className="absolute top-1/4 -left-20 w-64 h-64 bg-[#3ecf8e] opacity-20 blur-[100px] rounded-full" />

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
                Join Chukwudi<br /><span className="text-[#3ecf8e]">Academy.</span>
              </h1>
              <p className="text-white/60 mt-3 text-sm leading-relaxed max-w-xs">
                AI-powered study tools for SS1 through JAMB and MBBS. Upload notes, chat with AI, and ace every exam.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {ALL_CLASSES.map(c => (
                <div key={c} className="bg-white/10 border border-white/10 rounded-xl p-3 text-center">
                  <p className="font-extrabold text-white text-base">{c}</p>
                  <p className="text-[10px] text-white/50 mt-0.5">
                    {c === "WAEC" ? "Exam Prep" : c === "JAMB" ? "UTME Prep" : `Year ${c.replace("SS","")}`}
                  </p>
                </div>
              ))}
              <div className="bg-[#3ecf8e]/20 border border-[#3ecf8e]/30 rounded-xl p-3 text-center">
                <p className="font-extrabold text-[#3ecf8e] text-base">MBBS</p>
                <p className="text-[10px] text-white/50 mt-0.5">Medical</p>
              </div>
            </div>

            <div className="space-y-2">
              {[
                "📚 Upload notes, past papers and slides",
                "🤖 AI-powered study assistant",
                "✅ WAEC, JAMB & MBBS practice",
                "🏥 Medical school course materials",
                "👨‍💼 Admin-approved secure access",
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

      {/* ── Right panel — form ────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col bg-background overflow-y-auto">
        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-2 p-6 border-b border-border">
          <div className="bg-[#3ecf8e] p-1.5 rounded-lg">
            <GraduationCap className="text-black w-5 h-5" />
          </div>
          <span className="font-extrabold text-base tracking-tight">CHUKWUDI ACADEMY</span>
        </div>

        <div className="flex-1 flex items-start justify-center p-6 md:p-10">
          <div className="w-full max-w-md space-y-6 py-4">
            <div>
              <h2 className="text-3xl font-extrabold text-foreground">Create account</h2>
              <p className="text-muted-foreground text-sm mt-1">Join Chukwudi Academy Portal</p>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-5">
              <form onSubmit={handleSubmit} className="space-y-4">

                {/* ── Passport Photo Upload ─────────────────────────── */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">
                    Passport Photo <span className="text-muted-foreground font-normal">(optional)</span>
                  </Label>
                  <div className="flex items-center gap-4">
                    {/* Preview circle */}
                    <div className="relative shrink-0">
                      <div className={`w-20 h-20 rounded-full border-2 overflow-hidden flex items-center justify-center ${
                        passportPreview ? "border-[#3ecf8e]" : "border-dashed border-border bg-muted"
                      }`}>
                        {passportPreview ? (
                          <img src={passportPreview} alt="Passport" className="w-full h-full object-cover" />
                        ) : (
                          <Camera className="h-7 w-7 text-muted-foreground/50" />
                        )}
                      </div>
                      {passportPreview && (
                        <button
                          type="button"
                          onClick={removePassport}
                          className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </div>

                    {/* Upload button */}
                    <div className="flex-1 space-y-1">
                      <button
                        type="button"
                        onClick={() => fileRef.current?.click()}
                        className="w-full flex items-center justify-center gap-2 h-10 border-2 border-dashed border-border hover:border-[#3ecf8e] rounded-xl text-sm text-muted-foreground hover:text-[#3ecf8e] transition-colors"
                      >
                        <Upload className="h-4 w-4" />
                        {passportFile ? passportFile.name.slice(0, 20) + (passportFile.name.length > 20 ? "…" : "") : "Upload photo"}
                      </button>
                      <p className="text-[10px] text-muted-foreground text-center">JPG, PNG · Max 2MB · White background preferred</p>
                    </div>
                  </div>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePassport}
                  />
                </div>

                <div className="h-px bg-border" />

                {/* Full Name */}
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

                {/* Role + Class */}
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
                        <SelectItem value="mbbs">MBBS Student</SelectItem>
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
                                <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded ${CLASS_META[c].color}`}>{c}</span>
                                <span className="text-xs">{CLASS_META[c].label.split("—")[1]?.trim()}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {form.role === "mbbs" && (
                    <div className="space-y-1.5">
                      <Label className="text-sm font-semibold">Level</Label>
                      <Select value={form.className}
                        onValueChange={v => setForm(f => ({ ...f, className: v }))}>
                        <SelectTrigger className="h-11 focus:ring-[#3ecf8e]">
                          <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                        <SelectContent>
                          {["Year 1","Year 2","Year 3","Year 4","Year 5","Year 6"].map(y => (
                            <SelectItem key={y} value={y}>{y}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                {/* Phone */}
                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="text-sm font-semibold">Phone Number</Label>
                  <Input id="phone" type="tel" placeholder="e.g. 08012345678"
                    value={form.phone} onChange={set("phone")} disabled={loading}
                    className="h-11 focus-visible:ring-[#3ecf8e] focus-visible:border-[#3ecf8e]" />
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

                {/* Confirm Password */}
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
                  {form.confirmPassword && form.confirmPassword !== form.password && (
                    <p className="text-xs text-red-500 font-medium">Passwords do not match</p>
                  )}
                </div>

                <Button type="submit" disabled={loading}
                  className="w-full h-11 bg-[#3ecf8e] hover:bg-[#34b27b] text-black font-bold shadow-lg shadow-[#3ecf8e]/20">
                  {loading
                    ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Creating account…</>
                    : "Create Account"}
                </Button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
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
