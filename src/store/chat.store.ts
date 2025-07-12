import { getMessageId } from "@/lib/chat.helpers";
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
  loadMessagesForChatId: (chatId: string) => Promise<void>;

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
      // Implement your logic to load messages for a chatId
      // This is a placeholder; replace with your actual logic
      console.log("Loading messages for chatId:", chatId);
      set({ messages: [] });
      return;
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
      }

      const userMessage: TChatMessage = {
        id: getMessageId("user"),
        role: "user",
        parts,
      };

      try {
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
