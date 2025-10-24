// Simple in-memory conversation storage
// Format: { userId: { messageId: conversationHistory } }
export const conversationStore = new Map<string, Map<string, Array<{ role: string; content: string }>>>();

export function saveConversation(userId: string, messageId: string, history: Array<{ role: string; content: string }>) {
  if (!conversationStore.has(userId)) {
    conversationStore.set(userId, new Map());
  }
  conversationStore.get(userId)!.set(messageId, history);
  
  // Also save as "latest" for easy retrieval
  conversationStore.get(userId)!.set('latest', history);
}

export function getConversation(userId: string, messageId: string): Array<{ role: string; content: string }> | undefined {
  const userConversations = conversationStore.get(userId);
  if (!userConversations) return undefined;
  
  // Try to get specific message conversation
  let conversation = userConversations.get(messageId);
  
  // Fallback to latest conversation if specific not found
  if (!conversation) {
    conversation = userConversations.get('latest');
  }
  
  return conversation;
}

export function clearUserConversations(userId: string) {
  conversationStore.delete(userId);
}
