import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Tampilkan daftar command yang tersedia'),
  
  async execute(interaction: ChatInputCommandInteraction) {
    const embed = new EmbedBuilder()
      .setTitle('🤖 AI Bot Commands')
      .setDescription('Berikut adalah daftar command yang tersedia:')
      .addFields(
        { 
          name: '/ask [pertanyaan]', 
          value: 'Tanya sesuatu kepada AI dan dapatkan jawaban cerdas',
          inline: false 
        },
        { 
          name: '/imagine [prompt]', 
          value: 'Generate gambar dengan AI (hanya OpenAI DALL-E)',
          inline: false 
        },
        { 
          name: '/chat [pesan]', 
          value: 'Ngobrol santai dengan AI',
          inline: false 
        },
        { 
          name: '/help', 
          value: 'Tampilkan pesan bantuan ini',
          inline: false 
        }
      )
      .setColor('#5865F2')
      .setFooter({ text: 'AI Discord Bot' })
      .setTimestamp();
    
    await interaction.reply({ embeds: [embed] });
  },
};
