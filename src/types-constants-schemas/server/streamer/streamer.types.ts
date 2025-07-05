import { TPartType } from "@/types-constants-schemas/client/chat.types";

export enum IncomingChunkType {
  TextDelta = "text-delta",
  ReasoningDelta = "reasoning",
}

export type TOutgoingChunkType = `${TPartType}-${"start" | "delta"}`;
