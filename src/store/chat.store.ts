import { getMessageId } from "@/lib/chat.helpers";
import { TOutgoingChunkType } from "@/types-constants-schemas/server/streamer/streamer.types";
import { toast } from "sonner";
import { v4 as uuid } from "uuid";
import { shallow } from "zustand/shallow";
import { createWithEqualityFn } from "zustand/traditional";
import {
  TAssistantMessage,
  TChatMessage,
  TPartType,
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
  messages: TChatMessage[];
  streamingMessage: TAssistantMessage | null;
  input: string;
  error?: string;
  chatId: string | null;
  setInput: (input: string) => void;
  isFirstChunkPending: () => boolean;
  setStreamingMessage: (chunk: {
    type: TOutgoingChunkType;
    textDelta: string;
  }) => void;
  loadMessagesForChatId: (chatId: string) => Promise<void>;
  sendMessage: (content: string) => Promise<string | null>;
};

export const useChatStore = createWithEqualityFn<TChatStore>()(
  (set, get) => ({
    messages: [],
    streamingMessage: null,
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
    setStreamingMessage: (chunk) => {
      const streamingMessageState = get().streamingMessage;

      const newContent = streamingMessageState?.content ?? [];
      if (chunk.type.includes("start")) {
        newContent.push({
          type: chunk.type.split("-")[0] as TPartType,
          text: chunk.textDelta,
        });
      }

      if (chunk.type.includes("delta")) {
        newContent[newContent.length - 1].text += chunk.textDelta;
      }

      set({
        streamingMessage: {
          content: newContent,
          role: "assistant",
          id: streamingMessageState?.id ?? getMessageId("assistant"),
        },
      });
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
