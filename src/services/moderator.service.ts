interface ModeratorConfig {
  [guildId: string]: string[]; // guildId -> array of user IDs
}

class ModeratorService {
  private moderators: ModeratorConfig;

  constructor() {
    this.moderators = {};
  }

  /**
   * Tambahkan moderator untuk server tertentu
   */
  addModerator(guildId: string, userId: string): boolean {
    if (!this.moderators[guildId]) {
      this.moderators[guildId] = [];
    }

    if (this.moderators[guildId].includes(userId)) {
      return false; // Already exists
    }

    this.moderators[guildId].push(userId);
    return true;
  }

  /**
   * Hapus moderator dari server tertentu
   */
  removeModerator(guildId: string, userId: string): boolean {
    if (!this.moderators[guildId]) {
      return false;
    }

    const index = this.moderators[guildId].indexOf(userId);
    if (index === -1) {
      return false;
    }

    this.moderators[guildId].splice(index, 1);
    return true;
  }

  /**
   * Dapatkan daftar moderator untuk server
   */
  getModerators(guildId: string): string[] {
    return this.moderators[guildId] || [];
  }

  /**
   * Clear semua moderator di server
   */
  clearModerators(guildId: string): void {
    delete this.moderators[guildId];
  }

  /**
   * Check apakah user adalah moderator
   */
  isModerator(guildId: string, userId: string): boolean {
    return this.moderators[guildId]?.includes(userId) || false;
  }
}

export const moderatorService = new ModeratorService();
