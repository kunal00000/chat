import { createStreamer } from "@/lib/streamer";
import { google } from "@ai-sdk/google";
import { smoothStream, streamText } from "ai";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const llmStreamResponse = streamText({
    model: google("gemini-2.0-flash-lite-preview-02-05", {
      useSearchGrounding: true,
    }),
    messages,
    experimental_transform: smoothStream({
      chunking: /.{10}/m,
      delayInMs: 15,
    }),
    abortSignal: req.signal,
  });

  const streamer = createStreamer();

  streamer.streamTextStream(llmStreamResponse.textStream).then(async () => {
    const usage = await llmStreamResponse.usage;
    if (usage) {
      streamer.appendEvent({ usage }, "usage");
    }

    streamer.close();
  });

  return streamer.toResponse();
}
