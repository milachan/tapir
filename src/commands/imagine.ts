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
    // Validate interaction first
    if (interaction.replied || interaction.deferred) {
      console.error('❌ [IMAGINE] Interaction already handled!');
      return;
    }

    const prompt = interaction.options.getString('prompt', true);
    
    console.log(`🎨 [IMAGINE] Generating image for prompt: "${prompt}"`);
    
    await interaction.reply('🎨 Sedang membuat gambar...');
    
    try {
      const imageData = await aiService.generateImage(prompt);
      
      console.log(`🖼️ [IMAGINE] Image data received: ${imageData?.substring(0, 100)}...`);
      
      if (imageData) {
        const embed = new EmbedBuilder()
          .setTitle('🎨 AI Generated Image')
          .setDescription(`**Prompt:** ${prompt}`)
          .setColor(0x5865F2)
          .setTimestamp();

        // Check if it's a URL or base64
        if (imageData.startsWith('http')) {
          console.log(`🌐 [IMAGINE] Using URL: ${imageData}`);
          embed.setImage(imageData);
          await interaction.editReply({ 
            content: '✅ Gambar berhasil dibuat!',
            embeds: [embed] 
          });
        } else if (imageData.startsWith('data:image')) {
          console.log(`📦 [IMAGINE] Converting base64 to attachment...`);
          // Convert base64 to buffer
          const base64Data = imageData.split(',')[1];
          const buffer = Buffer.from(base64Data, 'base64');
          const attachment = new AttachmentBuilder(buffer, { name: 'generated-image.png' });
          
          embed.setImage('attachment://generated-image.png');
          await interaction.editReply({ 
            content: '✅ Gambar berhasil dibuat!',
            embeds: [embed], 
            files: [attachment] 
          });
        }
        
        console.log(`✅ [IMAGINE] Image sent successfully`);
      } else {
        console.error(`❌ [IMAGINE] No image data received`);
        await interaction.editReply('❌ Maaf, gagal membuat gambar. 😔');
      }
    } catch (error) {
      console.error('❌ [IMAGINE] Error in imagine command:', error);
      await interaction.editReply('❌ Maaf, terjadi kesalahan saat membuat gambar. 😔\n```' + (error as Error).message + '```');
    }
  },
};
