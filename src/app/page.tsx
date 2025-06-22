import { PromptInputWithSuggestions } from "@/components/prompt-kit/prompt-bar";

export default function Home() {
    return (
        <main className="bg-border-custom/50 h-screen w-full pt-2 pl-2">
            <div className="bg-background-custom rounded-tl-md h-full w-full">
                <PromptInputWithSuggestions />
            </div>
        </main>
    );
}
