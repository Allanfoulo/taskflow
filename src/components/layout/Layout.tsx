import { useEffect, useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import { NotificationSystem } from "@/components/collaboration";
import AIAssistant from "@/components/ai/AIAssistant";

import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";

const Layout = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!isLoading && !isAuthenticated && !location.pathname.includes("/auth")) {
      navigate("/auth/login");
    }
  }, [isAuthenticated, isLoading, navigate, location.pathname]);

  // Retrieve sidebar state from localStorage on mount (desktop only)
  useEffect(() => {
    const savedState = localStorage.getItem("sidebarCollapsed");
    if (savedState) {
      setSidebarCollapsed(savedState === "true");
    }
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const toggleSidebar = () => {
    if (isMobile) {
      setMobileOpen(!mobileOpen);
    } else {
      const newState = !sidebarCollapsed;
      setSidebarCollapsed(newState);
      localStorage.setItem("sidebarCollapsed", String(newState));

      toast({
        title: newState ? "Sidebar collapsed" : "Sidebar expanded",
        description: newState
          ? "Click the menu icon to expand it again."
          : "You now have more space for navigation.",
        duration: 2000,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated && !location.pathname.includes("/auth")) {
    return null; // Don't render layout content while redirecting
  }

  return (
    <div className="h-screen flex flex-col">
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar */}
        {!isMobile && <Sidebar collapsed={sidebarCollapsed} />}

        {/* Mobile Sidebar */}
        {isMobile && (
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetContent side="left" className="p-0 w-[270px] border-r-0">
              <Sidebar collapsed={false} />
            </SheetContent>
          </Sheet>
        )}

        <div className="flex-1 flex flex-col overflow-hidden">
          <TopBar onToggleSidebar={toggleSidebar} />
          <main className="flex-1 overflow-auto bg-secondary/30 p-2 sm:p-4 md:p-6">
            <div className="animate-fade-in max-w-full">
              <Outlet />
            </div>
          </main>
          <footer className="border-t bg-background p-2 sm:p-4 text-center text-xs sm:text-sm text-muted-foreground">
            <p>CLX &copy; {new Date().getFullYear()} - Clarity Layer for Execution</p>
          </footer>
        </div>
      </div>
      <AIAssistant />
    </div>
  );
};

export default Layout;
