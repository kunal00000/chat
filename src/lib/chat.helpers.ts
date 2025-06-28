import { TSSEStatus } from "@/store/sse.helpers";
import { UseChatOptions } from "@ai-sdk/react";

export const CH = {
  isPromptBarLoading: (status: TSSEStatus) => {
    return status !== "error" && status !== "idle" && status !== "success";
  },
};

export const CHAT_ARGS: UseChatOptions = {
  id: "123",
  api: "/api/chat",
  initialInput: "",

  onFinish: (...args: Parameters<NonNullable<UseChatOptions["onFinish"]>>) => {
    console.log("ON FINISH", args);
  },

  onError: (...args: Parameters<NonNullable<UseChatOptions["onError"]>>) => {
    console.log("ON ERROR", args);
  },
};

export function getMessageId(role: "user" | "assistant") {
  return `${role}-msg-${Date.now()}${Math.random()}`;
}
