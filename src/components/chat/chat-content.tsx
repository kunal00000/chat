"use client"

import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard"
import { shouldUseMaxWidthMessage } from "@/lib/chat.helpers"
import { cn } from "@/lib/utils"
import { useChatStore } from "@/store/chat.store"
import { Pencil, Trash } from "lucide-react"
import { Button } from "../ui/button"
import { ChatContainerContent, ChatContainerRoot } from "../ui/chat-container"
import { PromptkitLoader } from "../ui/loader"
import { Message, MessageAction, MessageActions, MessageContent } from "../ui/message"
import { ScrollButton } from "../ui/scroll-button"

export default function ChatContent() {
    const { chatMessages, streamingMessage, isFirstChunkPending } = useChatStore((s) => ({
        chatMessages: s.messages,
        streamingMessage: s.streamingMessage,
        isFirstChunkPending: s.isFirstChunkPending()
    }))

    const { handleCopy, getCopyIcon } = useCopyToClipboard();

    return (
        <div className="relative flex-1 overflow-y-auto">
            <ChatContainerRoot className="h-full">
                <ChatContainerContent className="space-y-0 md:px-5 pt-20 pb-12">
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
                                            className="text-main/95 prose flex-1 rounded-lg bg-transparent p-0"
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
                                                    onClick={() => handleCopy(message.id, message.content)}
                                                >
                                                    {getCopyIcon(message.id)}
                                                </Button>
                                            </MessageAction>
                                        </MessageActions>
                                    </div>
                                ) : (
                                    <div className="group flex flex-col items-end gap-1">
                                        <MessageContent className={cn("bg-secondary-custom text-main/95 rounded-3xl px-5 py-2.5",
                                            shouldUseMaxWidthMessage(message.content) && "max-w-[85%] sm:max-w-[75%]"
                                        )}>
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
                                                    onClick={() => handleCopy(message.id, message.content)}
                                                >
                                                    {getCopyIcon(message.id)}
                                                </Button>
                                            </MessageAction>
                                        </MessageActions>
                                    </div>
                                )}
                            </Message>
                        )
                    })}
                    {isFirstChunkPending ? (
                        <Message
                            key="loading"
                            className="mx-auto flex w-full max-w-3xl flex-col gap-2 px-6 items-start"
                        >
                            <PromptkitLoader variant="loading-dots" size="md" text="Loading" />
                        </Message>
                    ) : null}
                    {streamingMessage && (
                        <Message
                            key="streaming-assistant"
                            className="mx-auto flex w-full max-w-3xl flex-col gap-2 px-6 items-start"
                        >
                            <div className="group flex w-full flex-col gap-0">
                                <MessageContent
                                    className="text-main/95 prose flex-1 rounded-lg bg-transparent p-0"
                                    markdown
                                >
                                    {streamingMessage.content}
                                </MessageContent>
                            </div>
                        </Message>
                    )}
                </ChatContainerContent>
                <div className="absolute bottom-4 left-1/2 flex w-full max-w-3xl -translate-x-1/2 justify-end px-5">
                    <ScrollButton className="border border-border-custom/75 shadow-none" />
                </div>
            </ChatContainerRoot>
        </div>
    )
}