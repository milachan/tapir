import { ContextMenuCommandBuilder, ApplicationCommandType, MessageContextMenuCommandInteraction, EmbedBuilder } from 'discord.js';
import { AIService } from '../services/ai.service';

const aiService = new AIService();

module.exports = {
  data: new ContextMenuCommandBuilder()
    .setName('Jawab dengan AI')
    .setType(ApplicationCommandType.Message),
  
  async execute(interaction: MessageContextMenuCommandInteraction) {
    const targetMessage = interaction.targetMessage;
    
    // Validate interaction
    if (interaction.replied || interaction.deferred) {
      console.error('❌ [REPLY-AI] Interaction already handled!');
      return;
    }

    // Check if message has content
    if (!targetMessage.content || targetMessage.content.trim() === '') {
      await interaction.reply({
        content: '❌ Pesan ini tidak memiliki teks yang bisa dijawab.',
        ephemeral: true
      });
      return;
    }

    // Defer reply immediately to prevent timeout
    await interaction.deferReply({ ephemeral: false });

    try {
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

      console.log(`✅ [REPLY-AI] AI response sent`);
    } catch (error) {
      console.error('❌ [REPLY-AI] Error:', error);
      await interaction.editReply({
        content: '❌ Maaf, terjadi kesalahan saat membuat respons AI.\n```' + (error as Error).message + '```'
      });
    }
  },
};
