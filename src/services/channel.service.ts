interface ChannelConfig {
  autoReplyChannels: string[];
  welcomeChannelId: string | null;
  moderationEnabled: boolean;
  channelPersonalities: Map<string, string>;
}

class ChannelService {
  private config: ChannelConfig;

  constructor() {
    this.config = {
      autoReplyChannels: process.env.AUTO_REPLY_CHANNELS
        ? process.env.AUTO_REPLY_CHANNELS.split(',').map(id => id.trim())
        : [],
      welcomeChannelId: process.env.WELCOME_CHANNEL_ID || null,
      moderationEnabled: process.env.MODERATION_ENABLED === 'true',
      channelPersonalities: new Map(),
    };

    this.initializePersonalities();
  }

  private initializePersonalities() {
    // Contoh personalities untuk channel berbeda
    // Bisa dikustomisasi sesuai kebutuhan
    this.config.channelPersonalities.set('general', 
      'Kamu adalah asisten yang ramah dan helpful. Jawab dengan santai dan informatif.'
    );
    this.config.channelPersonalities.set('gaming', 
      'Kamu adalah gamer enthusiast yang suka diskusi game. Gunakan bahasa gaming dan emoji 🎮.'
    );
    this.config.channelPersonalities.set('tech', 
      'Kamu adalah tech expert yang suka bahas teknologi. Jawab dengan detail teknis.'
    );
    this.config.channelPersonalities.set('memes', 
      'Kamu adalah bot yang fun dan suka bercanda. Gunakan banyak emoji dan humor 😂.'
    );
  }

  isAutoReplyChannel(channelId: string): boolean {
    return this.config.autoReplyChannels.includes(channelId);
  }

  getWelcomeChannelId(): string | null {
    return this.config.welcomeChannelId;
  }

  isModerationEnabled(): boolean {
    return this.config.moderationEnabled;
  }

  getChannelPersonality(channelName: string): string | null {
    // Cari personality berdasarkan nama channel
    const normalizedName = channelName.toLowerCase().replace(/[^a-z]/g, '');
    
    for (const [key, personality] of this.config.channelPersonalities.entries()) {
      if (normalizedName.includes(key)) {
        return personality;
      }
    }
    
    return null; // Default personality dari AI
  }

  addAutoReplyChannel(channelId: string): boolean {
    if (!this.config.autoReplyChannels.includes(channelId)) {
      this.config.autoReplyChannels.push(channelId);
      return true;
    }
    return false;
  }

  removeAutoReplyChannel(channelId: string): boolean {
    const index = this.config.autoReplyChannels.indexOf(channelId);
    if (index > -1) {
      this.config.autoReplyChannels.splice(index, 1);
      return true;
    }
    return false;
  }

  setWelcomeChannel(channelId: string): void {
    this.config.welcomeChannelId = channelId;
  }

  getAutoReplyChannels(): string[] {
    return [...this.config.autoReplyChannels];
  }
}

export const channelService = new ChannelService();
