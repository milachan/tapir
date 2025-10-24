import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { AIService } from '../services/ai.service';
import { saveConversation } from '../services/conversation.service';

const aiService = new AIService();

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ask')
    .setDescription('Tanya sesuatu kepada AI')
    .addStringOption(option =>
      option.setName('pertanyaan')
        .setDescription('Pertanyaan yang ingin kamu tanyakan')
        .setRequired(true)
    ),
  
  async execute(interaction: ChatInputCommandInteraction) {
    try {
      // IMMEDIATELY defer reply untuk memberi waktu lebih (15 menit)
      await interaction.deferReply();
      
      const question = interaction.options.getString('pertanyaan', true);
      
      // Create conversation history
      const conversationHistory = [
        { role: 'user', content: question }
      ];
      
      const response = await aiService.chat(question);
      
      // Add response to history
      conversationHistory.push({ role: 'assistant', content: response });
      
      // Get the message and save conversation
      const sentMessage = await interaction.fetchReply();
      saveConversation(interaction.user.id, sentMessage.id, conversationHistory);
      
      // Split response if too long (Discord limit is 2000 characters)
      if (response.length > 2000) {
        const chunks = response.match(/.{1,2000}/g) || [];
        await interaction.editReply(chunks[0]);
        
        for (let i = 1; i < chunks.length; i++) {
          await interaction.followUp(chunks[i]);
        }
      } else {
        await interaction.editReply(response);
      }
    } catch (error) {
      console.error('Error in ask command:', error);
      
      try {
        if (interaction.deferred || interaction.replied) {
          await interaction.editReply('Maaf, terjadi kesalahan saat memproses pertanyaan kamu. 😔');
        } else {
          await interaction.reply('Maaf, terjadi kesalahan saat memproses pertanyaan kamu. 😔');
        }
      } catch (replyError) {
        console.error('Failed to send error message:', replyError);
      }
    }
  },
};
