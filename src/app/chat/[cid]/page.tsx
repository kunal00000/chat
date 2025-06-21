import { SidebarTrigger } from "@/components/ui/sidebar";

export default async function ChatPage({ params }: { params: Promise<{ cid: string }> }) {
    const { cid } = await params;
    console.log({ cid });

    return (
        <main className="flex h-screen flex-col overflow-hidden">
            <header className="bg-background z-10 flex h-16 w-full shrink-0 items-center gap-2 border-b px-4">
                <SidebarTrigger className="-ml-1" />
                <div className="text-foreground">Project roadmap discussion</div>
            </header>
        </main>
    )
}
