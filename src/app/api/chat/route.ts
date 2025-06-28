import { createStreamer } from "@/lib/streamer";
import { google } from "@ai-sdk/google";
import { smoothStream, streamText } from "ai";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const { textStream } = streamText({
    model: google("gemini-2.0-flash-001", {
      useSearchGrounding: true,
    }),
    messages,
    experimental_transform: smoothStream({
      chunking: /.{10}/m,
      delayInMs: 15,
    }),
  });

  const streamer = createStreamer();

  streamer.streamTextStream(textStream).then(() => {
    streamer.close();
  });

  return streamer.toResponse();
}
