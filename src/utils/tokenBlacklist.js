const logger = require('./logger');

/**
 * In-memory token blacklist
 * In production, this should be replaced with Redis or database storage
 */
class TokenBlacklist {
  constructor() {
    this.blacklist = new Set();
    this.expiryMap = new Map(); // Store token expiry times
    
    // Clean up expired tokens every hour
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60 * 60 * 1000);
  }

  /**
   * Add token to blacklist
   * @param {string} token - JWT token to blacklist
   * @param {number} expiresAt - Token expiration timestamp (ms)
   */
  add(token, expiresAt) {
    this.blacklist.add(token);
    this.expiryMap.set(token, expiresAt);
    logger.debug(`Token added to blacklist. Total blacklisted: ${this.blacklist.size}`);
  }

  /**
   * Check if token is blacklisted
   * @param {string} token - JWT token to check
   * @returns {boolean} True if token is blacklisted
   */
  isBlacklisted(token) {
    return this.blacklist.has(token);
  }

  /**
   * Remove token from blacklist
   * @param {string} token - JWT token to remove
   */
  remove(token) {
    this.blacklist.delete(token);
    this.expiryMap.delete(token);
    logger.debug(`Token removed from blacklist. Total blacklisted: ${this.blacklist.size}`);
  }

  /**
   * Clean up expired tokens from blacklist
   */
  cleanup() {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [token, expiresAt] of this.expiryMap.entries()) {
      if (expiresAt < now) {
        this.blacklist.delete(token);
        this.expiryMap.delete(token);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      logger.info(`Cleaned up ${cleanedCount} expired tokens from blacklist`);
    }
  }

  /**
   * Get blacklist size
   * @returns {number} Number of blacklisted tokens
   */
  size() {
    return this.blacklist.size;
  }

  /**
   * Clear all tokens from blacklist
   */
  clear() {
    this.blacklist.clear();
    this.expiryMap.clear();
    logger.info('Token blacklist cleared');
  }

  /**
   * Stop cleanup interval
   */
  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }
}

// Create singleton instance
const tokenBlacklist = new TokenBlacklist();

module.exports = tokenBlacklist;
