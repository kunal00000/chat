"use client"

import { Button } from "@/components/ui/button"
import {
    PromptInput,
    PromptInputAction,
    PromptInputActions,
    PromptInputTextarea,
} from "@/components/ui/prompt-input"
import { cn } from "@/lib/utils"
import { useChatStore } from "@/store/chat.store"
import { motion } from "framer-motion"
import { ArrowUp, Mic } from "lucide-react"
import { useRouter } from "next/navigation"
import { ReactNode } from "react"
import { toast } from "sonner"

interface PromptBarInputProps {
    className?: string
    placeholder?: string
    showVoiceButton?: boolean
    showAdditionalActions?: boolean
    additionalActions?: ReactNode
    onSubmit?: () => void
    onValueChange?: (value: string) => void
    layoutId?: string
    navigateToChat?: boolean
}

export function PromptBarInput({
    className = "",
    placeholder = "Ask anything...",
    showVoiceButton = true,
    showAdditionalActions = false,
    additionalActions,
    onSubmit: customOnSubmit,
    onValueChange: customOnValueChange,
    layoutId = "prompt-bar",
    navigateToChat = false,
}: PromptBarInputProps) {
    const nextRouter = useRouter()
    const { prompt, isPromptBarLoading, chatMessages } = useChatStore((state) => ({
        prompt: state.prompt,
        isPromptBarLoading: state.isPromptBarLoading,
        chatMessages: state.chatMessages
    }))

    const handleSubmit = () => {
        if (!prompt.trim()) {
            toast.error("Please enter a prompt")
            return
        }

        if (navigateToChat) {
            nextRouter.push("/chat/123")
        }

        useChatStore.setState({
            prompt: "",
            isPromptBarLoading: true,
        })

        // Call custom onSubmit if provided
        if (customOnSubmit) {
            customOnSubmit()
        } else {

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
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            handleSubmit()
        }
    }

    const handlePromptInputValueChange = (value: string) => {
        if (customOnValueChange) {
            customOnValueChange(value)
        } else {
            useChatStore.setState({
                prompt: value,
            })
        }
    }

    return (
        <motion.div
            layout
            layoutId={layoutId}
            className={className}
        >
            <PromptInput
                isLoading={isPromptBarLoading}
                value={prompt}
                onValueChange={handlePromptInputValueChange}
                onSubmit={handleSubmit}
                className={cn("border-input bg-popover relative z-10 w-full rounded-3xl border p-0 pt-1 shadow-xs", className)}
            >
                <div className="flex flex-col">
                    <PromptInputTextarea
                        placeholder={placeholder}
                        className="min-h-[44px] pt-3 pl-4 text-base leading-[1.3] sm:text-base md:text-base"
                        onKeyDown={handleKeyDown}
                    />

                    <PromptInputActions className={cn("mt-5 flex w-full items-center justify-between gap-2 px-3 pb-3", !showAdditionalActions && "justify-end")}>
                        {showAdditionalActions && additionalActions && (
                            <div className="flex items-center gap-2">
                                {additionalActions}
                            </div>
                        )}
                        <div className="flex items-center gap-2">
                            {showVoiceButton && (
                                <PromptInputAction tooltip="Voice input">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="size-9 shadow-none rounded-full"
                                    >
                                        <Mic size={18} />
                                    </Button>
                                </PromptInputAction>
                            )}

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
    )
} 