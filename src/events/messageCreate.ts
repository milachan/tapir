import { Events, Message } from 'discord.js';
import { AIService } from '../services/ai.service';
import { getConversation, saveConversation } from '../services/conversation.service';
import { channelService } from '../services/channel.service';
import { moderationService } from '../services/moderation.service';
import { channelConversationService } from '../services/channel-conversation.service';

const aiService = new AIService();

module.exports = {
  name: Events.MessageCreate,
  async execute(message: Message) {
    // Ignore bot messages
    if (message.author.bot) return;

    console.log(`📨 Message received in channel ${message.channel.id} from ${message.author.username}`);
    console.log(`📋 Auto-reply channels: ${channelService.getAutoReplyChannels().join(', ')}`);

    // === MODERATION CHECK ===
    if (channelService.isModerationEnabled()) {
      const moderationResult = await moderationService.checkContent(
        message.content,
        message.author.id
      );

      if (moderationResult.isToxic || moderationResult.isSpam) {
        try {
          await message.delete();
          if ('send' in message.channel) {
            const warningMsg = await message.channel.send(
              `⚠️ ${message.author}, pesan kamu dihapus: ${moderationResult.reason}`
            );
            // Auto-delete warning after 5 seconds
            setTimeout(() => warningMsg.delete().catch(() => {}), 5000);
          }
        } catch (error) {
          console.error('Error moderating message:', error);
        }
        return;
      }
    }

    // === AUTO-REPLY IN SPECIFIC CHANNELS ===
    console.log(`🔍 Checking auto-reply: isAutoReply=${channelService.isAutoReplyChannel(message.channel.id)}, hasReference=${!!message.reference}`);
    if (!message.reference && channelService.isAutoReplyChannel(message.channel.id)) {
      try {
        // Show typing indicator
        if ('sendTyping' in message.channel) {
          await message.channel.sendTyping();
        }

        // Get channel-specific personality if exists
        const channelName = 'name' in message.channel ? message.channel.name : 'general';
        const personality = channelService.getChannelPersonality(channelName);
        
        // Set personality jika belum ada
        if (personality && channelConversationService.getConversationLength(message.channel.id) === 0) {
          channelConversationService.setSystemMessage(message.channel.id, personality);
        }

        // Add user message to channel history
        const username = message.author.username;
        channelConversationService.addUserMessage(message.channel.id, message.content, username);
        
        // Get updated conversation history for AI
        const conversationHistory = channelConversationService.getChannelConversation(message.channel.id);

        // Debug logging
        console.log(`📝 Channel ${message.channel.id} - History length: ${conversationHistory.length}`);
        console.log(`💬 New message from ${username}: ${message.content.substring(0, 50)}...`);

        // Check if conversation is too long (reduce to prevent token limit)
        if (conversationHistory.length > 20) {
          console.log(`⚠️ Conversation too long (${conversationHistory.length} messages), clearing old messages...`);
          channelConversationService.clearChannelConversation(message.channel.id);
          channelConversationService.addUserMessage(message.channel.id, message.content, username);
        }

        console.log(`🤖 Sending request to AI...`);
        
        // Get AI response with timeout
        const responsePromise = aiService.chat(message.content, conversationHistory);
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('AI response timeout')), 30000) // 30 second timeout
        );
        
        const response = await Promise.race([responsePromise, timeoutPromise]) as string;
        
        console.log(`✅ AI response received: ${response.substring(0, 50)}...`);

        // Add assistant response to channel history
        channelConversationService.addAssistantMessage(message.channel.id, response);

        // Send response
        const botReply = await message.reply(response.length > 2000 ? response.substring(0, 2000) : response);

        // Send remaining text if too long
        if (response.length > 2000) {
          const remaining = response.substring(2000);
          const chunks = remaining.match(/.{1,2000}/g) || [];
          for (const chunk of chunks) {
            if ('send' in message.channel) {
              await message.channel.send(chunk);
            }
          }
        }

        return;
      } catch (error: any) {
        console.error('❌ Error in auto-reply:', error.message || error);
        
        // Send error message to user
        try {
          if ('send' in message.channel) {
            let errorMsg = 'Maaf, terjadi kesalahan saat memproses pesan kamu. 😔';
            
            if (error.message?.includes('timeout')) {
              errorMsg = '⏰ Maaf, AI membutuhkan waktu terlalu lama. Coba lagi ya!';
            } else if (error.message?.includes('rate')) {
              errorMsg = '⏳ Maaf, terlalu banyak request. Tunggu sebentar ya!';
            } else if (error.message?.includes('token')) {
              errorMsg = '💬 Conversation terlalu panjang. Gunakan `/setchannel clearmemory` untuk reset.';
            }
            
            await message.reply(errorMsg);
          }
        } catch (replyError) {
          console.error('Failed to send error message:', replyError);
        }
        return;
      }
    }

    // === CONVERSATION CONTINUATION (REPLY TO BOT) ===
    if (!message.reference) return;

    try {
      // Get the referenced message
      const repliedMessage = await message.channel.messages.fetch(message.reference.messageId!);
      
      // Check if replied message is from our bot
      if (repliedMessage.author.id !== message.client.user?.id) return;

      // Show typing indicator
      if ('sendTyping' in message.channel) {
        await message.channel.sendTyping();
      }

      // Get conversation history
      let conversationHistory = getConversation(message.author.id, repliedMessage.id) || [];
      
      // Add user's new message
      conversationHistory.push({
        role: 'user',
        content: message.content
      });

      // Get AI response
      const response = await aiService.chat(message.content, conversationHistory);

      // Add AI response to history
      conversationHistory.push({
        role: 'assistant',
        content: response
      });

      // Send response
      const botReply = await message.reply(response.length > 2000 ? response.substring(0, 2000) : response);

      // Save updated conversation history with new message ID
      saveConversation(message.author.id, botReply.id, conversationHistory);

      // Send remaining text if too long
      if (response.length > 2000) {
        const remaining = response.substring(2000);
        const chunks = remaining.match(/.{1,2000}/g) || [];
        for (const chunk of chunks) {
          if ('send' in message.channel) {
            await message.channel.send(chunk);
          }
        }
      }

    } catch (error) {
      console.error('Error in message reply:', error);
      try {
        await message.reply('Maaf, terjadi kesalahan saat memproses pesan kamu. 😔');
      } catch (replyError) {
        console.error('Failed to send error message:', replyError);
      }
    }
  },
};
