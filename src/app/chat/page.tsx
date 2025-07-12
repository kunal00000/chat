import ResetChatEffects from "@/components/common/reset-chat-effect";
import { PromptBarInput } from "@/components/ui/prompt-bar-input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

export default async function ChatHomePage() {
    const promptSuggestions = [
        "What are you working on?",
        "What's on your mind today?",
        "Hey, ready to dive in?",
        "How can I help?",
        "Got a question? Ask away!",
        "Need some inspiration?",
        "What's your next big idea?",
        "Share your thoughts!",
        "Let's get started!",
    ];

    const randomSuggestion = promptSuggestions[Math.floor(Math.random() * promptSuggestions.length)];

    return (
        <main className="relative flex h-[100dvh] md:rounded-tl-md md:ml-2 md:mt-2 flex-col overflow-hidden bg-background-custom">
            <header className={cn("absolute top-0 z-10 flex h-14 w-full items-center gap-2 px-4")}>
                <SidebarTrigger className="-ml-1" />
            </header>

            <div
                className="absolute inset-x-0 top-1/2 mx-auto flex max-w-3xl -translate-y-1/2 flex-col items-center justify-center gap-4 px-3 pb-3 md:px-5 md:pb-5">
                <div className="mb-8 text-4xl text-foreground-custom text-center">{randomSuggestion}</div>
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
