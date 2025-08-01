const { generateTokens } = require('../helper/tokenHelper');
const { makeTransactionServiceRequest } = require('../helper/apiRequestHelper');
const { validateRequiredFields } = require('../utils/validators');
const { validationError } = require('../utils/errorHandler');

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
  const { jwe, jws } = await generateTokens(payload, config, 'capture');

  // 5. API call
  return makeTransactionServiceRequest({
    serviceType: 'capture',
    gid,
    data: jwe,
    headers: {
      'Content-Type': 'text/plain',
      'x-gl-token-external': jws,
    },
    operation: 'capture',
    config
  });
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



