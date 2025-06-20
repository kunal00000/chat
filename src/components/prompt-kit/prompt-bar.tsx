"use client"

import { Button } from "@/components/ui/button"
import {
    PromptInput,
    PromptInputAction,
    PromptInputActions,
    PromptInputTextarea,
} from "@/components/ui/prompt-input"
import { PromptSuggestion } from "@/components/ui/prompt-suggestion"
import { ArrowUp, BrainIcon, Mic } from "lucide-react"
import { useState } from "react"

const suggestionGroups = [
    {
        label: "Summary",
        highlight: "Summarize",
        items: [
            "Summarize a document",
            "Summarize a video",
            "Summarize a podcast",
            "Summarize a book",
        ],
    },
    {
        label: "Code",
        highlight: "Help me",
        items: [
            "Help me write React components",
            "Help me debug code",
            "Help me learn Python",
            "Help me learn SQL",
        ],
    },
    {
        label: "Design",
        highlight: "Design",
        items: [
            "Design a small logo",
            "Design a hero section",
            "Design a landing page",
            "Design a social media post",
        ],
    },
    {
        label: "Research",
        highlight: "Research",
        items: [
            "Research the best practices for SEO",
            "Research the best running shoes",
            "Research the best restaurants in Paris",
            "Research the best AI tools",
        ],
    },
]

export function PromptInputWithSuggestions() {
    const [inputValue, setInputValue] = useState("")
    const [activeCategory, setActiveCategory] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = () => {
        if (!inputValue.trim()) return

        setIsLoading(true)

        // Simulate API call
        console.log("Processing:", inputValue)
        setTimeout(() => {
            setInputValue("")
            setIsLoading(false)
            setActiveCategory("")
        }, 1500)
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            handleSubmit()
        }
    }

    const handlePromptInputValueChange = (value: string) => {
        setInputValue(value)
        // Clear active category when typing something different
        if (value.trim() === "") {
            setActiveCategory("")
        }
    }

    // Get suggestions based on active category
    const activeCategoryData = suggestionGroups.find(
        (group) => group.label === activeCategory
    )

    // Determine which suggestions to show
    const showCategorySuggestions = activeCategory !== ""

    return (
        <div className="absolute inset-x-0 top-1/2 mx-auto flex max-w-3xl -translate-y-1/2 flex-col items-center justify-center gap-4 px-3 pb-3 md:px-5 md:pb-5">
            <PromptInput
                className="border-input bg-popover relative z-10 w-full rounded-3xl border p-0 pt-1 shadow-xs"
                value={inputValue}
                onValueChange={handlePromptInputValueChange}
                onSubmit={handleSubmit}
            >
                <PromptInputTextarea
                    placeholder="Ask anything..."
                    className="min-h-[44px] pt-3 pl-4 text-base leading-[1.3] sm:text-base md:text-base"
                    onKeyDown={handleKeyDown}
                />

                <PromptInputActions className="mt-5 flex w-full items-end justify-end gap-2 px-3 pb-3">
                    <PromptInputAction tooltip="Voice input">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="size-9 shadow-none rounded-full"
                        >
                            <Mic size={18} />
                        </Button>
                    </PromptInputAction>

                    <Button
                        size="icon"
                        disabled={!inputValue.trim() || isLoading}
                        onClick={handleSubmit}
                        className="size-9 rounded-full"
                    >
                        {!isLoading ? (
                            <ArrowUp size={18} />
                        ) : (
                            <span className="size-3 rounded-xs bg-white" />
                        )}
                    </Button>
                </PromptInputActions>
            </PromptInput>

            <div className="relative flex w-full flex-col items-center justify-center space-y-2">
                <div className="absolute top-0 left-0 h-[70px] w-full">
                    {showCategorySuggestions ? (
                        <div className="flex w-full flex-col space-y-1">
                            {activeCategoryData?.items.map((suggestion) => (
                                <PromptSuggestion
                                    key={suggestion}
                                    highlight={activeCategoryData.highlight}
                                    onClick={() => {
                                        setInputValue(suggestion)
                                        // Optional: auto-send
                                        // handleSend()
                                    }}
                                >
                                    {suggestion}
                                </PromptSuggestion>
                            ))}
                        </div>
                    ) : (
                        <div className="relative flex w-full flex-wrap items-stretch justify-start gap-2">
                            {suggestionGroups.map((suggestion) => (
                                <PromptSuggestion
                                    key={suggestion.label}
                                    onClick={() => {
                                        setActiveCategory(suggestion.label)
                                        setInputValue("") // Clear input when selecting a category
                                    }}
                                    className="capitalize bg-secondary rounded-lg shadow-none"
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
        </div>
    )
}
