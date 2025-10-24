interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface InternalMessage extends Message {
  author?: string; // Username untuk tracking internal
}

interface ChannelConversation {
  messages: InternalMessage[];
  lastUpdated: number;
}

class ChannelConversationService {
  private channelConversations: Map<string, ChannelConversation>;
  private maxMessagesPerChannel: number;
  private conversationTimeout: number; // dalam milidetik

  constructor() {
    this.channelConversations = new Map();
    this.maxMessagesPerChannel = 50; // Simpan max 50 pesan terakhir per channel
    this.conversationTimeout = 30 * 60 * 1000; // 30 menit, setelah itu reset
  }

  /**
   * Dapatkan conversation history dari channel (tanpa property 'author')
   */
  getChannelConversation(channelId: string): Message[] {
    const conversation = this.channelConversations.get(channelId);
    
    if (!conversation) {
      return [];
    }

    // Check apakah conversation sudah timeout
    const now = Date.now();
    if (now - conversation.lastUpdated > this.conversationTimeout) {
      // Reset conversation jika sudah terlalu lama
      this.channelConversations.delete(channelId);
      return [];
    }

    // Return messages without 'author' property for AI API
    const messages = conversation.messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    // PAKSA system prompt Bahasa Indonesia di posisi pertama
    // Jika tidak ada system message atau bukan Bahasa Indonesia, tambahkan
    const hasIndonesianPrompt = messages.length > 0 && 
                                messages[0].role === 'system' && 
                                messages[0].content.includes('Bahasa Indonesia');
    
    if (!hasIndonesianPrompt) {
      // Hapus system message lama jika ada
      const filteredMessages = messages.filter(m => m.role !== 'system');
      
      // Tambahkan system prompt Bahasa Indonesia di awal
      return [
        {
          role: 'system',
          content: 'Kamu adalah asisten AI yang SELALU menjawab dalam Bahasa Indonesia. Jawab dengan singkat, jelas, dan ramah. WAJIB gunakan Bahasa Indonesia untuk semua respons.'
        },
        ...filteredMessages
      ];
    }

    return messages;
  }

  /**
   * Tambahkan pesan user ke channel conversation
   */
  addUserMessage(channelId: string, content: string, username: string): void {
    let conversation = this.channelConversations.get(channelId);
    
    if (!conversation) {
      conversation = {
        messages: [],
        lastUpdated: Date.now()
      };
      this.channelConversations.set(channelId, conversation);
    }

    // Tambahkan pesan user dengan info username
    conversation.messages.push({
      role: 'user',
      content: `${username}: ${content}`,
      author: username
    });

    // Update timestamp
    conversation.lastUpdated = Date.now();

    // Trim jika terlalu panjang (keep only last N messages)
    if (conversation.messages.length > this.maxMessagesPerChannel) {
      // Buang pesan lama, tapi keep system message jika ada
      const systemMessages = conversation.messages.filter(m => m.role === 'system');
      const otherMessages = conversation.messages.filter(m => m.role !== 'system');
      
      // Keep system messages + last (maxMessages - systemMessages.length) messages
      const keepCount = this.maxMessagesPerChannel - systemMessages.length;
      conversation.messages = [
        ...systemMessages,
        ...otherMessages.slice(-keepCount)
      ];
    }
  }

  /**
   * Tambahkan response bot ke channel conversation
   */
  addAssistantMessage(channelId: string, content: string): void {
    const conversation = this.channelConversations.get(channelId);
    
    if (!conversation) {
      return; // Should not happen
    }

    conversation.messages.push({
      role: 'assistant',
      content: content
    });

    conversation.lastUpdated = Date.now();
  }

  /**
   * Set system message untuk channel (personality)
   */
  setSystemMessage(channelId: string, systemMessage: string): void {
    let conversation = this.channelConversations.get(channelId);
    
    if (!conversation) {
      conversation = {
        messages: [],
        lastUpdated: Date.now()
      };
      this.channelConversations.set(channelId, conversation);
    }

    // Remove existing system messages
    conversation.messages = conversation.messages.filter(m => m.role !== 'system');
    
    // Add new system message at the beginning
    conversation.messages.unshift({
      role: 'system',
      content: systemMessage
    });
  }

  /**
   * Clear conversation untuk channel tertentu
   */
  clearChannelConversation(channelId: string): void {
    this.channelConversations.delete(channelId);
  }

  /**
   * Clear semua conversations
   */
  clearAllConversations(): void {
    this.channelConversations.clear();
  }

  /**
   * Get jumlah pesan dalam conversation
   */
  getConversationLength(channelId: string): number {
    const conversation = this.channelConversations.get(channelId);
    return conversation ? conversation.messages.length : 0;
  }
}

export const channelConversationService = new ChannelConversationService();
