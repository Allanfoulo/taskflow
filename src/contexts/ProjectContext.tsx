import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useMutation, useQuery } from "convex/react";
import { Id } from "../../convex/_generated/dataModel";
import { api } from "../../convex/_generated/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

// Define our data types
export type Project = {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  dueDate?: string;
  status: "active" | "completed" | "onHold";
  progress: number;
  members: string[];
  tasks: Task[];
  workspace: string;
  favorite: boolean;
  color: string;
  tags?: string[];
  milestones?: Milestone[];
};

export type Milestone = {
  id: string;
  title: string;
  date: string;
  completed: boolean;
};

type MilestoneInput = Partial<Milestone> & {
  projectId?: string;
};

export type Task = {
  id: string;
  title: string;
  description: string;
  status: "backlog" | "todo" | "inProgress" | "inReview" | "done";
  priority: "low" | "medium" | "high" | "urgent";
  assigneeId?: string;
  dueDate?: string;
  createdAt: string;
  tags: string[];
  subtasks: Subtask[];
  projectId: string;
};

export type Subtask = {
  id: string;
  title: string;
  completed: boolean;
};

export type Activity = {
  id: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  entityName?: string;
  metadata: any;
  createdAt: string;
};

export type Workspace = {
  id: string;
  name: string;
  color: string;
};

// Create the context and provider
interface ProjectContextType {
  projects: Project[];
  workspaces: Workspace[];
  currentProject: Project | null;
  setCurrentProject: (project: Project | null) => void;
  addProject: (project: Partial<Project>) => Promise<void>;
  updateProject: (id: string, project: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  addTask: (task: Partial<Task>) => Promise<void>;
  updateTask: (id: string, task: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  addMilestone: (milestone: MilestoneInput) => Promise<void>;
  updateMilestone: (id: string, milestone: Partial<Milestone>) => Promise<void>;
  deleteMilestone: (id: string) => Promise<void>;
  addWorkspace: (workspace: Partial<Workspace>) => Promise<void>;
  activities: Activity[];
  logActivity: (activity: Partial<Activity>) => Promise<void>;
  isLoading: boolean;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [requestedDefaultWorkspace, setRequestedDefaultWorkspace] = useState(false);
  const workspaceRecords = useQuery(api.workspaces.list);
  const projectRecords = useQuery(api.projects.list);
  const activityRecords = useQuery(api.activities.list);
  const ensureDefaultWorkspace = useMutation(api.workspaces.ensureDefault);
  const createWorkspace = useMutation(api.workspaces.create);
  const createProject = useMutation(api.projects.create);
  const patchProject = useMutation(api.projects.update);
  const removeProject = useMutation(api.projects.remove);
  const createTask = useMutation(api.tasks.create);
  const patchTask = useMutation(api.tasks.update);
  const removeTask = useMutation(api.tasks.remove);
  const createActivity = useMutation(api.activities.log);

  const workspaces = (workspaceRecords || []).map((workspace) => ({
    id: String(workspace.id),
    name: workspace.name,
    color: workspace.color,
  }));

  const projects = (projectRecords || []).map((project) => ({
    ...project,
    id: String(project.id),
    workspace: String(project.workspace),
    tasks: project.tasks.map((task) => ({
      ...task,
      id: String(task.id),
      assigneeId: task.assigneeId ? String(task.assigneeId) : undefined,
      projectId: String(task.projectId),
    })),
  }));

  const activities = (activityRecords || []).map((activity) => ({
    ...activity,
    id: String(activity.id),
    userId: String(activity.userId),
  }));

  useEffect(() => {
    if (!user) {
      setRequestedDefaultWorkspace(false);
      return;
    }

    if (workspaceRecords && workspaceRecords.length === 0 && !requestedDefaultWorkspace) {
      setRequestedDefaultWorkspace(true);
      void ensureDefaultWorkspace({});
    }
  }, [ensureDefaultWorkspace, requestedDefaultWorkspace, user, workspaceRecords]);

  const isLoading = !!user && (workspaceRecords === undefined || projectRecords === undefined || activityRecords === undefined);

  const logActivity = async (activity: Partial<Activity>) => {
    if (!user) return;

    try {
      await createActivity({
        action: activity.action || "updated",
        entityType: activity.entityType || "unknown",
        entityId: activity.entityId || "",
        entityName: activity.entityName,
        metadata: activity.metadata,
      });
    } catch (error) {
      console.error("Error logging activity:", error);
    }
  };

  const addProject = async (project: Partial<Project>) => {
    if (!user) return;

    try {
      const workspaceId = (project.workspace || workspaces[0]?.id) as Id<"workspaces"> | undefined;
      if (!workspaceId) {
        throw new Error("Workspace is required");
      }

      const createdProjectId = await createProject({
        name: project.name || "New Project",
        description: project.description || "",
        status: project.status || "active",
        workspaceId,
        color: project.color || "#4f46e5",
        tags: project.tags || [],
        members: project.members || [],
        milestones: project.milestones || [],
        favorite: project.favorite || false,
        progress: project.progress || 0,
        dueDate: project.dueDate,
      });

      await logActivity({
        action: "created",
        entityType: "project",
        entityId: String(createdProjectId),
        entityName: project.name || "New Project",
      });
      toast.success("Project created successfully");
    } catch (error) {
      console.error("Error creating project:", error);
      toast.error("Failed to create project");
    }
  };

  const updateProject = async (id: string, updatedFields: Partial<Project>) => {
    try {
      await patchProject({
        id: id as Id<"projects">,
        name: updatedFields.name,
        description: updatedFields.description,
        status: updatedFields.status,
        dueDate: updatedFields.dueDate,
        favorite: updatedFields.favorite,
        color: updatedFields.color,
        progress: updatedFields.progress,
        tags: updatedFields.tags,
        members: updatedFields.members,
        milestones: updatedFields.milestones,
      });

      if (currentProject && currentProject.id === id) {
        setCurrentProject({ ...currentProject, ...updatedFields });
      }

      await logActivity({
        action: updatedFields.favorite !== undefined ? (updatedFields.favorite ? "favorited" : "unfavorited") : "updated",
        entityType: "project",
        entityId: id,
        entityName: projects.find(p => p.id === id)?.name
      });

      toast.success("Project updated");
    } catch (error) {
      console.error("Error updating project:", error);
      toast.error("Failed to update project");
    }
  };

  const deleteProject = async (id: string) => {
    try {
      await removeProject({
        id: id as Id<"projects">,
      });

      if (currentProject?.id === id) {
        setCurrentProject(null);
      }

      await logActivity({
        action: "deleted",
        entityType: "project",
        entityId: id,
        entityName: projects.find(p => p.id === id)?.name
      });

      toast.success("Project deleted");
    } catch (error) {
      console.error("Error deleting project:", error);
      toast.error("Failed to delete project");
    }
  };

  const addTask = async (task: Partial<Task>) => {
    if (!task.projectId || !user) return;

    try {
      const createdTaskId = await createTask({
        projectId: task.projectId as Id<"projects">,
        title: task.title || "New Task",
        description: task.description || "",
        status: task.status || "todo",
        priority: task.priority || "medium",
        assigneeId: (task.assigneeId || user.id) as Id<"users">,
        tags: task.tags || [],
        subtasks: task.subtasks || [],
        dueDate: task.dueDate,
      });

      await logActivity({
        action: "added task",
        entityType: "task",
        entityId: String(createdTaskId),
        entityName: task.title || "New Task",
        metadata: { projectId: task.projectId },
      });

      toast.success("Task added");
    } catch (error) {
      console.error("Error adding task:", error);
      toast.error("Failed to add task");
    }
  };

  const updateTask = async (id: string, updatedFields: Partial<Task>) => {
    try {
      await patchTask({
        id: id as Id<"tasks">,
        title: updatedFields.title,
        description: updatedFields.description,
        status: updatedFields.status,
        priority: updatedFields.priority,
        dueDate: updatedFields.dueDate,
        assigneeId: updatedFields.assigneeId as Id<"users"> | undefined,
        tags: updatedFields.tags,
        subtasks: updatedFields.subtasks,
      });

      await logActivity({
        action: updatedFields.status === "done" ? "completed task" : "updated task",
        entityType: "task",
        entityId: id,
        entityName: projects.flatMap(p => p.tasks).find(t => t.id === id)?.title
      });
    } catch (error) {
      console.error("Error updating task:", error);
      toast.error("Failed to update task");
    }
  };

  const deleteTask = async (id: string) => {
    try {
      await removeTask({
        id: id as Id<"tasks">,
      });

      await logActivity({
        action: "deleted task",
        entityType: "task",
        entityId: id
      });

      toast.success("Task deleted");
    } catch (error) {
      console.error("Error deleting task:", error);
      toast.error("Failed to delete task");
    }
  };

  const toggleFavorite = async (id: string) => {
    const project = projects.find(p => p.id === id);
    if (!project) return;

    await updateProject(id, { favorite: !project.favorite });
  };

  // Milestones are stored in projects table as JSONB, so we update the project
  const addMilestone = async (milestone: MilestoneInput) => {
    if (!milestone.projectId) return;

    const project = projects.find(p => p.id === milestone.projectId);
    if (!project) return;

    const newMilestone: Milestone = {
      id: `m${Date.now()}`, // Generate client-side ID for simplicity inside JSON
      title: milestone.title || "New Milestone",
      date: milestone.date || "",
      completed: milestone.completed || false,
    };

    const updatedMilestones = [...(project.milestones || []), newMilestone];
    await updateProject(project.id, { milestones: updatedMilestones });
  };

  const updateMilestone = async (id: string, updatedFields: Partial<Milestone>) => {
    // Find project containing this milestone
    const project = projects.find(p => p.milestones?.some(m => m.id === id));
    if (!project) return;

    const updatedMilestones = project.milestones?.map(m =>
      m.id === id ? { ...m, ...updatedFields } : m
    );

    await updateProject(project.id, { milestones: updatedMilestones });
  };

  const deleteMilestone = async (id: string) => {
    const project = projects.find(p => p.milestones?.some(m => m.id === id));
    if (!project) return;

    const updatedMilestones = project.milestones?.filter(m => m.id !== id);
    await updateProject(project.id, { milestones: updatedMilestones });
  };

  const addWorkspace = async (workspace: Partial<Workspace>) => {
    try {
      await createWorkspace({
        name: workspace.name || "New Workspace",
        color: workspace.color || "#4f46e5",
      });
    } catch (error) {
      console.error("Error creating workspace:", error);
      toast.error("Failed to create workspace");
    }
  };

  return (
    <ProjectContext.Provider
      value={{
        projects,
        workspaces,
        currentProject,
        setCurrentProject,
        addProject,
        updateProject,
        deleteProject,
        addTask,
        updateTask,
        deleteTask,
        toggleFavorite,
        addMilestone,
        updateMilestone,
        deleteMilestone,
        addWorkspace,
        activities,
        logActivity,
        isLoading,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProjects = () => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error("useProjects must be used within a ProjectProvider");
  }
  return context;
};
