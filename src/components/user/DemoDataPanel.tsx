import { useState } from "react";
import { useMutation } from "convex/react";
import { Database, RefreshCcw, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { api } from "../../../convex/_generated/api";
import { useProjects } from "@/contexts/ProjectContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const DemoDataPanel = () => {
  const { user } = useAuth();
  const { workspaces, projects } = useProjects();
  const seedFixtures = useMutation(api.datasets.seedFixtures);
  const [isSeeding, setIsSeeding] = useState(false);

  const demoProjects = projects.filter((project) => project.tags?.includes("tfaagency"));
  const demoTasks = demoProjects.reduce((count, project) => count + project.tasks.length, 0);
  const demoWorkspaces = workspaces.filter((workspace) => workspace.name.startsWith("TFAAgency /"));

  const handleSeedDemoData = async () => {
    if (!user) {
      toast.error("Sign in before seeding demo data");
      return;
    }

    setIsSeeding(true);
    try {
      const result = await seedFixtures({});
      toast.success(
        `TFAAgency demo data ready: ${result.workspaceCount} workspaces, ${result.projectCount} projects, ${result.taskCount} tasks.`,
      );
    } catch (error) {
      console.error("Error seeding demo data:", error);
      toast.error("Failed to seed demo data");
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Demo Data
            </CardTitle>
            <CardDescription>
              Reseed the TFAAgency showcase dataset for product walkthroughs and recordings.
            </CardDescription>
          </div>
          <div className="rounded-full border border-border bg-muted/60 px-3 py-1 text-xs font-medium text-muted-foreground">
            Safe rerun
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="rounded-lg border border-dashed border-border bg-muted/30 p-4">
          <div className="flex items-start gap-3">
            <Sparkles className="mt-0.5 h-4 w-4 text-amber-500" />
            <div className="space-y-1 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">What this does</p>
              <p>
                Rebuilds only the seeded <span className="font-medium text-foreground">TFAAgency</span> records for the current account and leaves any non-demo data untouched.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="rounded-lg border p-4">
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Workspaces</div>
            <div className="mt-2 text-2xl font-semibold">{demoWorkspaces.length}</div>
            <div className="text-sm text-muted-foreground">TFAAgency client spaces</div>
          </div>
          <div className="rounded-lg border p-4">
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Projects</div>
            <div className="mt-2 text-2xl font-semibold">{demoProjects.length}</div>
            <div className="text-sm text-muted-foreground">Showcase-ready initiatives</div>
          </div>
          <div className="rounded-lg border p-4">
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Tasks</div>
            <div className="mt-2 text-2xl font-semibold">{demoTasks}</div>
            <div className="text-sm text-muted-foreground">Populated across statuses</div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Use this right before recording if you want a fresh, predictable dataset.
        </p>
        <Button onClick={handleSeedDemoData} disabled={isSeeding || !user}>
          <RefreshCcw className={`mr-2 h-4 w-4 ${isSeeding ? "animate-spin" : ""}`} />
          {isSeeding ? "Seeding Demo Data..." : "Seed TFAAgency Demo Data"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default DemoDataPanel;
