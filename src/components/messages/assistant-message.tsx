import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard'
import { cn } from '@/lib/utils'
import { useChatStore } from '@/store/chat.store'
import { TAssistantMessage } from '@/types-constants-schemas/client/chat.types'
import { RefreshCcwIcon } from 'lucide-react'
import { Button } from '../ui/button'
import { Message, MessageAction, MessageActions, MessageContent } from '../ui/message'
import { Reasoning, ReasoningContent, ReasoningTrigger } from '../ui/reasoning'

export function AssistantMessage({ message, isLastMessage }: { message: TAssistantMessage, isLastMessage: boolean }) {
    const { handleCopy, getCopyIcon } = useCopyToClipboard()
    const retryMessage = useChatStore((s) => s.retryMessage)

    return (
        <Message
            key={message.id}
            className={cn(
                "mx-auto flex w-full max-w-3xl flex-col gap-2 px-6",
                "items-start"
            )}
        >
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
                    <MessageAction tooltip="Retry" delayDuration={100}>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-full"
                            onClick={() => retryMessage(message.id)}
                        >
                            <RefreshCcwIcon />
                        </Button>
                    </MessageAction>
                </MessageActions>
            </div>
        </Message>
    )
}
