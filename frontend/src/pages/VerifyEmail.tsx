import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { lmsAuth } from "@/services/lmsApi";
import { Loader2, CheckCircle2, XCircle, GraduationCap, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/AuthProvider";
import { toast } from "sonner";

export default function VerifyEmail() {
  const [params]  = useSearchParams();
  const token     = params.get("token") ?? "";
  const id        = params.get("id")    ?? "";
  const { user }  = useAuth();

  const [status,  setStatus]  = useState<"loading" | "success" | "error" | "idle">(
    token && id ? "loading" : "idle"
  );
  const [message, setMessage] = useState("");
  const [resendLoading, setResendLoading] = useState(false);

  useEffect(() => {
    if (!token || !id) return;
    lmsAuth.verifyEmail(token, id)
      .then(res => {
        setStatus("success");
        setMessage(res.message);
      })
      .catch(err => {
        setStatus("error");
        setMessage(err.message ?? "Email verification failed");
      });
  }, []);  // eslint-disable-line

  const handleResend = async () => {
    setResendLoading(true);
    try {
      const res = await lmsAuth.sendVerification();
      toast.success(res.message);
    } catch (err: any) {
      toast.error(err.message ?? "Failed to resend verification email");
    } finally {
      setResendLoading(false);
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
          <h1 className="text-2xl font-extrabold text-foreground">Email Verification</h1>
        </div>

        <div className="bg-card border-2 border-border rounded-2xl p-8 shadow-sm">
          {/* Loading */}
          {status === "loading" && (
            <div className="text-center space-y-4 py-4">
              <Loader2 className="h-12 w-12 animate-spin text-[#3ecf8e] mx-auto" />
              <p className="text-sm font-semibold text-muted-foreground">Verifying your email…</p>
            </div>
          )}

          {/* Success */}
          {status === "success" && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#3ecf8e]/10 border-2 border-[#3ecf8e] flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-8 w-8 text-[#3ecf8e]" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">Email Verified! 🎉</h2>
                <p className="text-sm text-muted-foreground mt-1">{message}</p>
              </div>
              <Link to="/login">
                <Button className="w-full bg-[#3ecf8e] hover:bg-[#34b27b] text-black font-bold">
                  Continue to Login
                </Button>
              </Link>
            </div>
          )}

          {/* Error */}
          {status === "error" && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-950/40 border-2 border-red-400 flex items-center justify-center mx-auto">
                <XCircle className="h-8 w-8 text-red-500" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">Verification Failed</h2>
                <p className="text-sm text-muted-foreground mt-1">{message}</p>
              </div>
              <div className="space-y-2">
                {user && (
                  <Button
                    onClick={handleResend}
                    disabled={resendLoading}
                    className="w-full bg-[#3ecf8e] hover:bg-[#34b27b] text-black font-bold"
                  >
                    {resendLoading
                      ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Sending…</>
                      : "Resend Verification Email"
                    }
                  </Button>
                )}
                <Link to="/login">
                  <Button variant="outline" className="w-full">Back to Login</Button>
                </Link>
              </div>
            </div>
          )}

          {/* Idle — no token in URL, show instructions */}
          {status === "idle" && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-950/40 border-2 border-blue-400 flex items-center justify-center mx-auto">
                <Mail className="h-8 w-8 text-blue-500" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">Verify Your Email</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Check your inbox for a verification link. If you didn't receive one, click below to resend.
                </p>
              </div>
              {user ? (
                <Button
                  onClick={handleResend}
                  disabled={resendLoading}
                  className="w-full bg-[#3ecf8e] hover:bg-[#34b27b] text-black font-bold"
                >
                  {resendLoading
                    ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Sending…</>
                    : "Resend Verification Email"
                  }
                </Button>
              ) : (
                <Link to="/login">
                  <Button className="w-full bg-[#3ecf8e] hover:bg-[#34b27b] text-black font-bold">
                    Go to Login
                  </Button>
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
