const { generateJWE, generateJWS } = require('../core/crypto');
const { logger } = require('../utils/logger');
const { paymentError } = require('../utils/errorHandler');

/**
 * Generate JWT tokens (JWE and JWS) for API requests
 * @param {Object} payload - The payload to encrypt in JWE
 * @param {Object} config - Configuration object containing keys and settings
 * @param {string} operation - Operation name for logging and error messages
 * @param {string} [digestInput] - Optional input for JWS generation (defaults to JWE)
 * @returns {Promise<Object>} Object containing jwe and jws tokens
 */
async function generateTokens(payload, config, operation, digestInput = null) {
  let jwe, jws;
  
  // Generate JWE
  try {
    jwe = await generateJWE(payload, config);
  } catch (error) {
    logger.error(`JWE generation failed for ${operation}:`, error.message);
    throw paymentError(operation, 'Failed to generate JWE', error);
  }

  // Generate JWS
  try {
    const inputForJWS = digestInput || jwe;
    jws = await generateJWS(inputForJWS, config);
  } catch (error) {
    logger.error(`JWS generation failed for ${operation}:`, error.message);
    throw paymentError(operation, 'Failed to generate JWS', error);
  }

  logger.debug(`Tokens generated for ${operation}`);

  // Return only the tokens
  return { jwe, jws };
}

module.exports = {
  generateTokens
}; 