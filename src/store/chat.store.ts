import { chatEventEmitter } from "@/lib/chat-events";
import { getMessageId } from "@/lib/chat.helpers";
import { indexedDBService } from "@/lib/indexed-db";
import { navigateToChat } from "@/lib/navigation";
import { toast } from "sonner";
import { v4 as uuid } from "uuid";
import { shallow } from "zustand/shallow";
import { createWithEqualityFn } from "zustand/traditional";
import {
  TAssistantMessage,
  TChatMessage,
  TUserMessage,
} from "../types-constants-schemas/client/chat.types";
import { useSSEStore } from "./sse.store";

// Type guard for error with message
function isErrorWithMessage(err: unknown): err is { message: string } {
  return (
    typeof err === "object" &&
    err !== null &&
    "message" in err &&
    typeof (err as { message: unknown }).message === "string"
  );
}

export type TChatStore = {
  chatId: string | null;
  messages: TChatMessage[];
  chatTitle: string | null;
  loadMessagesForChatId: (chatId: string) => Promise<void>;
  loadAllChats: () => Promise<void>;
  deleteChat: (chatId: string) => Promise<void>;
  updateChatTitle: (chatId: string, title: string) => Promise<void>;
  refreshChatHistory: () => Promise<void>;

  input: string;
  setInput: (input: string) => void;
  sendMessage: (parts: TUserMessage["parts"]) => Promise<string | null>;
  retryMessage: (messageId: string) => Promise<string | null>;

  streamingMessage: TAssistantMessage | null;
  isFirstChunkPending: () => boolean;

  error?: string;

  // Edit message state and actions
  editingMessageId: string | null;
  startEditingMessage: (messageId: string) => void;
  cancelEditingMessage: () => void;
  editUserMessage: (
    messageId: string,
    newText: string
  ) => Promise<string | null>;
};

export const useChatStore = createWithEqualityFn<TChatStore>()(
  (set, get) => ({
    messages: [],
    streamingMessage: null,
    streamingReasoning: null,
    input: "",
    error: undefined,
    chatId: null,
    chatTitle: null,
    editingMessageId: null,
    setInput: (input) => set({ input }),
    isFirstChunkPending: () => {
      return (
        useSSEStore.getState().status === "pending" ||
        (useSSEStore.getState().status === "streaming" &&
          get().streamingMessage === null)
      );
    },
    loadMessagesForChatId: async (chatId) => {
      try {
        const messages = await indexedDBService.getMessages(chatId);
        const chat = await indexedDBService.getChat(chatId);
        set({
          messages,
          chatId,
          chatTitle: chat?.title || null,
        });
      } catch (error) {
        console.error("Error loading messages:", error);
        // If chat doesn't exist yet, set it up as a new chat
        set({ messages: [], chatId, chatTitle: null });
      }
    },
    loadAllChats: async () => {
      try {
        const chats = await indexedDBService.getAllChats();
        // This could be used to populate a chat list
        console.log("Loaded chats:", chats);
      } catch (error) {
        console.error("Error loading chats:", error);
      }
    },
    deleteChat: async (chatId) => {
      try {
        await indexedDBService.deleteChat(chatId);
        if (get().chatId === chatId) {
          set({ chatId: null, messages: [], chatTitle: null });
        }
      } catch (error) {
        console.error("Error deleting chat:", error);
        toast.error("Failed to delete chat");
      }
    },
    updateChatTitle: async (chatId, title) => {
      try {
        await indexedDBService.updateChatTitle(chatId, title);
        if (get().chatId === chatId) {
          set({ chatTitle: title });
        }
        chatEventEmitter.emit("chat-updated");
      } catch (error) {
        console.error("Error updating chat title:", error);
        toast.error("Failed to update chat title");
      }
    },
    refreshChatHistory: async () => {
      // This method can be called to trigger a refresh of chat history
      // The actual refresh is handled by the useChatHistory hook
    },
    sendMessage: async (parts: TUserMessage["parts"]) => {
      if (useSSEStore.getState().isLoading()) {
        toast.error("Please wait for the current message to finish");
        return null;
      }

      let chatId = get().chatId;
      if (!chatId) {
        chatId = uuid();
        set({ chatId, messages: [] });
        navigateToChat(chatId);
      }

      const userMessage: TChatMessage = {
        id: getMessageId("user"),
        role: "user",
        parts,
      };

      try {
        // Save user message to IndexedDB
        await indexedDBService.saveMessage(chatId, userMessage);

        // Save chat if it's new
        if (get().messages.length === 0) {
          await indexedDBService.saveChat(chatId, null);
          // Trigger a refresh of chat history when a new chat is created
          setTimeout(() => {
            // This will trigger the useEffect in useChatHistory
          }, 100);
        }

        await useSSEStore
          .getState()
          .startStream({ chatId, messages: [...get().messages, userMessage] });

        set((state) => ({
          messages: [...state.messages, userMessage],
          input: "",
          error: undefined,
        }));
      } catch (err: unknown) {
        let errorMsg = "Unknown error";
        if (isErrorWithMessage(err)) {
          errorMsg = err.message;
        }
        set({ error: errorMsg });
      }

      return chatId;
    },
    retryMessage: async (assistantMessageId: string) => {
      if (useSSEStore.getState().isLoading()) {
        toast.error("Please wait for the current message to finish");
        return null;
      }

      const { chatId, messages } = get();
      if (!chatId) {
        toast.error("No chat session found");
        return null;
      }

      // Find the assistant message index
      const assistantIdx = messages.findIndex(
        (msg) => msg.id === assistantMessageId && msg.role === "assistant"
      );
      if (assistantIdx === -1) {
        toast.error("Assistant message not found");
        return null;
      }

      // Find the previous user message before this assistant message
      let userIdx = assistantIdx - 1;
      while (userIdx >= 0 && messages[userIdx].role !== "user") {
        userIdx--;
      }
      if (userIdx < 0) {
        toast.error("No user message found before this assistant message");
        return null;
      }

      // Slice up to and including the user message
      const newMessages = messages.slice(0, userIdx + 1);

      try {
        // Update messages in IndexedDB (remove messages after the user message)
        const messagesToKeep = newMessages;
        const currentMessages = await indexedDBService.getMessages(chatId);
        const userMessageIds = new Set(messagesToKeep.map((m) => m.id));

        // Remove messages that are no longer in the conversation
        for (const message of currentMessages) {
          if (!userMessageIds.has(message.id)) {
            await indexedDBService.deleteMessage(chatId, message.id);
          }
        }

        await useSSEStore.getState().startStream({
          chatId,
          messages: newMessages,
        });
        set({
          messages: newMessages,
          error: undefined,
        });
      } catch (err: unknown) {
        let errorMsg = "Unknown error";
        if (isErrorWithMessage(err)) {
          errorMsg = err.message;
        }
        set({ error: errorMsg });
      }

      return chatId;
    },
    startEditingMessage: (messageId) => set({ editingMessageId: messageId }),
    cancelEditingMessage: () => set({ editingMessageId: null }),
    editUserMessage: async (messageId, newText) => {
      if (useSSEStore.getState().isLoading()) {
        toast.error("Please wait for the current message to finish");
        return null;
      }
      const { chatId, messages } = get();
      if (!chatId) {
        toast.error("No chat session found");
        return null;
      }
      // Find the user message index
      const userIdx = messages.findIndex(
        (msg) => msg.id === messageId && msg.role === "user"
      );
      if (userIdx === -1) {
        toast.error("User message not found");
        return null;
      }
      // Slice up to and including the edited user message
      const newMessages = messages.slice(0, userIdx + 1).map((msg, idx) => {
        if (idx === userIdx && msg.role === "user") {
          return {
            ...msg,
            parts: [
              ...msg.parts.filter((p) => p.type !== "text"),
              { type: "text", text: newText },
            ],
          } satisfies TChatMessage;
        }
        return msg;
      });
      try {
        // Update the edited message in IndexedDB
        const editedMessage = newMessages[userIdx];
        await indexedDBService.saveMessage(chatId, editedMessage);

        // Remove messages after the edited message
        const currentMessages = await indexedDBService.getMessages(chatId);
        const messagesToKeep = newMessages;
        const userMessageIds = new Set(messagesToKeep.map((m) => m.id));

        for (const message of currentMessages) {
          if (!userMessageIds.has(message.id)) {
            await indexedDBService.deleteMessage(chatId, message.id);
          }
        }

        await useSSEStore.getState().startStream({
          chatId,
          messages: newMessages,
        });
        set({
          messages: newMessages,
          editingMessageId: null,
          error: undefined,
        });
      } catch (err: unknown) {
        let errorMsg = "Unknown error";
        if (isErrorWithMessage(err)) {
          errorMsg = err.message;
        }
        set({ error: errorMsg });
      }
      return chatId;
    },
  }),
  shallow
);
