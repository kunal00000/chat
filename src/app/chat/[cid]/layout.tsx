import { ChatSidebar } from '@/components/prompt-kit/full-app'
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
            <SidebarInset>
                {children}
            </SidebarInset>
        </SidebarProvider>
    )
}
