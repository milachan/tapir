import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits } from 'discord.js';
import { moderatorService } from '../services/moderator.service';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setmoderator')
    .setDescription('Kelola moderator yang akan menerima notifikasi pelanggaran')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(subcommand =>
      subcommand
        .setName('add')
        .setDescription('Tambahkan moderator')
        .addUserOption(option =>
          option
            .setName('user')
            .setDescription('User yang akan dijadikan moderator')
            .setRequired(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('remove')
        .setDescription('Hapus moderator')
        .addUserOption(option =>
          option
            .setName('user')
            .setDescription('User yang akan dihapus dari moderator')
            .setRequired(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('list')
        .setDescription('Lihat daftar moderator')
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('clear')
        .setDescription('Hapus semua moderator')
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    try {
      await interaction.deferReply({ ephemeral: true });

      const subcommand = interaction.options.getSubcommand();
      const guildId = interaction.guildId;

      if (!guildId) {
        await interaction.editReply('❌ Command ini hanya bisa digunakan di server!');
        return;
      }

      switch (subcommand) {
        case 'add': {
          const user = interaction.options.getUser('user', true);
          
          if (user.bot) {
            await interaction.editReply('❌ Tidak bisa menambahkan bot sebagai moderator!');
            return;
          }

          const added = moderatorService.addModerator(guildId, user.id);
          
          if (added) {
            await interaction.editReply(
              `✅ **${user.username}** berhasil ditambahkan sebagai moderator!\n` +
              `${user} akan menerima notifikasi DM setiap ada pelanggaran.`
            );
          } else {
            await interaction.editReply(`ℹ️ ${user.username} sudah terdaftar sebagai moderator.`);
          }
          break;
        }

        case 'remove': {
          const user = interaction.options.getUser('user', true);
          const removed = moderatorService.removeModerator(guildId, user.id);
          
          if (removed) {
            await interaction.editReply(`✅ **${user.username}** berhasil dihapus dari daftar moderator.`);
          } else {
            await interaction.editReply(`ℹ️ ${user.username} tidak ada dalam daftar moderator.`);
          }
          break;
        }

        case 'list': {
          const moderators = moderatorService.getModerators(guildId);
          
          if (moderators.length === 0) {
            await interaction.editReply('📋 Belum ada moderator yang ditunjuk.');
            return;
          }

          const moderatorList = moderators.map((id, index) => {
            return `${index + 1}. <@${id}>`;
          }).join('\n');

          await interaction.editReply(
            `📋 **Daftar Moderator (${moderators.length})**\n\n${moderatorList}\n\n` +
            `✉️ Mereka akan menerima DM setiap ada pelanggaran.`
          );
          break;
        }

        case 'clear': {
          moderatorService.clearModerators(guildId);
          await interaction.editReply('✅ Semua moderator berhasil dihapus.');
          break;
        }
      }

    } catch (error) {
      console.error('Error in setmoderator command:', error);
      
      try {
        const errorMessage = 'Maaf, terjadi kesalahan saat mengelola moderator. 😔';
        if (interaction.deferred || interaction.replied) {
          await interaction.editReply(errorMessage);
        } else {
          await interaction.reply({ content: errorMessage, ephemeral: true });
        }
      } catch (replyError) {
        console.error('Failed to send error message:', replyError);
      }
    }
  },
};
