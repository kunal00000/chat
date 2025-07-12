import {
  assistantMessageSchema,
  chatMessageSchema,
  userMessageSchema,
} from "@/types-constants-schemas/server/chat/chat.schema";
import { SourceUrlUIPart } from "ai";
import * as z from "zod/v4";

export type TChatMessage = z.infer<typeof chatMessageSchema>;

export type TAssistantMessage = z.infer<typeof assistantMessageSchema>;

export type TUserMessage = z.infer<typeof userMessageSchema>;

export type TPreviewFile = { file: File; base64: string; isLoading: boolean };

// tools types
type TToolWebsearch = {
  input: string[];
  output: SourceUrlUIPart[];
};

export type TTools = {
  websearch: TToolWebsearch;
};
