import { getMessageId } from "@/lib/chat.helpers";
import { TextStreamPart, ToolSet } from "ai";
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
        case "chat-title":
          useChatStore.setState({ chatTitle: parsedData.chatTitle });
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
  const newContent = streamingMessageState?.parts ?? [];
  const lastPart = newContent[newContent.length - 1];

  switch (chunkData.type) {
    case "text-start":
      newContent.push({ type: "text", text: "" });
      break;

    case "reasoning-start":
      newContent.push({ type: "reasoning", text: "", state: "streaming" });
      break;

    case "reasoning":
    case "text":
      if (lastPart.type === "text" || lastPart.type === "reasoning")
        lastPart.text += chunkData.text;
      break;

    case "reasoning-end":
      if (lastPart.type === "reasoning") lastPart.state = "done";
      break;

    case "source":
      if (chunkData.sourceType === "url") {
        newContent.push({
          type: "source-url",
          sourceId: chunkData.id,
          url: chunkData.url,
          title: chunkData.title,
        });
      } else if (chunkData.sourceType === "document") {
        newContent.push({
          type: "source-document",
          sourceId: chunkData.id,
          mediaType: chunkData.mediaType,
          title: chunkData.title,
          filename: chunkData.filename,
        });
      }
      break;

    case "finish-step":
      // websearch handling
      //   const parsedInput = JSON.parse(
      //     JSON.stringify(chunkData.providerMetadata?.google.groundingMetadata)
      //   ).webSearchQueries;

      //   newContent.push({
      //     type: "tool-websearch",
      //     toolCallId: uuid(),
      //     state: "output-available",
      //     input: parsedInput,
      //     output: [...newContent.filter((part) => part.type === "source-url")],
      //   });
      break;

    case "text-end":
    default:
  }

  useChatStore.setState({
    streamingMessage: {
      parts: newContent,
      role: "assistant",
      id: streamingMessageState?.id ?? getMessageId("assistant"),
    },
  });
}
