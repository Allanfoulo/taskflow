import { useState, useEffect } from "react";
import { useProjects } from "@/contexts/ProjectContext";
import { Bell, CheckCircle2, MessageSquare, AlertTriangle, Clock, Calendar, User, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { formatDistance } from "date-fns/formatDistance";

type NotificationType = "mention" | "comment" | "assignment" | "deadline" | "status" | "system" | "all";

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  timestamp: string;
  projectId?: string;
  projectName?: string;
  taskId?: string;
  taskName?: string;
  userId?: string;
  userName?: string;
  userAvatar?: string;
  link?: string;
}

const NotificationsPage = () => {
  const { projects } = useProjects();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
  const [activeFilter, setActiveFilter] = useState<NotificationType>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Generate mock notifications
  useEffect(() => {
    const mockNotifications = generateMockNotifications();
    setNotifications(mockNotifications);
    setFilteredNotifications(mockNotifications);
  }, [projects]);

  // Filter notifications when filter or search changes
  useEffect(() => {
    let filtered = [...notifications];

    // Apply type filter
    if (activeFilter !== "all") {
      filtered = filtered.filter(n => n.type === activeFilter);
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(n =>
        n.title.toLowerCase().includes(query) ||
        n.message.toLowerCase().includes(query) ||
        (n.projectName && n.projectName.toLowerCase().includes(query)) ||
        (n.taskName && n.taskName.toLowerCase().includes(query))
      );
    }

    setFilteredNotifications(filtered);
  }, [activeFilter, searchQuery, notifications]);

  const generateMockNotifications = () => {
    if (projects.length === 0) {
      // Create some default notifications if no projects
      return [
        {
          id: "1",
          type: "system" as NotificationType,
          title: "Welcome to CLX",
          message: "Thanks for joining! Start by creating your first project.",
          read: false,
          timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        },
        {
          id: "2",
          type: "system" as NotificationType,
          title: "Getting Started Guide",
          message: "Check out our guide to learn how to use all features.",
          read: true,
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        },
      ];
    }

    const mockNotifications: Notification[] = [];

    // Generate notifications based on projects and tasks
    projects.forEach(project => {
      // Project deadline approaching
      if (project.dueDate) {
        mockNotifications.push({
          id: `deadline-${project.id}`,
          type: "deadline",
          title: "Project Deadline Approaching",
          message: `Project "${project.name}" is due in 3 days`,
          read: Math.random() > 0.5,
          timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
          projectId: project.id,
          projectName: project.name,
          link: `/projects/${project.id}`
        });
      }

      // Task notifications
      project.tasks.forEach(task => {
        // Task assignment
        if (task.assigneeId) {
          mockNotifications.push({
            id: `assign-${task.id}`,
            type: "assignment",
            title: "Task Assigned",
            message: `You've been assigned to "${task.title}" in ${project.name}`,
            read: Math.random() > 0.5,
            timestamp: new Date(Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000).toISOString(),
            projectId: project.id,
            projectName: project.name,
            taskId: task.id,
            taskName: task.title,
            link: `/projects/${project.id}?task=${task.id}`
          });
        }

        // Task mentions (random)
        if (Math.random() > 0.7) {
          mockNotifications.push({
            id: `mention-${task.id}`,
            type: "mention",
            title: "You were mentioned",
            message: `@John mentioned you in a comment on "${task.title}"`,
            read: Math.random() > 0.5,
            timestamp: new Date(Date.now() - Math.random() * 2 * 24 * 60 * 60 * 1000).toISOString(),
            projectId: project.id,
            projectName: project.name,
            taskId: task.id,
            taskName: task.title,
            userId: "user-1",
            userName: "John Doe",
            userAvatar: "https://i.pravatar.cc/150?img=1",
            link: `/projects/${project.id}?task=${task.id}`
          });
        }

        // Task comments (random)
        if (Math.random() > 0.6) {
          mockNotifications.push({
            id: `comment-${task.id}`,
            type: "comment",
            title: "New Comment",
            message: `New comment on task "${task.title}": "Let's discuss this in the next meeting"`,
            read: Math.random() > 0.5,
            timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
            projectId: project.id,
            projectName: project.name,
            taskId: task.id,
            taskName: task.title,
            userId: "user-2",
            userName: "Jane Smith",
            userAvatar: "https://i.pravatar.cc/150?img=2",
            link: `/projects/${project.id}?task=${task.id}`
          });
        }

        // Task status changes (random)
        if (Math.random() > 0.6) {
          mockNotifications.push({
            id: `status-${task.id}`,
            type: "status",
            title: "Task Status Updated",
            message: `Task "${task.title}" was moved to ${["In Progress", "Review", "Done"][Math.floor(Math.random() * 3)]}`,
            read: Math.random() > 0.5,
            timestamp: new Date(Date.now() - Math.random() * 4 * 24 * 60 * 60 * 1000).toISOString(),
            projectId: project.id,
            projectName: project.name,
            taskId: task.id,
            taskName: task.title,
            link: `/projects/${project.id}?task=${task.id}`
          });
        }
      });
    });

    // Add some system notifications
    mockNotifications.push({
      id: "system-1",
      type: "system",
      title: "New Feature Available",
      message: "Check out our new Gantt chart view for better project planning!",
      read: false,
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    });

    // Sort by timestamp (newest first)
    return mockNotifications.sort((a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, read: true }))
    );
  };

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case "mention":
        return <User className="h-5 w-5 text-blue-500" />;
      case "comment":
        return <MessageSquare className="h-5 w-5 text-green-500" />;
      case "assignment":
        return <User className="h-5 w-5 text-purple-500" />;
      case "deadline":
        return <Calendar className="h-5 w-5 text-red-500" />;
      case "status":
        return <CheckCircle2 className="h-5 w-5 text-orange-500" />;
      case "system":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };

  // Helper function to format relative time
  const formatRelativeTime = (date: Date | string) => {
    return formatDistance(new Date(date), new Date(), { addSuffix: true });
  };

  const getFilterCount = (type: NotificationType) => {
    if (type === "all") return notifications.length;
    return notifications.filter(n => n.type === type).length;
  };

  const getUnreadCount = () => {
    return notifications.filter(n => !n.read).length;
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="text-muted-foreground mt-1">
            You have {getUnreadCount()} unread notifications
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={markAllAsRead} disabled={getUnreadCount() === 0}>
            Mark all as read
          </Button>
        </div>
      </div>

      <Separator />

      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-64 space-y-4">
          <Card>
            <CardHeader className="py-4">
              <CardTitle className="text-lg">Filters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 pt-0">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search notifications..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="space-y-1 pt-2">
                <Button
                  variant={activeFilter === "all" ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setActiveFilter("all")}
                >
                  <Bell className="mr-2 h-4 w-4" />
                  All Notifications
                  <Badge className="ml-auto" variant="secondary">{getFilterCount("all")}</Badge>
                </Button>

                <Button
                  variant={activeFilter === "mention" ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setActiveFilter("mention")}
                >
                  <User className="mr-2 h-4 w-4 text-blue-500" />
                  Mentions
                  <Badge className="ml-auto" variant="secondary">{getFilterCount("mention")}</Badge>
                </Button>

                <Button
                  variant={activeFilter === "comment" ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setActiveFilter("comment")}
                >
                  <MessageSquare className="mr-2 h-4 w-4 text-green-500" />
                  Comments
                  <Badge className="ml-auto" variant="secondary">{getFilterCount("comment")}</Badge>
                </Button>

                <Button
                  variant={activeFilter === "assignment" ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setActiveFilter("assignment")}
                >
                  <User className="mr-2 h-4 w-4 text-purple-500" />
                  Assignments
                  <Badge className="ml-auto" variant="secondary">{getFilterCount("assignment")}</Badge>
                </Button>

                <Button
                  variant={activeFilter === "deadline" ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setActiveFilter("deadline")}
                >
                  <Calendar className="mr-2 h-4 w-4 text-red-500" />
                  Deadlines
                  <Badge className="ml-auto" variant="secondary">{getFilterCount("deadline")}</Badge>
                </Button>

                <Button
                  variant={activeFilter === "status" ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setActiveFilter("status")}
                >
                  <CheckCircle2 className="mr-2 h-4 w-4 text-orange-500" />
                  Status Updates
                  <Badge className="ml-auto" variant="secondary">{getFilterCount("status")}</Badge>
                </Button>

                <Button
                  variant={activeFilter === "system" ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setActiveFilter("system")}
                >
                  <AlertTriangle className="mr-2 h-4 w-4 text-yellow-500" />
                  System
                  <Badge className="ml-auto" variant="secondary">{getFilterCount("system")}</Badge>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex-1 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">
              {activeFilter === "all" ? "All Notifications" : `${activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1)} Notifications`}
            </h2>
            <Select defaultValue="newest">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest first</SelectItem>
                <SelectItem value="oldest">Oldest first</SelectItem>
                <SelectItem value="unread">Unread first</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filteredNotifications.length > 0 ? (
            <div className="space-y-3">
              {filteredNotifications.map(notification => (
                <Card
                  key={notification.id}
                  className={`${!notification.read ? 'border-l-4 border-l-primary' : ''}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="mt-1 p-2 rounded-full bg-muted">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-start justify-between">
                          <h3 className="font-medium">{notification.title}</h3>
                          <span className="text-sm text-muted-foreground">
                            {formatRelativeTime(notification.timestamp)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{notification.message}</p>

                        <div className="flex flex-wrap gap-2 pt-1">
                          {notification.projectName && (
                            <Badge variant="outline">
                              {notification.projectName}
                            </Badge>
                          )}
                          {!notification.read && (
                            <Badge className="bg-primary/10 text-primary border-primary/20">
                              Unread
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center justify-between pt-2">
                          {notification.link && (
                            <Button variant="link" size="sm" className="px-0" asChild>
                              <a href={notification.link}>View details</a>
                            </Button>
                          )}
                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markAsRead(notification.id)}
                            >
                              Mark as read
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <Bell className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No notifications found</h3>
                <p className="text-sm text-muted-foreground">
                  {searchQuery ? "Try adjusting your search or filters" : "You're all caught up!"}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
