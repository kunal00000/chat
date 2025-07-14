"use client";

import { useMemo } from "react";
import { MorphingText } from "../ui/morphing-text";

const promptSuggestions = [
    "What are you working on?",
    "What's on your mind today?",
    "Hey, ready to dive in?",
    "How can I help?",
    "Got a question? Ask away!",
    "Need some inspiration?",
    "What's your next big idea?",
    "Share your thoughts!",
    "Let's get started!",
];

function shuffleArray<T>(array: T[]): T[] {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

export default function RandomHeaders({ className }: { className?: string }) {
    const shuffledPromptSuggestions = useMemo(() => shuffleArray(promptSuggestions), []);

    return (
        <MorphingText texts={shuffledPromptSuggestions} className={className} />
    )
}
