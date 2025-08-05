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
async function initiateCaptureOperation(params, config) {
  const { gid } = params;
  
  // 1. Comprehensive validation (without schema validation for transaction services)
  validatePayload(params, {
    operation: 'capture',
    requiredFields: ['gid', 'merchantTxnId', 'captureType'],
    validateSchema: false, // Disable schema validation for transaction services
    operationType: {
      field: 'captureType',
      validTypes: ['F', 'P']
    },
    conditionalValidation: {
      condition: 'captureType',
      value: 'PARTIAL',
      requiredFields: ['paymentData', 'paymentData.totalAmount']
    }
  });

  // 3. Generate tokens (use the params we received)
  const { jwe, jws } = await generateTokens(params, config, 'capture');
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
 * @param {string} params.merchantTxnId - Merchant transaction ID
 * @param {string} params.captureType - Capture type ('FULL' or 'PARTIAL')
 * @param {Object} [params.paymentData] - Payment data for partial capture
 * @param {Object} config - Configuration object
 * @returns {Promise<Object>} Capture response
 */
async function initiateCapture(params, config) {
  return initiateCaptureOperation(params, config);
}

module.exports = { initiateCapture };



