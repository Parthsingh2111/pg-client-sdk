const { post } = require('../core/http');
const { generateJWE, generateJWS } = require('../core/crypto');
const { validateRequiredFields } = require('../utils/validators');
const { logger } = require('../utils/logger');

/**
 * Initiate an auth reversal.
 * @param {Object} params - Reversal parameters
 * @param {string} params.gid - Global transaction ID
 * @param {string} params.merchantTxnId - Transaction ID
 * @param {Object} config - Configuration object
 * @returns {Promise<Object>} Reversal response
 */
async function initiateAuthReversal({ gid, merchantTxnId }, config) {
  validateRequiredFields(
    { gid, merchantTxnId },
    ['gid', 'merchantTxnId']
  );

  const payload = { merchantTxnId };
  const jwe = await generateJWE(payload, config);
  const jws = await generateJWS(jwe, config);

  logger.debug('Tokens reveived');

  try {
    logger.info(`Initiating auth reversal: ${gid}`);
    const response = await post(
      `${config.baseUrl}/gl/v1/payments/${gid}/auth-reversal`,
      jwe,
      {
        'Content-Type': 'text/plain',
        'x-gl-token-external': jws,
      }
    );


     if (!response) {
      logger.error('Empty response from Api ');
      throw new Error('Empty response from Api');
    }

    logger.debug('response Received');

    return {
      status: response.data.status || 'INITIATED',
      gid: response.data.gid || gid,
      message: response.data.message || 'Auth reversal request processed',
      reversalId: response.data.reversalId || '',
    };
  } catch (error) {
    logger.error(`Auth reversal failed: ${error.message}`);
    throw new Error(`Auth reversal failed: ${error.message}`);
  }
}

module.exports = { initiateAuthReversal };