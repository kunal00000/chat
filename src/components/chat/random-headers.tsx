"use client";

export default function RandomHeaders() {
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

    const randomSuggestion = promptSuggestions[Math.floor(Math.random() * promptSuggestions.length)];

    return (
        <div className="mb-8 text-4xl text-foreground-custom text-center">{randomSuggestion}</div>
    )
}
