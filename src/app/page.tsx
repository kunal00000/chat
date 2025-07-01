import ResetChatEffects from "@/components/common/reset-chat-effect";
import { PromptBarInput } from "@/components/ui/prompt-bar-input";

export default function Home() {

    return (
        <main className="bg-border-custom/50 h-screen w-full md:pt-2 md:pl-2">
            <div className="bg-background-custom md:rounded-tl-md h-full w-full relative">
                <div
                    className="absolute inset-x-0 top-1/2 mx-auto flex max-w-3xl -translate-y-1/2 flex-col items-center justify-center gap-4 px-3 pb-3 md:px-5 md:pb-5">
                    <PromptBarInput
                        className="w-full"
                        showSuggestions={true}
                        navigateToChat={true}
                    />
                </div>
            </div>
            <ResetChatEffects />
        </main>
    );
}
