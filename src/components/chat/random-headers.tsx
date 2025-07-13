"use client";

import { useEffect, useState } from "react";

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

export default function RandomHeaders() {
    const [randomHeader, setRandomHeader] = useState("");

    useEffect(() => {
        setRandomHeader(promptSuggestions[Math.floor(Math.random() * promptSuggestions.length)]);
    }, []);

    return (
        <div className="mb-8 text-4xl text-foreground-custom text-center">{randomHeader}</div>
    )
}
