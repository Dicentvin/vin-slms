import { useState } from "react";
import { Link } from "react-router";
import { lmsAuth } from "@/services/lmsApi";
import { toast } from "sonner";
import { Loader2, Mail, ArrowLeft, CheckCircle2, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ForgotPassword() {
  const [email,     setEmail]     = useState("");
  const [loading,   setLoading]   = useState(false);
  const [sent,      setSent]      = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) { toast.error("Enter your email address"); return; }
    setLoading(true);
    try {
      const res = await lmsAuth.forgotPassword(email.trim());
      setSent(true);
      toast.success(res.message);
    } catch (err: any) {
      toast.error(err.message ?? "Failed to send reset email");
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
          <h1 className="text-2xl font-extrabold text-foreground">Forgot Password</h1>
          <p className="text-sm text-muted-foreground">
            Enter your email and we'll send you a reset link
          </p>
        </div>

        {sent ? (
          /* Success state */
          <div className="bg-card border-2 border-[#3ecf8e]/40 rounded-2xl p-8 text-center space-y-4 shadow-sm">
            <div className="w-16 h-16 rounded-full bg-[#3ecf8e]/10 border-2 border-[#3ecf8e] flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-8 w-8 text-[#3ecf8e]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Check your inbox</h2>
              <p className="text-sm text-muted-foreground mt-1">
                If <strong className="text-foreground">{email}</strong> is registered, you'll receive a
                password reset link within a few minutes.
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              Didn't receive it? Check your spam folder, or{" "}
              <button
                onClick={() => setSent(false)}
                className="text-[#3ecf8e] font-semibold hover:underline"
              >
                try again
              </button>
              .
            </p>
            <Link to="/login">
              <Button variant="outline" className="w-full gap-2 mt-2">
                <ArrowLeft className="h-4 w-4" /> Back to Login
              </Button>
            </Link>
          </div>
        ) : (
          /* Form */
          <div className="bg-card border-2 border-border rounded-2xl p-8 shadow-sm space-y-5">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm font-semibold">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email" type="email"
                    placeholder="you@school.edu"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    disabled={loading}
                    className="h-11 pl-9 border-border focus-visible:ring-[#3ecf8e] focus-visible:border-[#3ecf8e]"
                    autoComplete="email"
                  />
                </div>
              </div>

              <Button
                type="submit" disabled={loading}
                className="w-full h-11 bg-[#3ecf8e] hover:bg-[#34b27b] text-black font-bold"
              >
                {loading
                  ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Sending…</>
                  : "Send Reset Link"
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
