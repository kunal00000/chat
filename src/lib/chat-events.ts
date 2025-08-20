type TChatEventType = "chat-created" | "chat-updated" | "chat-deleted";

class ChatEventEmitter {
  private listeners: Map<TChatEventType, Set<() => void>> = new Map();

  on(event: TChatEventType, callback: () => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  off(event: TChatEventType, callback: () => void) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.delete(callback);
    }
  }

  emit(event: TChatEventType) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach((callback) => callback());
    }
  }
}

export const chatEventEmitter = new ChatEventEmitter();
