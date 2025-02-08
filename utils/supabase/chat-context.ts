interface ChatContext {
    lastParkingQuery?: string;
    selectedParking?: string;
    entrance?: 'Main' | 'Side';
    parkingStatus?: Record<string, boolean>; // true if occupied
  }
  
  export const ChatContextManager = {
    getContext(): ChatContext {
      const contextStr = sessionStorage.getItem('chat-context');
      return contextStr ? JSON.parse(contextStr) : {};
    },
  
    updateContext(updates: Partial<ChatContext>) {
      const current = this.getContext();
      const updated = { ...current, ...updates };
      sessionStorage.setItem('chat-context', JSON.stringify(updated));
      return updated;
    },
  
    clearContext() {
      sessionStorage.removeItem('chat-context');
    }
  };