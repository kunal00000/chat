import {
  EventStreamContentType,
  fetchEventSource,
  type FetchEventSourceInit,
} from "@microsoft/fetch-event-source";
import { toast } from "sonner";
import { create } from "zustand";

export type TSSEStatus =
  | "error"
  | "idle"
  | "pending"
  | "retrying"
  | "stopping"
  | "streaming"
  | "success";

/**
 * Configuration for SSE stream handler.
 */
export type TSSEConfig<TStartStreamArgs, TRequestPayload> = {
  getRequestPayload: (
    streamArgs: TStartStreamArgs
  ) => Promise<null | TRequestPayload>;
  onClose: NonNullable<FetchEventSourceInit["onclose"]>;
  onError: NonNullable<FetchEventSourceInit["onerror"]>;
  onMessage: NonNullable<FetchEventSourceInit["onmessage"]>;
  onOpen: NonNullable<FetchEventSourceInit["onopen"]>;
  stopRequest?: (lastRequestPayload: TRequestPayload) => Promise<unknown>;
  url: string;
};

const RETRY_COUNT = 3;

/**
 * Zustand store state for SSE stream handler.
 */
type TStoreState<TStartStreamArgs, TRequestPayload> = {
  abortController: AbortController;
  isLoading: () => boolean;
  isStopping: () => boolean;
  lastRequestPayload: null | TRequestPayload;
  lastStreamStartArgs: null | TStartStreamArgs;
  retryCount: number;
  setStatus: (status: TSSEStatus) => void;
  startStream: (streamArgs: TStartStreamArgs) => Promise<TRequestPayload>;
  status: TSSEStatus;
  stopStream: () => Promise<void>;
};

/**
 * Example stream response type.
 */
type TStreamResponse = {
  data: {
    content: string;
    id: string;
    role: string;
  };
  event: string;
  error: {
    message: string;
    type: string;
  };
  status: "success" | "error";
};

/**
 * Creates a Zustand store for managing SSE streams with robust status and error handling.
 * @param config - The SSE configuration object.
 */
export function createBaseStore<TStartStreamArgs, TRequestPayload>(
  config: TSSEConfig<TStartStreamArgs, TRequestPayload>
) {
  return create<TStoreState<TStartStreamArgs, TRequestPayload>>()(
    (set, get) => ({
      abortController: new AbortController(),
      isLoading: () =>
        get().status === "pending" ||
        get().status === "streaming" ||
        get().status === "retrying" ||
        get().status === "stopping",
      isStopping: () => get().status === "stopping",
      lastRequestPayload: null,
      lastStreamStartArgs: null,
      retryCount: 0,
      setStatus: (newStatus: TSSEStatus) => set({ status: newStatus }),
      startStream: async (streamArgs) => {
        let requestPayload = null;
        if (get().status === "retrying" && get().lastRequestPayload) {
          requestPayload = get().lastRequestPayload;
        } else {
          set({ retryCount: 0 });
          requestPayload = await config.getRequestPayload(streamArgs);
        }
        if (!requestPayload) {
          set({ status: "error" });
          throw null;
        }
        set({ lastRequestPayload: requestPayload });
        set({ lastStreamStartArgs: streamArgs, status: "pending" });
        get().abortController.abort();
        const controller = new AbortController();
        set({ abortController: controller });
        try {
          fetchEventSource(config.url, {
            body: JSON.stringify(requestPayload),
            headers: {
              Accept: "text/event-stream",
              "Content-Type": "application/json",
              "x-request-timestamp": new Date().toISOString(),
            },
            method: "POST",
            onclose: () => {
              set({ status: "idle" });
              config.onClose();
            },
            onerror: (error) => {
              if (error?.retry && get().retryCount < RETRY_COUNT) {
                set((prev) => ({ ...prev, retryCount: prev.retryCount + 1 }));
                //   get().onInvalidToken();
                set({ status: "retrying" });
              } else {
                set({ status: "error" });
                config.onError(error);
                throw error;
              }
            },
            onmessage: (chunk) => {
              const parsedChunk = JSON.parse(chunk.data);
              if (chunk.event === "error") {
                throw {
                  message: parsedChunk.message,
                  retry: false,
                  type: parsedChunk.type,
                };
              }
              if (chunk.event === "usage") {
                // return;
              }
              const result = config.onMessage(chunk);
              return result;
            },
            onopen: async (chunk) => {
              if (get().status === "stopping") {
                return;
              }
              if (
                chunk.ok &&
                chunk.headers.get("content-type") === EventStreamContentType
              ) {
                set({ status: "streaming" });
                config.onOpen(chunk);
              } else if (chunk.status === 401) {
                const temp: TStreamResponse = await chunk.json();
                throw { name: "CUSTOM_ERROR", retry: true, ...temp.error };
              } else if (chunk.status === 413) {
                throw {
                  message: "Input size too large",
                  name: "CUSTOM_ERROR",
                  retry: false,
                  type: "INPUT_SIZE_TOO_LARGE",
                };
              } else if (chunk.status === 429) {
                throw {
                  message: "Too many requests",
                  name: "CUSTOM_ERROR",
                  retry: false,
                  type: "RATE_LIMITED",
                };
              } else {
                const temp: TStreamResponse = await chunk.json();
                if (temp?.status === "error") {
                  throw { name: "CUSTOM_ERROR", retry: false, ...temp.error };
                } else {
                  throw {
                    message: "Something went wrong. Please try again later.",
                    name: "CUSTOM_ERROR",
                    retry: false,
                    type: "UNKNOWN_ERROR",
                  };
                }
              }
            },
            openWhenHidden: true,
            signal: controller.signal,
          }).catch((error) => {
            console.error("Failed to start fetch event source:", error);
            set({ status: "error" });
          });
          return requestPayload;
        } catch {
          set({ status: "error" });
          throw null;
        }
      },
      status: "idle",
      stopStream: async () => {
        if (get().status === "stopping" || get().status === "idle") {
          return;
        }
        set({ status: "stopping" });
        const stopRequestPayload = get().lastRequestPayload;
        if (config.stopRequest && stopRequestPayload) {
          await config.stopRequest(stopRequestPayload).catch((error) => {
            console.error("Failed to stop stream", error);
            toast.error("Failed to stop generating response");
          });
        }
        set({ status: "idle" });
        config.onClose();
      },
    })
  );
}
