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
    console.log(`🔍 [MODERATION] Checking message from user ${userId}: "${content}"`);
    
    const result: ModerationResult = {
      isToxic: false,
      isSpam: false,
      confidence: 0,
    };

    // Check toxic content
    const toxicCheck = this.checkToxicContent(content);
    if (toxicCheck.isToxic) {
      console.log(`🚨 [MODERATION] TOXIC DETECTED! Reason: ${toxicCheck.reason}, Confidence: ${toxicCheck.confidence}`);
      result.isToxic = true;
      result.reason = toxicCheck.reason;
      result.confidence = toxicCheck.confidence;
      return result;
    }

    // Check spam (always enabled if moderation is enabled)
    const spamCheck = this.checkSpam(content, userId);
    if (spamCheck.isSpam) {
      console.log(`🚨 [MODERATION] SPAM DETECTED! Reason: ${spamCheck.reason}, Confidence: ${spamCheck.confidence}`);
      result.isSpam = true;
      result.reason = spamCheck.reason;
      result.confidence = spamCheck.confidence;
      return result;
    }

    console.log(`✅ [MODERATION] Message passed all checks`);
    return result;
  }

  private checkToxicContent(content: string): ModerationResult {
    const lowerContent = content.toLowerCase();
    const foundKeywords: string[] = [];

    console.log(`🔍 [MODERATION] Checking toxic keywords in: "${lowerContent}"`);

    for (const keyword of this.toxicKeywords) {
      if (lowerContent.includes(keyword)) {
        foundKeywords.push(keyword);
        console.log(`⚠️ [MODERATION] Found toxic keyword: "${keyword}"`);
      }
    }

    if (foundKeywords.length > 0) {
      // Setiap kata toxic = 0.5 confidence (jadi 1 kata = 0.5, 2 kata = 1.0)
      const confidence = Math.min(foundKeywords.length * 0.5, 1);
      console.log(`📊 [MODERATION] Toxic confidence: ${confidence} (threshold: ${this.toxicThreshold})`);
      
      if (confidence >= this.toxicThreshold) {
        console.log(`🚨 [MODERATION] ABOVE THRESHOLD! Blocking message.`);
        return {
          isToxic: true,
          isSpam: false,
          reason: `Mengandung kata-kata tidak pantas: ${foundKeywords.join(', ')}`,
          confidence,
        };
      } else {
        console.log(`⚠️ [MODERATION] Below threshold, allowing message.`);
      }
    } else {
      console.log(`✅ [MODERATION] No toxic keywords found.`);
    }

    return { isToxic: false, isSpam: false, confidence: 0 };
  }

  private checkSpam(content: string, userId: string): ModerationResult {
    console.log(`🔍 [SPAM] Checking spam for user ${userId}`);
    
    // Check spam patterns
    for (const pattern of this.spamPatterns) {
      if (pattern.test(content)) {
        console.log(`🚨 [SPAM] Pattern matched: ${pattern}`);
        return {
          isToxic: false,
          isSpam: true,
          reason: 'Terdeteksi sebagai spam (pattern matching)',
          confidence: 0.9,
        };
      }
    }

    // Check rate limiting (spam flooding)
    const now = Date.now();
    const userTimestamps = this.userMessageTimestamps.get(userId) || [];
    
    console.log(`📊 [SPAM] User ${userId} has ${userTimestamps.length} timestamps stored`);
    
    // Hapus timestamp lama (> 10 detik)
    const timeWindow = parseInt(process.env.SPAM_TIME_WINDOW || '10') * 1000;
    const recentTimestamps = userTimestamps.filter(ts => now - ts < timeWindow);
    
    console.log(`📊 [SPAM] Recent timestamps within ${timeWindow/1000}s: ${recentTimestamps.length}`);
    
    // Jika user kirim > limit pesan dalam time window
    const messageLimit = parseInt(process.env.SPAM_MESSAGE_LIMIT || '5');
    if (recentTimestamps.length >= messageLimit) {
      console.log(`🚨 [SPAM] RATE LIMIT EXCEEDED! ${recentTimestamps.length} messages in ${timeWindow/1000}s (limit: ${messageLimit})`);
      return {
        isToxic: false,
        isSpam: true,
        reason: `Terlalu banyak pesan (${recentTimestamps.length} dalam ${timeWindow/1000} detik)`,
        confidence: 0.95,
      };
    }

    // Update timestamps
    recentTimestamps.push(now);
    this.userMessageTimestamps.set(userId, recentTimestamps);
    
    console.log(`✅ [SPAM] No spam detected, updated timestamp count: ${recentTimestamps.length}`);

    return { isToxic: false, isSpam: false, confidence: 0 };
  }

  clearUserHistory(userId: string): void {
    this.userMessageTimestamps.delete(userId);
  }
}

export const moderationService = new ModerationService();
