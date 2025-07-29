const { get } = require('../core/http');
const { pemToKey, generateJWS, generateJWE } = require('../core/crypto');
const crypto = require('crypto');
const { logger } = require('../utils/logger');

/**
 * Check payment status.
 * @param {string} gid - Global transaction ID
 * @param {Object} config - Configuration object
 * @returns {Promise<Object>} Status response
 */
async function initiatecheckStatus(gid, config) {
  if (!gid) {
    throw new Error('Missing gid');
  }
  logger.debug('Checking status for GID:', gid);

  const statusUrl = `${config.baseUrl}/gl/v1/payments/${gid}/status`;

  const payloadPath = `/gl/v1/payments/${gid}/status`;


  const jwe = await generateJWE({}, config);
  const jws = await generateJWS(payloadPath, config);

  logger.debug('token received');

  try {
    logger.info(`Checking status: ${gid}`);
    const response = await get(statusUrl, {
      'x-gl-token-external': jws,
    });

    // Response is now properly parsed as JSON object
   
    if (!response) {
      logger.error('Empty response from Api ');
      throw new Error('Empty response from Api');
    }    

    // Handle the actual API response structure
    // The API returns: { gid, status, message, data: { ... }, errors }
    const statusData = response.data || response;
    
    return {
      status: statusData.status || response.status,
      gid: statusData.gid || response.gid,
      message: statusData.message || response.message,
    };
    
  } catch (error) {
    logger.error(`Status check failed: ${error.message}`);
    throw new Error(`Status check failed: ${error.message}`);
  }
}

module.exports = { initiatecheckStatus };






