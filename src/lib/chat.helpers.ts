import { UseChatOptions } from "@ai-sdk/react";

export const CH = {
  isPromptBarLoading: (
    status: "submitted" | "streaming" | "ready" | "error"
  ) => {
    return status === "submitted" || status === "streaming";
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
