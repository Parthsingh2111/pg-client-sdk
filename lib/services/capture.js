const { post } = require('../core/http');
const { generateJWE, generateJWS } = require('../core/crypto');
const { validateRequiredFields } = require('../utils/validators');
const { logger } = require('../utils/logger');
const { ENDPOINTS, buildEndpoint } = require('../constants/endpoints');
const { paymentError, validationError } = require('../utils/errorHandler');

/**
 * Common capture initiation function
 * @param {Object} params - Capture parameters
 * @param {Object} config - Configuration
 * @returns {Promise<Object>} Capture response
 */
async function initiateCaptureOperation({ gid, merchantTxnId, captureType, paymentData = {} }, config) {
  // 1. Basic validation
  if (!gid || !merchantTxnId || !captureType) {
    throw validationError('capture', 'Missing required fields: gid, merchantTxnId, or captureType');
  }

  const apiCaptureType = captureType === 'PARTIAL' ? 'P' : 'F';

  // 2. Conditional validation for partial capture
  if (apiCaptureType === 'P') {
    validateRequiredFields(
      { paymentData },
      ['paymentData.totalAmount']
    );
  }

  // 3. Prepare payload
  const payload = {
    merchantTxnId,
    captureType: apiCaptureType,
    ...(apiCaptureType === 'P' && { paymentData }) // only include if partial
  };

  // 4. Generate tokens
let jwe, jws;
try {
  jwe = await generateJWE(payload, config);
} catch (error) {
  logger.error('JWE generation failed. for Capture:', error.message);
  throw paymentError('refund', 'Failed to generate JWE');
}

try {
  jws = await generateJWS(jwe, config);
} catch (error) {
  logger.error('JWS generation failed for Capture:', error.message);
  throw paymentError('refund', 'Failed to generate JWS');
}



  logger.debug('Tokens generated');

  // 5. API call

  logger.info(`Initiating capture for GID: ${gid}`);

  try {
  const endpoint = buildEndpoint(ENDPOINTS.TRANSACTION_SERVICE.CAPTURE, { gid });
  const response = await post(
    `${config.baseUrl}${endpoint}`,
    jwe,
    {
      'Content-Type': 'text/plain',
      'x-gl-token-external': jws,
    }
  );

  // 6. Response validation
  if (!response) {
    throw paymentError('capture', 'Empty response from API');
  }

  // 7. Return result
  return {
    status: response.status,
    gid: response.gid,
    message: response.message,
  };
} catch (error) {
    logger.error('API call failed for Capture:', error.message);
    throw paymentError('capture', 'API call failed');
  }
}

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
async function initiateCapture(params, config) {
  return initiateCaptureOperation(params, config);
}

module.exports = { initiateCapture };



