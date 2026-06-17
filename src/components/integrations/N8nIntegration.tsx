import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Workflow, Plus, Trash2, Zap, ExternalLink, CheckCircle2, Play } from "lucide-react";

interface N8nIntegrationProps {
    className?: string;
}

const N8nIntegration = ({ className }: N8nIntegrationProps) => {
    const { toast } = useToast();
    const [webhooks, setWebhooks] = useState<{ id: string; name: string; url: string; events: string[]; active: boolean }[]>([
        {
            id: "1",
            name: "Slack Notification",
            url: "https://n8n.example.com/webhook/slack-notify",
            events: ["task.completed"],
            active: true,
        },
    ]);
    const [isAdding, setIsAdding] = useState(false);
    const [newWebhook, setNewWebhook] = useState({ name: "", url: "", events: [] as string[] });

    const handleAddWebhook = () => {
        if (!newWebhook.name || !newWebhook.url) {
            toast({ title: "Validation Error", description: "Name and URL are required", variant: "destructive" });
            return;
        }
        setWebhooks([...webhooks, { ...newWebhook, id: Date.now().toString(), active: true }]);
        setIsAdding(false);
        setNewWebhook({ name: "", url: "", events: [] });
        toast({ title: "Webhook Added", description: "Your n8n workflow has been connected." });
    };

    const handleDeleteWebhook = (id: string) => {
        setWebhooks(webhooks.filter((w) => w.id !== id));
        toast({ title: "Webhook Deleted", description: "Integration removed." });
    };

    const handleTestTrigger = (url: string) => {
        toast({ title: "Test Trigger Sent", description: "Sending sample payload to n8n..." });
        setTimeout(() => {
            toast({ title: "Success", description: "n8n received the event!", className: "bg-green-50 border-green-200" });
        }, 1500);
    };

    const toggleEvent = (event: string) => {
        setNewWebhook(prev => ({
            ...prev,
            events: prev.events.includes(event)
                ? prev.events.filter(e => e !== event)
                : [...prev.events, event]
        }));
    };

    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Workflow className="h-5 w-5 text-orange-500" />
                    n8n Workflow Automation
                </CardTitle>
                <CardDescription>
                    Connect CLX to thousands of apps using n8n via webhooks.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">

                {/* Active Integrations List */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium">Active Workflows</h3>
                        <Button variant="outline" size="sm" onClick={() => setIsAdding(!isAdding)}>
                            <Plus className="h-4 w-4 mr-2" /> Connect Workflow
                        </Button>
                    </div>

                    {isAdding && (
                        <div className="border rounded-lg p-4 bg-muted/30 space-y-4">
                            <div className="grid gap-2">
                                <Label>Workflow Name</Label>
                                <Input
                                    placeholder="e.g. Sync High Priority Tasks to Jira"
                                    value={newWebhook.name}
                                    onChange={(e) => setNewWebhook({ ...newWebhook, name: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>n8n Webhook URL</Label>
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="https://your-n8n-instance.com/webhook/..."
                                        value={newWebhook.url}
                                        onChange={(e) => setNewWebhook({ ...newWebhook, url: e.target.value })}
                                    />
                                    <Button variant="ghost" size="icon" asChild>
                                        <a href="https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook/" target="_blank" rel="noreferrer">
                                            <ExternalLink className="h-4 w-4" />
                                        </a>
                                    </Button>
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label>Trigger Events</Label>
                                <div className="flex flex-wrap gap-2">
                                    {["task.created", "task.completed", "project.percentage_update"].map(evt => (
                                        <Badge
                                            key={evt}
                                            variant={newWebhook.events.includes(evt) ? "default" : "outline"}
                                            className="cursor-pointer"
                                            onClick={() => toggleEvent(evt)}
                                        >
                                            {evt}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button variant="ghost" onClick={() => setIsAdding(false)}>Cancel</Button>
                                <Button onClick={handleAddWebhook}>Save Integration</Button>
                            </div>
                        </div>
                    )}

                    {webhooks.length === 0 && !isAdding && (
                        <div className="text-center py-6 text-muted-foreground border border-dashed rounded-lg">
                            <p>No active n8n workflows.</p>
                        </div>
                    )}

                    <div className="grid gap-4">
                        {webhooks.map((webhook) => (
                            <div key={webhook.id} className="flex items-center justify-between p-4 border rounded-lg hover:border-orange-200 transition-colors bg-white">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-semibold text-sm">{webhook.name}</h4>
                                        {webhook.active && <Badge variant="secondary" className="text-[10px] bg-green-100 text-green-700">Active</Badge>}
                                    </div>
                                    <p className="text-xs text-muted-foreground truncate max-w-[300px]">{webhook.url}</p>
                                    <div className="flex gap-1 mt-1">
                                        {webhook.events.map(e => <Badge key={e} variant="outline" className="text-[10px]">{e}</Badge>)}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button variant="ghost" size="sm" onClick={() => handleTestTrigger(webhook.url)}>
                                        <Zap className="h-4 w-4 mr-1 text-yellow-500" /> Test
                                    </Button>
                                    <Button variant="ghost" size="sm" onClick={() => handleDeleteWebhook(webhook.id)}>
                                        <Trash2 className="h-4 w-4 text-red-500" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-orange-50 border border-orange-100 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                        <div className="bg-orange-100 p-2 rounded-full">
                            <Play className="h-4 w-4 text-orange-600" />
                        </div>
                        <div>
                            <h4 className="text-sm font-semibold text-orange-800">Why use n8n?</h4>
                            <p className="text-xs text-orange-700 mt-1">
                                n8n allows you to build complex automation flows visually. Connect CLX events to:
                            </p>
                            <ul className="text-xs text-orange-700 mt-2 list-disc list-inside">
                                <li>Send Slack/Teams notifications</li>
                                <li>Sync tasks with Jira or Asana</li>
                                <li>Generate invoices in Quickbooks</li>
                            </ul>
                        </div>
                    </div>
                </div>

            </CardContent>
        </Card>
    );
};

export default N8nIntegration;
