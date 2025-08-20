import { buttonVariants } from "@/components/ui/button";
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
} from "@/components/ui/sidebar";
import { useChatHistory } from "@/hooks/use-chat-history";
import { navigateToChat } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { Edit3, MessageSquare, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function ChatHistory() {
    const { chats, isLoading, removeChat, updateTitle } = useChatHistory();
    const [editingChatId, setEditingChatId] = useState<string | null>(null);
    const [editingTitle, setEditingTitle] = useState("");

    const handleChatClick = async (chatId: string) => {
        navigateToChat(chatId);
    };

    const handleDeleteChat = async (chatId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm("Are you sure you want to delete this chat?")) {
            await removeChat(chatId);
            toast.success("Chat deleted");
        }
    };

    const handleEditTitle = (chat: { id: string; title: string | null }) => {
        setEditingChatId(chat.id);
        setEditingTitle(chat.title || "");
    };

    const handleSaveTitle = async (chatId: string) => {
        if (editingTitle.trim()) {
            await updateTitle(chatId, editingTitle.trim());
            toast.success("Chat title updated");
        }
        setEditingChatId(null);
        setEditingTitle("");
    };

    const handleCancelEdit = () => {
        setEditingChatId(null);
        setEditingTitle("");
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    if (chats.length === 0) {
        return (
            <div className="p-4 text-center text-gray-500">
                <MessageSquare className="mx-auto h-8 w-8 mb-2" />
                <p>No chat history</p>
                <p className="text-sm">Your conversations will appear here</p>
            </div>
        );
    }

    return (
        <SidebarGroup>
            <SidebarGroupLabel>Recent Chats</SidebarGroupLabel>
            <SidebarMenu>
                {chats.map((chat) => (
                    <div key={chat.id}>
                        <SidebarMenuButton
                            onClick={() => handleChatClick(chat.id)}
                            className="relative group/menu-item"
                        >
                            <div className="flex-1 min-w-0">
                                {editingChatId === chat.id ? (
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="text"
                                            value={editingTitle}
                                            onChange={(e) => setEditingTitle(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                    handleSaveTitle(chat.id);
                                                } else if (e.key === "Escape") {
                                                    handleCancelEdit();
                                                }
                                            }}
                                            className="flex-1 text-sm border rounded px-2 py-1"
                                            autoFocus
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                        <div
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleSaveTitle(chat.id);
                                            }}
                                            className={cn("h-6", buttonVariants({ variant: "ghost", size: "sm" }))}
                                        >
                                            Save
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center space-x-2">
                                        <span className="text-sm truncate">
                                            {chat.title || "Untitled Chat"}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {editingChatId !== chat.id && (
                                <div className="flex items-center space-x-1 bg-accent opacity-0 group-hover/menu-item:opacity-100 transition-opacity absolute right-2">
                                    <div
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleEditTitle(chat);
                                        }}
                                        className={cn("h-6 w-6 p-0", buttonVariants({ variant: "ghost", size: "sm" }))}
                                    >
                                        <Edit3 className="h-3 w-3" />
                                    </div>
                                    <div
                                        onClick={(e) => handleDeleteChat(chat.id, e)}
                                        className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "h-6 w-6 p-0 text-red-500 hover:text-red-700")}
                                    >
                                        <Trash2 className="h-3 w-3" />
                                    </div>
                                </div>
                            )}
                        </SidebarMenuButton>
                    </div>
                ))}
            </SidebarMenu>
        </SidebarGroup>
    );
} 