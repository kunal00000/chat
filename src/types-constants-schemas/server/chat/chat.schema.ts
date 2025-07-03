import * as z from "zod/v4";

export const chatMessageSchema = z.object({
  id: z.string(),
  role: z.enum(["user", "assistant", "system", "data"]),
  content: z.string(),
});

export const chatControllerInputSchema = z.object({
  messages: z.array(chatMessageSchema),
});
