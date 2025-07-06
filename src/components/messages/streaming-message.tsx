import { useChatStore } from '@/store/chat.store'
import { PromptkitLoader } from '../ui/loader'
import { Message, MessageContent } from '../ui/message'
import { Reasoning, ReasoningContent, ReasoningTrigger } from '../ui/reasoning'

export function StreamingMessage() {
    const { streamingMessage, isFirstChunkPending } = useChatStore((s) => ({ streamingMessage: s.streamingMessage, isFirstChunkPending: s.isFirstChunkPending() }))

    console.log({
        reasoningStreaming: streamingMessage?.content.some((part) => part.type === "reasoning" && part.isStreaming),
    })

    return (
        <Message
            key="streaming-assistant"
            className="mx-auto flex w-full max-w-3xl flex-col gap-2 px-6 items-start"
        >
            <div className="group flex w-full flex-col gap-0">
                {isFirstChunkPending ? (
                    <PromptkitLoader variant="loading-dots" size="md" text="Loading" />
                ) : streamingMessage && streamingMessage.content.map((part) => {
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
    )
}
