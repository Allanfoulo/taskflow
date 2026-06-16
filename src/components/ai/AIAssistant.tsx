import React, { useState, useRef, useEffect } from "react";
import { formatDistanceToNow } from "date-fns/formatDistanceToNow";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useAI } from "@/contexts/AIContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Bot,
    Send,
    Minus,
    Sparkles,
    Plus,
    History,
} from "lucide-react";
import { cn } from "@/lib/utils";

const normalizeMarkdownTables = (content: string) => {
    const lines = content.split("\n");
    const normalized: string[] = [];

    for (let i = 0; i < lines.length; i += 1) {
        const line = lines[i];
        const nextLine = lines[i + 1] ?? "";
        const isTableHeader = line.trim().startsWith("|") && nextLine.trim().match(/^\|?[\s:-|]+\|?$/);

        if (isTableHeader && normalized.length > 0 && normalized[normalized.length - 1].trim() !== "") {
            normalized.push("");
        }

        normalized.push(line);

        const currentLineLooksLikeTable = line.trim().startsWith("|");
        const nextLineLooksLikeTable = nextLine.trim().startsWith("|");

        if (currentLineLooksLikeTable && !nextLineLooksLikeTable && nextLine.trim() !== "") {
            normalized.push("");
        }
    }

    return normalized.join("\n");
};

const AIAssistant = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState("");
    const {
        messages,
        conversations,
        activeConversationId,
        sendMessage,
        isThinking,
        startNewConversation,
        selectConversation,
    } = useAI();
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isThinking]);

    const handleSend = async () => {
        if (!input.trim() || isThinking) return;
        const msg = input;
        setInput("");
        await sendMessage(msg);
    };

    if (!isOpen) {
        return (
            <Button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-2xl animate-bounce hover:animate-none group bg-primary p-0"
            >
                <Sparkles className="h-6 w-6 text-primary-foreground group-hover:scale-110 transition-transform" />
            </Button>
        );
    }

    return (
        <Card className="fixed bottom-6 right-6 w-96 h-[600px] flex flex-col shadow-2xl glass-card border-primary/20 animate-scale-in z-50">
            <CardHeader className="p-4 border-b flex flex-row items-center justify-between bg-primary/5">
                <div className="flex items-center gap-2">
                    <div className="bg-primary p-2 rounded-xl">
                        <Bot className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <div>
                        <CardTitle className="text-sm font-bold">TaskFlow Agent</CardTitle>
                        <div className="flex items-center gap-1">
                            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">Online</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => void startNewConversation()}
                        className="h-8 w-8 text-muted-foreground hover:text-primary"
                    >
                        <Plus className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="h-8 w-8">
                        <Minus className="h-4 w-4" />
                    </Button>
                </div>
            </CardHeader>

            <div className="border-b bg-background/40 px-4 py-3">
                <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        <History className="h-3.5 w-3.5" />
                        Recent chats
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-[11px]"
                        onClick={() => void startNewConversation()}
                    >
                        <Plus className="mr-1 h-3.5 w-3.5" />
                        New chat
                    </Button>
                </div>

                <div className="flex gap-2 overflow-x-auto pb-1">
                    {conversations.map((conversation) => (
                        <button
                            key={conversation.id}
                            onClick={() => selectConversation(conversation.id)}
                            className={cn(
                                "min-w-[148px] rounded-xl border px-3 py-2 text-left transition-colors",
                                activeConversationId === conversation.id
                                    ? "border-primary bg-primary/10"
                                    : "border-border bg-background hover:bg-muted/60",
                            )}
                        >
                            <div className="truncate text-xs font-medium">{conversation.title}</div>
                            <div className="mt-1 text-[10px] text-muted-foreground">
                                {formatDistanceToNow(new Date(conversation.lastActivityAt), { addSuffix: true })}
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            <ScrollArea className="flex-1 p-4 overflow-y-auto" ref={scrollRef}>
                <div className="space-y-4">
                    {messages.length === 0 && (
                        <div className="text-center py-8 space-y-4">
                            <div className="bg-primary/10 w-12 h-12 rounded-2xl flex items-center justify-center mx-auto">
                                <Sparkles className="h-6 w-6 text-primary" />
                            </div>
                            <div className="space-y-1">
                                <p className="font-semibold text-sm">How can I help you today?</p>
                                <p className="text-xs text-muted-foreground">Try asking about your projects, tasks, or for a summary.</p>
                            </div>
                            <div className="grid grid-cols-1 gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-[10px] justify-start h-8 bg-background/50"
                                    onClick={() => sendMessage("Give me a summary of my active projects.")}
                                >
                                    "Summarize my active projects"
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-[10px] justify-start h-8 bg-background/50"
                                    onClick={() => sendMessage("Generate a task list for a new marketing campaign.")}
                                >
                                    "Generate a task list for marketing"
                                </Button>
                            </div>
                        </div>
                    )}

                    {messages.map((m, i) => (
                        <div
                            key={i}
                            className={cn(
                                "flex flex-col gap-2 max-w-[85%] animate-fade-in",
                                m.role === "user" ? "ml-auto items-end" : "mr-auto items-start"
                            )}
                        >
                            <div
                                className={cn(
                                    "p-3 rounded-2xl text-sm shadow-sm overflow-hidden",
                                    m.role === "user"
                                        ? "bg-primary text-primary-foreground rounded-tr-none"
                                        : "bg-secondary text-secondary-foreground rounded-tl-none border border-border"
                                )}
                            >
                                <ReactMarkdown
                                    remarkPlugins={[remarkGfm]}
                                    components={{
                                        p: ({ children }) => <p className="mb-3 last:mb-0 leading-6">{children}</p>,
                                        ul: ({ children }) => <ul className="mb-3 list-disc pl-5 space-y-1">{children}</ul>,
                                        ol: ({ children }) => <ol className="mb-3 list-decimal pl-5 space-y-1">{children}</ol>,
                                        li: ({ children }) => <li className="leading-6">{children}</li>,
                                        table: ({ children }) => (
                                            <div className="mb-3 overflow-x-auto rounded-lg border border-border/70">
                                                <table className="min-w-full border-collapse text-left text-xs">
                                                    {children}
                                                </table>
                                            </div>
                                        ),
                                        thead: ({ children }) => <thead className="bg-background/40">{children}</thead>,
                                        th: ({ children }) => (
                                            <th className="border-b border-border/70 px-2 py-1.5 font-semibold align-top">
                                                {children}
                                            </th>
                                        ),
                                        td: ({ children }) => (
                                            <td className="border-t border-border/50 px-2 py-1.5 align-top">
                                                {children}
                                            </td>
                                        ),
                                        code: ({ children }) => (
                                            <code className="rounded bg-background/50 px-1 py-0.5 text-[0.85em]">
                                                {children}
                                            </code>
                                        ),
                                    }}
                                >
                                    {normalizeMarkdownTables(m.content)}
                                </ReactMarkdown>
                            </div>
                        </div>
                    ))}

                    {isThinking && (
                        <div className="flex items-center gap-2 text-muted-foreground animate-pulse">
                            <Bot className="h-4 w-4" />
                            <div className="flex gap-1">
                                <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40 animate-bounce" />
                                <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40 animate-bounce delay-150" />
                                <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40 animate-bounce delay-300" />
                            </div>
                        </div>
                    )}
                </div>
            </ScrollArea>

            <CardFooter className="p-4 border-t bg-background/50">
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleSend();
                    }}
                    className="flex w-full items-center space-x-2"
                >
                    <Input
                        placeholder="Ask anything..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        disabled={isThinking}
                        className="flex-1 bg-background/80 focus-visible:ring-primary h-10 border-none shadow-inner"
                    />
                    <Button type="submit" size="icon" disabled={isThinking || !input.trim()} className="h-10 w-10 shadow-lg">
                        <Send className="h-4 w-4" />
                    </Button>
                </form>
            </CardFooter>
        </Card>
    );
};

export default AIAssistant;
