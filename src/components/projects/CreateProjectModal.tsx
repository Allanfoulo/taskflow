import { useEffect, useState } from "react";
import { useProjects } from "@/contexts/ProjectContext";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar as CalendarIcon, Plus } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface CreateProjectModalProps {
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

const CreateProjectModal = ({
  trigger,
  onSuccess,
}: CreateProjectModalProps) => {
  const { addProject, workspaces } = useProjects();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    workspace: "",
    dueDate: null as Date | null,
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    if (!formData.workspace && workspaces.length > 0) {
      setFormData((current) => ({
        ...current,
        workspace: workspaces[0].id,
      }));
    }
  }, [formData.workspace, open, workspaces]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.workspace) {
      return;
    }

    setIsSubmitting(true);

    // Generate a random color based on the workspace or default
    const selectedWorkspace = workspaces.find(w => w.id === formData.workspace);
    const color = selectedWorkspace?.color || `#${Math.floor(Math.random()*16777215).toString(16)}`;

    const newProject = {
      name: formData.name,
      description: formData.description,
      dueDate: formData.dueDate ? formData.dueDate.toISOString() : undefined,
      status: "active" as const,
      progress: 0,
      members: [],
      workspace: formData.workspace,
      favorite: false,
      color,
    };

    try {
      await addProject(newProject);
      setFormData({
        name: "",
        description: "",
        workspace: "",
        dueDate: null,
      });
      setOpen(false);
      onSuccess?.();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>
            Fill in the details to create a new project.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Project Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter project name"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter project description"
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="workspace">Workspace</Label>
            <Select
              value={formData.workspace}
              onValueChange={(value) => setFormData({ ...formData, workspace: value })}
              required
            >
              <SelectTrigger id="workspace">
                <SelectValue placeholder="Select a workspace" />
              </SelectTrigger>
              <SelectContent>
                {workspaces.map((workspace) => (
                  <SelectItem key={workspace.id} value={workspace.id}>
                    <div className="flex items-center">
                      <span
                        className="h-2 w-2 rounded-full mr-2"
                        style={{ backgroundColor: workspace.color }}
                      />
                      {workspace.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="dueDate">Due Date (Optional)</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.dueDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.dueDate ? (
                    format(formData.dueDate, "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.dueDate || undefined}
                  onSelect={(date) => setFormData({ ...formData, dueDate: date })}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || workspaces.length === 0}>
              {isSubmitting ? "Creating..." : "Create Project"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateProjectModal;
