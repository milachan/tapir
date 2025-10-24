import { Events, Message } from 'discord.js';
import { AIService } from '../services/ai.service';
import { getConversation, saveConversation } from '../services/conversation.service';
import { channelService } from '../services/channel.service';
import { moderationService } from '../services/moderation.service';
import { moderatorService } from '../services/moderator.service';
import { channelConversationService } from '../services/channel-conversation.service';

const aiService = new AIService();

// Track processed messages to prevent duplicate replies
const processedMessages = new Set<string>();
const MESSAGE_CACHE_TIME = 5000; // 5 seconds

module.exports = {
  name: Events.MessageCreate,
  async execute(message: Message) {
    // Ignore bot messages
    if (message.author.bot) return;

    // Check if message already being processed
    const messageKey = `${message.id}-${message.author.id}`;
    if (processedMessages.has(messageKey)) {
      console.log(`⚠️ [DUPLICATE] Message ${message.id} already being processed, skipping...`);
      return;
    }

    // Mark as being processed
    processedMessages.add(messageKey);
    
    // Auto-remove from cache after 5 seconds
    setTimeout(() => {
      processedMessages.delete(messageKey);
    }, MESSAGE_CACHE_TIME);

    console.log(`📨 Message received in channel ${message.channel.id} from ${message.author.username}`);
    console.log(`📋 Auto-reply channels: ${channelService.getAutoReplyChannels().join(', ')}`);

    // === MODERATION CHECK ===
    // Cek moderation: enabled globally DAN channel tidak di-exclude
    const moderationEnabled = channelService.isModerationEnabledInChannel(message.channelId);
    console.log(`🛡️ [MODERATION] Enabled in this channel: ${moderationEnabled}`);
    
    if (moderationEnabled) {
      const moderationResult = await moderationService.checkContent(
        message.content,
        message.author.id
      );

      if (moderationResult.isToxic || moderationResult.isSpam) {
        console.log(`🚨 [MODERATION] VIOLATION DETECTED! Taking action...`);
        try {
          // Simpan info pesan sebelum dihapus
          const violationInfo = {
            user: message.author,
            userId: message.author.id,
            username: message.author.username,
            content: message.content,
            channel: message.channel,
            channelName: 'name' in message.channel ? message.channel.name : 'DM',
            reason: moderationResult.reason,
            type: moderationResult.isToxic ? 'Toxic Content' : 'Spam',
            timestamp: new Date().toLocaleString('id-ID')
          };

          // Cek permission bot sebelum delete
          if (message.guild && message.channel.isTextBased() && 'permissionsFor' in message.channel) {
            const botMember = message.guild.members.me;
            const permissions = message.channel.permissionsFor(botMember);
            
            if (!permissions?.has('ManageMessages')) {
              console.error(`❌ [MODERATION] Bot tidak punya permission "Manage Messages" di channel ${violationInfo.channelName}`);
              console.error(`❌ [MODERATION] Pesan toxic dari ${violationInfo.username} TIDAK BISA dihapus!`);
              console.error(`📋 [MODERATION] Pesan: "${message.content}"`);
              
              // Tetap kirim notifikasi ke moderator meskipun tidak bisa delete
              if ('send' in message.channel) {
                await message.channel.send(
                  `⚠️ **${message.author}** Bot mendeteksi pelanggaran tapi tidak punya permission untuk menghapus pesan!\n` +
                  `📋 Alasan: **${moderationResult.reason}**\n` +
                  `🔧 Admin: Beri bot permission "Manage Messages" untuk moderasi otomatis.`
                ).catch(() => {});
              }
              
              // Skip delete, langsung ke notifikasi moderator
            } else {
              // Hapus pesan
              await message.delete();
              console.log(`✅ [MODERATION] Message deleted successfully`);
              
              // Kirim warning ke pelaku
              if ('send' in message.channel) {
                const warningMsg = await message.channel.send(
                  `⚠️ **Peringatan untuk ${message.author}**\n` +
                  `📋 Pesan kamu dihapus karena: **${moderationResult.reason}**\n` +
                  `🚫 Jenis pelanggaran: **${violationInfo.type}**\n` +
                  `⏰ Waktu: ${violationInfo.timestamp}\n\n` +
                  `Harap patuhi aturan server! Pelanggaran berulang akan berakibat sanksi.`
                );
                // Auto-delete warning after 10 seconds
                setTimeout(() => warningMsg.delete().catch(() => {}), 10000);
              }
            }
          } else {
            // DM channel atau tidak ada guild, skip moderation
            return;
          }

          // Kirim notifikasi ke moderator yang ditunjuk
          if (message.guild) {
            const moderators = moderatorService.getModerators(message.guild.id);
            
            if (moderators.length > 0) {
              // Kirim DM ke setiap moderator
              for (const moderatorId of moderators) {
                try {
                  const moderator = await message.client.users.fetch(moderatorId);
                  
                  await moderator.send({
                    embeds: [{
                      title: '🚨 Pelanggaran Terdeteksi',
                      color: moderationResult.isToxic ? 0xFF0000 : 0xFFA500,
                      description: `Ada pelanggaran di **${message.guild?.name}**`,
                      fields: [
                        {
                          name: '👤 Pelanggar',
                          value: `${violationInfo.username} (${violationInfo.user})\nID: ${violationInfo.userId}`,
                          inline: false
                        },
                        {
                          name: '📍 Channel',
                          value: `#${violationInfo.channelName}`,
                          inline: true
                        },
                        {
                          name: '🚫 Jenis Pelanggaran',
                          value: violationInfo.type,
                          inline: true
                        },
                        {
                          name: '📋 Alasan',
                          value: violationInfo.reason,
                          inline: false
                        },
                        {
                          name: '💬 Pesan yang Dihapus',
                          value: violationInfo.content.length > 500 
                            ? '```' + violationInfo.content.substring(0, 500) + '...```'
                            : '```' + violationInfo.content + '```',
                          inline: false
                        },
                        {
                          name: '⏰ Waktu',
                          value: violationInfo.timestamp,
                          inline: false
                        }
                      ],
                      footer: {
                        text: 'Bot Moderasi Otomatis • Klik nama user untuk info lebih'
                      },
                      timestamp: new Date().toISOString()
                    }]
                  });
                  
                  console.log(`📤 Notifikasi pelanggaran dikirim ke moderator: ${moderator.username}`);
                  
                } catch (dmError) {
                  console.error(`❌ Gagal mengirim DM ke moderator ${moderatorId}:`, dmError);
                }
              }
            } else {
              // Jika tidak ada moderator yang ditunjuk, kirim ke log channel atau owner
              const logChannelId = process.env.MODERATION_LOG_CHANNEL;

              if (logChannelId) {
                const logChannel = message.guild.channels.cache.get(logChannelId);
                
                if (logChannel && 'send' in logChannel) {
                  await logChannel.send({
                    embeds: [{
                      title: '🚨 Pelanggaran Terdeteksi',
                      color: moderationResult.isToxic ? 0xFF0000 : 0xFFA500,
                      description: '⚠️ **Belum ada moderator yang ditunjuk!**\nGunakan `/setmoderator add` untuk menunjuk moderator.',
                      fields: [
                        {
                          name: '👤 Pelanggar',
                          value: `${violationInfo.username} (${violationInfo.user})`,
                          inline: true
                        },
                        {
                          name: '📍 Channel',
                          value: `#${violationInfo.channelName}`,
                          inline: true
                        },
                        {
                          name: '🚫 Pelanggaran',
                          value: violationInfo.type,
                          inline: true
                        },
                        {
                          name: '📋 Alasan',
                          value: violationInfo.reason,
                          inline: false
                        },
                        {
                          name: '💬 Pesan',
                          value: violationInfo.content.substring(0, 500),
                          inline: false
                        }
                      ],
                      timestamp: new Date().toISOString()
                    }]
                  });
                }
              } else {
                // Fallback: kirim DM ke owner
                const owner = await message.guild.fetchOwner();
                if (owner) {
                  try {
                    await owner.send({
                      embeds: [{
                        title: '🚨 Pelanggaran Terdeteksi',
                        color: 0xFF0000,
                        description: `Ada pelanggaran di **${message.guild.name}**\n\n⚠️ **Tip**: Gunakan \`/setmoderator add\` untuk menunjuk moderator yang akan menerima notifikasi ini.`,
                        fields: [
                          {
                            name: '👤 Pelanggar',
                            value: `${violationInfo.username} (ID: ${violationInfo.userId})`,
                            inline: false
                          },
                          {
                            name: '📍 Channel',
                            value: `#${violationInfo.channelName}`,
                            inline: true
                          },
                          {
                            name: '🚫 Pelanggaran',
                            value: violationInfo.type,
                            inline: true
                          },
                          {
                            name: '📋 Alasan',
                            value: violationInfo.reason,
                            inline: false
                          },
                          {
                            name: '💬 Pesan',
                            value: violationInfo.content.substring(0, 500),
                            inline: false
                          }
                        ],
                        timestamp: new Date().toISOString()
                      }]
                    });
                  } catch (dmError) {
                    console.log('Could not send DM to owner:', dmError);
                  }
                }
              }
            }
          }

          console.log(`🚨 Moderation action taken for ${message.author.username}: ${moderationResult.reason}`);
          
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
        
        // Set personality di awal conversation atau update jika berubah
        if (channelConversationService.getConversationLength(message.channel.id) === 0) {
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

      console.log(`💬 [REPLY] User ${message.author.username} replying to bot message ${repliedMessage.id}`);

      // Double-check not already processed (extra safety)
      const replyKey = `reply-${message.id}`;
      if (processedMessages.has(replyKey)) {
        console.log(`⚠️ [REPLY] Already processing this reply, skipping...`);
        return;
      }
      processedMessages.add(replyKey);
      setTimeout(() => processedMessages.delete(replyKey), MESSAGE_CACHE_TIME);

      // Show typing indicator
      if ('sendTyping' in message.channel) {
        await message.channel.sendTyping();
      }

      // Get conversation history
      let conversationHistory = getConversation(message.author.id, repliedMessage.id) || [];
      
      console.log(`📝 [REPLY] Current history length: ${conversationHistory.length}`);

      // LIMIT: Keep only last 10 messages (5 user + 5 assistant) untuk prevent bloat
      if (conversationHistory.length > 10) {
        console.log(`⚠️ [REPLY] History too long (${conversationHistory.length}), keeping last 10 only`);
        conversationHistory = conversationHistory.slice(-10);
      }

      // Add user's new message
      conversationHistory.push({
        role: 'user',
        content: message.content
      });

      console.log(`🤖 [REPLY] Sending to AI with ${conversationHistory.length} messages in history`);

      // Get AI response dengan timeout
      const responsePromise = aiService.chat(message.content, conversationHistory);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('AI response timeout')), 30000)
      );
      
      const response = await Promise.race([responsePromise, timeoutPromise]) as string;

      console.log(`✅ [REPLY] AI response received: ${response.substring(0, 100)}...`);

      // Add AI response to history
      conversationHistory.push({
        role: 'assistant',
        content: response
      });

      // Send response (max 2000 chars per message)
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

    } catch (error: any) {
      console.error('❌ [REPLY] Error in message reply:', error.message || error);
      try {
        let errorMsg = 'Maaf, terjadi kesalahan saat memproses pesan kamu. 😔';
        
        if (error.message?.includes('timeout')) {
          errorMsg = '⏰ Maaf, AI membutuhkan waktu terlalu lama. Coba lagi ya!';
        }
        
        await message.reply(errorMsg);
      } catch (replyError) {
        console.error('Failed to send error message:', replyError);
      }
    }
  },
};
