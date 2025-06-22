import { shallow } from "zustand/shallow";
import { createWithEqualityFn } from "zustand/traditional";

export type TChatStore = {
  prompt: string;
  isPromptBarLoading: boolean;
};

export const useChatStore = createWithEqualityFn<TChatStore>()(() => {
  const initialState = {
    prompt: "",
    isPromptBarLoading: false,
  };

  return initialState;
}, shallow);
