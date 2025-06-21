import {
  CONVERSATION_HISTORY,
  INITIAL_MESSAGES,
  SUGGESTION_GROUPS,
} from "@/constants/prompt-kit.constants";
import {
  TChatMessage,
  TConversationHistory,
  TSuggestionGroup,
} from "@/types/chat.types";
import { shallow } from "zustand/shallow";
import { createWithEqualityFn } from "zustand/traditional";

export type TChatStore = {
  chatMessages: TChatMessage[];
  conversationHistory: TConversationHistory[];
  suggestionGroups: TSuggestionGroup[];
  prompt: string;
  isPromptBarLoading: boolean;
};

export const useChatStore = createWithEqualityFn<TChatStore>()(() => {
  const initialState = {
    chatMessages: INITIAL_MESSAGES,
    conversationHistory: CONVERSATION_HISTORY,
    suggestionGroups: SUGGESTION_GROUPS,
    prompt: "",
    isPromptBarLoading: false,
  };

  return initialState;
}, shallow);
