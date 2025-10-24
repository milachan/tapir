import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder, AttachmentBuilder } from 'discord.js';
import { AIService } from '../services/ai.service';

const aiService = new AIService();

module.exports = {
  data: new SlashCommandBuilder()
    .setName('imagine')
    .setDescription('Generate gambar dengan AI (Hugging Face / DALL-E)')
    .addStringOption(option =>
      option.setName('prompt')
        .setDescription('Deskripsi gambar yang ingin dibuat')
        .setRequired(true)
    ),
  
  async execute(interaction: ChatInputCommandInteraction) {
    const prompt = interaction.options.getString('prompt', true);
    
    await interaction.reply('🎨 Sedang membuat gambar...');
    
    try {
      const imageData = await aiService.generateImage(prompt);
      
      if (imageData) {
        const embed = new EmbedBuilder()
          .setTitle('🎨 AI Generated Image')
          .setDescription(`**Prompt:** ${prompt}`)
          .setColor('#5865F2')
          .setTimestamp();

        // Check if it's a URL or base64
        if (imageData.startsWith('http')) {
          embed.setImage(imageData);
          await interaction.editReply({ embeds: [embed] });
        } else if (imageData.startsWith('data:image')) {
          // Convert base64 to buffer
          const base64Data = imageData.split(',')[1];
          const buffer = Buffer.from(base64Data, 'base64');
          const attachment = new AttachmentBuilder(buffer, { name: 'generated-image.png' });
          
          embed.setImage('attachment://generated-image.png');
          await interaction.editReply({ embeds: [embed], files: [attachment] });
        }
      } else {
        await interaction.editReply('Maaf, gagal membuat gambar. 😔');
      }
    } catch (error) {
      console.error('Error in imagine command:', error);
      await interaction.editReply('Maaf, terjadi kesalahan saat membuat gambar. 😔\nError: ' + (error as Error).message);
    }
  },
};
