import { CheckIcon, CopyIcon } from "lucide-react";
import { useEffect, useState } from "react";

export function useCopyToClipboard() {
    const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);

    const handleCopy = (id: string, text: string) => {
        navigator.clipboard.writeText(text);
        setCopiedMessageId(id);
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
        getCopyIcon: (messageId: string, className?: string) => {
            return copiedMessageId === messageId ? <CheckIcon className={className} /> : <CopyIcon className={className} />;
        },
        getCopyText: (messageId: string) => {
            return copiedMessageId === messageId ? "Copied" : "Copy";
        },
    };
}
