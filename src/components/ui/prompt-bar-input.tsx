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
import { TPreviewFile, TUserMessage } from "@/types-constants-schemas/client/chat.types"
import { SUGGESTION_GROUPS } from "@/types-constants-schemas/client/prompt-kit.constants"
import { motion } from "framer-motion"
import { ArrowUp, BrainIcon, Mic, Paperclip } from "lucide-react"
import { useRouter } from "next/navigation"
import { ReactNode, useEffect, useState } from "react"
import { toast } from "sonner"
import { FileUpload, FileUploadContent, FileUploadTrigger } from "./file-upload"
import { PromptBarFilePreview } from "./prompt-bar-file"
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
    const [previewFiles, setPreviewFiles] = useState<TPreviewFile[]>([])

    const handleSubmitWrapper = async () => {
        if (!input.trim()) {
            toast.error("Please enter a prompt")
            return
        }

        const parts: TUserMessage["parts"] = [];
        if (input.trim()) {
            parts.push({ type: "text", text: input.trim() });
        }
        for (const preview of previewFiles) {
            if (!preview.base64) {
                toast.error(`File ${preview.file.name} is still loading`);
                return;
            }
            parts.push({
                type: "file",
                mediaType: preview.file.type,
                filename: preview.file.name,
                url: preview.base64,
            });
        }

        setInput("");
        setPreviewFiles([]);
        const chatId = await sendMessage(parts);

        if (navigateToChat && chatId) {
            nextRouter.push(`/chat/${chatId}`)
        }
        return;
    }

    const handleFilesAdded = async (newFiles: TPreviewFile[]) => {
        setPreviewFiles((prev) => [...prev, ...newFiles])
    }

    const removeFile = (index: number) => {
        setPreviewFiles((prev) => prev.filter((_, i) => i !== index))
    }

    return (
        <motion.div
            layout
            layoutId={"prompt-bar"}
            className={cn("relative space-y-4", className)}
        >
            <FileUpload
                onFilesAdded={handleFilesAdded}
            >
                <PromptInput
                    isLoading={isLoading}
                    value={input}
                    onValueChange={setInput}
                    onSubmit={handleSubmitWrapper}
                    className={cn("border-input bg-popover relative z-10 w-full rounded-3xl border p-0 pt-1 shadow-xs", className)}
                >
                    <div className="flex flex-col">
                        <PromptBarFilePreview
                            previewFiles={previewFiles}
                            removeFile={removeFile}
                        />

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
                            <div className="flex items-center justify-between gap-2 w-full">
                                <PromptInputAction tooltip="Attach files">
                                    <FileUploadTrigger asChild>
                                        <div className="hover:bg-secondary-foreground/10 flex size-9 cursor-pointer items-center justify-center rounded-2xl">
                                            <Paperclip size={18} />
                                        </div>
                                    </FileUploadTrigger>
                                </PromptInputAction>

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
                                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="2" width="14" height="14" rx="2" fill="currentColor" /></svg>
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

                {/* Drag and drop content */}
                <FileUploadContent>
                    <div className="min-h-52 bg-background/90 w-md rounded-lg border p-8 shadow-lg">
                        <div className="mb-4 flex justify-center">
                            <svg
                                className="text-muted size-8"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
                                />
                            </svg>
                        </div>
                        <h3 className="mb-2 text-center text-base font-medium">
                            Drop files to upload
                        </h3>
                        <p className="text-muted-foreground text-center text-sm">
                            Release to add files to your message
                        </p>
                    </div>
                </FileUploadContent>
            </FileUpload>

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
                    <div
                        className="relative flex w-full flex-wrap items-stretch justify-center gap-2">
                        {SUGGESTION_GROUPS.map((suggestion) => (
                            <PromptSuggestion
                                key={suggestion.label}
                                onClick={() => {
                                    setActiveCategory(suggestion.label)
                                    setInput(suggestion.label)
                                }}
                                className="capitalize bg-border-custom/25 border-border-custom/50 rounded-lg shadow-none"
                                size={"default"}
                            >
                                <BrainIcon className="h-4 w-4" />
                                {suggestion.label}
                            </PromptSuggestion>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
