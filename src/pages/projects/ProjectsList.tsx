import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useProjects } from "@/contexts/ProjectContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import ProjectSearch from "@/components/projects/ProjectSearch";
import CreateProjectModal from "@/components/projects/CreateProjectModal";
import {
  Calendar,
  CheckCircle2,
  Clock,
  Plus,
  Search,
  Star,
  StarOff,
  Filter,
  ArrowUpDown,
  MoreHorizontal,
  Tag,
  Users,
  AlertTriangle,
} from "lucide-react";
import { format, isAfter, parseISO, differenceInDays } from "date-fns";

const ProjectsList = () => {
  const [searchParams] = useSearchParams();
  const { projects, workspaces, toggleFavorite } = useProjects();
  const [filteredProjects, setFilteredProjects] = useState(projects);
  const [sortOption, setSortOption] = useState("favorite");
  const selectedWorkspaceId = searchParams.get("workspace");
  const selectedWorkspace = workspaces.find((workspace) => workspace.id === selectedWorkspaceId);
  const visibleProjects = selectedWorkspaceId
    ? filteredProjects.filter((project) => project.workspace === selectedWorkspaceId)
    : filteredProjects;

  // Sort projects based on selected sort option
  const sortedProjects = [...visibleProjects].sort((a, b) => {
    switch (sortOption) {
      case "favorite":
        // First, sort by favorite status
        if (a.favorite && !b.favorite) return -1;
        if (!a.favorite && b.favorite) return 1;
        // Then by due date
        if (a.dueDate && b.dueDate) {
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        }
        return 0;

      case "dueDate-asc":
        if (a.dueDate && b.dueDate) {
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        }
        if (a.dueDate && !b.dueDate) return -1;
        if (!a.dueDate && b.dueDate) return 1;
        return 0;

      case "dueDate-desc":
        if (a.dueDate && b.dueDate) {
          return new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
        }
        if (a.dueDate && !b.dueDate) return -1;
        if (!a.dueDate && b.dueDate) return 1;
        return 0;

      case "name-asc":
        return a.name.localeCompare(b.name);

      case "name-desc":
        return b.name.localeCompare(a.name);

      case "progress-asc":
        return a.progress - b.progress;

      case "progress-desc":
        return b.progress - a.progress;

      case "created-asc":
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();

      case "created-desc":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();

      default:
        return 0;
    }
  });

  // Check if a project is overdue or due soon
  const getProjectTimeStatus = (project) => {
    if (!project.dueDate) return "none";

    const dueDate = parseISO(project.dueDate);
    const today = new Date();
    const daysRemaining = differenceInDays(dueDate, today);

    if (daysRemaining < 0) return "overdue";
    if (daysRemaining <= 7) return "soon";
    return "normal";
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-muted-foreground mt-1">
            {selectedWorkspace
              ? `${selectedWorkspace.name}: ${visibleProjects.length} project${visibleProjects.length !== 1 && "s"}`
              : `${projects.length} project${projects.length !== 1 && "s"} in total`}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <CreateProjectModal />
        </div>
      </div>

      <ProjectSearch
        onFilterChange={setFilteredProjects}
      />

      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          {visibleProjects.length} project{visibleProjects.length !== 1 && "s"} found
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              <ArrowUpDown className="h-4 w-4" />
              Sort
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => setSortOption("favorite")}
            >
              Favorites first
              {sortOption === "favorite" && <CheckCircle2 className="ml-auto h-4 w-4" />}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Due Date</DropdownMenuLabel>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => setSortOption("dueDate-asc")}
            >
              Earliest first
              {sortOption === "dueDate-asc" && <CheckCircle2 className="ml-auto h-4 w-4" />}
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => setSortOption("dueDate-desc")}
            >
              Latest first
              {sortOption === "dueDate-desc" && <CheckCircle2 className="ml-auto h-4 w-4" />}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Name</DropdownMenuLabel>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => setSortOption("name-asc")}
            >
              A-Z
              {sortOption === "name-asc" && <CheckCircle2 className="ml-auto h-4 w-4" />}
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => setSortOption("name-desc")}
            >
              Z-A
              {sortOption === "name-desc" && <CheckCircle2 className="ml-auto h-4 w-4" />}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Progress</DropdownMenuLabel>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => setSortOption("progress-asc")}
            >
              Lowest first
              {sortOption === "progress-asc" && <CheckCircle2 className="ml-auto h-4 w-4" />}
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => setSortOption("progress-desc")}
            >
              Highest first
              {sortOption === "progress-desc" && <CheckCircle2 className="ml-auto h-4 w-4" />}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Created Date</DropdownMenuLabel>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => setSortOption("created-desc")}
            >
              Newest first
              {sortOption === "created-desc" && <CheckCircle2 className="ml-auto h-4 w-4" />}
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => setSortOption("created-asc")}
            >
              Oldest first
              {sortOption === "created-asc" && <CheckCircle2 className="ml-auto h-4 w-4" />}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedProjects.length > 0 ? (
          sortedProjects.map((project, index) => {
            const workspace = workspaces.find((w) => w.id === project.workspace);
            const timeStatus = getProjectTimeStatus(project);

            return (
              <Link
                to={`/projects/${project.id}`}
                key={project.id}
                className="group"
              >
                <Card
                  className="h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1 animate-slide-up"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <CardTitle className="flex items-center gap-2">
                          <span className="line-clamp-1">{project.name}</span>
                          {project.favorite && (
                            <Star className="h-4 w-4 fill-amber-400 text-amber-400 flex-shrink-0" />
                          )}
                        </CardTitle>
                        {workspace && (
                          <Badge
                            variant="outline"
                            className="text-xs"
                            style={{
                              backgroundColor: workspace.color,
                              color: "white",
                              borderColor: workspace.color
                            }}
                          >
                            {workspace.name}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {project.tags && project.tags.length > 0 && (
                          <div className="flex items-center text-muted-foreground">
                            <Tag className="h-3.5 w-3.5 mr-1" />
                            <span className="text-xs">{project.tags.length}</span>
                          </div>
                        )}
                        {project.members.length > 0 && (
                          <div className="flex items-center text-muted-foreground">
                            <Users className="h-3.5 w-3.5 mr-1" />
                            <span className="text-xs">{project.members.length}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <CardDescription className="line-clamp-2">
                      {project.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Progress</span>
                          <span>{project.progress}%</span>
                        </div>
                        <Progress value={project.progress} className="h-2" />
                      </div>

                      <div className="flex justify-between items-center text-sm">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {format(new Date(project.createdAt), "MMM d, yyyy")}
                          </span>
                        </div>

                        {project.dueDate && (
                          <div className="flex items-center gap-1.5">
                            {timeStatus === "overdue" ? (
                              <AlertTriangle className="h-4 w-4 text-destructive" />
                            ) : timeStatus === "soon" ? (
                              <Clock className="h-4 w-4 text-amber-500" />
                            ) : (
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                            )}
                            <span className={timeStatus === "overdue" ? "text-destructive" : timeStatus === "soon" ? "text-amber-500" : "text-muted-foreground"}>
                              {format(parseISO(project.dueDate), "MMM d, yyyy")}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <span>
                            {project.tasks.length} task{project.tasks.length !== 1 && "s"}
                          </span>
                          {project.tasks.length > 0 && (
                            <span>
                              • {project.tasks.filter(t => t.status === "done").length} completed
                            </span>
                          )}
                        </div>

                        <Badge variant={project.status === "active" ? "default" : project.status === "completed" ? "success" : "outline"}>
                          {project.status === "active" ? "Active" :
                            project.status === "completed" ? "Completed" : "On Hold"}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <div className="flex -space-x-2">
                      {project.members.slice(0, 5).map((memberId, index) => (
                        <Avatar key={index} className="border-2 border-background h-7 w-7">
                          <AvatarImage
                            src={`https://i.pravatar.cc/150?u=${memberId}`}
                            alt={`Team member ${index + 1}`}
                          />
                          <AvatarFallback className="text-xs">
                            {memberId.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                      {project.members.length > 5 && (
                        <div className="flex items-center justify-center h-7 w-7 rounded-full bg-secondary text-xs font-medium border-2 border-background">
                          +{project.members.length - 5}
                        </div>
                      )}
                    </div>
                  </CardFooter>
                </Card>
              </Link>
            );
          })
        ) : (
          <div className="col-span-full py-12 text-center">
            <div className="mx-auto w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-4">
              <Search className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium">No projects found</h3>
            <p className="text-muted-foreground mt-1 mb-4">
              Try adjusting your search or filter criteria
            </p>
            <CreateProjectModal
              trigger={
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create a new project
                </Button>
              }
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectsList;
