import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits, ChannelType } from 'discord.js';
import { channelService } from '../services/channel.service';
import { channelConversationService } from '../services/channel-conversation.service';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setchannel')
    .setDescription('Konfigurasi channel management')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(subcommand =>
      subcommand
        .setName('autoreply')
        .setDescription('Set channel untuk auto-reply AI')
        .addStringOption(option =>
          option
            .setName('action')
            .setDescription('Add atau remove channel')
            .setRequired(true)
            .addChoices(
              { name: 'Add', value: 'add' },
              { name: 'Remove', value: 'remove' },
              { name: 'List', value: 'list' }
            )
        )
        .addChannelOption(option =>
          option
            .setName('channel')
            .setDescription('Channel yang akan di-set')
            .addChannelTypes(ChannelType.GuildText)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('welcome')
        .setDescription('Set channel untuk welcome message')
        .addChannelOption(option =>
          option
            .setName('channel')
            .setDescription('Channel untuk welcome message')
            .setRequired(true)
            .addChannelTypes(ChannelType.GuildText)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('clearmemory')
        .setDescription('Clear conversation memory di channel')
        .addChannelOption(option =>
          option
            .setName('channel')
            .setDescription('Channel yang akan di-clear memorynya')
            .setRequired(true)
            .addChannelTypes(ChannelType.GuildText)
        )
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    try {
      // Defer reply immediately untuk avoid timeout
      await interaction.deferReply({ ephemeral: false });
      
      const subcommand = interaction.options.getSubcommand();

      if (subcommand === 'autoreply') {
        const action = interaction.options.getString('action', true);
        const channel = interaction.options.getChannel('channel');

        if (action === 'list') {
          const channels = channelService.getAutoReplyChannels();
          if (channels.length === 0) {
            await interaction.editReply('📝 Tidak ada channel auto-reply yang terdaftar.');
            return;
          }

          const channelMentions = channels.map(id => `<#${id}>`).join('\n');
          await interaction.editReply(`📝 **Auto-reply Channels:**\n${channelMentions}`);
          return;
        }

        if (!channel) {
          await interaction.editReply('❌ Silakan pilih channel!');
          return;
        }

        if (action === 'add') {
          const success = channelService.addAutoReplyChannel(channel.id);
          if (success) {
            await interaction.editReply(`✅ Channel ${channel} berhasil ditambahkan ke auto-reply!\n\nSekarang bot akan otomatis reply semua pesan di channel tersebut.`);
          } else {
            await interaction.editReply(`ℹ️ Channel ${channel} sudah ada di auto-reply list.`);
          }
        } else if (action === 'remove') {
          const success = channelService.removeAutoReplyChannel(channel.id);
          if (success) {
            await interaction.editReply(`✅ Channel ${channel} berhasil dihapus dari auto-reply!`);
          } else {
            await interaction.editReply(`ℹ️ Channel ${channel} tidak ada di auto-reply list.`);
          }
        }

      } else if (subcommand === 'welcome') {
        const channel = interaction.options.getChannel('channel', true);

        channelService.setWelcomeChannel(channel.id);
        await interaction.editReply(`✅ Welcome channel berhasil di-set ke ${channel}!`);
        
      } else if (subcommand === 'clearmemory') {
        const channel = interaction.options.getChannel('channel', true);

        const messageCount = channelConversationService.getConversationLength(channel.id);
        channelConversationService.clearChannelConversation(channel.id);
        
        if (messageCount > 0) {
          await interaction.editReply(`✅ Memory conversation di ${channel} berhasil di-clear! (${messageCount} pesan dihapus)`);
        } else {
          await interaction.editReply(`ℹ️ Channel ${channel} tidak memiliki conversation memory.`);
        }
      }

    } catch (error) {
      console.error('Error executing setchannel command:', error);
      
      try {
        if (interaction.deferred || interaction.replied) {
          await interaction.editReply('❌ Terjadi kesalahan saat mengatur channel.');
        } else {
          await interaction.reply('❌ Terjadi kesalahan saat mengatur channel.');
        }
      } catch (replyError) {
        console.error('Failed to send error message:', replyError);
      }
    }
  },
};
