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
    for await (const chunk of textStream) {
      appendEvent({ chunk });
    }
  }

  async function streamFullStream(
    fullStream: AsyncIterable<TextStreamPart<ToolSet>>
  ) {
    for await (const chunk of fullStream) {
      switch (chunk.type) {
        case "text":
        case "text-end":
        case "text-start":
        case "reasoning":
        case "reasoning-end":
        case "reasoning-start":
        case "tool-call":
        case "tool-input-start":
        case "tool-input-delta":
        case "tool-result":
        case "tool-input-end":
        case "tool-error":
        case "source":
        case "file":
        case "raw":
        case "error":
          appendEvent(chunk);
          break;

        case "start":
          appendEvent(chunk, "start_stream");
          break;

        case "start-step":
        case "finish-step":
        case "finish":
        default:
          break;
      }
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
