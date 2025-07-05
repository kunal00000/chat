import * as z from "zod/v4";
import { MESSAGE_PARTS } from "./chat.constants";

const systemMessageSchema = z.object({
  id: z.string(),
  role: z.literal("system"),
  content: z.string(),
});

const textPartSchema = z.object({
  type: z.literal(MESSAGE_PARTS.Text),
  text: z.string(),
});

const reasoningPartSchema = z.object({
  type: z.literal(MESSAGE_PARTS.Reasoning),
  text: z.string(),
});

const userMessageContentSchema = z.string();

export const userMessageSchema = z.object({
  id: z.string(),
  role: z.literal("user"),
  content: userMessageContentSchema,
});

const assistantMessageContentSchema = z.array(
  z.discriminatedUnion("type", [textPartSchema, reasoningPartSchema])
);

export const assistantMessageSchema = z.object({
  id: z.string(),
  role: z.literal("assistant"),
  content: assistantMessageContentSchema,
});

export const chatMessageSchema = z.discriminatedUnion("role", [
  systemMessageSchema,
  userMessageSchema,
  assistantMessageSchema,
]);

export const chatControllerInputSchema = z.object({
  messages: z.array(chatMessageSchema),
});
