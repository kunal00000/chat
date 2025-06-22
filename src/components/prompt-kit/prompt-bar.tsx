"use client"

import { PromptBarInput } from "@/components/ui/prompt-bar-input"
import { PromptSuggestion } from "@/components/ui/prompt-suggestion"
import { SUGGESTION_GROUPS } from "@/constants/prompt-kit.constants"
import { useChatStore } from "@/store/chat.store"
import { motion } from "framer-motion"
import { BrainIcon } from "lucide-react"
import { useState } from "react"

export function PromptInputWithSuggestions() {
    const [activeCategory, setActiveCategory] = useState("")

    const handlePromptInputValueChange = (value: string) => {
        useChatStore.setState({
            prompt: value,
        })
        // Clear active category when typing something different
        if (value.trim() === "") {
            setActiveCategory("")
        }
    }

    // Get suggestions based on active category
    const activeCategoryData = SUGGESTION_GROUPS.find(
        (group) => group.label === activeCategory
    )

    // Determine which suggestions to show
    const showCategorySuggestions = activeCategory !== ""

    return (
        <div
            className="absolute inset-x-0 top-1/2 mx-auto flex max-w-3xl -translate-y-1/2 flex-col items-center justify-center gap-4 px-3 pb-3 md:px-5 md:pb-5">
            <PromptBarInput
                className="w-full"
                placeholder="Ask anything..."
                onValueChange={handlePromptInputValueChange}
                navigateToChat={true}
            />

            <div className="relative flex w-full flex-col items-center justify-center space-y-2">
                <div className="absolute top-0 left-0 h-[70px] w-full">
                    {showCategorySuggestions ? (
                        <div className="flex w-full flex-col space-y-1">
                            {activeCategoryData?.items.map((suggestion) => (
                                <PromptSuggestion
                                    key={suggestion}
                                    highlight={activeCategoryData.highlight}
                                    onClick={() => {
                                        useChatStore.setState({
                                            prompt: suggestion,
                                        })
                                        // Optional: auto-send
                                        // handleSend()
                                    }}
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
                                        useChatStore.setState({
                                            prompt: "",
                                        }) // Clear input when selecting a category
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
        </div>
    )
}
