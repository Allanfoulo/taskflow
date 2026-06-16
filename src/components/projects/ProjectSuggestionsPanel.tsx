import { useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { formatDistanceToNow } from "date-fns/formatDistanceToNow";
import { Lightbulb, Plus, Sparkles, UserPen } from "lucide-react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";

const suggestionStatuses = ["new", "saved", "dismissed", "applied"] as const;

type SuggestionStatus = (typeof suggestionStatuses)[number];

const statusLabels: Record<SuggestionStatus, string> = {
  new: "New",
  saved: "Saved",
  dismissed: "Dismissed",
  applied: "Applied",
};

const statusBadgeClasses: Record<SuggestionStatus, string> = {
  new: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  saved: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  dismissed: "bg-slate-500/10 text-slate-600 border-slate-500/20",
  applied: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
};

const sourceBadgeClasses = {
  autopilot: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  manual: "bg-cyan-500/10 text-cyan-600 border-cyan-500/20",
};

interface ProjectSuggestionsPanelProps {
  projectId: string;
}

const ProjectSuggestionsPanel = ({ projectId }: ProjectSuggestionsPanelProps) => {
  const suggestions = useQuery(api.projectSuggestions.listByProject, {
    projectId: projectId as Id<"projects">,
  });
  const createSuggestion = useMutation(api.projectSuggestions.create);
  const updateSuggestionStatus = useMutation(api.projectSuggestions.updateStatus);

  const [activeStatus, setActiveStatus] = useState<SuggestionStatus>("new");
  const [manualSuggestion, setManualSuggestion] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUpdatingId, setIsUpdatingId] = useState<string | null>(null);

  const filteredSuggestions = useMemo(
    () => (suggestions || []).filter((suggestion) => suggestion.status === activeStatus),
    [activeStatus, suggestions],
  );

  const counts = useMemo(() => {
    const baseCounts: Record<SuggestionStatus, number> = {
      new: 0,
      saved: 0,
      dismissed: 0,
      applied: 0,
    };

    for (const suggestion of suggestions || []) {
      baseCounts[suggestion.status as SuggestionStatus] += 1;
    }

    return baseCounts;
  }, [suggestions]);

  const handleCreateManualSuggestion = async () => {
    const content = manualSuggestion.trim();
    if (!content) {
      toast({
        title: "Suggestion required",
        description: "Enter a suggestion before saving it.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await createSuggestion({
        projectId: projectId as Id<"projects">,
        source: "manual",
        content,
      });
      setManualSuggestion("");
      setActiveStatus("new");
      toast({
        title: "Suggestion added",
        description: "Your suggestion is now available in the panel.",
      });
    } catch (error) {
      console.error("Failed to create manual suggestion", error);
      toast({
        title: "Unable to save suggestion",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (suggestionId: string, status: SuggestionStatus) => {
    setIsUpdatingId(suggestionId);
    try {
      await updateSuggestionStatus({
        id: suggestionId as Id<"projectSuggestions">,
        status,
      });
    } catch (error) {
      console.error("Failed to update suggestion status", error);
      toast({
        title: "Unable to update suggestion",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingId(null);
    }
  };

  return (
    <Card>
      <CardHeader className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-amber-500" />
              Suggestions
            </CardTitle>
            <CardDescription>
              Autopilot ideas and manual suggestions for this project, with workflow states for triage.
            </CardDescription>
          </div>
          <Badge variant="outline">{(suggestions || []).length} total</Badge>
        </div>

        <div className="flex flex-col gap-3 rounded-lg border border-dashed p-3 sm:flex-row sm:items-center">
          <Input
            value={manualSuggestion}
            onChange={(event) => setManualSuggestion(event.target.value)}
            placeholder="Add a manual suggestion for this project"
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                void handleCreateManualSuggestion();
              }
            }}
          />
          <Button onClick={() => void handleCreateManualSuggestion()} disabled={isSubmitting}>
            <Plus className="mr-2 h-4 w-4" />
            {isSubmitting ? "Saving..." : "Add Suggestion"}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <Tabs value={activeStatus} onValueChange={(value) => setActiveStatus(value as SuggestionStatus)}>
          <TabsList className="grid w-full grid-cols-4">
            {suggestionStatuses.map((status) => (
              <TabsTrigger key={status} value={status}>
                {statusLabels[status]} ({counts[status]})
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {suggestions === undefined ? (
          <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
            Loading suggestions...
          </div>
        ) : filteredSuggestions.length > 0 ? (
          <div className="space-y-3">
            {filteredSuggestions.map((suggestion) => (
              <div key={suggestion.id} className="rounded-lg border p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        variant="outline"
                        className={
                          suggestion.source === "autopilot"
                            ? sourceBadgeClasses.autopilot
                            : sourceBadgeClasses.manual
                        }
                      >
                        {suggestion.source === "autopilot" ? (
                          <Sparkles className="mr-1 h-3 w-3" />
                        ) : (
                          <UserPen className="mr-1 h-3 w-3" />
                        )}
                        {suggestion.source === "autopilot" ? "Autopilot" : "Manual"}
                      </Badge>
                      <Badge variant="outline" className={statusBadgeClasses[suggestion.status as SuggestionStatus]}>
                        {statusLabels[suggestion.status as SuggestionStatus]}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(suggestion.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm leading-6">{suggestion.content}</p>
                  </div>

                  <div className="flex flex-wrap gap-2 sm:max-w-[260px] sm:justify-end">
                    {suggestionStatuses
                      .filter((status) => status !== suggestion.status)
                      .map((status) => (
                        <Button
                          key={status}
                          variant="outline"
                          size="sm"
                          disabled={isUpdatingId === suggestion.id}
                          onClick={() => void handleStatusChange(String(suggestion.id), status)}
                        >
                          Mark {statusLabels[status]}
                        </Button>
                      ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
            No {statusLabels[activeStatus].toLowerCase()} suggestions yet.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProjectSuggestionsPanel;
