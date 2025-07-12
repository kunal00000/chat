"use client"

import { PromptInput, PromptInputAction, PromptInputActions, PromptInputTextarea } from '@/components/ui/prompt-input'
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard'
import { shouldUseMaxWidthMessage } from '@/lib/chat.helpers'
import { cn } from '@/lib/utils'
import { useChatStore } from '@/store/chat.store'
import { TUserMessage } from '@/types-constants-schemas/client/chat.types'
import { ArrowUp, SquarePenIcon, X as XIcon } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '../ui/button'
import { Message, MessageAction, MessageActions, MessageContent } from '../ui/message'

function UserMessageEditBar({ message }: { message: TUserMessage }) {
    const [localValue, setLocalValue] = useState(message.parts[0].text)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const { cancelEditingMessage, editUserMessage } = useChatStore(s => ({
        cancelEditingMessage: s.cancelEditingMessage,
        editUserMessage: s.editUserMessage
    }))

    useEffect(() => {
        setLocalValue(message.parts[0].text)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [message.id])

    const handleSubmit = async () => {
        if (!localValue.trim()) return
        if (localValue === message.parts[0].text) {
            toast.error("You didn't make any changes")
            return
        }
        setIsSubmitting(true)
        await editUserMessage(message.id, localValue)
        setIsSubmitting(false)
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Escape') {
            cancelEditingMessage()
        }
    }

    return (
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-2 px-4 pb-4">
            <PromptInput
                value={localValue}
                onValueChange={setLocalValue}
                onSubmit={handleSubmit}
                isLoading={isSubmitting}
                className="bg-secondary-custom w-full"
            >
                <PromptInputTextarea
                    onKeyDown={handleKeyDown}
                    placeholder="Edit your message..."
                    className="text-base leading-[1.3]"
                    autoFocus
                />
                <PromptInputActions className="mt-auto flex w-full items-center justify-end gap-2">
                    <PromptInputAction tooltip="Cancel">
                        <Button
                            variant="outline"
                            size="icon"
                            className="rounded-full bg-secondary-custom border-custom-dark shadow-none"
                            onClick={cancelEditingMessage}
                            type="button"
                        >
                            <XIcon size={18} />
                        </Button>
                    </PromptInputAction>
                    <PromptInputAction tooltip="Send">
                        <Button
                            variant="default"
                            size="icon"
                            className="rounded-full"
                            onClick={handleSubmit}
                            disabled={!localValue.trim() || isSubmitting}
                            type="button"
                        >
                            <ArrowUp size={18} />
                        </Button>
                    </PromptInputAction>
                </PromptInputActions>
            </PromptInput>
        </div>
    )
}

export function UserMessage({ message }: { message: TUserMessage }) {
    const { handleCopy, getCopyIcon } = useCopyToClipboard()
    const editingMessageId = useChatStore(s => s.editingMessageId)
    const startEditingMessage = useChatStore(s => s.startEditingMessage)

    const isEditing = editingMessageId === message.id

    if (isEditing) {
        return <UserMessageEditBar message={message} />
    }

    return (
        <Message
            key={message.id}
            className={cn(
                "mx-auto flex w-full max-w-3xl flex-col gap-2 px-6",
                "items-end"
            )}
        >
            <div className="group flex flex-col items-end gap-1">
                <MessageContent className={cn("bg-secondary-custom text-main/95 rounded-3xl px-5 py-2.5",
                    shouldUseMaxWidthMessage(message.parts[0].text) && "max-w-[85%] sm:max-w-[75%]"
                )}>
                    {message.parts[0].text}
                </MessageContent>
                <MessageActions
                    className={cn(
                        "flex gap-0 opacity-0 transition-opacity duration-150 group-hover:opacity-100"
                    )}
                >
                    <MessageAction tooltip="Copy" delayDuration={100}>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-full"
                            onClick={() => handleCopy(message.id, message.parts[0].text)}
                        >
                            {getCopyIcon(message.id)}
                        </Button>
                    </MessageAction>
                    <MessageAction tooltip="Edit" delayDuration={100}>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-full"
                            onClick={() => startEditingMessage(message.id)}
                        >
                            <SquarePenIcon />
                        </Button>
                    </MessageAction>
                </MessageActions>
            </div>
        </Message>
    )
}
