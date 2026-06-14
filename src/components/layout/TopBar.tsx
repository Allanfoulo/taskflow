import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Bell,
  Menu,
  X,
  Plus,
  ChevronDown,
  LogOut,
  User,
  Settings as SettingsIcon,
  FolderPlus,
  ListTodo,
  Layers,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useProjects } from "@/contexts/ProjectContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "./ThemeToggle";
import { NotificationSystem } from "@/components/collaboration";
import CreateProjectModal from "@/components/projects/CreateProjectModal";
import CreateTaskModal from "@/components/tasks/CreateTaskModal";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";

interface TopBarProps {
  onToggleSidebar: () => void;
}

const TopBar = ({ onToggleSidebar }: TopBarProps) => {
  const { user, logout } = useAuth();
  const { projects, addWorkspace } = useProjects();
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const [isCreateWorkspaceOpen, setIsCreateWorkspaceOpen] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [newWorkspaceColor, setNewWorkspaceColor] = useState("#4f46e5");
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/auth/login");
  };

  const handleCreateWorkspace = async () => {
    if (!newWorkspaceName.trim()) {
      toast({
        title: "Workspace name required",
        description: "Please enter a name for your workspace",
        variant: "destructive",
      });
      return;
    }

    const workspaceName = newWorkspaceName;

    await addWorkspace({
      name: workspaceName,
      color: newWorkspaceColor,
    });
    setNewWorkspaceName("");
    setNewWorkspaceColor("#4f46e5");
    setIsCreateWorkspaceOpen(false);

    toast({
      title: "Workspace created",
      description: `${workspaceName} has been created successfully`,
    });
  };

  return (
    <div className="h-16 border-b border-border bg-background flex items-center justify-between px-4 z-10">
      <div className="flex items-center space-x-4">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-md hover:bg-secondary/50 transition-colors"
        >
          <Menu size={20} />
        </button>

        {searchOpen ? (
          <div className="relative animate-fade-in">
            <Input
              type="text"
              placeholder="Search..."
              className="w-64 pl-10"
              autoFocus
              onBlur={() => setSearchOpen(false)}
            />
            <Search
              size={16}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
            />
            <button
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
              onClick={() => setSearchOpen(false)}
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setSearchOpen(true)}
            className="p-2 rounded-md hover:bg-secondary/50 transition-colors text-muted-foreground"
          >
            <Search size={20} />
          </button>
        )}
      </div>

      <div className="flex items-center space-x-4">
        <ThemeToggle />

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
              data-component-name="_c"
            >
              <Plus size={16} />
              <span>Create</span>
              <ChevronDown size={14} />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56" align="end">
            <div className="space-y-1">
              <CreateProjectModal
                trigger={
                  <button className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-secondary transition-colors flex items-center gap-2">
                    <FolderPlus size={16} />
                    New Project
                  </button>
                }
                onSuccess={() => {
                  toast({
                    title: "Project created",
                    description: "Your new project has been created successfully",
                  });
                  navigate('/projects');
                }}
              />

              {projects.length > 0 ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-secondary transition-colors flex items-center gap-2 justify-between">
                      <div className="flex items-center gap-2">
                        <ListTodo size={16} />
                        New Task
                      </div>
                      <ChevronDown size={14} />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end">
                    <DropdownMenuLabel>Select Project</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {projects.map(project => (
                      <DropdownMenuItem
                        key={project.id}
                        onClick={() => {
                          setSelectedProjectId(project.id);
                          setIsCreateTaskOpen(true);
                        }}
                        className="cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: project.color }}
                          />
                          {project.name}
                        </div>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <button
                  className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-secondary transition-colors flex items-center gap-2 opacity-50"
                  onClick={() => toast({
                    title: "No projects available",
                    description: "Create a project first before adding tasks",
                    variant: "destructive",
                  })}
                >
                  <ListTodo size={16} />
                  New Task
                </button>
              )}

              {selectedProjectId && (
                <CreateTaskModal
                  projectId={selectedProjectId}
                  open={isCreateTaskOpen}
                  onOpenChange={(open) => {
                    setIsCreateTaskOpen(open);
                    if (!open) {
                      setSelectedProjectId(null);
                    }
                  }}
                  onSuccess={() => {
                    setSelectedProjectId(null);
                  }}
                />
              )}

              <Dialog open={isCreateWorkspaceOpen} onOpenChange={setIsCreateWorkspaceOpen}>
                <DialogTrigger asChild>
                  <button className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-secondary transition-colors flex items-center gap-2">
                    <Layers size={16} />
                    New Workspace
                  </button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Workspace</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="workspaceName">Workspace Name</Label>
                      <Input
                        id="workspaceName"
                        value={newWorkspaceName}
                        onChange={(e) => setNewWorkspaceName(e.target.value)}
                        placeholder="Enter workspace name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="workspaceColor">Color</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="color"
                          id="workspaceColor"
                          value={newWorkspaceColor}
                          onChange={(e) => setNewWorkspaceColor(e.target.value)}
                          className="w-12 h-8 p-1"
                        />
                        <div
                          className="w-8 h-8 rounded-full border"
                          style={{ backgroundColor: newWorkspaceColor }}
                        />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsCreateWorkspaceOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateWorkspace}>
                      Create Workspace
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </PopoverContent>
        </Popover>

        <NotificationSystem />

        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger className="focus:outline-none">
              <div className="flex items-center">
                <img
                  className="h-8 w-8 rounded-full border border-border"
                  src={user.avatarUrl}
                  alt={user.name}
                />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span>{user.name}</span>
                  <span className="text-muted-foreground text-xs">
                    {user.email}
                  </span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={() => navigate("/profile")}
                className="cursor-pointer"
              >
                <User size={16} className="mr-2" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => navigate("/settings")}
                className="cursor-pointer"
              >
                <SettingsIcon size={16} className="mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={handleLogout}
                className="text-red-500 cursor-pointer"
              >
                <LogOut size={16} className="mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
};

export default TopBar;
