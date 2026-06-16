import React, { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { useMutation, useQuery } from "convex/react";
import { GoogleGenAI } from "@google/genai";
import { Id } from "../../convex/_generated/dataModel";
import { api } from "../../convex/_generated/api";
import { useAuth } from "@/contexts/AuthContext";
import { useProjects } from "@/contexts/ProjectContext";

export interface Message {
    role: "user" | "model";
    content: string;
}

type DraftTask = {
    title: string;
    description: string;
    status: "backlog" | "todo" | "inProgress" | "inReview" | "done";
    priority: "low" | "medium" | "high" | "urgent";
    dueDate?: string;
};

type PendingProjectDraft = {
    projectName: string;
    description: string;
    workspaceId: string;
    dueDate?: string;
    tasks: DraftTask[];
};

type AIConversation = {
    id: string;
    title: string;
    status: "active" | "archived";
    pendingDraft: PendingProjectDraft | null;
    lastActivityAt: string;
};

type AIModelResponse = {
    type: "chat" | "clarification" | "create_project_plan";
    message: string;
    draft?: {
        projectName?: string;
        description?: string;
        workspaceId?: string;
        dueDate?: string;
        tasks?: Array<{
            title?: string;
            description?: string;
            status?: string;
            priority?: string;
            dueDate?: string;
        }>;
    };
};

interface AIContextType {
    messages: Message[];
    conversations: AIConversation[];
    activeConversationId: string | null;
    sendMessage: (message: string) => Promise<void>;
    generateContent: (prompt: string) => Promise<string>;
    isThinking: boolean;
    error: string | null;
    startNewConversation: () => Promise<void>;
    selectConversation: (conversationId: string) => void;
}

const AIContext = createContext<AIContextType | undefined>(undefined);

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";
const ai = new GoogleGenAI({ apiKey: API_KEY });
const CONFIRMATION_MESSAGES = new Set(["confirm", "confirm create", "yes, create it"]);
const TASK_STATUSES: DraftTask["status"][] = ["backlog", "todo", "inProgress", "inReview", "done"];
const TASK_PRIORITIES: DraftTask["priority"][] = ["low", "medium", "high", "urgent"];

const isConfirmationMessage = (content: string) =>
    CONFIRMATION_MESSAGES.has(content.trim().toLowerCase());

const stripCodeFences = (value: string) =>
    value
        .trim()
        .replace(/^```(?:json)?\s*/i, "")
        .replace(/\s*```$/, "");

const parseAIResponse = (value: string): AIModelResponse | null => {
    try {
        return JSON.parse(stripCodeFences(value)) as AIModelResponse;
    } catch (error) {
        console.warn("Failed to parse AI JSON response", error);
        return null;
    }
};

const formatDraftSummary = (
    draft: PendingProjectDraft,
    workspaceName: string,
    intro?: string,
    replacedExisting?: boolean,
) => {
    const taskLines =
        draft.tasks.length > 0
            ? draft.tasks
                .map((task, index) =>
                    `${index + 1}. **${task.title}** - ${task.priority} priority, ${task.status}${task.dueDate ? `, due ${task.dueDate}` : ""}${task.description ? `\n   - ${task.description}` : ""}`,
                )
                .join("\n")
            : "- No tasks planned yet";

    return `${replacedExisting ? "I replaced the previous pending draft.\n\n" : ""}${intro ? `${intro}\n\n` : ""}## Pending Project Draft

- **Project:** ${draft.projectName}
- **Workspace:** ${workspaceName}
- **Description:** ${draft.description || "No description provided"}
- **Due date:** ${draft.dueDate || "Not set"}
- **Task count:** ${draft.tasks.length}

### Planned Tasks
${taskLines}

Reply with \`confirm\` to create this project.`;
};

const normalizeDraft = (
    responseDraft: AIModelResponse["draft"],
    workspaceIds: string[],
): PendingProjectDraft | null => {
    if (!responseDraft?.projectName?.trim()) {
        return null;
    }

    const workspaceId = responseDraft.workspaceId?.trim();
    if (!workspaceId || !workspaceIds.includes(workspaceId)) {
        return null;
    }

    const tasks = (responseDraft.tasks || [])
        .filter((task) => task.title?.trim())
        .map((task) => ({
            title: task.title!.trim(),
            description: task.description?.trim() || "",
            status: TASK_STATUSES.includes(task.status as DraftTask["status"])
                ? (task.status as DraftTask["status"])
                : "todo",
            priority: TASK_PRIORITIES.includes(task.priority as DraftTask["priority"])
                ? (task.priority as DraftTask["priority"])
                : "medium",
            dueDate: task.dueDate?.trim() || undefined,
        }));

    return {
        projectName: responseDraft.projectName.trim(),
        description: responseDraft.description?.trim() || "",
        workspaceId,
        dueDate: responseDraft.dueDate?.trim() || undefined,
        tasks,
    };
};

const buildConversationTitle = (content: string) => {
    const collapsed = content.replace(/\s+/g, " ").trim();
    if (!collapsed) {
        return "New chat";
    }

    return collapsed.length > 48 ? `${collapsed.slice(0, 45).trimEnd()}...` : collapsed;
};

export const AIProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const { projects, workspaces, addProject, addTask } = useProjects();
    const [isThinking, setIsThinking] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
    const [pendingDraft, setPendingDraft] = useState<PendingProjectDraft | null>(null);
    const [requestedInitialConversation, setRequestedInitialConversation] = useState(false);

    const conversationRecords = useQuery(api.aiConversations.listConversations);
    const messageRecords = useQuery(api.aiConversations.listMessages, {
        conversationId: activeConversationId ? (activeConversationId as Id<"aiConversations">) : undefined,
    });
    const createConversation = useMutation(api.aiConversations.createConversation);
    const appendConversationMessage = useMutation(api.aiConversations.appendMessage);
    const updateConversationTitle = useMutation(api.aiConversations.updateConversationTitle);
    const updateConversationPendingDraft = useMutation(api.aiConversations.updatePendingDraft);

    const conversations = useMemo<AIConversation[]>(
        () => (conversationRecords || []).map((conversation) => ({
            id: String(conversation.id),
            title: conversation.title,
            status: conversation.status,
            pendingDraft: conversation.pendingDraft,
            lastActivityAt: conversation.lastActivityAt,
        })),
        [conversationRecords],
    );

    const messages = useMemo<Message[]>(
        () => (messageRecords || []).map((message) => ({
            role: message.role,
            content: message.content,
        })),
        [messageRecords],
    );

    const activeConversation = useMemo(
        () => conversations.find((conversation) => conversation.id === activeConversationId) || null,
        [activeConversationId, conversations],
    );

    const retryWithBackoff = async <T,>(
        fn: () => Promise<T>,
        maxRetries: number = 3,
        initialDelay: number = 1000,
    ): Promise<T> => {
        let retries = 0;
        while (true) {
            try {
                return await fn();
            } catch (retryError: any) {
                const isTransient =
                    retryError?.error?.code === 503 ||
                    retryError?.error?.code === 429 ||
                    retryError?.status === "UNAVAILABLE" ||
                    (retryError?.message && (retryError.message.includes("503") || retryError.message.includes("429")));

                if (!isTransient || retries >= maxRetries) {
                    throw retryError;
                }

                const delay = initialDelay * Math.pow(2, retries);
                console.warn(`AI API transient error. Retrying in ${delay}ms... (Attempt ${retries + 1}/${maxRetries})`);
                await new Promise(resolve => setTimeout(resolve, delay));
                retries += 1;
            }
        }
    };

    const buildProjectContext = (): string => {
        const workspaceSummaries = workspaces.map((workspace) => ({
            id: workspace.id,
            name: workspace.name,
            color: workspace.color,
        }));

        if (!projects || projects.length === 0) {
            return `\n\n[USER DATA]\nAvailable workspaces:\n${JSON.stringify(workspaceSummaries, null, 2)}\nThe user currently has no projects.`;
        }

        const projectSummaries = projects.map((project) => {
            const tasksByStatus = {
                backlog: project.tasks?.filter(task => task.status === "backlog").length || 0,
                todo: project.tasks?.filter(task => task.status === "todo").length || 0,
                inProgress: project.tasks?.filter(task => task.status === "inProgress").length || 0,
                inReview: project.tasks?.filter(task => task.status === "inReview").length || 0,
                done: project.tasks?.filter(task => task.status === "done").length || 0,
            };

            const overdueTasks = project.tasks?.filter(
                task => task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "done",
            ) || [];

            return {
                name: project.name,
                description: project.description,
                status: project.status,
                progress: `${project.progress}%`,
                dueDate: project.dueDate || "none",
                workspaceId: project.workspace,
                totalTasks: project.tasks?.length || 0,
                tasksByStatus,
                overdueTaskCount: overdueTasks.length,
                tags: project.tags || [],
                members: project.members || [],
            };
        });

        return `\n\n[USER DATA - LIVE FROM DATABASE]\nAvailable workspaces:\n${JSON.stringify(workspaceSummaries, null, 2)}\nThe user has ${projects.length} project(s). Here is the full data:\n${JSON.stringify(projectSummaries, null, 2)}`;
    };

    const appendStoredMessage = async (
        conversationId: string,
        role: Message["role"],
        content: string,
    ) => {
        await appendConversationMessage({
            conversationId: conversationId as Id<"aiConversations">,
            role,
            content,
        });
    };

    const persistPendingDraft = async (
        conversationId: string,
        draft: PendingProjectDraft | null,
    ) => {
        await updateConversationPendingDraft({
            conversationId: conversationId as Id<"aiConversations">,
            pendingDraft: draft,
        });
    };

    const createAndActivateConversation = async () => {
        const createdConversationId = await createConversation({});
        const nextConversationId = String(createdConversationId);
        setActiveConversationId(nextConversationId);
        setPendingDraft(null);
        setError(null);
        return nextConversationId;
    };

    const ensureActiveConversation = async () => {
        if (activeConversationId) {
            return activeConversationId;
        }

        return await createAndActivateConversation();
    };

    useEffect(() => {
        if (!user) {
            setActiveConversationId(null);
            setPendingDraft(null);
            setRequestedInitialConversation(false);
            return;
        }

        if (conversationRecords === undefined) {
            return;
        }

        if (activeConversationId && conversations.some((conversation) => conversation.id === activeConversationId)) {
            return;
        }

        if (conversations.length > 0) {
            setActiveConversationId(conversations[0].id);
            setRequestedInitialConversation(false);
            return;
        }

        if (!requestedInitialConversation) {
            setRequestedInitialConversation(true);
            void createAndActivateConversation();
        }
    }, [activeConversationId, conversationRecords, conversations, requestedInitialConversation, user]);

    useEffect(() => {
        setPendingDraft(activeConversation?.pendingDraft || null);
    }, [activeConversation]);

    const handleConfirmedCreation = async (conversationId: string) => {
        if (!pendingDraft) {
            await appendStoredMessage(conversationId, "model", "There is no pending project draft to create yet.");
            return;
        }

        const workspace = workspaces.find((item) => item.id === pendingDraft.workspaceId);
        if (!workspace) {
            setPendingDraft(null);
            await persistPendingDraft(conversationId, null);
            await appendStoredMessage(conversationId, "model", "The selected workspace is no longer available, so I cleared the pending draft. Please try again.");
            return;
        }

        const projectId = await addProject({
            name: pendingDraft.projectName,
            description: pendingDraft.description,
            workspace: pendingDraft.workspaceId,
            dueDate: pendingDraft.dueDate,
            status: "active",
            progress: 0,
        }, { suppressToast: true });

        if (!projectId) {
            setPendingDraft(null);
            await persistPendingDraft(conversationId, null);
            await appendStoredMessage(conversationId, "model", `I couldn't create **${pendingDraft.projectName}** in **${workspace.name}**. No tasks were created.`);
            return;
        }

        let createdTasks = 0;
        let failedTasks = 0;

        for (const task of pendingDraft.tasks) {
            const createdTaskId = await addTask({
                projectId,
                title: task.title,
                description: task.description,
                status: task.status,
                priority: task.priority,
                dueDate: task.dueDate,
                tags: [],
                subtasks: [],
            }, { suppressToast: true });

            if (createdTaskId) {
                createdTasks += 1;
            } else {
                failedTasks += 1;
            }
        }

        setPendingDraft(null);
        await persistPendingDraft(conversationId, null);

        if (failedTasks === 0) {
            await appendStoredMessage(
                conversationId,
                "model",
                `Created **${pendingDraft.projectName}** in **${workspace.name}** with ${createdTasks} task${createdTasks !== 1 ? "s" : ""}.`,
            );
            return;
        }

        await appendStoredMessage(
            conversationId,
            "model",
            `Created **${pendingDraft.projectName}** in **${workspace.name}**, but only ${createdTasks} task${createdTasks !== 1 ? "s" : ""} succeeded and ${failedTasks} failed.`,
        );
    };

    const sendMessage = async (content: string) => {
        const trimmedContent = content.trim();
        if (!trimmedContent) {
            return;
        }

        setError(null);

        const conversationId = await ensureActiveConversation();
        const currentMessages = messageRecords || [];
        const currentTitle = activeConversation?.title || "New chat";
        const newUserMessage: Message = { role: "user", content: trimmedContent };

        await appendStoredMessage(conversationId, "user", trimmedContent);

        if (currentMessages.length === 0 && currentTitle === "New chat") {
            await updateConversationTitle({
                conversationId: conversationId as Id<"aiConversations">,
                title: buildConversationTitle(trimmedContent),
            });
        }

        if (isConfirmationMessage(trimmedContent)) {
            setIsThinking(true);
            try {
                await handleConfirmedCreation(conversationId);
            } finally {
                setIsThinking(false);
            }
            return;
        }

        if (!API_KEY) {
            const missingKeyMessage = "Gemini API key is missing. Please add VITE_GEMINI_API_KEY to your .env file.";
            setError(missingKeyMessage);
            await appendStoredMessage(conversationId, "model", missingKeyMessage);
            return;
        }

        try {
            setIsThinking(true);

            const formattedHistory = [...currentMessages.map((message) => ({
                role: message.role,
                parts: [{ text: message.content }],
            })), {
                role: newUserMessage.role,
                parts: [{ text: newUserMessage.content }],
            }];

            const projectContext = buildProjectContext();

            const response = await retryWithBackoff(() => ai.models.generateContent({
                model: "gemini-3-flash-preview",
                config: {
                    systemInstruction: `You are the TaskFlow Agent, a professional AI assistant for project management.

You have real-time access to the user's project data from their database. Use this data to answer questions accurately.

When the user asks about their projects, tasks, progress, or team, reference the actual data provided below.
Be specific: mention project names, task counts, statuses, overdue items, and progress percentages.

If the user asks you to create a project, tasks, or both, do not claim that you already created anything.
Instead, return a machine-readable draft plan for confirmation first.

Return only valid JSON using this exact top-level shape:
{
  "type": "chat" | "clarification" | "create_project_plan",
  "message": "string",
  "draft": {
    "projectName": "string",
    "description": "string",
    "workspaceId": "string",
    "dueDate": "YYYY-MM-DD",
    "tasks": [
      {
        "title": "string",
        "description": "string",
        "status": "backlog" | "todo" | "inProgress" | "inReview" | "done",
        "priority": "low" | "medium" | "high" | "urgent",
        "dueDate": "YYYY-MM-DD"
      }
    ]
  }
}

Rules:
- Use "create_project_plan" only when the user clearly wants real creation.
- Use "clarification" if the request is too ambiguous to draft safely.
- Use "chat" for all normal informational replies.
- When creating a draft, choose a workspaceId only from the provided workspace list.
- If no valid workspaceId is obvious, ask a clarification question instead of guessing.
- Keep "message" concise and useful.
- Never wrap the JSON in commentary outside the JSON object.

${projectContext}`,
                },
                contents: formattedHistory,
            }));

            const responseText = response.text;
            if (!responseText) {
                return;
            }

            const parsed = parseAIResponse(responseText);
            if (!parsed) {
                await appendStoredMessage(conversationId, "model", responseText);
                return;
            }

            if (parsed.type === "create_project_plan") {
                const normalizedDraft = normalizeDraft(parsed.draft, workspaces.map((workspace) => workspace.id));
                if (!normalizedDraft) {
                    const fallbackMessage =
                        parsed.message || "I need a little more detail before I can prepare a project draft.";
                    await appendStoredMessage(conversationId, "model", fallbackMessage);
                    return;
                }

                const workspace = workspaces.find((item) => item.id === normalizedDraft.workspaceId);
                const replacedExisting = pendingDraft !== null;
                setPendingDraft(normalizedDraft);
                await persistPendingDraft(conversationId, normalizedDraft);
                await appendStoredMessage(
                    conversationId,
                    "model",
                    formatDraftSummary(
                        normalizedDraft,
                        workspace?.name || "Selected workspace",
                        parsed.message,
                        replacedExisting,
                    ),
                );
                return;
            }

            await appendStoredMessage(conversationId, "model", parsed.message || responseText);
        } catch (sendError: any) {
            console.error("Error sending message to Gemini:", sendError);
            const errorMsg = sendError?.message?.includes("429")
                ? "Rate limit reached. Please wait a moment and try again."
                : sendError?.message?.includes("503")
                    ? "AI service is temporarily busy. Please try again shortly."
                    : "Something went wrong while generating a response. Please try again.";

            setError(errorMsg);
            await appendStoredMessage(conversationId, "model", `Warning: ${errorMsg}`);
        } finally {
            setIsThinking(false);
        }
    };

    const generateContent = async (prompt: string): Promise<string> => {
        if (!API_KEY) {
            console.error("Gemini API key is missing.");
            return "";
        }

        try {
            const response = await retryWithBackoff(() => ai.models.generateContent({
                model: "gemini-3-flash-preview",
                contents: prompt,
            }));
            return response.text || "";
        } catch (generationError) {
            console.error("Error generating content:", generationError);
            return "";
        }
    };

    const startNewConversation = async () => {
        await createAndActivateConversation();
    };

    const selectConversation = (conversationId: string) => {
        setActiveConversationId(conversationId);
        setError(null);
    };

    return (
        <AIContext.Provider
            value={{
                messages,
                conversations,
                activeConversationId,
                sendMessage,
                generateContent,
                isThinking,
                error,
                startNewConversation,
                selectConversation,
            }}
        >
            {children}
        </AIContext.Provider>
    );
};

export const useAI = () => {
    const context = useContext(AIContext);
    if (context === undefined) {
        throw new Error("useAI must be used within an AIProvider");
    }
    return context;
};
