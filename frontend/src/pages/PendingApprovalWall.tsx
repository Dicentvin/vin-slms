import { Clock, GraduationCap, LogOut, RefreshCw, Moon, Sun } from "lucide-react";
import { useAuth } from "@/hooks/AuthProvider";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { lmsAuth } from "@/services/lmsApi";
import { useState } from "react";
import { useTheme } from "@/components/provider/theme";

export default function PendingApprovalWall() {
  const { user, logout, setUser } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [checking, setChecking] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const checkStatus = async () => {
    setChecking(true);
    try {
      const { user: fresh } = await lmsAuth.me();
      if (fresh.approvalStatus === "approved") {
        setUser({
          _id:            fresh._id,
          name:           fresh.name,
          email:          fresh.email,
          role:           fresh.role as any,
          className:      fresh.className,
          approvalStatus: fresh.approvalStatus as any,
        });
      }
    } catch {}
    finally { setChecking(false); }
  };

  const isRejected = user?.approvalStatus === "rejected";

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
{/* Floating theme toggle */}
      <button
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className="fixed top-4 right-4 z-50 w-9 h-9 rounded-full bg-background border border-border shadow-md flex items-center justify-center hover:bg-muted transition-colors"
        title="Toggle theme"
      >
        {theme === "dark" ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-600" />}
      </button>
      <div className="min-h-screen
      {/* Background blobs matching home page */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#3ecf8e] opacity-5 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#3ecf8e] opacity-5 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 w-full max-w-md text-center space-y-8">

        {/* Logo */}
        <div className="flex items-center justify-center gap-2">
          <div className="bg-[#3ecf8e] p-2 rounded-xl">
            <GraduationCap className="text-black w-7 h-7" />
          </div>
          <div className="flex flex-col leading-none text-left">
            <span className="text-xl font-extrabold tracking-tight text-foreground">CHUKWUDI</span>
            <span className="text-[10px] font-bold tracking-[0.2em] text-[#3ecf8e]">ACADEMY</span>
          </div>
        </div>

        {/* Card */}
        <div className="bg-card border border-border rounded-3xl p-8 shadow-xl space-y-6">

          {isRejected ? (
            <>
              <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-950/30 flex items-center justify-center mx-auto">
                <span className="text-4xl">❌</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">Account Rejected</h2>
                <p className="text-muted-foreground text-sm mt-2 leading-relaxed">
                  Unfortunately your account registration has been declined by the admin.
                  Please contact the school for assistance.
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="w-20 h-20 rounded-full bg-amber-100 dark:bg-amber-950/30 flex items-center justify-center mx-auto">
                <Clock className="w-10 h-10 text-amber-500" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">Awaiting Approval</h2>
                <p className="text-muted-foreground text-sm mt-2 leading-relaxed">
                  Your <span className="font-semibold text-foreground capitalize">{user?.role}</span> account
                  is pending review by the admin. You'll get full access once approved.
                </p>
              </div>

              {/* Info pills */}
              <div className="grid grid-cols-2 gap-3 text-left">
                <div className="bg-muted/60 rounded-xl p-3 space-y-1">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Name</p>
                  <p className="text-sm font-semibold text-foreground truncate">{user?.name}</p>
                </div>
                <div className="bg-muted/60 rounded-xl p-3 space-y-1">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Role</p>
                  <p className="text-sm font-semibold text-foreground capitalize">{user?.role}</p>
                </div>
                {user?.className && (
                  <div className="bg-muted/60 rounded-xl p-3 space-y-1 col-span-2">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Class</p>
                    <p className="text-sm font-semibold text-foreground">{user.className}</p>
                  </div>
                )}
              </div>

              <Button
                onClick={checkStatus}
                disabled={checking}
                className="w-full bg-[#3ecf8e] hover:bg-[#34b27b] text-black font-bold"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${checking ? "animate-spin" : ""}`} />
                {checking ? "Checking…" : "Check Approval Status"}
              </Button>
            </>
          )}

          <Button variant="ghost" onClick={handleLogout} className="w-full text-muted-foreground hover:text-foreground gap-2">
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          Need help? Contact your school admin.
        </p>
      </div>
    </div>
  );
}
