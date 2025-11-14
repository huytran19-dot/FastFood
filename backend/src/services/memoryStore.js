// In-memory store as fallback when Redis is not available
// This stores drone positions temporarily in memory

const memoryStore = new Map();

/**
 * Store drone position in memory
 * @param {string} key - Redis key format
 * @param {Object} value - Position data
 * @param {number} expireSeconds - Expiration time (not used in memory, but kept for API compatibility)
 */
function setMemory(key, value, expireSeconds = null) {
  const expireTime = expireSeconds ? Date.now() + (expireSeconds * 1000) : null;
  memoryStore.set(key, {
    value,
    expireTime
  });
  
  // Auto cleanup expired entries
  if (expireTime) {
    setTimeout(() => {
      if (memoryStore.has(key)) {
        const entry = memoryStore.get(key);
        if (entry.expireTime && Date.now() > entry.expireTime) {
          memoryStore.delete(key);
        }
      }
    }, expireSeconds * 1000);
  }
  
  return true;
}

/**
 * Get drone position from memory
 * @param {string} key - Redis key format
 * @returns {Object|null} - Position data or null
 */
function getMemory(key) {
  if (!memoryStore.has(key)) {
    return null;
  }
  
  const entry = memoryStore.get(key);
  
  // Check if expired
  if (entry.expireTime && Date.now() > entry.expireTime) {
    memoryStore.delete(key);
    return null;
  }
  
  return entry.value;
}

/**
 * Clear all memory entries (for testing/cleanup)
 */
function clearMemory() {
  memoryStore.clear();
}

module.exports = {
  setMemory,
  getMemory,
  clearMemory
};

