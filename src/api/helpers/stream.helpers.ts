import { IncomingChunkType } from "@/types-constants-schemas/server/streamer/streamer.types";
import { TextStreamPart, ToolSet } from "ai";

export function createStreamer() {
  let controller: ReadableStreamDefaultController<Uint8Array> | null = null;
  const textEncoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    start(ctrl) {
      controller = ctrl;
    },
    cancel() {
      controller = null;
    },
  });

  function appendEvent(data: unknown, event: string = "message") {
    if (!controller) return;

    let payload = "";
    if (typeof data === "string") {
      payload = `event: ${event}\ndata: ${data}\n\n`;
    } else {
      payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    }

    controller.enqueue(textEncoder.encode(payload));
  }

  async function streamTextStream(textStream: AsyncIterable<string>) {
    let lastChunkType: IncomingChunkType | null = null;
    for await (const chunk of textStream) {
      if (lastChunkType !== IncomingChunkType.TextDelta) {
        appendEvent({ textDelta: chunk, type: "text-start" });
      }

      appendEvent({ textDelta: chunk, type: "text-delta" });
      lastChunkType = IncomingChunkType.TextDelta;
    }
  }

  async function streamFullStream(
    fullStream: AsyncIterable<TextStreamPart<ToolSet>>
  ) {
    let lastChunkType: TextStreamPart<ToolSet>["type"] | null = null;

    for await (const chunk of fullStream) {
      switch (chunk.type) {
        case IncomingChunkType.TextDelta:
          if (lastChunkType !== IncomingChunkType.TextDelta) {
            appendEvent({ textDelta: chunk.textDelta, type: "text-start" });
            break;
          }

          appendEvent({ textDelta: chunk.textDelta, type: "text-delta" });
          break;

        case IncomingChunkType.ReasoningDelta:
          if (lastChunkType !== IncomingChunkType.ReasoningDelta) {
            appendEvent({
              textDelta: chunk.textDelta,
              type: "reasoning-start",
            });
            break;
          }

          appendEvent({ textDelta: chunk.textDelta, type: "reasoning-delta" });
          break;

        case "error":
        case "file":
        case "reasoning-signature":
        case "redacted-reasoning":
        case "tool-call":
        case "source":
        case "step-start":
        case "step-finish":
        case "finish":
        case "tool-call-delta":
        case "tool-call-streaming-start":
        default:
          console.log({ chunk });
          break;
      }

      lastChunkType = chunk.type;
    }
  }

  function close() {
    if (controller) {
      appendEvent({}, "end_stream");
      controller.close();
      controller = null;
    }
  }

  function toResponse() {
    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  }

  return {
    appendEvent,
    streamTextStream,
    streamFullStream,
    close,
    toResponse,
  };
}
