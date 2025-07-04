import ResetChatEffects from "@/components/common/reset-chat-effect";
import { PromptBarInput } from "@/components/ui/prompt-bar-input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

export default async function ChatHomePage() {

    return (
        <main className="relative flex h-[100dvh] md:rounded-tl-md md:ml-2 md:mt-2 flex-col overflow-hidden bg-background-custom">
            <header className={cn("absolute top-0 z-10 flex h-14 w-full items-center gap-2 px-4", "border-b border-border-custom/50 backdrop-blur-xl")}>
                <SidebarTrigger className="-ml-1" />
                <div className="text-foreground">Project roadmap discussion</div>
            </header>

            <div
                className="absolute inset-x-0 top-1/2 mx-auto flex max-w-3xl -translate-y-1/2 flex-col items-center justify-center gap-4 px-3 pb-3 md:px-5 md:pb-5">
                <PromptBarInput
                    className="w-full"
                    showSuggestions={true}
                    navigateToChat={true}
                />
            </div>
            <ResetChatEffects />
        </main>
    )
}
