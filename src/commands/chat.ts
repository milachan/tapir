import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { AIService } from '../services/ai.service';
import { saveConversation } from '../services/conversation.service';

const aiService = new AIService();

module.exports = {
  data: new SlashCommandBuilder()
    .setName('chat')
    .setDescription('Ngobrol santai dengan AI')
    .addStringOption(option =>
      option.setName('pesan')
        .setDescription('Pesan yang ingin kamu sampaikan')
        .setRequired(true)
    ),
  
  async execute(interaction: ChatInputCommandInteraction) {
    const message = interaction.options.getString('pesan', true);
    
    try {
      // Defer reply untuk memberi waktu lebih
      await interaction.deferReply();
      
      // Add a friendly system context
      const conversationHistory = [
        { 
          role: 'system', 
          content: 'Kamu adalah asisten AI yang ramah dan membantu. Jawab dengan bahasa yang santai dan friendly.' 
        },
        { role: 'user', content: message }
      ];
      
      const response = await aiService.chat(message, conversationHistory);
      
      // Add response to history
      conversationHistory.push({ role: 'assistant', content: response });
      
      // Get the message and save conversation
      const sentMessage = await interaction.fetchReply();
      saveConversation(interaction.user.id, sentMessage.id, conversationHistory);
      
      // Split response if too long
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
      console.error('Error in chat command:', error);
      
      try {
        if (interaction.deferred || interaction.replied) {
          await interaction.editReply('Maaf, terjadi kesalahan saat memproses pesan kamu. 😔');
        } else {
          await interaction.reply('Maaf, terjadi kesalahan saat memproses pesan kamu. 😔');
        }
      } catch (replyError) {
        console.error('Failed to send error message:', replyError);
      }
    }
  },
};
