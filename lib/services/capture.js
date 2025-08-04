const { generateTokens } = require('../helper/tokenHelper');
const { makeTransactionServiceRequest } = require('../helper/apiRequestHelper');
const { validatePayload } = require('../helper/validationHelper');
const { buildJwtHeaders } = require('../helper/headerHelper');
const { ENDPOINTS } = require('../constants/endpoints');

/**
 * Common capture initiation function
 * @param {Object} params - Capture parameters
 * @param {Object} config - Configuration
 * @returns {Promise<Object>} Capture response
 */
async function initiateCaptureOperation(payload, config) {
  const { gid, merchantTxnId, captureType, paymentData } = payload;
  
  // 1. Comprehensive validation
  validatePayload(payload, {
    operation: 'capture',
    requiredFields: ['gid', 'merchantTxnId', 'captureType'],
    operationType: {
      field: 'captureType',
      validTypes: ['F', 'P']
    },
    conditionalValidation: {
      condition: 'captureType',
      value: 'P',
      requiredFields: ['paymentData', 'paymentData.totalAmount']
    },
    validateSchema: false
  });

  // 3. Generate tokens (use the payload we received)
  const { jwe, jws } = await generateTokens(payload, config, 'capture');
  const requestData = jwe;
  const headers = buildJwtHeaders(jws);

  // 4. API call
  return makeTransactionServiceRequest({
    baseUrl: config.baseUrl,
    endpoint: ENDPOINTS.TRANSACTION_SERVICE.CAPTURE,
    gid,
    requestData,
    headers,
    operation: 'capture',
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



