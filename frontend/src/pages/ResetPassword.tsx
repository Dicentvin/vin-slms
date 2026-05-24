import { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router";
import { lmsAuth } from "@/services/lmsApi";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff, KeyRound, ArrowLeft, CheckCircle2, GraduationCap, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ResetPassword() {
  const [params]    = useSearchParams();
  const navigate    = useNavigate();
  const token       = params.get("token") ?? "";
  const id          = params.get("id")    ?? "";

  const [password,  setPassword]  = useState("");
  const [confirm,   setConfirm]   = useState("");
  const [showPass,  setShowPass]  = useState(false);
  const [showConf,  setShowConf]  = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [done,      setDone]      = useState(false);

  const invalid = !token || !id;

  const strength = (() => {
    if (!password) return 0;
    let s = 0;
    if (password.length >= 6)                       s++;
    if (password.length >= 10)                      s++;
    if (/[A-Z]/.test(password))                     s++;
    if (/[0-9]/.test(password))                     s++;
    if (/[^A-Za-z0-9]/.test(password))              s++;
    return s;
  })();

  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong", "Very Strong"][strength];
  const strengthColor = ["", "bg-red-500", "bg-orange-400", "bg-amber-400", "bg-[#3ecf8e]", "bg-[#3ecf8e]"][strength];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6)         { toast.error("Password must be at least 6 characters"); return; }
    if (password !== confirm)        { toast.error("Passwords do not match"); return; }

    setLoading(true);
    try {
      const res = await lmsAuth.resetPassword(token, id, password);
      toast.success(res.message);
      setDone(true);
      setTimeout(() => navigate("/login"), 3000);
    } catch (err: any) {
      toast.error(err.message ?? "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#3ecf8e] to-[#10b981] flex items-center justify-center mx-auto shadow-lg">
            <GraduationCap className="h-7 w-7 text-black" />
          </div>
          <h1 className="text-2xl font-extrabold text-foreground">Reset Password</h1>
          <p className="text-sm text-muted-foreground">Create a new secure password for your account</p>
        </div>

        {invalid ? (
          /* Bad link */
          <div className="bg-card border-2 border-red-300 dark:border-red-800 rounded-2xl p-8 text-center space-y-4 shadow-sm">
            <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-950/40 border-2 border-red-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Invalid reset link</h2>
              <p className="text-sm text-muted-foreground mt-1">
                This password reset link is missing required information. Please request a new one.
              </p>
            </div>
            <Link to="/forgot-password">
              <Button className="w-full bg-[#3ecf8e] hover:bg-[#34b27b] text-black font-bold">
                Request New Link
              </Button>
            </Link>
          </div>
        ) : done ? (
          /* Success */
          <div className="bg-card border-2 border-[#3ecf8e]/40 rounded-2xl p-8 text-center space-y-4 shadow-sm">
            <div className="w-16 h-16 rounded-full bg-[#3ecf8e]/10 border-2 border-[#3ecf8e] flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-8 w-8 text-[#3ecf8e]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Password reset!</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Your password has been updated. Redirecting you to login…
              </p>
            </div>
            <Link to="/login">
              <Button className="w-full bg-[#3ecf8e] hover:bg-[#34b27b] text-black font-bold gap-2">
                <ArrowLeft className="h-4 w-4" /> Go to Login
              </Button>
            </Link>
          </div>
        ) : (
          /* Form */
          <div className="bg-card border-2 border-border rounded-2xl p-8 shadow-sm space-y-5">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* New password */}
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-sm font-semibold">New Password</Label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPass ? "text" : "password"}
                    placeholder="Min. 6 characters"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    disabled={loading}
                    className="h-11 pl-9 pr-10 border-border focus-visible:ring-[#3ecf8e] focus-visible:border-[#3ecf8e]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(s => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                {/* Strength bar */}
                {password && (
                  <div className="space-y-1">
                    <div className="flex gap-1">
                      {[1,2,3,4,5].map(i => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-all ${i <= strength ? strengthColor : "bg-muted"}`}
                        />
                      ))}
                    </div>
                    <p className={`text-xs font-semibold ${strength <= 1 ? "text-red-500" : strength <= 2 ? "text-amber-500" : "text-[#3ecf8e]"}`}>
                      {strengthLabel}
                    </p>
                  </div>
                )}
              </div>

              {/* Confirm password */}
              <div className="space-y-1.5">
                <Label htmlFor="confirm" className="text-sm font-semibold">Confirm Password</Label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirm"
                    type={showConf ? "text" : "password"}
                    placeholder="Repeat your password"
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    disabled={loading}
                    className={`h-11 pl-9 pr-10 border-border focus-visible:ring-[#3ecf8e] focus-visible:border-[#3ecf8e] ${
                      confirm && confirm !== password ? "border-red-400 focus-visible:ring-red-400" : ""
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConf(s => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConf ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {confirm && confirm !== password && (
                  <p className="text-xs text-red-500 font-medium">Passwords do not match</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={loading || !password || !confirm || password !== confirm}
                className="w-full h-11 bg-[#3ecf8e] hover:bg-[#34b27b] text-black font-bold disabled:opacity-50"
              >
                {loading
                  ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Resetting…</>
                  : "Reset Password"
                }
              </Button>
            </form>

            <Link to="/login">
              <button className="w-full flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="h-4 w-4" /> Back to Login
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
