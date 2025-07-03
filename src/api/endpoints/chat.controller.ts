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

    console.log("hello - 1");
    const streamer = createStreamer();
    console.log("hello - 2");
    streamer.appendEvent({}, "start_stream");
    console.log("hello - 3");
    const response = streamer.toResponse();
    console.log("hello - 4");
    (async () => {
      const llmStreamResponse = streamText({
        model: google("gemini-2.0-flash-lite-preview-02-05", {
          useSearchGrounding: true,
        }),
        messages,
        experimental_transform: smoothStream({
          chunking: /.{10}/m,
          delayInMs: 15,
        }),
        abortSignal: c.req.raw.signal,
      });
      console.log("hello - 5");
      await streamer.streamTextStream(llmStreamResponse.textStream);
      console.log("hello - 6");
      const usage = await llmStreamResponse.usage;
      streamer.appendEvent({ usage }, "usage");
      console.log("hello - 7");
      streamer.close();
      console.log("hello - 8");
    })();

    console.log("hello - 9");
    return response;
  }
);
