import { ChatSidebar } from '@/components/prompt-kit/chat-sidebar'
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
        </SidebarProvider>
    )
}
