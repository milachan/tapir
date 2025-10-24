// Simple in-memory conversation storage
// Format: { userId: { messageId: conversationHistory } }
export const conversationStore = new Map<string, Map<string, Array<{ role: string; content: string }>>>();

export function saveConversation(userId: string, messageId: string, history: Array<{ role: string; content: string }>) {
  if (!conversationStore.has(userId)) {
    conversationStore.set(userId, new Map());
  }
  conversationStore.get(userId)!.set(messageId, history);
}

export function getConversation(userId: string, messageId: string): Array<{ role: string; content: string }> | undefined {
  return conversationStore.get(userId)?.get(messageId);
}

export function clearUserConversations(userId: string) {
  conversationStore.delete(userId);
}
