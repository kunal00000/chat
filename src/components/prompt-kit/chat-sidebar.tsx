"use client"

import { Button } from "@/components/ui/button"
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton
} from "@/components/ui/sidebar"
import { CONVERSATION_HISTORY } from "@/constants/prompt-kit.constants"
import {
    PlusIcon,
    Search
} from "lucide-react"
import { useRouter } from "next/navigation"

export function ChatSidebar() {
    const nextRouter = useRouter()

    return (
        <Sidebar className="border-none">
            <SidebarHeader className="flex flex-row items-center justify-between gap-2 px-2 py-4 bg-border-custom/50">
                <div className="flex flex-row items-center gap-2 px-2">
                    <div className="bg-primary/10 size-8 rounded-md"></div>
                    <div className="text-md font-medium text-primary tracking-tight">
                        vukchat
                    </div>
                </div>
                <Button variant="ghost" className="size-8">
                    <Search className="size-4" />
                </Button>
            </SidebarHeader>
            <SidebarContent className="pt-4 bg-border-custom/50">
                <div className="px-4">
                    <Button
                        variant="outline"
                        className="mb-4 flex w-full items-center gap-2 border-none shadow-none bg-background-custom hover:bg-background-custom"
                        onClick={() => nextRouter.push("/")}
                    >
                        <PlusIcon className="size-4" />
                        <span>New Chat</span>
                    </Button>
                </div>
                {CONVERSATION_HISTORY.map((group) => (
                    <SidebarGroup key={group.period}>
                        <SidebarGroupLabel>{group.period}</SidebarGroupLabel>
                        <SidebarMenu>
                            {group.conversations.map((conversation) => (
                                <SidebarMenuButton key={conversation.id}>
                                    <span>{conversation.title}</span>
                                </SidebarMenuButton>
                            ))}
                        </SidebarMenu>
                    </SidebarGroup>
                ))}
            </SidebarContent>
        </Sidebar>
    )
}