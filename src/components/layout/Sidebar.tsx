
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Home,
  Briefcase,
  Calendar,
  List,
  Settings,
  User,
  Plus,
  Star,
  Users,
  ChevronRight,
  Link as LinkIcon,
} from "lucide-react";
import { useProjects } from "@/contexts/ProjectContext";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";

interface SidebarProps {
  collapsed: boolean;
}

const Sidebar = ({ collapsed }: SidebarProps) => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { workspaces, projects } = useProjects();
  const { user } = useAuth();
  const selectedWorkspaceId = searchParams.get("workspace");

  const favoriteProjects = projects.filter((project) => project.favorite);

  const navItems = [
    {
      name: "Home",
      path: "/",
      icon: <Home size={20} />,
    },
    {
      name: "Projects",
      path: "/projects",
      icon: <Briefcase size={20} />,
    },
    {
      name: "Calendar",
      path: "/calendar",
      icon: <Calendar size={20} />,
    },
    {
      name: "Tasks",
      path: "/tasks",
      icon: <List size={20} />,
    },
    {
      name: "Team",
      path: "/team",
      icon: <Users size={20} />,
    },
    {
      name: "Integrations",
      path: "/integrations",
      icon: <LinkIcon size={20} />,
    },
  ];

  return (
    <div
      className={cn(
        "border-r border-border h-screen bg-sidebar flex flex-col transition-all duration-300 ease-in-out",
        collapsed ? "w-[70px]" : "w-[250px]"
      )}
    >
      <div className="p-4 flex items-center justify-between border-b border-border">
        <Link
          to="/"
          className={cn(
            "font-semibold text-xl flex items-center",
            collapsed && "justify-center"
          )}
        >
          {collapsed ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6"
            >
              <path d="M12 2L2 12 12 22 22 12 12 2z" />
            </svg>
          ) : (
            <span className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6 mr-2"
              >
                <path d="M12 2L2 12 12 22 22 12 12 2z" />
              </svg>
              TaskFlow
            </span>
          )}
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto py-4 flex flex-col gap-4">
        <nav className="px-2 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all",
                location.pathname === item.path
                  ? "bg-secondary text-primary"
                  : "text-sidebar-foreground hover:bg-secondary/50 hover:text-primary",
                collapsed && "justify-center"
              )}
            >
              <span className="flex-shrink-0">{item.icon}</span>
              {!collapsed && <span className="ml-3">{item.name}</span>}
            </Link>
          ))}
        </nav>

        {!collapsed && (
          <>
            <div className="px-4 py-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase text-muted-foreground">
                  Workspaces
                </h3>
                <button className="text-muted-foreground hover:text-primary transition-colors">
                  <Plus size={16} />
                </button>
              </div>
              <ul className="mt-2 space-y-1">
                {workspaces.map((workspace) => (
                  <li key={workspace.id}>
                    <Link
                      to={`/projects?workspace=${workspace.id}`}
                      className={cn(
                        "flex items-center px-3 py-2 text-sm rounded-md group transition-all",
                        location.pathname === "/projects" && selectedWorkspaceId === workspace.id
                          ? "bg-secondary text-primary"
                          : "hover:bg-secondary/50",
                      )}
                    >
                      <span
                        className="w-2 h-2 rounded-full mr-2"
                        style={{ backgroundColor: workspace.color }}
                      ></span>
                      <span className="flex-1 truncate">
                        {workspace.name}
                      </span>
                      <ChevronRight
                        size={14}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground"
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="px-4 py-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase text-muted-foreground">
                  Favorites
                </h3>
              </div>
              <ul className="mt-2 space-y-1">
                {favoriteProjects.length > 0 ? (
                  favoriteProjects.map((project) => (
                    <li key={project.id}>
                      <Link
                        to={`/projects/${project.id}`}
                        className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-secondary/50 group transition-all"
                      >
                        <span
                          className="w-2 h-2 rounded-full mr-2"
                          style={{ backgroundColor: project.color }}
                        ></span>
                        <span className="flex-1 truncate">
                          {project.name}
                        </span>
                        <Star
                          size={14}
                          className="text-amber-400 fill-amber-400"
                        />
                      </Link>
                    </li>
                  ))
                ) : (
                  <li className="px-3 py-2 text-sm text-muted-foreground">
                    No favorites yet
                  </li>
                )}
              </ul>
            </div>
          </>
        )}
      </div>

      <div className="p-4 border-t border-border">
        <div className="space-y-1">
          <Link
            to="/profile"
            className={cn(
              "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all hover:bg-secondary/50",
              location.pathname === "/profile" ? "bg-secondary text-primary" : "text-sidebar-foreground",
              collapsed && "justify-center"
            )}
          >
            <User size={20} />
            {!collapsed && <span className="ml-3">Profile</span>}
          </Link>
          <Link
            to="/settings"
            className={cn(
              "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all hover:bg-secondary/50",
              location.pathname === "/settings" ? "bg-secondary text-primary" : "text-sidebar-foreground",
              collapsed && "justify-center"
            )}
          >
            <Settings size={20} />
            {!collapsed && <span className="ml-3">Settings</span>}
          </Link>
        </div>
        {!collapsed && user && (
          <div className="mt-4 flex items-center px-3 py-2">
            <div className="flex-shrink-0">
              <img
                className="h-8 w-8 rounded-full"
                src={user.avatarUrl}
                alt={user.name}
              />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">{user.name}</p>
              <Badge variant="secondary" className="text-xs mt-1">
                {user.role}
              </Badge>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
