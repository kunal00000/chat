import { TChatMessage } from "@/types/chat.types";
import { CheckIcon, CopyIcon } from "lucide-react";
import { useEffect, useState } from "react";

export function useCopyMessage() {
    const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);

    const handleCopy = (message: TChatMessage) => {
        navigator.clipboard.writeText(message.content);
        setCopiedMessageId(message.id);
    };

    useEffect(() => {
        if (copiedMessageId) {
            setTimeout(() => {
                setCopiedMessageId(null);
            }, 2000);
        }
    }, [copiedMessageId]);

    return {
        copiedMessageId,
        handleCopy,
        getCopyIcon: (messageId: string) => {
            return copiedMessageId === messageId ? <CheckIcon /> : <CopyIcon />;
        },
    };
}
