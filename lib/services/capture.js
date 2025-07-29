const { post } = require('../core/http');
const { generateJWE, generateJWS } = require('../core/crypto');
const { validateRequiredFields } = require('../utils/validators');
const { logger } = require('../utils/logger');

/**
 * Initiate a capture.
 * @param {Object} params - Capture parameters
 * @param {string} params.gid - Global transaction ID
 * @param {string} params.merchantTxnId - Transaction ID
 * @param {string} params.captureType - 'FULL' or 'PARTIAL' (client-facing)
 * @param {Object} params.paymentData - Required only for PARTIAL captures
 * @param {Object} config - Configuration object
 * @returns {Promise<Object>} Capture response
 */
async function initiateCapture({ gid, merchantTxnId, captureType, paymentData = {} }, config) {
  if (!gid || !merchantTxnId || !captureType) {
    throw new Error('Missing required fields: gid, merchantTxnId, or captureType');
  }

  const apiCaptureType = captureType === 'PARTIAL' ? 'P' : 'F';


  if (apiCaptureType === 'P') {
  validateRequiredFields(
    { paymentData },
    ['paymentData.totalAmount']
  );
}

  const payload = {
    merchantTxnId,
    captureType: apiCaptureType,
    ...(apiCaptureType === 'P' && { paymentData }) // only include if partial
  };

  const jwe = await generateJWE(payload, config);
  const jws = await generateJWS(jwe, config);

  logger.debug('Tokens generated');

  try {
    logger.info(`Initiating capture for GID: ${gid}`);
    const response = await post(
      `${config.baseUrl}/gl/v1/payments/${gid}/capture`,
      jwe,
      {
        'Content-Type': 'text/plain',
        'x-gl-token-external': jws,
      }
    );

   if (!response) {
      logger.error('Empty response from API');
      throw new Error('Empty response from API');
    }

    return {
      status: statusData.status || response.status,
      gid: statusData.gid || response.gid,
      message: statusData.message || response.message,
    };
    
  } catch (error) {
    logger.error(`Capture failed: ${error.message}`);
    throw new Error(`Capture failed: ${error.message}`);
  }
}

module.exports = { initiateCapture };



