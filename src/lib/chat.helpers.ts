import { TSSEStatus } from "@/store/sse.helpers";
import { v4 as uuid } from "uuid";

export const CH = {
  isPromptBarLoading: (status: TSSEStatus) => {
    return status !== "error" && status !== "idle" && status !== "success";
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
