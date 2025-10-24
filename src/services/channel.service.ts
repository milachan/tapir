interface ChannelConfig {
  autoReplyChannels: string[];
  welcomeChannelId: string | null;
  moderationEnabled: boolean;
  moderationExcludedChannels: string[];
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
      moderationExcludedChannels: [],
      channelPersonalities: new Map(),
    };

    this.initializePersonalities();
  }

  private initializePersonalities() {
    // Semua personalities WAJIB menggunakan Bahasa Indonesia
    this.config.channelPersonalities.set('general', 
      'Kamu adalah asisten yang ramah dan helpful. Jawab dengan santai dan informatif. WAJIB gunakan Bahasa Indonesia untuk SEMUA respons.'
    );
    this.config.channelPersonalities.set('gaming', 
      'Kamu adalah gamer enthusiast yang suka diskusi game. Gunakan bahasa gaming dan emoji 🎮. WAJIB gunakan Bahasa Indonesia untuk SEMUA respons.'
    );
    this.config.channelPersonalities.set('tech', 
      'Kamu adalah tech expert yang suka bahas teknologi. Jawab dengan detail teknis. WAJIB gunakan Bahasa Indonesia untuk SEMUA respons.'
    );
    this.config.channelPersonalities.set('memes', 
      'Kamu adalah bot yang fun dan suka bercanda. Gunakan banyak emoji dan humor 😂. WAJIB gunakan Bahasa Indonesia untuk SEMUA respons.'
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

  isModerationEnabledInChannel(channelId: string): boolean {
    // Moderasi aktif jika: enabled globally DAN channel tidak di-exclude
    return this.config.moderationEnabled && !this.config.moderationExcludedChannels.includes(channelId);
  }

  addModerationExcludedChannel(channelId: string): boolean {
    if (!this.config.moderationExcludedChannels.includes(channelId)) {
      this.config.moderationExcludedChannels.push(channelId);
      return true;
    }
    return false;
  }

  removeModerationExcludedChannel(channelId: string): boolean {
    const index = this.config.moderationExcludedChannels.indexOf(channelId);
    if (index > -1) {
      this.config.moderationExcludedChannels.splice(index, 1);
      return true;
    }
    return false;
  }

  getModerationExcludedChannels(): string[] {
    return [...this.config.moderationExcludedChannels];
  }

  getChannelPersonality(channelName: string): string | null {
    // Cari personality berdasarkan nama channel
    const normalizedName = channelName.toLowerCase().replace(/[^a-z]/g, '');
    
    for (const [key, personality] of this.config.channelPersonalities.entries()) {
      if (normalizedName.includes(key)) {
        return personality;
      }
    }
    
    // Default personality dalam Bahasa Indonesia
    return 'Kamu adalah asisten AI yang SELALU menjawab dalam Bahasa Indonesia. Jawab dengan singkat, jelas, dan ramah. WAJIB gunakan Bahasa Indonesia untuk semua respons.';
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
