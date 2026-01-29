/**
 * Base priority scores for different token types
 * Higher score = Higher priority
 */
const BASE_PRIORITY = {
  EMERGENCY: 100,
  PRIORITY: 80,
  FOLLOWUP: 60,
  ONLINE: 40,
  WALKIN: 20
};

/**
 * Calculate dynamic priority based on token type and waiting time
 * Priority increases with waiting time to ensure fairness
 * 
 * @param {string} type - Token type (EMERGENCY, PRIORITY, FOLLOWUP, ONLINE, WALKIN)
 * @param {Date} createdAt - Token creation timestamp
 * @returns {number} Calculated priority score
 */
exports.calculatePriority = (type, createdAt) => {
  const basePriority = BASE_PRIORITY[type] || 0;
  
  // Calculate waiting time in minutes
  const waitingTimeMs = Date.now() - new Date(createdAt).getTime();
  const waitingTimeMinutes = waitingTimeMs / (1000 * 60);
  
  // Add 0.2 priority points per minute of waiting
  // This ensures older tokens gradually gain priority
  const waitingBonus = waitingTimeMinutes / 5;
  
  return basePriority + waitingBonus;
};

/**
 * Get base priority for a token type
 */
exports.getBasePriority = (type) => {
  return BASE_PRIORITY[type] || 0;
};

/**
 * Compare two tokens by priority
 * Returns positive if token1 has higher priority
 */
exports.comparePriority = (token1, token2) => {
  return token2.priority - token1.priority;
};
