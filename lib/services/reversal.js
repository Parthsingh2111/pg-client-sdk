const { generateTokens } = require('../helper/tokenHelper');
const { makeTransactionServiceRequest } = require('../helper/apiRequestHelper');
const { validatePayload } = require('../helper/validationHelper');
const { buildJwtHeaders } = require('../helper/headerHelper');
const { ENDPOINTS } = require('../constants/endpoints');
const { logger } = require('../utils/logger');

/**
 * Common auth reversal initiation function
 * @param {Object} params - Reversal parameters
 * @param {Object} config - Configuration
 * @returns {Promise<Object>} Reversal response
 */
async function initiateAuthReversalOperation(params, config) {
  const { gid, merchantTxnId } = params;
  
  logger.info('Initiating auth reversal operation', { gid, merchantTxnId });
  
  // 1. Comprehensive validation (without schema validation for transaction services)
  validatePayload(params, {
    operation: 'auth reversal',
    requiredFields: ['gid', 'merchantTxnId'],
    validateSchema: false // Disable schema validation for transaction services
  });

  // 3. Generate tokens (use the params we received)
  const { jwe, jws } = await generateTokens(params, config, 'auth-reversal');
  const requestData = jwe;
  const headers = buildJwtHeaders(jws);

  // 4. API call
  const response = await makeTransactionServiceRequest({
    baseUrl: config.baseUrl,
    endpoint: ENDPOINTS.TRANSACTION_SERVICE.AUTH_REVERSAL,
    gid,
    requestData,
    headers,
    operation: 'auth reversal',
  });

  logger.info('Auth reversal operation completed');

  return response;
}

/**
 * Initiate an auth reversal.
 * @param {Object} params - Reversal parameters
 * @param {string} params.gid - Global transaction ID
 * @param {string} params.merchantTxnId - Merchant transaction ID
 * @param {Object} config - Configuration object
 * @returns {Promise<Object>} Reversal response
 */
async function initiateAuthReversal(params, config) {
  return initiateAuthReversalOperation(params, config);
}

module.exports = { initiateAuthReversal };