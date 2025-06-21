import { ChatContent } from "@/components/prompt-kit/full-app";

export default function ChatPage({ params }: { params: { cid: string } }) {
    const { cid } = params
    console.log({ cid })

    return (
        <ChatContent />
    )
}
