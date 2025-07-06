"use client"

import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard"
import { cn } from "@/lib/utils"
import { useChatStore } from "@/store/chat.store"
import { UserMessage } from "../messages/user-message"
import { Button } from "../ui/button"
import { ChatContainerContent, ChatContainerRoot } from "../ui/chat-container"
import { PromptkitLoader } from "../ui/loader"
import { Message, MessageAction, MessageActions, MessageContent } from "../ui/message"
import { Reasoning, ReasoningContent, ReasoningTrigger } from "../ui/reasoning"
import { ScrollButton } from "../ui/scroll-button"

export default function ChatContent() {
    const { chatMessages, streamingMessage, isFirstChunkPending } = useChatStore((s) => ({
        chatMessages: s.messages,
        streamingMessage: s.streamingMessage,
        isFirstChunkPending: s.isFirstChunkPending(),
    }))

    const { handleCopy, getCopyIcon } = useCopyToClipboard();

    return (
        <div className="relative flex-1 overflow-y-auto">
            <ChatContainerRoot className="h-full">
                <ChatContainerContent className="space-y-0 md:px-5 pt-20 pb-12">
                    {chatMessages.map((message, index) => {
                        const isAssistant = message.role === "assistant"
                        const isUser = message.role === "user"
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
                                        {message.content.map((part) => {
                                            if (part.type === "text") {
                                                return (
                                                    <MessageContent
                                                        key={part.text}
                                                        className="text-main/95 prose flex-1 rounded-lg bg-transparent p-0"
                                                        markdown
                                                    >
                                                        {part.text}
                                                    </MessageContent>
                                                )
                                            }

                                            if (part.type === "reasoning") {
                                                return (
                                                    <Reasoning key={part.text} isStreaming={part.isStreaming}>
                                                        <ReasoningTrigger>Thinking</ReasoningTrigger>
                                                        <ReasoningContent
                                                            markdown
                                                            className="ml-2 border-l-2 border-l-slate-200 px-2 pb-1 dark:border-l-slate-700"
                                                        >
                                                            {part.text}
                                                        </ReasoningContent>
                                                    </Reasoning>
                                                )
                                            }

                                            return null
                                        })}
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
                                                    onClick={() => handleCopy(message.id, message.content.map(part => part.type === "text" ? part.text : "").join(""))}
                                                >
                                                    {getCopyIcon(message.id)}
                                                </Button>
                                            </MessageAction>
                                        </MessageActions>
                                    </div>
                                ) : isUser ? (
                                    <UserMessage message={message} />
                                ) : null}
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
                                {streamingMessage.content.map((part) => {
                                    if (part.type === "text") {
                                        return (
                                            <MessageContent
                                                key={part.text}
                                                className="text-main/95 prose flex-1 rounded-lg bg-transparent p-0"
                                                markdown
                                            >
                                                {part.text}
                                            </MessageContent>
                                        )
                                    }

                                    if (part.type === "reasoning") {
                                        return (
                                            <Reasoning key={part.text} isStreaming={part.isStreaming}>
                                                <ReasoningTrigger>Thinking</ReasoningTrigger>
                                                <ReasoningContent
                                                    markdown
                                                    className="ml-2 border-l-2 border-l-slate-200 px-2 pb-1 dark:border-l-slate-700"
                                                >
                                                    {part.text}
                                                </ReasoningContent>
                                            </Reasoning>
                                        )
                                    }

                                    return null
                                })}
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