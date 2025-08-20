import { TChatMessage } from "@/types-constants-schemas/client/chat.types";
import { chatEventEmitter } from "./chat-events";

const DB_NAME = "ChatDB";
const DB_VERSION = 1;
const CHAT_STORE = "chats";
const MESSAGE_STORE = "messages";

export type TStoredChat = {
  id: string;
  title: string | null;
  createdAt: number;
  updatedAt: number;
};

export type TStoredMessage = {
  id: string;
  chatId: string;
  message: TChatMessage;
  createdAt: number;
};

class IndexedDBService {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create chats store
        if (!db.objectStoreNames.contains(CHAT_STORE)) {
          const chatStore = db.createObjectStore(CHAT_STORE, { keyPath: "id" });
          chatStore.createIndex("createdAt", "createdAt", { unique: false });
          chatStore.createIndex("updatedAt", "updatedAt", { unique: false });
        }

        // Create messages store
        if (!db.objectStoreNames.contains(MESSAGE_STORE)) {
          const messageStore = db.createObjectStore(MESSAGE_STORE, {
            keyPath: "id",
          });
          messageStore.createIndex("chatId", "chatId", { unique: false });
          messageStore.createIndex("createdAt", "createdAt", { unique: false });
        }
      };
    });
  }

  private async ensureDB(): Promise<void> {
    if (!this.db) {
      await this.init();
    }
  }

  async saveChat(chatId: string, title: string | null): Promise<void> {
    await this.ensureDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([CHAT_STORE], "readwrite");
      const store = transaction.objectStore(CHAT_STORE);

      const now = Date.now();
      const chat: TStoredChat = {
        id: chatId,
        title,
        createdAt: now,
        updatedAt: now,
      };

      const request = store.put(chat);
      request.onsuccess = () => {
        chatEventEmitter.emit("chat-created");
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  }

  async saveMessage(chatId: string, message: TChatMessage): Promise<void> {
    await this.ensureDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(
        [MESSAGE_STORE, CHAT_STORE],
        "readwrite"
      );
      const messageStore = transaction.objectStore(MESSAGE_STORE);
      const chatStore = transaction.objectStore(CHAT_STORE);

      const now = Date.now();
      const storedMessage: TStoredMessage = {
        id: message.id,
        chatId,
        message,
        createdAt: now,
      };

      // Save message
      const messageRequest = messageStore.put(storedMessage);

      // Update chat's updatedAt timestamp
      const chatRequest = chatStore.get(chatId);
      chatRequest.onsuccess = () => {
        const chat = chatRequest.result;
        if (chat) {
          chat.updatedAt = now;
          chatStore.put(chat);
        }
      };

      messageRequest.onsuccess = () => {
        chatEventEmitter.emit("chat-updated");
        resolve();
      };
      messageRequest.onerror = () => reject(messageRequest.error);
    });
  }

  async getChat(chatId: string): Promise<TStoredChat | null> {
    await this.ensureDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([CHAT_STORE], "readonly");
      const store = transaction.objectStore(CHAT_STORE);

      const request = store.get(chatId);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async getMessages(chatId: string): Promise<TChatMessage[]> {
    await this.ensureDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([MESSAGE_STORE], "readonly");
      const store = transaction.objectStore(MESSAGE_STORE);
      const index = store.index("chatId");

      const request = index.getAll(chatId);
      request.onsuccess = () => {
        const storedMessages = request.result as TStoredMessage[];
        const messages = storedMessages
          .sort((a, b) => a.createdAt - b.createdAt)
          .map((stored) => stored.message);
        resolve(messages);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getAllChats(): Promise<TStoredChat[]> {
    await this.ensureDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([CHAT_STORE], "readonly");
      const store = transaction.objectStore(CHAT_STORE);
      const index = store.index("updatedAt");

      const request = index.getAll();
      request.onsuccess = () => {
        const chats = request.result as TStoredChat[];
        // Sort by updatedAt descending (most recent first)
        chats.sort((a, b) => b.updatedAt - a.updatedAt);
        resolve(chats);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async deleteChat(chatId: string): Promise<void> {
    await this.ensureDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(
        [CHAT_STORE, MESSAGE_STORE],
        "readwrite"
      );
      const chatStore = transaction.objectStore(CHAT_STORE);
      const messageStore = transaction.objectStore(MESSAGE_STORE);
      const messageIndex = messageStore.index("chatId");

      // Delete all messages for this chat
      const messageRequest = messageIndex.getAllKeys(chatId);
      messageRequest.onsuccess = () => {
        const messageKeys = messageRequest.result;
        messageKeys.forEach((key) => {
          messageStore.delete(key);
        });

        // Delete the chat
        const chatRequest = chatStore.delete(chatId);
        chatRequest.onsuccess = () => {
          chatEventEmitter.emit("chat-deleted");
          resolve();
        };
        chatRequest.onerror = () => reject(chatRequest.error);
      };
      messageRequest.onerror = () => reject(messageRequest.error);
    });
  }

  async cleanupOldChats(): Promise<void> {
    await this.ensureDB();

    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([CHAT_STORE], "readonly");
      const store = transaction.objectStore(CHAT_STORE);
      const index = store.index("updatedAt");

      const request = index.openCursor(IDBKeyRange.upperBound(oneWeekAgo));
      const chatsToDelete: string[] = [];

      request.onsuccess = () => {
        const cursor = request.result;
        if (cursor) {
          const chat = cursor.value as TStoredChat;
          if (chat.updatedAt < oneWeekAgo) {
            chatsToDelete.push(chat.id);
          }
          cursor.continue();
        } else {
          // Delete all old chats
          if (chatsToDelete.length > 0) {
            const deleteTransaction = this.db!.transaction(
              [CHAT_STORE, MESSAGE_STORE],
              "readwrite"
            );
            const chatStore = deleteTransaction.objectStore(CHAT_STORE);
            const messageStore = deleteTransaction.objectStore(MESSAGE_STORE);
            const messageIndex = messageStore.index("chatId");

            let deletedCount = 0;
            chatsToDelete.forEach((chatId) => {
              // Delete messages first
              const messageRequest = messageIndex.getAllKeys(chatId);
              messageRequest.onsuccess = () => {
                const messageKeys = messageRequest.result;
                messageKeys.forEach((key) => {
                  messageStore.delete(key);
                });

                // Delete chat
                chatStore.delete(chatId);
                deletedCount++;

                if (deletedCount === chatsToDelete.length) {
                  resolve();
                }
              };
              messageRequest.onerror = () => reject(messageRequest.error);
            });
          } else {
            resolve();
          }
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  async updateChatTitle(chatId: string, title: string): Promise<void> {
    await this.ensureDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([CHAT_STORE], "readwrite");
      const store = transaction.objectStore(CHAT_STORE);

      const request = store.get(chatId);
      request.onsuccess = () => {
        const chat = request.result as TStoredChat;
        if (chat) {
          chat.title = title;
          chat.updatedAt = Date.now();
          const updateRequest = store.put(chat);
          updateRequest.onsuccess = () => {
            chatEventEmitter.emit("chat-updated");
            resolve();
          };
          updateRequest.onerror = () => reject(updateRequest.error);
        } else {
          resolve();
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  async deleteMessage(chatId: string, messageId: string): Promise<void> {
    await this.ensureDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([MESSAGE_STORE], "readwrite");
      const store = transaction.objectStore(MESSAGE_STORE);

      const request = store.delete(messageId);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}

export const indexedDBService = new IndexedDBService();

// Initialize and cleanup on app start
if (typeof window !== "undefined") {
  indexedDBService.init().then(() => {
    // Clean up old chats on app initialization
    indexedDBService.cleanupOldChats().catch(console.error);
  });
}
