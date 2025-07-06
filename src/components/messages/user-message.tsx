import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard'
import { shouldUseMaxWidthMessage } from '@/lib/chat.helpers'
import { cn } from '@/lib/utils'
import { TUserMessage } from '@/types-constants-schemas/client/chat.types'
import { PencilIcon, TrashIcon } from 'lucide-react'
import { Button } from '../ui/button'
import { MessageAction, MessageActions, MessageContent } from '../ui/message'

export function UserMessage({ message }: { message: TUserMessage }) {
    const { handleCopy, getCopyIcon } = useCopyToClipboard()

    return (
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
                        <PencilIcon />
                    </Button>
                </MessageAction>
                <MessageAction tooltip="Delete" delayDuration={100}>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full"
                    >
                        <TrashIcon />
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
    )
}
