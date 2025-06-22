import ChatContent from "@/components/prompt-kit/chat-content";
import { PromptBarInput } from "@/components/ui/prompt-bar-input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

export default async function ChatPage({ params }: { params: Promise<{ cid: string }> }) {
    const { cid } = await params;
    console.log({ cid });

    return (
        <main className="relative flex h-screen md:rounded-tl-md md:ml-2 md:mt-2 flex-col overflow-hidden bg-background-custom">
            <header className={cn("absolute top-0 z-10 flex h-14 w-full items-center gap-2 px-4", "border-b border-border-custom/50 backdrop-blur-xl")}>
                <SidebarTrigger className="-ml-1" />
                <div className="text-foreground">Project roadmap discussion</div>
            </header>

            <ChatContent />

            <div className="z-10 shrink-0 px-3 pb-3 md:px-5 md:pb-5">
                <PromptBarInput
                    className="mx-auto max-w-3xl"
                    placeholder="Ask anything"
                />
            </div>
        </main>
    )
}
