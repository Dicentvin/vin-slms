import { useAuth } from "@/hooks/AuthProvider";
import { Navigate, Outlet, useLocation } from "react-router";
import { Loader2 } from "lucide-react";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar, MobileHeader } from "@/components/sidebar/AppSidebar";
import PendingApprovalWall from "@/pages/PendingApprovalWall";

const PrivateRoutes = () => {
  const { loading, user } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Block unapproved users — admins always pass through
  if (user.approvalStatus !== "approved") {
    return <PendingApprovalWall />;
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="flex flex-col min-h-screen">
        {/* Mobile hamburger bar — hidden on desktop */}
        <MobileHeader />
        {/* Page content */}
        <div className="flex-1 overflow-auto">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default PrivateRoutes;
