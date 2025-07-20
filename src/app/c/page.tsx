"use client";

import RandomHeaders from "@/components/chat/random-headers";
import ResetChatEffects from "@/components/common/reset-chat-effect";
import { PromptBarInput } from "@/components/ui/prompt-bar-input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

export default function ChatHomePage() {
    const isMobile = useIsMobile();

    return (
        <main className="relative flex h-[100dvh] md:rounded-tl-md md:ml-2 md:mt-2 flex-col overflow-hidden bg-background-custom">
            <header className={cn("absolute top-0 z-10 flex h-14 w-full items-center gap-2 px-4")}>
                <SidebarTrigger className="-ml-1" />
            </header>

            <div
                className="absolute md:top-1/4 inset-x-0 h-full md:h-auto mx-auto flex max-w-3xl flex-col items-center justify-end md:justify-center gap-4 px-3 pb-3 md:px-5 md:pb-5">
                <RandomHeaders className="absolute top-2/5 -translate-y-1/2 md:relative md:top-auto md:translate-y-0" />
                <PromptBarInput
                    className="w-full"
                    showSuggestions={!isMobile}
                    navigateToChat={true}
                />
            </div>
            <ResetChatEffects />
        </main>
    )
}
