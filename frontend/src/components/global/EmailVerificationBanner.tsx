import { useState } from "react";
import { Mail, X, Loader2, CheckCircle2 } from "lucide-react";
import { lmsAuth } from "@/services/lmsApi";
import { toast } from "sonner";
import { useAuth } from "@/hooks/AuthProvider";

export default function EmailVerificationBanner() {
  const { user } = useAuth();
  const [dismissed,     setDismissed]     = useState(false);
  const [sending,       setSending]       = useState(false);
  const [sent,          setSent]          = useState(false);

  // Only show for logged-in, unverified, non-admin users
  if (!user || user.isEmailVerified || user.role === "admin" || dismissed) return null;

  const handleSend = async () => {
    setSending(true);
    try {
      await lmsAuth.sendVerification();
      setSent(true);
      toast.success("Verification email sent! Check your inbox.");
    } catch (err: any) {
      toast.error(err.message ?? "Failed to send verification email");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="mx-4 mt-4 md:mx-6 lg:mx-8">
      <div className="flex items-start gap-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-700 rounded-xl px-4 py-3">
        <Mail className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          {sent ? (
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-[#3ecf8e] shrink-0" />
              <p className="text-sm text-foreground font-medium">
                Verification email sent — check your inbox (and spam folder).
              </p>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <p className="text-sm text-amber-800 dark:text-amber-300 font-medium flex-1">
                ⚠️ Your email address is not verified.
              </p>
              <button
                onClick={handleSend}
                disabled={sending}
                className="text-xs font-bold text-amber-700 dark:text-amber-300 hover:text-amber-900 dark:hover:text-amber-100 underline underline-offset-2 flex items-center gap-1 shrink-0 disabled:opacity-60"
              >
                {sending
                  ? <><Loader2 className="h-3 w-3 animate-spin" />Sending…</>
                  : "Send verification email"
                }
              </button>
            </div>
          )}
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-amber-500 hover:text-amber-700 dark:hover:text-amber-300 transition-colors shrink-0"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
