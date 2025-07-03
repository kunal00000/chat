"use client"

import { Button, buttonVariants } from "@/components/ui/button"
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import { PATHS } from "@/types-constants-schemas/client/chat.constants"
import { CONVERSATION_HISTORY } from "@/types-constants-schemas/client/prompt-kit.constants"
import {
    PlusIcon,
    Search
} from "lucide-react"
import Link from "next/link"
import Logo from "../ui/icons/logo"

export function ChatSidebar() {
    return (
        <Sidebar className="border-none">
            <SidebarHeader className="flex flex-row items-center justify-between gap-2 p-4 bg-border-custom/50">
                <Link href={PATHS.NEW_CHAT}>
                    <Logo className="size-8 rounded-md" />
                </Link>
                <Button variant="ghost" className="size-8">
                    <Search className="size-4" />
                </Button>
            </SidebarHeader>
            <SidebarContent className="pt-4 bg-border-custom/50">
                <div className="px-4">
                    <Link href={PATHS.NEW_CHAT} className={cn(buttonVariants({ variant: "outline" }), "mb-4 flex w-full items-center gap-2 border-none shadow-none bg-background-custom hover:bg-background-custom")}>
                        <PlusIcon className="size-4" />
                        <span>New Chat</span>
                    </Link>
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