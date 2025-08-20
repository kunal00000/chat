export const navigateToChat = (chatId: string) => {
  if (typeof window !== "undefined") {
    window.nextRouter.push(`/c/${chatId}`);
  }
};
