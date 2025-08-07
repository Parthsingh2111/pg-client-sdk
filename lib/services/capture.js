const { generateTokens } = require('../helper/tokenHelper');
const { makeTransactionServiceRequest } = require('../helper/apiRequestHelper');
const { validatePayload } = require('../helper/validationHelper');
const { buildJwtHeaders } = require('../helper/headerHelper');
const { ENDPOINTS } = require('../constants/endpoints');
const { logger } = require('../utils/logger');

/**
 * Common capture initiation function
 * @param {Object} params - Capture parameters
 * @param {Object} config - Configuration
 * @returns {Promise<Object>} Capture response
 */
async function initiateCaptureOperation(params, config) {
  const { gid, captureType, merchantTxnId } = params;
  
  logger.info('Initiating capture operation', { gid, captureType, merchantTxnId });
  
  // 1. Comprehensive validation (without schema validation for transaction services)
  validatePayload(params, {
    operation: 'capture',
    requiredFields: ['gid', 'merchantTxnId', 'captureType'], // All required fields
    validateSchema: false, // Disable schema validation for transaction services
    operationType: {
      field: 'captureType',
      validTypes: ['F', 'P']
    },
    conditionalValidation: {
      condition: 'captureType',
      value: 'P',
      requiredFields: ['paymentData', 'paymentData.totalAmount']
    }
  });

  // 3. Generate tokens (use the params we received)
  const { jwe, jws } = await generateTokens(params, config, 'capture');
  const requestData = jwe;
  const headers = buildJwtHeaders(jws);

  // 4. API call
  const response = await makeTransactionServiceRequest({
    method: 'POST',
    baseUrl: config.baseUrl,
    endpoint: ENDPOINTS.TRANSACTION_SERVICE.CAPTURE,
    gid,
    requestData,
    headers,
    operation: 'capture',
  });

  logger.info('Capture operation completed');

  return response;
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



