export function createStreamer() {
  let controller: ReadableStreamDefaultController | null = null;

  const stream = new ReadableStream({
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

    controller.enqueue(payload);
  }

  async function streamTextStream(textStream: AsyncIterable<string>) {
    for await (const chunk of textStream) {
      appendEvent({ content: chunk });
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
    close,
    toResponse,
  };
}
