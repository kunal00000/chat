import { ChatSidebar } from '@/components/chat/chat-sidebar'
import FirstLoadEffect from '@/components/common/first-load-effect'
import TooltipWrapper from '@/components/common/tooltip-wrapper'
import { Button } from '@/components/ui/button'
import GitHubIcon from '@/components/ui/icons/github'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import React from 'react'

export default function ChatLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <SidebarProvider>
            <ChatSidebar />
            <SidebarInset className='bg-border-custom/50'>
                {children}
            </SidebarInset>
            <TooltipWrapper tooltip="View on GitHub" side="left">
                <Button
                    variant="ghost"
                    className="fixed bottom-4 right-4 hidden md:block size-10 text-black hover:text-black/70 bg-white/80 hover:bg-white/90 shadow-none rounded-full z-50"
                    asChild
                >
                    <a
                        href="https://github.com/kunal00000/chat"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <GitHubIcon className="size-5" />
                    </a>
                </Button>
            </TooltipWrapper>
            <FirstLoadEffect />
        </SidebarProvider>
    )
}
