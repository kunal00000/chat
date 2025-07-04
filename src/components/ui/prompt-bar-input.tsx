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
import { useSSEStore } from "@/store/sse.store"
import { SUGGESTION_GROUPS } from "@/types-constants-schemas/client/prompt-kit.constants"
import { motion } from "framer-motion"
import { ArrowUp, BrainIcon, Mic } from "lucide-react"
import { useRouter } from "next/navigation"
import { ReactNode, useEffect, useState } from "react"
import { toast } from "sonner"
import { PromptSuggestion } from "./prompt-suggestion"

interface PromptBarInputProps {
    className?: string
    placeholder?: string
    showVoiceButton?: boolean
    showAdditionalActions?: boolean
    additionalActions?: ReactNode
    navigateToChat?: boolean
    showSuggestions?: boolean
}

export function PromptBarInput({
    className = "",
    placeholder = "Ask anything...",
    showVoiceButton = false,
    showAdditionalActions = false,
    additionalActions,
    navigateToChat = false,
    showSuggestions = false,
}: PromptBarInputProps) {
    const nextRouter = useRouter()
    const { input, setInput, sendMessage } = useChatStore((s) => ({
        input: s.input,
        setInput: s.setInput,
        sendMessage: s.sendMessage,
        chatId: s.chatId,
    }))
    const isLoading = useSSEStore((state) => state.isLoading())

    const handleSubmitWrapper = async () => {
        if (!input.trim()) {
            toast.error("Please enter a prompt")
            return
        }

        setInput("")
        const chatId = await sendMessage(input.trim())

        if (navigateToChat && chatId) {
            nextRouter.push(`/chat/${chatId}`)
        }
        return;
    }

    return (
        <motion.div
            layout
            layoutId={"prompt-bar"}
            className={cn("relative space-y-4", className)}
        >
            <PromptInput
                isLoading={isLoading}
                value={input}
                onValueChange={setInput}
                onSubmit={handleSubmitWrapper}
                className={cn("border-input bg-popover relative z-10 w-full rounded-3xl border p-0 pt-1 shadow-xs", className)}
            >
                <div className="flex flex-col">
                    <PromptInputTextarea
                        placeholder={placeholder}
                        className="min-h-[44px] pt-3 pl-4 text-base leading-[1.3] sm:text-base md:text-base"
                        autoFocus
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

                            {isLoading ? (
                                <Button
                                    size="icon"
                                    onClick={() => useSSEStore.getState().stopStream()}
                                    className="size-9 rounded-full"
                                >
                                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="4" y="4" width="10" height="10" rx="2" fill="currentColor" /></svg>
                                </Button>
                            ) : (
                                <Button
                                    size="icon"
                                    disabled={!input.trim() || isLoading}
                                    onClick={handleSubmitWrapper}
                                    className="size-9 rounded-full"
                                >
                                    <ArrowUp size={18} />
                                </Button>
                            )}
                        </div>
                    </PromptInputActions>
                </div>
            </PromptInput>

            {showSuggestions && (
                <PromptBarSuggestions input={input} setInput={setInput} />
            )}
        </motion.div>
    )
}

function PromptBarSuggestions({ input, setInput }: { input: string, setInput: (input: string) => void }) {
    const [activeCategory, setActiveCategory] = useState("")
    const showCategorySuggestions = activeCategory !== ""
    const activeCategoryData = SUGGESTION_GROUPS.find(
        (group) => group.label === activeCategory
    )

    useEffect(() => {
        if (input.trim() === "") {
            setActiveCategory("")
        }
    }, [input, setActiveCategory])

    return (
        <div className="relative flex w-full flex-col items-center justify-center space-y-2">
            <div className="absolute top-0 left-0 h-[70px] w-full">
                {showCategorySuggestions ? (
                    <div className="flex w-full flex-col space-y-1">
                        {activeCategoryData?.items.map((suggestion) => (
                            <PromptSuggestion
                                key={suggestion}
                                highlight={activeCategoryData.highlight}
                                onClick={() => { setInput(suggestion) }}
                            >
                                {suggestion}
                            </PromptSuggestion>
                        ))}
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.45 }}
                        className="relative flex w-full flex-wrap items-stretch justify-start gap-2">
                        {SUGGESTION_GROUPS.map((suggestion) => (
                            <PromptSuggestion
                                key={suggestion.label}
                                onClick={() => {
                                    setActiveCategory(suggestion.label)
                                    setInput(suggestion.label)
                                }}
                                className="capitalize bg-secondary rounded-lg shadow-none"
                                size={"default"}
                            >
                                <BrainIcon className="h-4 w-4" />
                                {suggestion.label}
                            </PromptSuggestion>
                        ))}
                    </motion.div>
                )}
            </div>
        </div>
    )
}