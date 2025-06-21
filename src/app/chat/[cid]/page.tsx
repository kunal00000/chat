import ChatContent from "@/components/prompt-kit/chat-content";
import { PromptBarInput } from "@/components/ui/prompt-bar-input";
import { SidebarTrigger } from "@/components/ui/sidebar";

export default async function ChatPage({ params }: { params: Promise<{ cid: string }> }) {
    const { cid } = await params;
    console.log({ cid });

    return (
        <main className="flex h-screen flex-col overflow-hidden bg-background-custom">
            <header className="z-10 flex h-16 w-full shrink-0 items-center gap-2 border-b px-4 border-border-custom/50">
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
