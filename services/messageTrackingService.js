export class MessageTrackingService {
  constructor() {
    this.messageStore = new Map();
  }

  storeMessage(hash, messageText) {
    this.messageStore.set(hash, messageText);
  }

  getMessage(hash) {
    return this.messageStore.get(hash);
  }
}

export const messageTracker = new MessageTrackingService();
