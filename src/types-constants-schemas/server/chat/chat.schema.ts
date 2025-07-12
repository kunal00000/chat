import { TextUIPart, UIDataTypes, UIMessagePart, UITools } from "ai";
import * as z from "zod/v4";

const textPartSchema = z.custom<TextUIPart>();
const uiMessagePartSchema = z.custom<UIMessagePart<UIDataTypes, UITools>>();

const baseMessageFields = z.object({
  id: z.string(),
  metadata: z.record(z.string(), z.any()).optional(), // metadata is optional and loose
});

export const systemMessageSchema = baseMessageFields.extend({
  role: z.literal("system"),
  parts: z.array(textPartSchema),
});

export const userMessageSchema = baseMessageFields.extend({
  role: z.literal("user"),
  parts: z.array(textPartSchema),
});

export const assistantMessageSchema = baseMessageFields.extend({
  role: z.literal("assistant"),
  parts: z.array(uiMessagePartSchema),
});

export const chatMessageSchema = z.discriminatedUnion("role", [
  systemMessageSchema,
  userMessageSchema,
  assistantMessageSchema,
]);

export const chatControllerInputSchema = z.object({
  messages: z.array(chatMessageSchema),
});
