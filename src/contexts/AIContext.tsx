import React, { createContext, useContext, useState, ReactNode } from "react";
import { GoogleGenAI } from "@google/genai";
import { useProjects } from "@/contexts/ProjectContext";

interface Message {
    role: "user" | "model";
    content: string;
}

interface AIContextType {
    messages: Message[];
    sendMessage: (message: string) => Promise<void>;
    generateContent: (prompt: string) => Promise<string>;
    isThinking: boolean;
    error: string | null;
    clearHistory: () => void;
}

const AIContext = createContext<AIContextType | undefined>(undefined);

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";
const ai = new GoogleGenAI({ apiKey: API_KEY });

export const AIProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isThinking, setIsThinking] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { projects } = useProjects();

    const retryWithBackoff = async <T,>(
        fn: () => Promise<T>,
        maxRetries: number = 3,
        initialDelay: number = 1000
    ): Promise<T> => {
        let retries = 0;
        while (true) {
            try {
                return await fn();
            } catch (error: any) {
                const isTransient =
                    error?.error?.code === 503 ||
                    error?.error?.code === 429 ||
                    error?.status === "UNAVAILABLE" ||
                    (error?.message && (error.message.includes("503") || error.message.includes("429")));

                if (!isTransient || retries >= maxRetries) {
                    throw error;
                }

                const delay = initialDelay * Math.pow(2, retries);
                console.warn(`AI API transient error. Retrying in ${delay}ms... (Attempt ${retries + 1}/${maxRetries})`);
                await new Promise(resolve => setTimeout(resolve, delay));
                retries++;
            }
        }
    };

    /** Serialize current project data into a context block for the AI */
    const buildProjectContext = (): string => {
        if (!projects || projects.length === 0) {
            return "\n\n[USER DATA] The user currently has no projects.";
        }

        const projectSummaries = projects.map(p => {
            const tasksByStatus = {
                backlog: p.tasks?.filter(t => t.status === "backlog").length || 0,
                todo: p.tasks?.filter(t => t.status === "todo").length || 0,
                inProgress: p.tasks?.filter(t => t.status === "inProgress").length || 0,
                inReview: p.tasks?.filter(t => t.status === "inReview").length || 0,
                done: p.tasks?.filter(t => t.status === "done").length || 0,
            };
            const overdueTasks = p.tasks?.filter(
                t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "done"
            ) || [];
            const taskDetails = p.tasks?.map(t => ({
                title: t.title,
                status: t.status,
                priority: t.priority,
                dueDate: t.dueDate || "none",
                assigneeId: t.assigneeId || "unassigned",
            })) || [];

            return {
                name: p.name,
                description: p.description,
                status: p.status,
                progress: `${p.progress}%`,
                dueDate: p.dueDate || "none",
                totalTasks: p.tasks?.length || 0,
                tasksByStatus,
                overdueTaskCount: overdueTasks.length,
                tasks: taskDetails,
                tags: p.tags || [],
                members: p.members || [],
            };
        });

        return `\n\n[USER DATA - LIVE FROM DATABASE]\nThe user has ${projects.length} project(s). Here is the full data:\n${JSON.stringify(projectSummaries, null, 2)}`;
    };

    const sendMessage = async (content: string) => {
        if (!API_KEY) {
            setError("Gemini API key is missing. Please add VITE_GEMINI_API_KEY to your .env file.");
            return;
        }

        try {
            setIsThinking(true);
            setError(null);
            const newUserMessage: Message = { role: "user", content };
            const newHistory = [...messages, newUserMessage];
            setMessages(newHistory);

            const formattedHistory = newHistory.map(m => ({
                role: m.role,
                parts: [{ text: m.content }]
            }));

            const projectContext = buildProjectContext();

            const response = await retryWithBackoff(() => ai.models.generateContent({
                model: "gemini-3-flash-preview",
                config: {
                    systemInstruction: `You are the TaskFlow Agent, a professional AI assistant for project management.

You have REAL-TIME ACCESS to the user's project data from their database. Use this data to answer questions accurately.

When the user asks about their projects, tasks, progress, or team — reference the actual data provided below.
Be specific: mention project names, task counts, statuses, overdue items, and progress percentages.

Formatting guidelines:
- Use **bold** for project names and important metrics
- Use bullet points and numbered lists for clarity
- Use tables (markdown) when comparing multiple projects
- Keep responses concise and actionable
- If the user asks for a summary, provide concrete numbers from their data

${projectContext}`
                },
                contents: formattedHistory
            }));

            const responseText = response.text;

            if (responseText) {
                const newModelMessage: Message = { role: "model", content: responseText };
                setMessages((prev) => [...prev, newModelMessage]);
            }
        } catch (err: any) {
            console.error("Error sending message to Gemini:", err);
            const errorMsg = err?.message?.includes("429")
                ? "Rate limit reached. Please wait a moment and try again."
                : err?.message?.includes("503")
                    ? "AI service is temporarily busy. Please try again shortly."
                    : "Something went wrong while generating a response. Please try again.";
            setError(errorMsg);
            // Add error message to chat so user sees it
            setMessages((prev) => [...prev, {
                role: "model",
                content: `⚠️ ${errorMsg}`
            }]);
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
        } catch (error) {
            console.error("Error generating content:", error);
            return "";
        }
    };

    const clearHistory = () => {
        setMessages([]);
        setError(null);
    };

    return (
        <AIContext.Provider value={{ messages, sendMessage, generateContent, isThinking, error, clearHistory }}>
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
