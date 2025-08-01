import ResetChatEffects from "@/components/common/reset-chat-effect";
import { PromptBarInput } from "@/components/ui/prompt-bar-input";
import { PATHS } from "@/types-constants-schemas/client/chat.constants";
import { redirect } from "next/navigation";

export default function Home() {
    redirect(PATHS.NEW_CHAT)

    return (
        <main className="h-[100dvh] w-full">
            <div className="bg-background-custom h-full w-full relative">
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
