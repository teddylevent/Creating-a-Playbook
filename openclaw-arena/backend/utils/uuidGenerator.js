const { v4: uuidv4 } = require('uuid');

/**
 * Generates a unique agent ID in the format: agent_<8-char-hex>
 */
function generateAgentId() {
  return 'agent_' + uuidv4().replace(/-/g, '').slice(0, 8);
}

/**
 * Generates a unique user ID in the format: user_<8-char-hex>
 */
function generateUserId() {
  return 'user_' + uuidv4().replace(/-/g, '').slice(0, 8);
}

module.exports = { generateAgentId, generateUserId };
