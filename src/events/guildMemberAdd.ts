import { Events, GuildMember, TextChannel } from 'discord.js';
import { AIService } from '../services/ai.service';
import { channelService } from '../services/channel.service';

const aiService = new AIService();

module.exports = {
  name: Events.GuildMemberAdd,
  async execute(member: GuildMember) {
    try {
      const welcomeChannelId = channelService.getWelcomeChannelId();
      
      if (!welcomeChannelId) {
        console.log('Welcome channel not configured');
        return;
      }

      const channel = member.guild.channels.cache.get(welcomeChannelId) as TextChannel;
      
      if (!channel) {
        console.log('Welcome channel not found');
        return;
      }

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

CONTOH FORMAT:
Jika username "Andi":
"Pergi ke pasar beli roti
Pulang-pulang mampir ke tukang sate
Selamat datang Andi ke komunitas ini
Yuk kenalan, jangan malu-malu ngobrolnya! 🎉"

ATAU dengan lelucon:
"Halo ${member.user.username}! 🎉
Selamat datang di server kita yang super seru!
Kenapa kamu datang? Karena kamu tau ini tempatnya orang-orang keren! 😄
Yuk perkenalkan diri dan join keseruannya! ✨"

Sekarang buatkan untuk username "${member.user.username}" dengan kreativitasmu!`;

      const conversationHistory = [
        {
          role: 'system',
          content: 'Kamu adalah bot yang kreatif, suka berpantun dan membuat lelucon yang lucu. Kamu pandai membuat permainan kata dari nama orang. Sambutan kamu selalu ceria dan menghibur.'
        },
        {
          role: 'user',
          content: prompt
        }
      ];

      const welcomeMessage = await aiService.chat(prompt, conversationHistory);

      // Send welcome message dengan mention member
      await channel.send(`${member} ${welcomeMessage}`);

      console.log(`✅ Welcome message sent for ${member.user.username}`);

    } catch (error) {
      console.error('Error sending welcome message:', error);
    }
  },
};
