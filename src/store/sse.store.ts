import { getMessageId } from "@/lib/chat.helpers";
import { ReasoningUIPart, TextStreamPart, ToolSet } from "ai";
import { TChatMessage } from "../types-constants-schemas/client/chat.types";
import { useChatStore } from "./chat.store";
import { createBaseStore } from "./sse.helpers";

export type TStartStreamArgs = {
  chatId: string;
  messages: TChatMessage[];
};

export const useSSEStore = createBaseStore<TStartStreamArgs, TStartStreamArgs>({
  url: "/api/chat",
  getRequestPayload: async (streamArgs) => {
    if (!streamArgs.chatId || !streamArgs.messages) return null;
    return {
      chatId: streamArgs.chatId,
      messages: streamArgs.messages,
    };
  },
  onOpen: async (response) => {
    console.log("SSE stream opened", response.status);
  },
  onMessage: (chunk) => {
    try {
      const parsedData = JSON.parse(chunk.data);

      switch (chunk.event) {
        case "message":
          toUIStreamingMessage(parsedData);
          break;

        case "end_stream":
        default:
      }
    } catch (e) {
      console.error("Failed to parse SSE message", e);
    }
  },
  onError: (error) => {
    console.error("SSE error", error);
  },
  onClose: () => {
    console.log("SSE stream closed");
    useChatStore.setState((state) => {
      if (state.streamingMessage) {
        return {
          messages: [...state.messages, state.streamingMessage],
          streamingMessage: null,
        };
      }
      return {};
    });
  },
});

function toUIStreamingMessage(chunkData: TextStreamPart<ToolSet>) {
  const streamingMessageState = useChatStore.getState().streamingMessage;
  const newContent = streamingMessageState?.content ?? [];

  switch (chunkData.type) {
    case "text-start":
      newContent.push({ type: "text", text: "" });
      break;

    case "reasoning-start":
      newContent.push({ type: "reasoning", text: "", state: "streaming" });
      break;

    case "reasoning":
    case "text":
      newContent[newContent.length - 1].text += chunkData.text;
      break;

    case "reasoning-end":
      (newContent[newContent.length - 1] as ReasoningUIPart).state = "done";
      break;

    case "text-end":
    default:
  }

  useChatStore.setState({
    streamingMessage: {
      content: newContent,
      role: "assistant",
      id: streamingMessageState?.id ?? getMessageId("assistant"),
    },
  });
}
