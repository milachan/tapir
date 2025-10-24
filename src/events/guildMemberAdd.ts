import { Events, GuildMember, TextChannel } from 'discord.js';
import { AIService } from '../services/ai.service';
import { channelService } from '../services/channel.service';

const aiService = new AIService();

module.exports = {
  name: Events.GuildMemberAdd,
  async execute(member: GuildMember) {
    try {
      console.log(`👋 [WELCOME] New member joined: ${member.user.username} (ID: ${member.user.id})`);
      
      const welcomeChannelId = channelService.getWelcomeChannelId();
      
      if (!welcomeChannelId) {
        console.log('⚠️ [WELCOME] Welcome channel not configured. Use /setchannel welcome to set it.');
        return;
      }

      const channel = member.guild.channels.cache.get(welcomeChannelId) as TextChannel;
      
      if (!channel) {
        console.error('❌ [WELCOME] Welcome channel not found. Channel ID might be invalid.');
        return;
      }

      // Check bot permissions
      const permissions = channel.permissionsFor(member.guild.members.me);
      if (!permissions?.has('SendMessages')) {
        console.error('❌ [WELCOME] Bot tidak punya permission "Send Messages" di welcome channel!');
        return;
      }

      console.log(`🎨 [WELCOME] Generating AI welcome message for ${member.user.username}...`);

      // Show typing indicator
      await channel.sendTyping();

      // Generate AI welcome message dengan pantun/lelucon
      const prompt = `Buatkan sambutan hangat untuk member baru Discord bernama "${member.user.username}".

SYARAT PENTING:
1. Sambutan harus dalam Bahasa Indonesia yang hangat dan ramah
2. WAJIB buat pantun ATAU lelucon yang KREATIF dan dikaitkan dengan username "${member.user.username}"
3. Jika username bisa dijadikan permainan kata, manfaatkan itu untuk pantun/lelucon
4. Gunakan emoji yang sesuai (🎉 👋 😄 🎊 ✨)
5. Ajak member untuk perkenalkan diri
6. Total maksimal 4-5 baris
7. WAJIB gunakan Bahasa Indonesia, TIDAK BOLEH bahasa Inggris

CONTOH FORMAT:
Jika username "Andi":
"Pergi ke pasar beli roti
Pulang-pulang mampir ke tukang sate
Selamat datang Andi ke komunitas ini
Yuk kenalan, jangan malu-malu ngobrolnya! 🎉"

ATAU dengan lelucon:
"Halo [username]! 🎉
Selamat datang di server kita yang super seru!
Kenapa kamu datang? Karena kamu tau ini tempatnya orang-orang keren! 😄
Yuk perkenalkan diri dan join keseruannya! ✨"

Sekarang buatkan untuk username "${member.user.username}" dengan kreativitasmu! WAJIB BAHASA INDONESIA!`;

      const conversationHistory = [
        {
          role: 'system',
          content: 'Kamu adalah bot yang kreatif, suka berpantun dan membuat lelucon yang lucu dalam BAHASA INDONESIA. Kamu pandai membuat permainan kata dari nama orang. Sambutan kamu selalu ceria dan menghibur. WAJIB gunakan Bahasa Indonesia untuk SEMUA respons.'
        }
      ];

      const welcomeMessage = await aiService.chat(prompt, conversationHistory);

      // Send welcome message dengan mention member
      await channel.send(`${member} ${welcomeMessage}`);

      console.log(`✅ [WELCOME] Welcome message sent successfully for ${member.user.username}`);
      console.log(`📝 [WELCOME] Message preview: ${welcomeMessage.substring(0, 100)}...`);

    } catch (error) {
      console.error('❌ [WELCOME] Error sending welcome message:', error);
    }
  },
};
