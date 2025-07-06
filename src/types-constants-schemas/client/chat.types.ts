import {
  assistantMessageSchema,
  chatMessageSchema,
  userMessageSchema,
} from "@/types-constants-schemas/server/chat/chat.schema";
import * as z from "zod/v4";
import { MESSAGE_PARTS } from "../server/chat/chat.constants";

export type TChatMessage = z.infer<typeof chatMessageSchema>;

export type TAssistantMessage = z.infer<typeof assistantMessageSchema>;

export type TUserMessage = z.infer<typeof userMessageSchema>;

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

export type TPartType = (typeof MESSAGE_PARTS)[keyof typeof MESSAGE_PARTS];
