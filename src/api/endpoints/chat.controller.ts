import { createStreamer } from "@/api/helpers/stream.helpers";
import { chatControllerInputSchema } from "@/types-constants-schemas/server/chat/chat.schema";
import { google } from "@ai-sdk/google";
import { zValidator } from "@hono/zod-validator";
import { smoothStream, streamText } from "ai";
import { Env, Hono } from "hono";

export const chatController = new Hono<Env>().post(
  "/",
  zValidator("json", chatControllerInputSchema),
  async (c) => {
    const { messages } = c.req.valid("json");

    const streamer = createStreamer();
    const response = streamer.toResponse();

    (async () => {
      const llmStreamResponse = streamText({
        model: google("gemini-2.5-flash-preview-04-17"),
        providerOptions: {
          google: {
            useSearchGrounding: true,
            thinkingConfig: {
              includeThoughts: true,
            },
          },
        },
        messages,
        experimental_transform: smoothStream({
          chunking: /.{10}/m,
          delayInMs: 15,
        }),
        abortSignal: c.req.raw.signal,
      });

      await streamer.streamFullStream(llmStreamResponse.fullStream);

      const usage = await llmStreamResponse.usage;
      streamer.appendEvent({ usage }, "usage");

      streamer.close();
    })();

    return response;
  }
);
