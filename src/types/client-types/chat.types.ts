export type TChatMessage = {
  id: string;
  role: "user" | "assistant" | "system" | "data";
  content: string;
};

export type TSuggestionGroup = {
  label: string;
  highlight: string;
  items: string[];
};

export type TConversationHistory = {
  period: string;
  conversations: {
    id: string;
    title: string;
    lastMessage: string;
    timestamp: number;
  }[];
};
