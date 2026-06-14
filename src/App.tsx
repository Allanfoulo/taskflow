
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProjectProvider } from "@/contexts/ProjectContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AIProvider } from "@/contexts/AIContext";
import { ThemeProvider as ThesysThemeProvider } from "@thesysai/genui-sdk";
import "@crayonai/react-ui/styles/index.css";

// Layout
import Layout from "@/components/layout/Layout";

// Auth Pages
import Login from "@/pages/auth/Login";
import Signup from "@/pages/auth/Signup";

// Main Pages
import Dashboard from "@/pages/Dashboard";
import ProjectsList from "@/pages/projects/ProjectsList";
import ProjectDetail from "@/pages/projects/ProjectDetail";
import NotFound from "@/pages/NotFound";

// Feature Pages
import Calendar from "@/pages/calendar/Calendar";
import Tasks from "@/pages/tasks/Tasks";
import Team from "@/pages/team/Team";
import Integrations from "@/pages/integrations";
import NotificationsPage from "@/pages/notifications/Notifications";

// User Pages
import Profile from "@/pages/profile/Profile";
import Settings from "@/pages/settings/Settings";
import ThemeSettings from "@/pages/settings/ThemeSettings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <AuthProvider>
          <ProjectProvider>
            <ThesysThemeProvider mode="dark">
              <AIProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter>
                  <Routes>
                    {/* Auth Routes */}
                    <Route path="/auth/login" element={<Login />} />
                    <Route path="/auth/signup" element={<Signup />} />

                    {/* Main App Routes */}
                    <Route path="/" element={<Layout />}>
                      <Route index element={<Dashboard />} />
                      <Route path="projects" element={<ProjectsList />} />
                      <Route path="projects/:projectId" element={<ProjectDetail />} />
                      <Route path="calendar" element={<Calendar />} />
                      <Route path="tasks" element={<Tasks />} />
                      <Route path="team" element={<Team />} />
                      <Route path="integrations" element={<Integrations />} />
                      <Route path="notifications" element={<NotificationsPage />} />

                      {/* User Routes */}
                      <Route path="profile" element={<Profile />} />
                      <Route path="settings" element={<Settings />} />
                      <Route path="settings/theme" element={<ThemeSettings />} />

                      <Route path="*" element={<NotFound />} />
                    </Route>
                  </Routes>
                </BrowserRouter>
              </AIProvider>
            </ThesysThemeProvider>
          </ProjectProvider>
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
