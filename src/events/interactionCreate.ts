import { Events, Interaction, ChatInputCommandInteraction, MessageContextMenuCommandInteraction } from 'discord.js';

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction: Interaction) {
    // Handle slash commands
    if (interaction.isChatInputCommand()) {
      // Prevent duplicate execution
      if (interaction.replied || interaction.deferred) {
        console.error(`❌ [INTERACTION] Command ${interaction.commandName} already handled!`);
        return;
      }

      const command = (interaction.client as any).commands.get(interaction.commandName);

      if (!command) {
        console.error(`Command ${interaction.commandName} tidak ditemukan.`);
        return;
      }

      try {
        console.log(`🎯 [INTERACTION] Executing slash command: ${interaction.commandName}`);
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
      return;
    }

    // Handle context menu commands
    if (interaction.isMessageContextMenuCommand()) {
      console.log(`🎯 [INTERACTION] Context menu triggered: ${interaction.commandName}`);
      
      const command = (interaction.client as any).commands.get(interaction.commandName);

      if (!command) {
        console.error(`Context menu command ${interaction.commandName} tidak ditemukan.`);
        return;
      }

      try {
        console.log(`🎯 [INTERACTION] Executing context menu: ${interaction.commandName}`);
        await command.execute(interaction as MessageContextMenuCommandInteraction);
      } catch (error) {
        console.error('Error executing context menu:', error);
        
        try {
          if (interaction.deferred) {
            await interaction.editReply({ 
              content: 'Terjadi kesalahan saat menjalankan command ini!' 
            });
          } else if (!interaction.replied) {
            await interaction.reply({ 
              content: 'Terjadi kesalahan saat menjalankan command ini!', 
              ephemeral: true 
            });
          }
        } catch (replyError) {
          console.error('Failed to send error message:', replyError);
        }
      }
      return;
    }
  },
};
