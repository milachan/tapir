import { Events, Interaction, ChatInputCommandInteraction } from 'discord.js';

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction: Interaction) {
    if (!interaction.isChatInputCommand()) return;

    const command = (interaction.client as any).commands.get(interaction.commandName);

    if (!command) {
      console.error(`Command ${interaction.commandName} tidak ditemukan.`);
      return;
    }

    try {
      await command.execute(interaction as ChatInputCommandInteraction);
    } catch (error) {
      console.error('Error executing command:', error);
      
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ 
          content: 'Terjadi kesalahan saat menjalankan command ini!', 
          ephemeral: true 
        });
      } else {
        await interaction.reply({ 
          content: 'Terjadi kesalahan saat menjalankan command ini!', 
          ephemeral: true 
        });
      }
    }
  },
};
