import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useProjects } from "@/contexts/ProjectContext";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import BoardView from "@/components/projects/BoardView";
import ProjectDashboard from "@/components/projects/ProjectDashboard";
import ProjectTimeline from "@/components/projects/ProjectTimeline";
import ProjectSuggestionsPanel from "@/components/projects/ProjectSuggestionsPanel";
import ProjectTags from "@/components/projects/ProjectTags";
import TaskList from "@/components/tasks/TaskList";
import CreateTaskModal from "@/components/tasks/CreateTaskModal";
import CalendarView from "@/components/tasks/CalendarView";
import { AnalyticsDashboard } from "@/components/analytics";
import { ActivityFeed } from "@/components/collaboration";
import AutopilotController from "@/components/projects/AutopilotController";

import {
  Calendar,
  LayoutGrid,
  List,
  MoreHorizontal,
  PenLine,
  Star,
  StarOff,
  Trash2,
  Users,
  Tag as TagIcon,
  BarChart,
  Clock,
  CheckSquare,
  LineChart,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import { format } from "date-fns";

const ProjectDetail = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const {
    projects,
    workspaces,
    updateProject,
    deleteProject,
    toggleFavorite,
  } = useProjects();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isAutopilotActive, setIsAutopilotActive] = useState(false);

  if (!projectId) {
    return <div>Project ID is missing</div>;
  }

  const project = projects.find((p) => p.id === projectId);

  if (!project) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Project not found</h2>
          <p className="text-muted-foreground mt-2">
            The project you're looking for doesn't exist or has been deleted.
          </p>
          <Button
            onClick={() => navigate("/projects")}
            className="mt-4"
            variant="outline"
          >
            View all projects
          </Button>
        </div>
      </div>
    );
  }

  const workspace = workspaces.find((w) => w.id === project.workspace);

  const handleDelete = () => {
    deleteProject(project.id);
    toast({
      title: "Project deleted",
      description: `"${project.name}" has been deleted`,
    });
    navigate("/projects");
  };

  const statusCounts = {
    backlog: project.tasks.filter((t) => t.status === "backlog").length,
    todo: project.tasks.filter((t) => t.status === "todo").length,
    inProgress: project.tasks.filter((t) => t.status === "inProgress").length,
    inReview: project.tasks.filter((t) => t.status === "inReview").length,
    done: project.tasks.filter((t) => t.status === "done").length,
  };

  const totalTasks = project.tasks.length;

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <h1 className="text-2xl font-bold">{project.name}</h1>
          <button
            onClick={() => toggleFavorite(project.id)}
            className="text-muted-foreground hover:text-amber-400 transition-colors"
          >
            {project.favorite ? (
              <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
            ) : (
              <StarOff className="h-5 w-5" />
            )}
          </button>
          {workspace && (
            <Badge
              className="text-xs"
              style={{ backgroundColor: workspace.color, color: "white" }}
            >
              {workspace.name}
            </Badge>
          )}
          <ProjectTags projectId={project.id} className="ml-2" />
          <Button
            variant="outline"
            size="sm"
            className="ml-2 gap-2 border-purple-500/50 hover:bg-purple-500/10 hover:text-purple-500"
            onClick={() => {
              const newState = !isAutopilotActive;
              setIsAutopilotActive(newState);
              toast({
                title: newState ? "Autopilot Activated" : "Autopilot Deactivated",
                description: newState ? "AI is now monitoring this project for updates." : "AI monitoring stopped."
              });
            }}
          >
            <Sparkles className={`h-4 w-4 ${isAutopilotActive ? "text-purple-500 fill-purple-500" : "text-purple-500"}`} />
            <span>{isAutopilotActive ? "Active" : "Autopilot"}</span>
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex -space-x-2">
            {project.members.slice(0, 3).map((memberId, index) => (
              <Avatar key={index} className="border-2 border-background h-8 w-8">
                <AvatarImage
                  src={`https://i.pravatar.cc/150?u=${memberId}`}
                  alt={`Team member ${index + 1}`}
                />
                <AvatarFallback>
                  {memberId.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            ))}
            {project.members.length > 3 && (
              <div className="flex items-center justify-center h-8 w-8 rounded-full bg-secondary text-xs font-medium">
                +{project.members.length - 3}
              </div>
            )}
          </div>

          <Button variant="outline" size="sm">
            <Users className="mr-2 h-4 w-4" />
            Team
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Project Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer">
                <PenLine className="mr-2 h-4 w-4" />
                Edit project
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => toggleFavorite(project.id)}
              >
                {project.favorite ? (
                  <>
                    <StarOff className="mr-2 h-4 w-4" />
                    Remove from favorites
                  </>
                ) : (
                  <>
                    <Star className="mr-2 h-4 w-4" />
                    Add to favorites
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-500 cursor-pointer"
                onClick={handleDelete}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete project
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <AutopilotController
        projectId={project.id}
        isActive={isAutopilotActive}
        onDeactivate={() => setIsAutopilotActive(false)}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-4 rounded-lg">
          <p className="text-sm text-muted-foreground">Progress</p>
          <div className="mt-1 flex items-center">
            <span className="text-2xl font-bold">{project.progress}%</span>
          </div>
          <Progress value={project.progress} className="h-2 mt-2" />
        </div>

        <div className="glass-card p-4 rounded-lg">
          <p className="text-sm text-muted-foreground">Tasks</p>
          <div className="mt-1 flex items-center justify-between">
            <span className="text-2xl font-bold">{totalTasks}</span>
            <span className="text-sm text-muted-foreground">
              {statusCounts.done} completed
            </span>
          </div>
          <div className="grid grid-cols-5 gap-1 mt-2">
            <div
              className="h-1 rounded-l-full bg-purple-500"
              style={{
                width: `${(statusCounts.backlog / totalTasks) * 100}%`,
              }}
            />
            <div
              className="h-1 bg-blue-500"
              style={{
                width: `${(statusCounts.todo / totalTasks) * 100}%`,
              }}
            />
            <div
              className="h-1 bg-amber-500"
              style={{
                width: `${(statusCounts.inProgress / totalTasks) * 100}%`,
              }}
            />
            <div
              className="h-1 bg-orange-500"
              style={{
                width: `${(statusCounts.inReview / totalTasks) * 100}%`,
              }}
            />
            <div
              className="h-1 rounded-r-full bg-green-500"
              style={{
                width: `${(statusCounts.done / totalTasks) * 100}%`,
              }}
            />
          </div>
        </div>

        <div className="glass-card p-4 rounded-lg">
          <p className="text-sm text-muted-foreground">Due Date</p>
          <div className="mt-1 flex items-center">
            <span className="text-2xl font-bold">
              {project.dueDate
                ? format(new Date(project.dueDate), "MMM d, yyyy")
                : "Not set"}
            </span>
          </div>
          {project.dueDate && (
            <p className="text-xs text-muted-foreground mt-2">
              {Math.ceil(
                (new Date(project.dueDate).getTime() - new Date().getTime()) /
                (1000 * 60 * 60 * 24)
              )}{" "}
              days remaining
            </p>
          )}
        </div>

        <div className="glass-card p-4 rounded-lg">
          <p className="text-sm text-muted-foreground">Created</p>
          <div className="mt-1 flex items-center">
            <span className="text-2xl font-bold">
              {format(new Date(project.createdAt), "MMM d, yyyy")}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {Math.ceil(
              (new Date().getTime() - new Date(project.createdAt).getTime()) /
              (1000 * 60 * 60 * 24)
            )}{" "}
            days ago
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
        <TabsList className="grid grid-cols-8 md:w-auto md:inline-flex overflow-x-auto tabs-list">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <BarChart className="h-4 w-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </TabsTrigger>
          <TabsTrigger value="board" className="flex items-center gap-2">
            <LayoutGrid className="h-4 w-4" />
            <span className="hidden sm:inline">Board</span>
          </TabsTrigger>
          <TabsTrigger value="timeline" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span className="hidden sm:inline">Timeline</span>
          </TabsTrigger>
          <TabsTrigger value="list" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            <span className="hidden sm:inline">List</span>
          </TabsTrigger>
          <TabsTrigger value="tasks" className="flex items-center gap-2">
            <CheckSquare className="h-4 w-4" />
            <span className="hidden sm:inline">Tasks</span>
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">Calendar</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <LineChart className="h-4 w-4" />
            <span className="hidden sm:inline">Analytics</span>
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            <span className="hidden sm:inline">Activity</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="flex-1 mt-6">
          <div className="space-y-6">
            <ProjectDashboard projectId={project.id} />
            <ProjectSuggestionsPanel projectId={project.id} />
          </div>
        </TabsContent>

        <TabsContent value="board" className="flex-1 mt-6">
          <div className="flex justify-end mb-4">
            <CreateTaskModal projectId={project.id} />
          </div>
          <BoardView projectId={project.id} />
        </TabsContent>

        <TabsContent value="timeline" className="flex-1 mt-6">
          <ProjectTimeline projectId={project.id} />
        </TabsContent>

        <TabsContent value="list" className="flex-1 mt-6">
          <div className="text-center py-12 text-muted-foreground">
            <p>List view coming soon</p>
          </div>
        </TabsContent>

        <TabsContent value="tasks" className="flex-1 mt-6">
          <TaskList projectId={project.id} />
        </TabsContent>

        <TabsContent value="calendar" className="flex-1 mt-6">
          <CalendarView projectId={project.id} />
        </TabsContent>

        <TabsContent value="analytics" className="flex-1 mt-6">
          <AnalyticsDashboard projectId={project.id} />
        </TabsContent>

        <TabsContent value="activity" className="flex-1 mt-6">
          <ActivityFeed projectId={project.id} />
        </TabsContent>
      </Tabs>
    </div >
  );
};

export default ProjectDetail;
