import { TSSEStatus } from "@/store/sse.helpers";
import { UseChatOptions } from "@ai-sdk/react";
import { v4 as uuid } from "uuid";

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
  return `${role.charAt(0)}-msg-${uuid()}`;
}

export function shouldUseMaxWidthMessage(content: string) {
  if (content.length < 40) return false;
  if (content.split(" ").length > 5) return true;

  return false;
}
