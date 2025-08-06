const { generateTokens } = require('../helper/tokenHelper');
const { makeTransactionServiceRequest } = require('../helper/apiRequestHelper');
const {validatePayload} = require('../helper/validationHelper');
const { buildJwtHeaders } = require('../helper/headerHelper');
const { ENDPOINTS } = require('../constants/endpoints');
const { logger } = require('../utils/logger');

/**
 * Common refund initiation function
 * @param {Object} params - Refund parameters
 * @param {Object} config - Configuration
 * @returns {Promise<Object>} Refund response
 */
async function initiateRefundOperation(params, config) {
  const {gid, refundType, merchantTxnId} = params;
  
  logger.info('Initiating refund operation', { gid, refundType, merchantTxnId });
  
  // 1. Comprehensive validation (without schema validation for transaction services)
  validatePayload(params, {
    operation: 'refund',
    requiredFields: ['gid', 'merchantTxnId', 'refundType'], // All required fields
    validateSchema: false, // Disable schema validation for transaction services
    operationType: {
      field: 'refundType',
      validTypes: ['F', 'P']
    },
    conditionalValidation: {
      condition: 'refundType',
      value: 'P',
      requiredFields: ['paymentData', 'paymentData.totalAmount']
    }
  });

  // 3. Generate tokens (use the params we received)
  const { jwe, jws } = await generateTokens(params, config, 'refund');
  const requestData = jwe;
  const headers = buildJwtHeaders(jws);

  // 4. API call
  const response = await makeTransactionServiceRequest({
    baseUrl: config.baseUrl,
    endpoint: ENDPOINTS.TRANSACTION_SERVICE.REFUND,
    gid,
    requestData,
    headers,
    operation: 'refund',
  });

  logger.info('Refund operation completed');

  return response;
}

/**
 * Initiate a refund.
 * @param {Object} params - Refund parameters
 * @param {string} params.gid - Global transaction ID
 * @param {string} params.merchantTxnId - Merchant transaction ID
 * @param {string} params.refundType - Refund type ('F' or 'P')
 * @param {Object} [params.paymentData] - Payment data for partial refund
 * @param {Object} config - Configuration object
 * @returns {Promise<Object>} Refund response
 */
async function initiateRefund(params, config) {
  return initiateRefundOperation(params, config);
}

module.exports = { initiateRefund };