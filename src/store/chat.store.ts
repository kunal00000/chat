import { getMessageId } from "@/lib/chat.helpers";
import { v4 as uuid } from "uuid";
import { shallow } from "zustand/shallow";
import { createWithEqualityFn } from "zustand/traditional";
import { TChatMessage } from "../types/chat.types";
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
  messages: TChatMessage[];
  streamingMessage: TChatMessage | null;
  input: string;
  error?: string;
  chatId: string | null;
  setInput: (input: string) => void;
  setStreamingMessage: (delta: string) => void;
  loadMessagesForChatId: (chatId: string) => Promise<void>;
  sendMessage: (content: string) => Promise<string>;
};

export const useChatStore = createWithEqualityFn<TChatStore>()(
  (set, get) => ({
    messages: [],
    streamingMessage: null,
    input: "",
    error: undefined,
    chatId: null,
    setInput: (input) => set({ input }),
    setStreamingMessage: (delta) =>
      set({
        streamingMessage: {
          content: (get().streamingMessage?.content ?? "") + delta,
          role: "assistant",
          id: getMessageId("assistant"),
        },
      }),
    loadMessagesForChatId: async (chatId) => {
      // Implement your logic to load messages for a chatId
      // This is a placeholder; replace with your actual logic
      console.log("Loading messages for chatId:", chatId);
      set({ messages: [] });
      return;
    },
    sendMessage: async (content: string) => {
      let chatId = get().chatId;
      if (!chatId) {
        chatId = uuid();
        set({ chatId, messages: [] });
      }

      const userMessage: TChatMessage = {
        id: getMessageId("user"),
        role: "user",
        content,
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
  }),
  shallow
);
