import { getMessageId } from "@/lib/chat.helpers";
import { toast } from "sonner";
import { v4 as uuid } from "uuid";
import { shallow } from "zustand/shallow";
import { createWithEqualityFn } from "zustand/traditional";
import {
  TAssistantMessage,
  TChatMessage,
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
  sendMessage: (content: string) => Promise<string | null>;

  streamingMessage: TAssistantMessage | null;
  isFirstChunkPending: () => boolean;

  error?: string;
};

export const useChatStore = createWithEqualityFn<TChatStore>()(
  (set, get) => ({
    messages: [],
    streamingMessage: null,
    streamingReasoning: null,
    input: "",
    error: undefined,
    chatId: null,
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
    sendMessage: async (content: string) => {
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
