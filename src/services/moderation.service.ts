interface ModerationResult {
  isToxic: boolean;
  isSpam: boolean;
  reason?: string;
  confidence: number;
}

class ModerationService {
  private toxicKeywords: string[];
  private spamPatterns: RegExp[];
  private userMessageTimestamps: Map<string, number[]>;
  private toxicThreshold: number;

  constructor() {
    this.toxicKeywords = [
      // Kata-kata toxic/offensive dalam Bahasa Indonesia
      'anjing', 'bangsat', 'babi', 'kontol', 'memek', 'ngentot', 'tolol', 
      'bodoh', 'goblok', 'idiot', 'bajingan', 'kampret', 'asu', 'jancok',
      // English toxic words
      'fuck', 'shit', 'bitch', 'damn', 'ass', 'dick', 'pussy', 'cunt',
      'bastard', 'asshole', 'motherfucker', 'retard', 'nigger', 'fag'
    ];

    this.spamPatterns = [
      /(.)\1{10,}/i,                    // Karakter berulang lebih dari 10x
      /(discord\.gg|discordapp\.com)/i, // Discord invite links
      /http[s]?:\/\/[^\s]+/gi,         // Multiple URLs
    ];

    this.userMessageTimestamps = new Map();
    this.toxicThreshold = parseFloat(process.env.TOXIC_THRESHOLD || '0.7');
  }

  async checkContent(content: string, userId: string): Promise<ModerationResult> {
    const result: ModerationResult = {
      isToxic: false,
      isSpam: false,
      confidence: 0,
    };

    // Check toxic content
    const toxicCheck = this.checkToxicContent(content);
    if (toxicCheck.isToxic) {
      result.isToxic = true;
      result.reason = toxicCheck.reason;
      result.confidence = toxicCheck.confidence;
      return result;
    }

    // Check spam
    if (process.env.SPAM_DETECTION === 'true') {
      const spamCheck = this.checkSpam(content, userId);
      if (spamCheck.isSpam) {
        result.isSpam = true;
        result.reason = spamCheck.reason;
        result.confidence = spamCheck.confidence;
        return result;
      }
    }

    return result;
  }

  private checkToxicContent(content: string): ModerationResult {
    const lowerContent = content.toLowerCase();
    const foundKeywords: string[] = [];

    for (const keyword of this.toxicKeywords) {
      if (lowerContent.includes(keyword)) {
        foundKeywords.push(keyword);
      }
    }

    if (foundKeywords.length > 0) {
      const confidence = Math.min(foundKeywords.length * 0.3, 1);
      if (confidence >= this.toxicThreshold) {
        return {
          isToxic: true,
          isSpam: false,
          reason: `Mengandung kata-kata tidak pantas: ${foundKeywords.join(', ')}`,
          confidence,
        };
      }
    }

    return { isToxic: false, isSpam: false, confidence: 0 };
  }

  private checkSpam(content: string, userId: string): ModerationResult {
    // Check spam patterns
    for (const pattern of this.spamPatterns) {
      if (pattern.test(content)) {
        return {
          isToxic: false,
          isSpam: true,
          reason: 'Terdeteksi sebagai spam',
          confidence: 0.9,
        };
      }
    }

    // Check rate limiting (spam flooding)
    const now = Date.now();
    const userTimestamps = this.userMessageTimestamps.get(userId) || [];
    
    // Hapus timestamp lama (> 10 detik)
    const recentTimestamps = userTimestamps.filter(ts => now - ts < 10000);
    
    // Jika user kirim > 5 pesan dalam 10 detik
    if (recentTimestamps.length >= 5) {
      return {
        isToxic: false,
        isSpam: true,
        reason: 'Terlalu banyak pesan dalam waktu singkat',
        confidence: 0.95,
      };
    }

    // Update timestamps
    recentTimestamps.push(now);
    this.userMessageTimestamps.set(userId, recentTimestamps);

    return { isToxic: false, isSpam: false, confidence: 0 };
  }

  clearUserHistory(userId: string): void {
    this.userMessageTimestamps.delete(userId);
  }
}

export const moderationService = new ModerationService();
