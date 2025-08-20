import { chatEventEmitter } from "@/lib/chat-events";
import { indexedDBService, TStoredChat } from "@/lib/indexed-db";
import { useChatStore } from "@/store/chat.store";
import { useEffect, useState } from "react";

export function useChatHistory() {
  const [chats, setChats] = useState<TStoredChat[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { loadMessagesForChatId, deleteChat, updateChatTitle, chatId } =
    useChatStore();

  const loadChats = async (opts?: { silent?: boolean }) => {
    const silent = opts?.silent ?? false;
    if (!silent) setIsLoading(true);
    try {
      const storedChats = await indexedDBService.getAllChats();
      setChats(storedChats);
    } catch (error) {
      console.error("Error loading chats:", error);
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  const loadChat = async (chatId: string) => {
    try {
      await loadMessagesForChatId(chatId);
    } catch (error) {
      console.error("Error loading chat:", error);
    }
  };

  const removeChat = async (chatId: string) => {
    try {
      await deleteChat(chatId);
      await loadChats(); // Reload the chat list
    } catch (error) {
      console.error("Error deleting chat:", error);
    }
  };

  const updateTitle = async (chatId: string, title: string) => {
    try {
      await updateChatTitle(chatId, title);
      await loadChats(); // Reload the chat list
    } catch (error) {
      console.error("Error updating chat title:", error);
    }
  };

  useEffect(() => {
    // Initial load shows a spinner
    loadChats({ silent: false });
  }, []);

  // Avoid aggressive reloads that cause flicker; rely on events below.
  // Optionally do a silent refresh when navigating to a different chat id.
  useEffect(() => {
    if (chatId) {
      loadChats({ silent: true });
    }
  }, [chatId]);

  // Listen for chat events to refresh the list
  useEffect(() => {
    const handleChatCreated = () => loadChats({ silent: true });
    const handleChatUpdated = () => loadChats({ silent: true });
    const handleChatDeleted = () => loadChats({ silent: true });

    chatEventEmitter.on("chat-created", handleChatCreated);
    chatEventEmitter.on("chat-updated", handleChatUpdated);
    chatEventEmitter.on("chat-deleted", handleChatDeleted);

    return () => {
      chatEventEmitter.off("chat-created", handleChatCreated);
      chatEventEmitter.off("chat-updated", handleChatUpdated);
      chatEventEmitter.off("chat-deleted", handleChatDeleted);
    };
  }, []);

  return {
    chats,
    isLoading,
    loadChats,
    loadChat,
    removeChat,
    updateTitle,
  };
}
