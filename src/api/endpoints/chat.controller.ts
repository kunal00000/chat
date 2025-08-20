import { createStreamer } from "@/api/helpers/stream.helpers";
import { chatControllerInputSchema } from "@/types-constants-schemas/server/chat/chat.schema";
import { google } from "@ai-sdk/google";
import { zValidator } from "@hono/zod-validator";
import {
  convertToModelMessages,
  generateText,
  smoothStream,
  streamText,
} from "ai";
import { Env, Hono } from "hono";

export const chatController = new Hono<Env>().post(
  "/",
  zValidator("json", chatControllerInputSchema),
  async (c) => {
    const { messages } = c.req.valid("json");

    const streamer = createStreamer();
    const response = streamer.toResponse();

    (async () => {
      if (messages.filter((m) => m.role === "user").length === 1) {
        (async () => {
          const userMessage = messages.filter((m) => m.role === "user")[0];
          const chatTitleStream = generateText({
            model: google("gemini-2.5-flash"),
            system:
              "You are tasked with generating a title for a chat. The title should be a single sentence that captures the essence of the chat. The title should be no more than 8 words and no full stops.",
            messages: [
              {
                role: "user",
                content: `this is first message for chat: ${userMessage.parts
                  .filter((p) => p.type === "text")
                  .map((p) => p.type === "text" && p.text)
                  .join(" ")}`,
              },
            ],
          });

          const chatTitle = (await chatTitleStream).text;
          streamer.appendEvent({ chatTitle }, "chat-title");
        })();
      }

      try {
        const llmStreamResponse = streamText({
          model: google("gemini-2.5-flash"),
          tools: {
            google_search: google.tools.googleSearch({}),
            url_context: google.tools.urlContext({}),
            code_execution: google.tools.codeExecution({}),
          },
          messages: convertToModelMessages(messages),
          experimental_transform: smoothStream({
            chunking: /.{10}/m,
            delayInMs: 15,
          }),
          abortSignal: c.req.raw.signal,
        });

        await streamer.streamFullStream(llmStreamResponse.fullStream);

        const usage = await llmStreamResponse.usage;
        streamer.appendEvent({ usage }, "usage");
      } catch (error) {
        streamer.appendEvent({ error }, "error");
      } finally {
        streamer.close();
      }
    })();

    return response;
  }
);
