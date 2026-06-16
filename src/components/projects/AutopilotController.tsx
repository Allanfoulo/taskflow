import React, { useEffect, useState } from 'react';
import { useMutation } from "convex/react";
import { useAI } from "@/contexts/AIContext";
import { useProjects } from "@/contexts/ProjectContext";
import { useToast } from "@/components/ui/use-toast";
import { Bot } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";

interface AutopilotControllerProps {
    projectId: string;
    isActive: boolean;
    onDeactivate: () => void;
}

const AutopilotController: React.FC<AutopilotControllerProps> = ({ projectId, isActive, onDeactivate }) => {
    const { generateContent } = useAI();
    const { projects } = useProjects();
    const { toast } = useToast();
    const createSuggestion = useMutation(api.projectSuggestions.create);
    const [status, setStatus] = useState<string>("Initializing...");
    const [lastAction, setLastAction] = useState<string | null>(null);

    useEffect(() => {
        if (!isActive) return;

        const project = projects.find(p => p.id === projectId);
        if (!project) return;

        setStatus("Monitoring project activity...");

        // Simulate periodic checks (every 10 seconds for demo purposes)
        const interval = setInterval(async () => {
            const actions = [
                "Analyzing task velocity...",
                "Checking for blockers...",
                "Reviewing recent commits...",
                "Optimizing resource allocation..."
            ];
            const randomAction = actions[Math.floor(Math.random() * actions.length)];
            setStatus(randomAction);

            // 20% chance to trigger an AI suggestion
            if (Math.random() < 0.2) {
                setStatus("Generating optimization suggestion...");
                try {
                    const prompt = `Given a project named "${project.name}" with status "${project.status}" and ${project.tasks.length} tasks, generate a short, one-sentence proactive suggestion for the project manager. Avoid generic advice.`;
                    const suggestion = await generateContent(prompt);
                    if (suggestion) {
                        const normalizedSuggestion = suggestion.trim();
                        setLastAction(normalizedSuggestion);
                        await createSuggestion({
                            projectId: projectId as Id<"projects">,
                            source: "autopilot",
                            content: normalizedSuggestion,
                        });
                        toast({
                            title: "Autopilot Suggestion",
                            description: normalizedSuggestion,
                            duration: 5000,
                        });
                    }
                } catch (e) {
                    console.error("Autopilot error:", e);
                }
                setStatus("Monitoring project activity...");
            }

        }, 10000);

        return () => clearInterval(interval);
    }, [isActive, projectId, projects, generateContent, toast]);

    if (!isActive) return null;

    return (
        <Card className="mb-6 border-purple-500/30 bg-purple-500/5 dark:bg-purple-900/20 dark:border-purple-500/50 overflow-hidden animate-in fade-in slide-in-from-top-2">
            <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="bg-purple-500/20 p-2 rounded-full animate-pulse">
                        <Bot className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                        <h4 className="font-semibold text-sm flex items-center gap-2">
                            Autopilot Active
                            <Badge variant="outline" className="text-[10px] h-5 border-purple-500/30 text-purple-600">BETA</Badge>
                        </h4>
                        <p className="text-xs text-muted-foreground">{status}</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {lastAction && (
                        <div className="hidden md:block text-xs text-muted-foreground max-w-xs italic text-right border-r pr-4 mr-4 border-dashed border-gray-200 dark:border-gray-700">
                            "{lastAction}"
                        </div>
                    )}
                    <Button variant="ghost" size="sm" onClick={onDeactivate} className="text-xs hover:bg-red-500/10 hover:text-red-500 h-8">
                        Deactivate
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

export default AutopilotController;
