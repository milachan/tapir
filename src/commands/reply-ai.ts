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

    await interaction.deferReply();

    try {
      console.log(`🤖 [REPLY-AI] Generating AI reply for message: "${targetMessage.content.substring(0, 50)}..."`);
      
      // Create context for AI
      const prompt = `Seseorang menulis pesan berikut:

"${targetMessage.content}"

Berikan respons yang relevan, membantu, dan ramah terhadap pesan tersebut. Jawab dalam Bahasa Indonesia.`;

      const response = await aiService.chat(prompt);

      const embed = new EmbedBuilder()
        .setTitle('🤖 Respons AI')
        .setDescription(response)
        .setColor(0x5865F2)
        .setFooter({ text: `Merespons pesan dari ${targetMessage.author.username}` })
        .setTimestamp();

      await interaction.editReply({
        embeds: [embed],
        // Create a reply to the original message
      });

      // Also reply to the original message
      await targetMessage.reply({
        embeds: [embed]
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
