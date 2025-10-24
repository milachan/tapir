import { ContextMenuCommandBuilder, ApplicationCommandType, MessageContextMenuCommandInteraction, EmbedBuilder } from 'discord.js';
import { AIService } from '../services/ai.service';

const aiService = new AIService();

module.exports = {
  data: new ContextMenuCommandBuilder()
    .setName('Jawab dengan AI')
    .setType(ApplicationCommandType.Message),
  
  async execute(interaction: MessageContextMenuCommandInteraction) {
    try {
      console.log(`🎯 [REPLY-AI] Context menu triggered by ${interaction.user.username}`);
      
      const targetMessage = interaction.targetMessage;
      
      // CRITICAL: Defer immediately to prevent timeout (must be within 3 seconds)
      await interaction.deferReply({ ephemeral: false });
      console.log(`⏳ [REPLY-AI] Deferred reply successfully`);
      
      // Check if message has content
      if (!targetMessage.content || targetMessage.content.trim() === '') {
        await interaction.editReply({
          content: '❌ Pesan ini tidak memiliki teks yang bisa dijawab.'
        });
        return;
      }

      console.log(`🤖 [REPLY-AI] Generating AI reply for message: "${targetMessage.content.substring(0, 50)}..."`);
      
      // Create context for AI
      const prompt = `Seseorang menulis pesan berikut:

"${targetMessage.content}"

Berikan respons yang relevan, membantu, dan ramah terhadap pesan tersebut. Jawab dalam Bahasa Indonesia.`;

      const response = await aiService.chat(prompt);

      const embed = new EmbedBuilder()
        .setTitle('🤖 Respons AI')
        .setDescription(response.length > 4000 ? response.substring(0, 4000) + '...' : response)
        .setColor(0x5865F2)
        .setFooter({ text: `Merespons pesan dari ${targetMessage.author.username}` })
        .setTimestamp();

      // Reply to the original message (visible to everyone)
      await targetMessage.reply({
        embeds: [embed]
      });

      // Edit deferred reply to show success
      await interaction.editReply({
        content: '✅ Respons AI telah dikirim!'
      });

      console.log(`✅ [REPLY-AI] AI response sent successfully`);
    } catch (error: any) {
      console.error('❌ [REPLY-AI] Critical error:', error);
      
      try {
        // Try to respond with error message
        if (interaction.deferred) {
          await interaction.editReply({
            content: '❌ Maaf, terjadi kesalahan saat membuat respons AI.\n```' + (error.message || 'Unknown error') + '```'
          });
        } else if (!interaction.replied) {
          await interaction.reply({
            content: '❌ Maaf, terjadi kesalahan saat memproses request.',
            ephemeral: true
          });
        }
      } catch (replyError) {
        console.error('❌ [REPLY-AI] Failed to send error message:', replyError);
      }
    }
  },
};
