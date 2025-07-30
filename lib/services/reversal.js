const { post } = require('../core/http');
const { generateJWE, generateJWS } = require('../core/crypto');
const { validateRequiredFields } = require('../utils/validators');
const { logger } = require('../utils/logger');
const { ENDPOINTS, buildEndpoint } = require('../constants/endpoints');
const { paymentError, validationError } = require('../utils/errorHandler');

/**
 * Common auth reversal initiation function
 * @param {Object} params - Reversal parameters
 * @param {Object} config - Configuration
 * @returns {Promise<Object>} Reversal response
 */
async function initiateAuthReversalOperation({ gid, merchantTxnId }, config) {
  // 1. Field validation
  validateRequiredFields(
    { gid, merchantTxnId },
    ['gid', 'merchantTxnId']
  );

  // 2. Prepare payload
  const payload = { merchantTxnId };

  // 3. Generate tokens


 let jwe, jws;
try {
  jwe = await generateJWE(payload, config);
} catch (error) {
  logger.error('JWE generation failed for Auth reversal:', error.message);
  throw paymentError('Auth reversal', 'Failed to generate JWE');
}

try {
  jws = await generateJWS(jwe, config);
} catch (error) {
  logger.error('JWS generation failed for Auth reversal:', error.message);
  throw paymentError('Auth reversal', 'Failed to generate JWS');
}

  logger.debug('Tokens generated');
  // 4. API call
  try {
  logger.info(`Initiating auth reversal: ${gid}`);
  const endpoint = buildEndpoint(ENDPOINTS.TRANSACTION_SERVICE.AUTH_REVERSAL, { gid });
  const response = await post(
    `${config.baseUrl}${endpoint}`,
    jwe,
    {
      'Content-Type': 'text/plain',
      'x-gl-token-external': jws,
    }
  );

  // 5. Response validation
  if (!response) {
    logger.error('Empty response from API');
    throw paymentError('auth reversal', 'Empty response from API');
  }

  logger.debug('Response received');

  // 6. Return result
  return {
    status: response.status,
    gid: response.gid,
    message: response.message,
  };
}catch (error) {
    logger.error('API call failed for Auth reversal:', error.message);
    throw paymentError('auth reversal', 'API call failed');
  }
}

/**
 * Initiate an auth reversal.
 * @param {Object} params - Reversal parameters
 * @param {string} params.gid - Global transaction ID
 * @param {string} params.merchantTxnId - Transaction ID
 * @param {Object} config - Configuration object
 * @returns {Promise<Object>} Reversal response
 */
async function initiateAuthReversal(params, config) {
  return initiateAuthReversalOperation(params, config);
}

module.exports = { initiateAuthReversal };