"use client"

import { Button } from "@/components/ui/button"
import {
    ChatContainerContent,
    ChatContainerRoot,
} from "@/components/ui/chat-container"
import {
    Message,
    MessageAction,
    MessageActions,
    MessageContent,
} from "@/components/ui/message"
import {
    PromptInput,
    PromptInputAction,
    PromptInputActions,
    PromptInputTextarea,
} from "@/components/ui/prompt-input"
import { ScrollButton } from "@/components/ui/scroll-button"
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarInset,
    SidebarMenu,
    SidebarMenuButton,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import { useChatStore } from "@/store/chat.store"
import { motion } from "framer-motion"
import {
    ArrowUp,
    Copy,
    Globe,
    Mic,
    MoreHorizontal,
    Pencil,
    Plus,
    PlusIcon,
    Search,
    ThumbsDown,
    ThumbsUp,
    Trash,
} from "lucide-react"
import { useRef } from "react"

export function ChatSidebar() {
    const conversationHistory = useChatStore((state) => state.conversationHistory)

    return (
        <Sidebar>
            <SidebarHeader className="flex flex-row items-center justify-between gap-2 px-2 py-4">
                <div className="flex flex-row items-center gap-2 px-2">
                    <div className="bg-primary/10 size-8 rounded-md"></div>
                    <div className="text-md font-base text-primary tracking-tight">
                        zola.chat
                    </div>
                </div>
                <Button variant="ghost" className="size-8">
                    <Search className="size-4" />
                </Button>
            </SidebarHeader>
            <SidebarContent className="pt-4">
                <div className="px-4">
                    <Button
                        variant="outline"
                        className="mb-4 flex w-full items-center gap-2"
                    >
                        <PlusIcon className="size-4" />
                        <span>New Chat</span>
                    </Button>
                </div>
                {conversationHistory.map((group) => (
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

function handlePromptInputValueChange(value: string) {
    useChatStore.setState({
        prompt: value,
    })
}

export function ChatContent() {
    const { prompt, isPromptBarLoading, chatMessages } = useChatStore((state) => ({
        prompt: state.prompt,
        isPromptBarLoading: state.isPromptBarLoading,
        chatMessages: state.chatMessages,
    }))

    const chatContainerRef = useRef<HTMLDivElement>(null)

    const handleSubmit = () => {
        if (!prompt.trim()) return

        useChatStore.setState({
            prompt: "",
            isPromptBarLoading: true,
        })

        // Add user message immediately
        const newUserMessage = {
            id: chatMessages.length + 1,
            role: "user" as const,
            content: prompt.trim(),
        }

        useChatStore.setState({
            chatMessages: [...chatMessages, newUserMessage],
        })

        // Simulate API response
        setTimeout(() => {
            const assistantResponse = {
                id: chatMessages.length + 2,
                role: "assistant" as const,
                content: `This is a response to: "${prompt.trim()}"`,
            }

            useChatStore.setState({
                chatMessages: [...chatMessages, newUserMessage, assistantResponse],
                isPromptBarLoading: false,
            })
        }, 1500)
    }

    return (
        <main className="flex h-screen flex-col overflow-hidden">
            <header className="bg-background z-10 flex h-16 w-full shrink-0 items-center gap-2 border-b px-4">
                <SidebarTrigger className="-ml-1" />
                <div className="text-foreground">Project roadmap discussion</div>
            </header>

            <div ref={chatContainerRef} className="relative flex-1 overflow-y-auto">
                <ChatContainerRoot className="h-full">
                    <ChatContainerContent className="space-y-0 px-5 py-12">
                        {chatMessages.map((message, index) => {
                            const isAssistant = message.role === "assistant"
                            const isLastMessage = index === chatMessages.length - 1

                            return (
                                <Message
                                    key={message.id}
                                    className={cn(
                                        "mx-auto flex w-full max-w-3xl flex-col gap-2 px-6",
                                        isAssistant ? "items-start" : "items-end"
                                    )}
                                >
                                    {isAssistant ? (
                                        <div className="group flex w-full flex-col gap-0">
                                            <MessageContent
                                                className="text-foreground prose flex-1 rounded-lg bg-transparent p-0"
                                                markdown
                                            >
                                                {message.content}
                                            </MessageContent>
                                            <MessageActions
                                                className={cn(
                                                    "-ml-2.5 flex gap-0 opacity-0 transition-opacity duration-150 group-hover:opacity-100",
                                                    isLastMessage && "opacity-100"
                                                )}
                                            >
                                                <MessageAction tooltip="Copy" delayDuration={100}>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="rounded-full"
                                                    >
                                                        <Copy />
                                                    </Button>
                                                </MessageAction>
                                                <MessageAction tooltip="Upvote" delayDuration={100}>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="rounded-full"
                                                    >
                                                        <ThumbsUp />
                                                    </Button>
                                                </MessageAction>
                                                <MessageAction tooltip="Downvote" delayDuration={100}>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="rounded-full"
                                                    >
                                                        <ThumbsDown />
                                                    </Button>
                                                </MessageAction>
                                            </MessageActions>
                                        </div>
                                    ) : (
                                        <div className="group flex flex-col items-end gap-1">
                                            <MessageContent className="bg-muted text-primary max-w-[85%] rounded-3xl px-5 py-2.5 sm:max-w-[75%]">
                                                {message.content}
                                            </MessageContent>
                                            <MessageActions
                                                className={cn(
                                                    "flex gap-0 opacity-0 transition-opacity duration-150 group-hover:opacity-100"
                                                )}
                                            >
                                                <MessageAction tooltip="Edit" delayDuration={100}>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="rounded-full"
                                                    >
                                                        <Pencil />
                                                    </Button>
                                                </MessageAction>
                                                <MessageAction tooltip="Delete" delayDuration={100}>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="rounded-full"
                                                    >
                                                        <Trash />
                                                    </Button>
                                                </MessageAction>
                                                <MessageAction tooltip="Copy" delayDuration={100}>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="rounded-full"
                                                    >
                                                        <Copy />
                                                    </Button>
                                                </MessageAction>
                                            </MessageActions>
                                        </div>
                                    )}
                                </Message>
                            )
                        })}
                    </ChatContainerContent>
                    <div className="absolute bottom-4 left-1/2 flex w-full max-w-3xl -translate-x-1/2 justify-end px-5">
                        <ScrollButton className="shadow-sm" />
                    </div>
                </ChatContainerRoot>
            </div>

            <div className="bg-background z-10 shrink-0 px-3 pb-3 md:px-5 md:pb-5">
                <motion.div
                    layout
                    layoutId={"prompt-bar"}
                    className="mx-auto max-w-3xl">
                    <PromptInput
                        isLoading={isPromptBarLoading}
                        value={prompt}
                        onValueChange={handlePromptInputValueChange}
                        onSubmit={handleSubmit}
                        className="border-input bg-popover relative z-10 w-full rounded-3xl border p-0 pt-1 shadow-xs"
                    >
                        <div className="flex flex-col">
                            <PromptInputTextarea
                                placeholder="Ask anything"
                                className="min-h-[44px] pt-3 pl-4 text-base leading-[1.3] sm:text-base md:text-base"
                            />

                            <PromptInputActions className="mt-5 flex w-full items-center justify-between gap-2 px-3 pb-3">
                                <div className="flex items-center gap-2">
                                    <PromptInputAction tooltip="Add a new action">
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="size-9 rounded-full"
                                        >
                                            <Plus size={18} />
                                        </Button>
                                    </PromptInputAction>

                                    <PromptInputAction tooltip="Search">
                                        <Button variant="outline" className="rounded-full">
                                            <Globe size={18} />
                                            Search
                                        </Button>
                                    </PromptInputAction>

                                    <PromptInputAction tooltip="More actions">
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="size-9 rounded-full"
                                        >
                                            <MoreHorizontal size={18} />
                                        </Button>
                                    </PromptInputAction>
                                </div>
                                <div className="flex items-center gap-2">
                                    <PromptInputAction tooltip="Voice input">
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="size-9 rounded-full"
                                        >
                                            <Mic size={18} />
                                        </Button>
                                    </PromptInputAction>

                                    <Button
                                        size="icon"
                                        disabled={!prompt.trim() || isPromptBarLoading}
                                        onClick={handleSubmit}
                                        className="size-9 rounded-full"
                                    >
                                        {!isPromptBarLoading ? (
                                            <ArrowUp size={18} />
                                        ) : (
                                            <span className="size-3 rounded-xs bg-white" />
                                        )}
                                    </Button>
                                </div>
                            </PromptInputActions>
                        </div>
                    </PromptInput>
                </motion.div>
            </div>
        </main>
    )
}

function FullChatApp() {
    return (
        <SidebarProvider>
            <ChatSidebar />
            <SidebarInset>
                <ChatContent />
            </SidebarInset>
        </SidebarProvider>
    )
}

export { FullChatApp }
