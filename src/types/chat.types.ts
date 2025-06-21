export type TChatMessage = {
  id: number;
  role: "user" | "assistant";
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
