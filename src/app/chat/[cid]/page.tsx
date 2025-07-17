"use client";

import ChatContent from "@/components/chat/chat-content";
import { PromptBarInput } from "@/components/ui/prompt-bar-input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { useChatStore } from "@/store/chat.store";

export default function ChatPage() {
    const chatTitle = useChatStore(s => s.chatTitle);

    return (
        <main className="relative flex h-[100dvh] md:rounded-tl-md md:ml-2 md:mt-2 flex-col overflow-hidden bg-background-custom">
            <header className={cn("absolute top-0 z-10 flex h-14 w-full items-center gap-2 px-4", "border-b border-border-custom/50 backdrop-blur-xl")}>
                <SidebarTrigger className="-ml-1" />
                <div className={cn("text-foreground transition-opacity duration-700 truncate", chatTitle ? "opacity-100" : "opacity-0")}>
                    {chatTitle}
                </div>
            </header>

            <ChatContent />

            <div className="z-10 shrink-0 px-3 pb-1 md:px-5 md:pb-5">
                <PromptBarInput
                    className="mx-auto max-w-3xl"
                    placeholder="Ask anything"
                />
            </div>
        </main>
    )
}
