import { chatMessageSchema } from "@/types-constants-schemas/server/chat/chat.schema";
import * as z from "zod/v4";

export type TChatMessage = z.infer<typeof chatMessageSchema>;

export type TSuggestionGroup = {
  label: string;
  highlight: string;
  items: string[];
};

export type TConversationHistory = {
  period: string;
  conversations: {
    id: string;
    title: string;
    lastMessage: string;
    timestamp: number;
  }[];
};
