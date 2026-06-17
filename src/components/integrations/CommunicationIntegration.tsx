import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check, ExternalLink, MessageSquare, RefreshCw, X } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface CommunicationIntegrationProps {
  className?: string;
}

type CommunicationProvider = "slack" | "teams" | "discord" | "zoom" | "other";

interface ConnectedApp {
  id: string;
  name: string;
  provider: CommunicationProvider;
  workspace?: string;
  connected: boolean;
  lastSync?: string;
  channels?: string[];
}

const CommunicationIntegration = ({ className }: CommunicationIntegrationProps) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"connected" | "settings">("connected");
  const [syncInProgress, setSyncInProgress] = useState(false);
  const [apps, setApps] = useState<ConnectedApp[]>([
    {
      id: "1",
      name: "Slack",
      provider: "slack",
      workspace: "CLX Team",
      connected: true,
      lastSync: "2025-04-03T06:30:00Z",
      channels: ["#general", "#project-updates", "#development"],
    },
  ]);

  const [settings, setSettings] = useState({
    notifyOnTaskAssignment: true,
    notifyOnComments: true,
    notifyOnStatusChange: false,
    notifyOnDueDateApproaching: true,
    defaultApp: "1",
    defaultChannel: "#project-updates",
  });

  const handleConnect = (provider: CommunicationProvider) => {
    toast({
      title: "Connecting to platform",
      description: `Opening authentication for ${provider}...`,
    });

    // Simulate successful connection after a delay
    setTimeout(() => {
      const newApp: ConnectedApp = {
        id: `${apps.length + 1}`,
        name: provider === "slack" ? "Slack" :
          provider === "teams" ? "Microsoft Teams" :
            provider === "discord" ? "Discord" :
              provider === "zoom" ? "Zoom" : "Other Platform",
        provider,
        workspace: "New Workspace",
        connected: true,
        lastSync: new Date().toISOString(),
        channels: provider === "slack" ? ["#general"] :
          provider === "teams" ? ["General"] :
            provider === "discord" ? ["general"] : [],
      };

      setApps([...apps, newApp]);

      toast({
        title: "Platform connected",
        description: `Successfully connected to ${newApp.name}`,
      });
    }, 1500);
  };

  const handleDisconnect = (id: string) => {
    setApps(
      apps.map((app) =>
        app.id === id ? { ...app, connected: false } : app
      )
    );

    toast({
      title: "Platform disconnected",
      description: "Communication platform has been disconnected",
    });
  };

  const handleReconnect = (id: string) => {
    setApps(
      apps.map((app) =>
        app.id === id ? { ...app, connected: true, lastSync: new Date().toISOString() } : app
      )
    );

    toast({
      title: "Platform reconnected",
      description: "Communication platform has been reconnected",
    });
  };

  const handleRemove = (id: string) => {
    setApps(apps.filter((app) => app.id !== id));

    toast({
      title: "Platform removed",
      description: "Communication platform has been removed",
    });
  };

  const handleSyncNow = () => {
    setSyncInProgress(true);

    // Simulate sync process
    setTimeout(() => {
      setApps(
        apps.map((app) => ({
          ...app,
          lastSync: app.connected ? new Date().toISOString() : app.lastSync,
        }))
      );

      setSyncInProgress(false);

      toast({
        title: "Sync complete",
        description: "All communication platforms have been synchronized",
      });
    }, 2000);
  };

  const handleUpdateSettings = () => {
    toast({
      title: "Settings updated",
      description: "Communication integration settings have been updated",
    });
  };

  const getProviderIcon = (provider: CommunicationProvider) => {
    switch (provider) {
      case "slack":
        return (
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
            <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.687 8.834a2.528 2.528 0 0 1-2.521 2.521 2.528 2.528 0 0 1-2.522-2.521V2.522A2.528 2.528 0 0 1 15.166 0a2.528 2.528 0 0 1 2.521 2.522v6.312zM15.166 18.956a2.528 2.528 0 0 1 2.521 2.522A2.528 2.528 0 0 1 15.166 24a2.528 2.528 0 0 1-2.522-2.522v-2.522h2.522zM15.166 17.687a2.528 2.528 0 0 1-2.522-2.522 2.528 2.528 0 0 1 2.522-2.521h6.312A2.528 2.528 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.522h-6.312z" fill="#E01E5A" />
          </svg>
        );
      case "teams":
        return (
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
            <path d="M24 10.125V7.5a1.5 1.5 0 0 0-1.5-1.5h-6a1.5 1.5 0 0 0-1.5 1.5v2.625a1.5 1.5 0 0 0 1.5 1.5h6a1.5 1.5 0 0 0 1.5-1.5zM10.5 6a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM13.5 7.5h-6a3 3 0 0 0-3 3V24h12V10.5a3 3 0 0 0-3-3z" fill="#5059C9" />
          </svg>
        );
      case "discord":
        return (
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" fill="#5865F2" />
          </svg>
        );
      case "zoom":
        return (
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
            <path d="M24 12C24 18.6274 18.6274 24 12 24C5.37258 24 0 18.6274 0 12C0 5.37258 5.37258 0 12 0C18.6274 0 24 5.37258 24 12Z" fill="#4A8CFF" />
            <path d="M7 8.5V15.5H14V17H5.5V7H17V8.5H7Z" fill="white" />
            <path d="M18.5 10.5V17H12V10.5H18.5Z" fill="white" />
          </svg>
        );
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const formatLastSync = (dateString?: string) => {
    if (!dateString) return "Never";

    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} minutes ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hours ago`;

    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} days ago`;
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Communication Tools Integration
        </CardTitle>
        <CardDescription>
          Connect communication platforms like Slack, Microsoft Teams, and Discord to streamline project communications.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="connected">Connected Apps</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="connected" className="space-y-6 pt-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Your Connected Platforms</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSyncNow}
                disabled={syncInProgress}
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${syncInProgress ? "animate-spin" : ""}`}
                />
                Sync Now
              </Button>
            </div>

            <div className="space-y-4">
              {apps.length > 0 ? (
                apps.map((app) => (
                  <div
                    key={app.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full flex items-center justify-center bg-primary/10">
                        {getProviderIcon(app.provider)}
                      </div>
                      <div>
                        <div className="font-medium flex items-center gap-2">
                          {app.name}
                          {app.connected ? (
                            <Badge variant="outline" className="text-xs bg-green-50">
                              <Check className="h-3 w-3 mr-1 text-green-500" />
                              Connected
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs bg-red-50">
                              <X className="h-3 w-3 mr-1 text-red-500" />
                              Disconnected
                            </Badge>
                          )}
                        </div>
                        {app.workspace && (
                          <div className="text-sm text-muted-foreground">
                            Workspace: {app.workspace}
                          </div>
                        )}
                        {app.connected && (
                          <div className="flex text-xs text-muted-foreground gap-2">
                            <span>Last sync: {formatLastSync(app.lastSync)}</span>
                            {app.channels && app.channels.length > 0 && (
                              <span>
                                {app.channels.length} channel{app.channels.length !== 1 ? 's' : ''}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {app.connected ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDisconnect(app.id)}
                        >
                          Disconnect
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReconnect(app.id)}
                        >
                          Reconnect
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemove(app.id)}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p>No communication tools connected yet</p>
                  <p className="text-sm">Connect your favorite communication platforms to get started</p>
                </div>
              )}
            </div>

            <div className="pt-4">
              <h3 className="text-lg font-medium mb-4">Connect a new platform</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <Button
                  variant="outline"
                  className="h-auto py-6 flex flex-col items-center justify-center gap-2"
                  onClick={() => handleConnect("slack")}
                >
                  <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none">
                    <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.687 8.834a2.528 2.528 0 0 1-2.521 2.521 2.528 2.528 0 0 1-2.522-2.521V2.522A2.528 2.528 0 0 1 15.166 0a2.528 2.528 0 0 1 2.521 2.522v6.312zM15.166 18.956a2.528 2.528 0 0 1 2.521 2.522A2.528 2.528 0 0 1 15.166 24a2.528 2.528 0 0 1-2.522-2.522v-2.522h2.522zM15.166 17.687a2.528 2.528 0 0 1-2.522-2.522 2.528 2.528 0 0 1 2.522-2.521h6.312A2.528 2.528 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.522h-6.312z" fill="#E01E5A" />
                  </svg>
                  <span>Slack</span>
                </Button>

                <Button
                  variant="outline"
                  className="h-auto py-6 flex flex-col items-center justify-center gap-2"
                  onClick={() => handleConnect("teams")}
                >
                  <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none">
                    <path d="M24 10.125V7.5a1.5 1.5 0 0 0-1.5-1.5h-6a1.5 1.5 0 0 0-1.5 1.5v2.625a1.5 1.5 0 0 0 1.5 1.5h6a1.5 1.5 0 0 0 1.5-1.5zM10.5 6a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM13.5 7.5h-6a3 3 0 0 0-3 3V24h12V10.5a3 3 0 0 0-3-3z" fill="#5059C9" />
                  </svg>
                  <span>Microsoft Teams</span>
                </Button>

                <Button
                  variant="outline"
                  className="h-auto py-6 flex flex-col items-center justify-center gap-2"
                  onClick={() => handleConnect("discord")}
                >
                  <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" fill="#5865F2" />
                  </svg>
                  <span>Discord</span>
                </Button>

                <Button
                  variant="outline"
                  className="h-auto py-6 flex flex-col items-center justify-center gap-2"
                  onClick={() => handleConnect("zoom")}
                >
                  <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none">
                    <path d="M24 12C24 18.6274 18.6274 24 12 24C5.37258 24 0 18.6274 0 12C0 5.37258 5.37258 0 12 0C18.6274 0 24 5.37258 24 12Z" fill="#4A8CFF" />
                    <path d="M7 8.5V15.5H14V17H5.5V7H17V8.5H7Z" fill="white" />
                    <path d="M18.5 10.5V17H12V10.5H18.5Z" fill="white" />
                  </svg>
                  <span>Zoom</span>
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6 pt-6">
            {apps.length > 0 ? (
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Notification Settings</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Task Assignment Notifications</Label>
                        <p className="text-sm text-muted-foreground">
                          Send notifications when tasks are assigned to team members
                        </p>
                      </div>
                      <Switch
                        checked={settings.notifyOnTaskAssignment}
                        onCheckedChange={(checked) =>
                          setSettings({ ...settings, notifyOnTaskAssignment: checked })
                        }
                      />
                    </div>

                    <Separator className="my-4" />

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Comment Notifications</Label>
                        <p className="text-sm text-muted-foreground">
                          Send notifications when new comments are added to tasks
                        </p>
                      </div>
                      <Switch
                        checked={settings.notifyOnComments}
                        onCheckedChange={(checked) =>
                          setSettings({ ...settings, notifyOnComments: checked })
                        }
                      />
                    </div>

                    <Separator className="my-4" />

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Status Change Notifications</Label>
                        <p className="text-sm text-muted-foreground">
                          Send notifications when task status changes
                        </p>
                      </div>
                      <Switch
                        checked={settings.notifyOnStatusChange}
                        onCheckedChange={(checked) =>
                          setSettings({ ...settings, notifyOnStatusChange: checked })
                        }
                      />
                    </div>

                    <Separator className="my-4" />

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Due Date Notifications</Label>
                        <p className="text-sm text-muted-foreground">
                          Send notifications when task due dates are approaching
                        </p>
                      </div>
                      <Switch
                        checked={settings.notifyOnDueDateApproaching}
                        onCheckedChange={(checked) =>
                          setSettings({ ...settings, notifyOnDueDateApproaching: checked })
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-6">
                  <h3 className="text-lg font-medium">Default Communication Channel</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="defaultApp">Default Platform</Label>
                      <Select
                        value={settings.defaultApp}
                        onValueChange={(value) =>
                          setSettings({ ...settings, defaultApp: value })
                        }
                      >
                        <SelectTrigger id="defaultApp">
                          <SelectValue placeholder="Select default platform" />
                        </SelectTrigger>
                        <SelectContent>
                          {apps
                            .filter((app) => app.connected)
                            .map((app) => (
                              <SelectItem key={app.id} value={app.id}>
                                {app.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="defaultChannel">Default Channel</Label>
                      <Select
                        value={settings.defaultChannel}
                        onValueChange={(value) =>
                          setSettings({ ...settings, defaultChannel: value })
                        }
                      >
                        <SelectTrigger id="defaultChannel">
                          <SelectValue placeholder="Select default channel" />
                        </SelectTrigger>
                        <SelectContent>
                          {apps
                            .find((app) => app.id === settings.defaultApp)
                            ?.channels?.map((channel) => (
                              <SelectItem key={channel} value={channel}>
                                {channel}
                              </SelectItem>
                            )) || []}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button onClick={handleUpdateSettings}>Save Settings</Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>Connect a communication platform first to configure settings</p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="mt-6 pt-6 border-t">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              <p>Need help with communication platform integration?</p>
              <a
                href="#"
                className="text-primary inline-flex items-center hover:underline"
              >
                View documentation
                <ExternalLink className="ml-1 h-3 w-3" />
              </a>
            </div>
            <Button variant="outline" size="sm">
              Advanced Settings
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CommunicationIntegration;
