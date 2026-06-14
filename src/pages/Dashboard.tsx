
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useProjects } from "@/contexts/ProjectContext";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  Layers,
  Calendar,
  Star,
  StarOff,
} from "lucide-react";
import { format } from "date-fns";
import { useIsMobile } from "@/hooks/use-mobile";
import SmartInsights from "@/components/dashboard/SmartInsights";
import CreateProjectModal from "@/components/projects/CreateProjectModal";

// Mock data for charts
const activityData = [
  { name: "Mon", tasks: 5 },
  { name: "Tue", tasks: 8 },
  { name: "Wed", tasks: 12 },
  { name: "Thu", tasks: 9 },
  { name: "Fri", tasks: 7 },
  { name: "Sat", tasks: 4 },
  { name: "Sun", tasks: 3 },
];

const Dashboard = () => {
  const { projects, activities } = useProjects();
  const { user } = useAuth();
  const isMobile = useIsMobile();

  // Derive project status data from projects
  const projectStatusData = projects.slice(0, 5).map(project => ({
    name: project.name.length > 15 ? project.name.substring(0, 12) + '...' : project.name,
    completed: project.progress,
    total: 100
  }));

  // Map activities to dashboard format
  const recentActivities = activities.slice(0, 5).map(activity => ({
    id: activity.id,
    action: activity.action,
    taskName: activity.entityName || "item",
    project: projects.find(p => p.id === (activity.entityType === 'project' ? activity.entityId : activity.metadata?.projectId))?.name || "Project",
    timestamp: activity.createdAt,
    user: {
      name: user?.name || "User",
      avatar: user?.avatarUrl || `https://ui-avatars.com/api/?name=${user?.name || 'User'}`,
    },
  }));

  // Calculate dashboard stats
  const totalProjects = projects.length;
  const totalTasks = projects.reduce(
    (acc, project) => acc + project.tasks.length,
    0
  );
  const completedTasks = projects.reduce(
    (acc, project) =>
      acc +
      project.tasks.filter((task) => task.status === "done").length,
    0
  );
  const upcomingDeadlines = projects
    .flatMap((project) => project.tasks)
    .filter((task) => {
      if (!task.dueDate) return false;
      const dueDate = new Date(task.dueDate);
      const now = new Date();
      const diffDays = Math.ceil(
        (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );
      return diffDays >= 0 && diffDays <= 7;
    });

  // Sort projects by creation date to get recent projects
  const recentProjects = [...projects]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 3);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="animate-slide-in">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">Dashboard</h1>
          <p className="text-muted-foreground mt-1 text-lg">
            Welcome back, {user?.name}
          </p>
        </div>
        <div className="mt-4 md:mt-0 animate-scale-in">
          <CreateProjectModal
            trigger={
              <button className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground text-sm font-semibold rounded-2xl hover:bg-primary/90 transition-all hover:scale-105 shadow-lg shadow-primary/20">
                <Layers className="mr-2 h-4 w-4" />
                New Project
              </button>
            }
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="glass-card animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Total Projects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className="mr-4 rounded-2xl p-3 bg-blue-100/50 dark:bg-blue-500/10">
                <Layers className="h-5 w-5 text-blue-500" />
              </div>
              <div className="text-3xl font-bold">{totalProjects}</div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Task Completion
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className="mr-4 rounded-2xl p-3 bg-green-100/50 dark:bg-green-500/10">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              </div>
              <div className="text-3xl font-bold">
                {totalTasks > 0
                  ? Math.round((completedTasks / totalTasks) * 100)
                  : 0}
                %
              </div>
            </div>
            <Progress
              value={totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0}
              className="h-2 mt-4"
            />
          </CardContent>
        </Card>

        <Card className="glass-card animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Active Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className="mr-4 rounded-2xl p-3 bg-amber-100/50 dark:bg-amber-500/10">
                <Clock className="h-5 w-5 text-amber-500" />
              </div>
              <div className="text-3xl font-bold">
                {totalTasks - completedTasks}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Upcoming Deadlines
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className="mr-4 rounded-2xl p-3 bg-red-100/50 dark:bg-red-500/10">
                <AlertCircle className="h-5 w-5 text-red-500" />
              </div>
              <div className="text-3xl font-bold">
                {upcomingDeadlines.length}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="animate-slide-up" style={{ animationDelay: '0.5s' }}>
        <SmartInsights />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Activity Overview</span>
              <Link
                to="/tasks"
                className="text-sm text-primary flex items-center hover:underline"
              >
                View all
                <ArrowUpRight className="ml-1 h-3 w-3" />
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={activityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="tasks"
                    stroke="#4f46e5"
                    strokeWidth={2}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Project Status</span>
              <Link
                to="/projects"
                className="text-sm text-primary flex items-center hover:underline"
              >
                View all
                <ArrowUpRight className="ml-1 h-3 w-3" />
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={projectStatusData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar
                    dataKey="completed"
                    fill="#4f46e5"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {recentActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start space-x-4 animate-fade-in"
                  >
                    <img
                      src={activity.user.avatar}
                      alt={activity.user.name}
                      className="h-10 w-10 rounded-full"
                    />
                    <div className="flex-1">
                      <p className="text-sm">
                        <span className="font-medium">
                          {activity.user.name}
                        </span>{" "}
                        {activity.action}{" "}
                        <span className="font-medium">
                          {activity.taskName}
                        </span>{" "}
                        in{" "}
                        <Link
                          to="#"
                          className="text-primary hover:underline"
                        >
                          {activity.project}
                        </Link>
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(
                          new Date(activity.timestamp),
                          "MMM d, h:mm a"
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Recent Projects</span>
                <Link
                  to="/projects"
                  className="text-sm text-primary flex items-center hover:underline"
                >
                  View all
                  <ArrowUpRight className="ml-1 h-3 w-3" />
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentProjects.map((project) => (
                  <Link
                    key={project.id}
                    to={`/projects/${project.id}`}
                    className="block"
                  >
                    <div className="flex items-center p-3 rounded-lg hover:bg-secondary/50 transition-colors">
                      <div
                        className="w-2 h-10 rounded-sm mr-3"
                        style={{ backgroundColor: project.color }}
                      ></div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <h3 className="text-sm font-medium truncate">
                            {project.name}
                          </h3>
                          <button
                            className="ml-2 text-muted-foreground hover:text-amber-400 flex-shrink-0"
                            onClick={(e) => {
                              e.preventDefault();
                              // Toggle favorite would be handled here
                            }}
                          >
                            {project.favorite ? (
                              <Star
                                size={16}
                                className="fill-amber-400 text-amber-400"
                              />
                            ) : (
                              <StarOff size={16} />
                            )}
                          </button>
                        </div>
                        <div className="flex items-center mt-1 text-xs text-muted-foreground">
                          <Calendar className="mr-1 h-3 w-3" />
                          {project.dueDate
                            ? format(new Date(project.dueDate), "MMM d, yyyy")
                            : "No due date"}
                        </div>
                        <Progress
                          value={project.progress}
                          className="h-1 mt-2"
                        />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
