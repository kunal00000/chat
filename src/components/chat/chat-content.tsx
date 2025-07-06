"use client"

import { useChatStore } from "@/store/chat.store"
import { AssistantMessage } from "../messages/assistant-message"
import { StreamingMessage } from "../messages/streaming-message"
import { UserMessage } from "../messages/user-message"
import { ChatContainerContent, ChatContainerRoot } from "../ui/chat-container"
import { ScrollButton } from "../ui/scroll-button"

export default function ChatContent() {
    const chatMessages = useChatStore((s) => s.messages)

    return (
        <div className="relative flex-1 overflow-y-auto">
            <ChatContainerRoot className="h-full">
                <ChatContainerContent className="space-y-0 md:px-5 pt-20 pb-24">
                    {chatMessages.map((message, index) => {
                        const isAssistant = message.role === "assistant"
                        const isUser = message.role === "user"
                        const isLastMessage = index === chatMessages.length - 1

                        if (isAssistant) {
                            return <AssistantMessage key={message.id} message={message} isLastMessage={isLastMessage} />
                        } else if (isUser) {
                            return <UserMessage key={message.id} message={message} />
                        } else {
                            return null
                        }
                    })}

                    <StreamingMessage />
                </ChatContainerContent>
                <div className="absolute bottom-4 left-1/2 flex w-full max-w-3xl -translate-x-1/2 justify-end px-5">
                    <ScrollButton className="border border-border-custom/75 shadow-none" />
                </div>
            </ChatContainerRoot>
        </div>
    )
}