import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Mail, Settings, Bell, Clock, AlertTriangle, CheckCircle2, MessageSquare, Info, Calendar, RefreshCw, Save, AlertCircle } from "lucide-react";

interface NotificationType {
  id: string;
  type: string;
  description: string;
  enabled: boolean;
  emailEnabled: boolean;
  frequency: "instant" | "daily" | "weekly" | "never";
}

interface DigestSetting {
  id: string;
  type: "daily" | "weekly";
  time: string;
  day?: "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";
  enabled: boolean;
}

interface EmailNotificationSystemProps {
  className?: string;
}

const EmailNotificationSystem = ({ className }: EmailNotificationSystemProps) => {
  const [email, setEmail] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);
  const [emailEnabled, setEmailEnabled] = useState(true);

  // Enhanced notification settings with more options and better structure
  const [notificationTypes, setNotificationTypes] = useState<NotificationType[]>([
    {
      id: "1",
      type: "Task Assignment",
      description: "When you are assigned to a task",
      enabled: true,
      emailEnabled: true,
      frequency: "instant",
    },
    {
      id: "2",
      type: "Task Comments",
      description: "When someone comments on your task",
      enabled: true,
      emailEnabled: true,
      frequency: "daily",
    },
    {
      id: "3",
      type: "Mentions",
      description: "When someone mentions you in a comment",
      enabled: true,
      emailEnabled: true,
      frequency: "instant",
    },
    {
      id: "4",
      type: "Due Date Reminders",
      description: "Reminders for upcoming task deadlines",
      enabled: true,
      emailEnabled: true,
      frequency: "daily",
    },
    {
      id: "5",
      type: "Status Changes",
      description: "When a task status changes",
      enabled: true,
      emailEnabled: false,
      frequency: "daily",
    },
    {
      id: "6",
      type: "Project Updates",
      description: "General project updates and announcements",
      enabled: true,
      emailEnabled: true,
      frequency: "weekly",
    },
  ]);

  // Keep the original settings for backward compatibility
  const [notificationSettings, setNotificationSettings] = useState({
    taskAssignments: true,
    mentions: true,
    comments: true,
    statusChanges: true,
    deadlines: true,
    dailyDigest: false,
    weeklyDigest: true,
  });

  // Enhanced digest settings
  const [digestSettings, setDigestSettings] = useState<DigestSetting[]>([
    {
      id: "1",
      type: "daily",
      time: "17:00",
      enabled: true,
    },
    {
      id: "2",
      type: "weekly",
      time: "10:00",
      day: "friday",
      enabled: true,
    },
  ]);

  const handleVerifyEmail = () => {
    // In a real app, this would send a verification email
    // For demo purposes, we'll just simulate verification
    if (email && email.includes("@")) {
      setEmailVerified(true);
      toast({
        title: "Verification email sent",
        description: "Please check your inbox to complete verification.",
      });

      // Simulate automatic verification after a delay
      setTimeout(() => {
        setEmailVerified(true);
        toast({
          title: "Email verified",
          description: "Your email has been successfully verified.",
        });
      }, 2000);
    } else {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
    }
  };

  const handleToggleSetting = (setting: keyof typeof notificationSettings) => {
    setNotificationSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const handleToggleEmailEnabled = (enabled: boolean) => {
    setEmailEnabled(enabled);
    toast({
      title: enabled ? "Email notifications enabled" : "Email notifications disabled",
      description: enabled
        ? "You will now receive email notifications based on your preferences."
        : "You will no longer receive any email notifications.",
    });
  };

  const handleUpdateNotificationType = (
    id: string,
    field: "enabled" | "emailEnabled" | "frequency",
    value: any
  ) => {
    setNotificationTypes(
      notificationTypes.map((type) =>
        type.id === id ? { ...type, [field]: value } : type
      )
    );

    // Update the original settings for backward compatibility
    if (field === "emailEnabled") {
      const type = notificationTypes.find(t => t.id === id);
      if (type) {
        if (type.type === "Task Assignment") {
          setNotificationSettings(prev => ({ ...prev, taskAssignments: value }));
        } else if (type.type === "Mentions") {
          setNotificationSettings(prev => ({ ...prev, mentions: value }));
        } else if (type.type === "Task Comments") {
          setNotificationSettings(prev => ({ ...prev, comments: value }));
        } else if (type.type === "Status Changes") {
          setNotificationSettings(prev => ({ ...prev, statusChanges: value }));
        } else if (type.type === "Due Date Reminders") {
          setNotificationSettings(prev => ({ ...prev, deadlines: value }));
        }
      }
    }
  };

  const handleUpdateDigestSetting = (
    id: string,
    field: "time" | "day" | "enabled",
    value: any
  ) => {
    setDigestSettings(
      digestSettings.map((setting) =>
        setting.id === id ? { ...setting, [field]: value } : setting
      )
    );

    // Update the original settings for backward compatibility
    if (field === "enabled") {
      const digest = digestSettings.find(d => d.id === id);
      if (digest) {
        if (digest.type === "daily") {
          setNotificationSettings(prev => ({ ...prev, dailyDigest: value }));
        } else if (digest.type === "weekly") {
          setNotificationSettings(prev => ({ ...prev, weeklyDigest: value }));
        }
      }
    }
  };

  const handleSaveSettings = () => {
    // In a real app, this would save the settings to a backend
    toast({
      title: "Settings saved",
      description: "Your email notification preferences have been updated.",
      variant: "default",
    });
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Email Notifications
        </CardTitle>
        <CardDescription>
          Configure how and when you receive email notifications about your projects and tasks.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-0.5">
            <h3 className="font-medium">Email Notifications</h3>
            <p className="text-sm text-muted-foreground">
              Enable or disable all email notifications
            </p>
          </div>
          <Switch
            checked={emailEnabled}
            onCheckedChange={handleToggleEmailEnabled}
          />
        </div>

        {!emailEnabled && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Email notifications are disabled</AlertTitle>
            <AlertDescription>
              You will not receive any email notifications. Enable email notifications
              to stay updated on important activities.
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="settings">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="settings">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="h-4 w-4 mr-2" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="preview">
              <Mail className="h-4 w-4 mr-2" />
              Preview
            </TabsTrigger>
          </TabsList>

          <TabsContent value="settings" className="space-y-6 mt-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Email Address</h3>
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1"
                  disabled={emailVerified}
                />
                <Button onClick={handleVerifyEmail} disabled={emailVerified}>
                  {emailVerified ? "Verified" : "Verify"}
                </Button>
              </div>
              {emailVerified && (
                <p className="text-sm text-green-500 flex items-center">
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                  Email verified successfully
                </p>
              )}
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Digest Settings</h3>
              <div className="space-y-4">
                {digestSettings.map((digest) => (
                  <div key={digest.id} className="border rounded-md p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium capitalize">
                            {digest.type} Digest
                          </h4>
                          <Badge
                            variant="outline"
                            className={digest.enabled ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}
                          >
                            {digest.enabled ? "Enabled" : "Disabled"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {digest.type === "daily"
                            ? `Sent daily at ${digest.time}`
                            : `Sent every ${digest.day} at ${digest.time}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Label
                            htmlFor={`time-${digest.id}`}
                            className="text-sm font-normal"
                          >
                            Time
                          </Label>
                          <Select
                            value={digest.time}
                            onValueChange={(value) =>
                              handleUpdateDigestSetting(digest.id, "time", value)
                            }
                          >
                            <SelectTrigger
                              id={`time-${digest.id}`}
                              className="w-[100px]"
                            >
                              <SelectValue placeholder="Select time" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="08:00">8:00 AM</SelectItem>
                              <SelectItem value="09:00">9:00 AM</SelectItem>
                              <SelectItem value="12:00">12:00 PM</SelectItem>
                              <SelectItem value="15:00">3:00 PM</SelectItem>
                              <SelectItem value="17:00">5:00 PM</SelectItem>
                              <SelectItem value="20:00">8:00 PM</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {digest.type === "weekly" && (
                          <div className="flex items-center gap-2">
                            <Label
                              htmlFor={`day-${digest.id}`}
                              className="text-sm font-normal"
                            >
                              Day
                            </Label>
                            <Select
                              value={digest.day}
                              onValueChange={(value) =>
                                handleUpdateDigestSetting(digest.id, "day", value)
                              }
                            >
                              <SelectTrigger
                                id={`day-${digest.id}`}
                                className="w-[120px]"
                              >
                                <SelectValue placeholder="Select day" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="monday">Monday</SelectItem>
                                <SelectItem value="tuesday">Tuesday</SelectItem>
                                <SelectItem value="wednesday">Wednesday</SelectItem>
                                <SelectItem value="thursday">Thursday</SelectItem>
                                <SelectItem value="friday">Friday</SelectItem>
                                <SelectItem value="saturday">Saturday</SelectItem>
                                <SelectItem value="sunday">Sunday</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        )}

                        <div className="flex items-center gap-2">
                          <Label
                            htmlFor={`enabled-${digest.id}`}
                            className="text-sm font-normal"
                          >
                            Enabled
                          </Label>
                          <Switch
                            id={`enabled-${digest.id}`}
                            checked={digest.enabled}
                            onCheckedChange={(checked) =>
                              handleUpdateDigestSetting(
                                digest.id,
                                "enabled",
                                checked
                              )
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleSaveSettings}>
                <Save className="mr-2 h-4 w-4" />
                Save Settings
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6 mt-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Notification Preferences</h3>
              <p className="text-sm text-muted-foreground">
                Configure which notifications you receive and how they are delivered
              </p>

              <div className="space-y-4 mt-4">
                {notificationTypes.map((notification) => (
                  <div key={notification.id} className="border rounded-md p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h4 className="font-medium">{notification.type}</h4>
                        <p className="text-sm text-muted-foreground">
                          {notification.description}
                        </p>
                      </div>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Label
                            htmlFor={`enabled-${notification.id}`}
                            className="text-sm font-normal"
                          >
                            Enabled
                          </Label>
                          <Switch
                            id={`enabled-${notification.id}`}
                            checked={notification.enabled}
                            onCheckedChange={(checked) =>
                              handleUpdateNotificationType(
                                notification.id,
                                "enabled",
                                checked
                              )
                            }
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <Label
                            htmlFor={`email-${notification.id}`}
                            className="text-sm font-normal"
                          >
                            Email
                          </Label>
                          <Switch
                            id={`email-${notification.id}`}
                            checked={notification.emailEnabled}
                            disabled={!emailEnabled}
                            onCheckedChange={(checked) =>
                              handleUpdateNotificationType(
                                notification.id,
                                "emailEnabled",
                                checked
                              )
                            }
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <Label
                            htmlFor={`frequency-${notification.id}`}
                            className="text-sm font-normal"
                          >
                            Frequency
                          </Label>
                          <Select
                            value={notification.frequency}
                            disabled={!notification.emailEnabled || !emailEnabled}
                            onValueChange={(value) =>
                              handleUpdateNotificationType(
                                notification.id,
                                "frequency",
                                value
                              )
                            }
                          >
                            <SelectTrigger
                              id={`frequency-${notification.id}`}
                              className="w-[130px]"
                            >
                              <SelectValue placeholder="Select frequency" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="instant">Instant</SelectItem>
                              <SelectItem value="daily">Daily Digest</SelectItem>
                              <SelectItem value="weekly">Weekly Digest</SelectItem>
                              <SelectItem value="never">Never</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Alert className="mt-4">
                <Info className="h-4 w-4" />
                <AlertTitle>Notification Frequency</AlertTitle>
                <AlertDescription>
                  "Instant" sends emails immediately, while "Daily" and "Weekly" options
                  include notifications in digest emails.
                </AlertDescription>
              </Alert>
            </div>
          </TabsContent>

          <TabsContent value="preview" className="mt-6">
            <div className="border rounded-md p-4 space-y-4">
              <div className="border-b pb-2">
                <h3 className="font-medium">Sample Task Assignment Email</h3>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Subject: [CLX] New task assigned to you</p>
                <div className="bg-muted p-4 rounded-md">
                  <p className="text-sm">Hi John,</p>
                  <p className="text-sm mt-2">You have been assigned a new task:</p>
                  <p className="text-sm font-medium mt-2">"Implement user authentication"</p>
                  <p className="text-sm mt-2">Project: Website Redesign</p>
                  <p className="text-sm">Due date: April 10, 2025</p>
                  <p className="text-sm">Priority: High</p>
                  <div className="mt-4 border-t pt-2">
                    <p className="text-sm">View this task in CLX:</p>
                    <p className="text-sm text-blue-500 underline">https://taskflow.com/tasks/123</p>
                  </div>
                </div>
              </div>

              <div className="border-b pb-2 pt-4">
                <h3 className="font-medium">Sample Comment Notification Email</h3>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Subject: [CLX] New comment on "Implement user authentication"</p>
                <div className="bg-muted p-4 rounded-md">
                  <p className="text-sm">Hi John,</p>
                  <p className="text-sm mt-2">Jane Smith commented on a task you're following:</p>
                  <div className="bg-background p-3 rounded-md mt-2 border">
                    <p className="text-sm italic">"I've started working on this. @John can you clarify the requirements for the password reset feature?"</p>
                  </div>
                  <div className="mt-4 border-t pt-2">
                    <p className="text-sm">Reply to this comment:</p>
                    <p className="text-sm text-blue-500 underline">https://taskflow.com/tasks/123#comments</p>
                  </div>
                </div>
              </div>

              <div className="border-b pb-2 pt-4">
                <h3 className="font-medium">Sample Daily Digest Email</h3>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Subject: [CLX] Your Daily Digest - April 3, 2025</p>
                <div className="bg-muted p-4 rounded-md">
                  <p className="text-sm">Hi John,</p>
                  <p className="text-sm mt-2">Here's your daily summary:</p>

                  <div className="mt-3">
                    <p className="text-sm font-medium">New Tasks (2)</p>
                    <ul className="list-disc list-inside text-sm mt-1 space-y-1">
                      <li>Design login page mockups (Due: Apr 5)</li>
                      <li>Update API documentation (Due: Apr 8)</li>
                    </ul>
                  </div>

                  <div className="mt-3">
                    <p className="text-sm font-medium">Comments (3)</p>
                    <ul className="list-disc list-inside text-sm mt-1 space-y-1">
                      <li>Sarah commented on "Implement user authentication"</li>
                      <li>Mike mentioned you in "Database schema update"</li>
                      <li>Lisa replied to your comment in "Frontend testing"</li>
                    </ul>
                  </div>

                  <div className="mt-3">
                    <p className="text-sm font-medium">Upcoming Deadlines</p>
                    <ul className="list-disc list-inside text-sm mt-1 space-y-1">
                      <li>API integration (Tomorrow)</li>
                      <li>Weekly team meeting (2 days)</li>
                    </ul>
                  </div>

                  <div className="mt-4 border-t pt-2">
                    <p className="text-sm">View all your tasks and notifications:</p>
                    <p className="text-sm text-blue-500 underline">https://taskflow.com/dashboard</p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Reset to Defaults
        </Button>
        <Button onClick={handleSaveSettings}>
          <Save className="mr-2 h-4 w-4" />
          Save All Settings
        </Button>
      </CardFooter>
    </Card>
  );
};

export default EmailNotificationSystem;
