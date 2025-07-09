const { get } = require('../core/http');
// const { pemToKey, generateJWS } = require('../core/crypto');
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

    if (!response) {
      logger.error('Empty response from Api ');
      throw new Error('Empty response from Api');
    }    

    return {
      status: response.data.status,
      gid: response.data.gid,
      message: response.data.message,
    };
  } catch (error) {
    logger.error(`Status check failed: ${error.message}`);
    throw new Error(`Status check failed: ${error.message}`);
  }
}

module.exports = { initiatecheckStatus };



