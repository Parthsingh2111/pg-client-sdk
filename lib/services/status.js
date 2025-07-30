const { get } = require('../core/http');
const { pemToKey, generateJWS, generateJWE } = require('../core/crypto');
const crypto = require('crypto');
const { logger } = require('../utils/logger');
const { ENDPOINTS, buildEndpoint } = require('../constants/endpoints');
const { paymentError, validationError } = require('../utils/errorHandler');

/**
 * Common status check function
 * @param {string} gid - Global transaction ID
 * @param {Object} config - Configuration
 * @returns {Promise<Object>} Status response
 */
async function initiateCheckStatusOperation(gid, config) {
  // 1. Basic validation
  if (!gid) {
    throw validationError('gid', 'Missing gid');
  }

  logger.debug('Checking status for GID:', gid);

  const endpoint = buildEndpoint(ENDPOINTS.TRANSACTION_SERVICE.STATUS, { gid });
  const statusUrl = `${config.baseUrl}${endpoint}`;
  const payloadPath = endpoint;


  // 2. Generate tokens
  let jwe, jws;
  try {
    jwe = await generateJWE({}, config);
  } catch (error) {
    logger.error('JWE generation failed for status check:', error.message);
    throw paymentError('status', 'Failed to generate JWE');
  }

  try {
    jws = await generateJWS(payloadPath, config);
  } catch (error) {
    logger.error('JWS generation failed for status check:', error.message);
    throw paymentError('status', 'Failed to generate JWS');
  }

  logger.debug('Tokens generated');


  // 3. API call
  logger.info(`Checking status: ${gid}`);
  try {
    const response = await get(statusUrl, {
      'x-gl-token-external': jws,
    });

    // 4. Response validation
    if (!response) {
      throw paymentError('status check', 'Empty response from API');
    }

    // 5. Handle the actual API response structure
    // The API returns: { gid, status, message, data: { ... }, errors }
    const statusData = response.data || response;

    // 6. Return result
    return {
      status: statusData.status || response.status,
      gid: statusData.gid || response.gid,
      message: statusData.message || response.message,
    };
  } catch (error) {
    logger.error('API call failed for status check :', error.message);
    throw paymentError('status check', 'API call failed');
  }
}


/**
 * Check payment status.
 * @param {string} gid - Global transaction ID
 * @param {Object} config - Configuration object
 * @returns {Promise<Object>} Status response
 */
async function initiateCheckStatus(gid, config) {
  return initiateCheckStatusOperation(gid, config);
}

module.exports = { initiateCheckStatus };






