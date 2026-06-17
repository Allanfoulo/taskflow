import { useState, useEffect } from "react";
import { useProjects } from "@/contexts/ProjectContext";
import { Bell, CheckCircle2, MessageSquare, AlertTriangle, Clock, Calendar, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDistance } from "date-fns/formatDistance";

interface NotificationSystemProps {
  className?: string;
}

type NotificationType = "mention" | "comment" | "assignment" | "deadline" | "status" | "system";

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

const NotificationSystem = ({ className }: NotificationSystemProps) => {
  const { projects } = useProjects();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  // Generate mock notifications
  useEffect(() => {
    generateMockNotifications();

    // Simulate receiving new notifications
    const interval = setInterval(() => {
      if (Math.random() > 0.7) { // 30% chance of new notification
        addRandomNotification();
      }
    }, 60000); // Every minute

    return () => clearInterval(interval);
  }, [projects]);

  // Update unread count when notifications change
  useEffect(() => {
    setUnreadCount(notifications.filter(n => !n.read).length);
  }, [notifications]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Get the dropdown element
      const dropdown = document.querySelector('[data-notification-dropdown]');
      // Check if the click is outside the dropdown
      if (isOpen && dropdown && !dropdown.contains(event.target as Node) && !(event.target as Element).closest('[data-notification-trigger]')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const generateMockNotifications = () => {
    if (projects.length === 0) return;

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
            userId: "user1",
            userName: "John Doe",
            userAvatar: "https://i.pravatar.cc/150?u=user1",
            link: `/projects/${project.id}?task=${task.id}`
          });
        }

        // Task comments (random)
        if (Math.random() > 0.6) {
          mockNotifications.push({
            id: `comment-${task.id}`,
            type: "comment",
            title: "New Comment",
            message: `New comment on task "${task.title}" from Jane`,
            read: Math.random() > 0.5,
            timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
            projectId: project.id,
            projectName: project.name,
            taskId: task.id,
            taskName: task.title,
            userId: "user2",
            userName: "Jane Smith",
            userAvatar: "https://i.pravatar.cc/150?u=user2",
            link: `/projects/${project.id}?task=${task.id}`
          });
        }

        // Task status changes (random)
        if (task.status === "done" && Math.random() > 0.5) {
          mockNotifications.push({
            id: `status-${task.id}`,
            type: "status",
            title: "Task Completed",
            message: `Task "${task.title}" was marked as complete`,
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

    // System notification
    mockNotifications.push({
      id: "system-update",
      type: "system",
      title: "System Update",
      message: "CLX has been updated with new features! Check out the collaboration tools.",
      read: false,
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
      link: "/whats-new"
    });

    // Sort by timestamp (newest first)
    mockNotifications.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Limit to 15 notifications
    setNotifications(mockNotifications.slice(0, 15));
  };

  const addRandomNotification = () => {
    if (projects.length === 0) return;

    const project = projects[Math.floor(Math.random() * projects.length)];
    if (!project || project.tasks.length === 0) return;

    const task = project.tasks[Math.floor(Math.random() * project.tasks.length)];

    const notificationTypes: NotificationType[] = ["mention", "comment", "assignment", "deadline", "status"];
    const type = notificationTypes[Math.floor(Math.random() * notificationTypes.length)];

    const newNotification: Notification = {
      id: `${type}-${Date.now()}`,
      type,
      title: type === "mention" ? "You were mentioned" :
        type === "comment" ? "New Comment" :
          type === "assignment" ? "Task Assigned" :
            type === "deadline" ? "Deadline Approaching" :
              "Status Update",
      message: type === "mention" ? `@Jane mentioned you in a comment on "${task.title}"` :
        type === "comment" ? `New comment on task "${task.title}" from Alex` :
          type === "assignment" ? `You've been assigned to "${task.title}" in ${project.name}` :
            type === "deadline" ? `Task "${task.title}" is due tomorrow` :
              `Task "${task.title}" status changed to ${task.status}`,
      read: false,
      timestamp: new Date().toISOString(),
      projectId: project.id,
      projectName: project.name,
      taskId: task.id,
      taskName: task.title,
      userId: type === "mention" ? "user2" : type === "comment" ? "user3" : undefined,
      userName: type === "mention" ? "Jane Smith" : type === "comment" ? "Alex Johnson" : undefined,
      userAvatar: type === "mention" ? "https://i.pravatar.cc/150?u=user2" : type === "comment" ? "https://i.pravatar.cc/150?u=user3" : undefined,
      link: `/projects/${project.id}?task=${task.id}`
    };

    setNotifications(prev => [newNotification, ...prev.slice(0, 14)]);
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notification => ({ ...notification, read: true })));
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case "mention":
        return <User className="h-4 w-4 text-blue-500" />;
      case "comment":
        return <MessageSquare className="h-4 w-4 text-green-500" />;
      case "assignment":
        return <User className="h-4 w-4 text-purple-500" />;
      case "deadline":
        return <Calendar className="h-4 w-4 text-red-500" />;
      case "status":
        return <CheckCircle2 className="h-4 w-4 text-orange-500" />;
      case "system":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  // Helper function to format relative time
  const formatRelativeTime = (date: Date | string) => {
    return formatDistance(new Date(date), new Date(), { addSuffix: true });
  };

  return (
    <div className={className}>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }} data-notification-trigger>
          <Button variant="outline" size="icon" className="relative">
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-80" align="end" onClick={(e) => e.stopPropagation()} data-notification-dropdown>
          <DropdownMenuLabel className="flex items-center justify-between">
            <span>Notifications</span>
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={(e) => {
                e.stopPropagation();
                markAllAsRead();
              }} className="h-7 text-xs">
                Mark all as read
              </Button>
            )}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <div className="max-h-[300px] overflow-y-auto">
            {notifications.length > 0 ? (
              <DropdownMenuGroup>
                {notifications.map(notification => (
                  <DropdownMenuItem
                    key={notification.id}
                    className={`flex items-start gap-2 p-3 cursor-pointer ${!notification.read ? 'bg-muted/50' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      markAsRead(notification.id);
                    }}
                  >
                    <div className="mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">{notification.title}</p>
                        <span className="text-xs text-muted-foreground">
                          {formatRelativeTime(notification.timestamp)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">{notification.message}</p>
                      {notification.projectName && (
                        <Badge variant="outline" className="text-xs mt-1">
                          {notification.projectName}
                        </Badge>
                      )}
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            ) : (
              <div className="py-6 text-center text-sm text-muted-foreground">
                No notifications
              </div>
            )}
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="justify-center" asChild>
            <Link to="/notifications" className="w-full text-center text-sm cursor-pointer">
              View all notifications
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default NotificationSystem;
