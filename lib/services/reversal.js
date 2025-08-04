const { generateTokens } = require('../helper/tokenHelper');
const { makeTransactionServiceRequest } = require('../helper/apiRequestHelper');
const { validatePayload } = require('../helper/validationHelper');
const { buildJwtHeaders } = require('../helper/headerHelper');
const { ENDPOINTS } = require('../constants/endpoints');

/**
 * Common auth reversal initiation function
 * @param {Object} params - Reversal parameters
 * @param {Object} config - Configuration
 * @returns {Promise<Object>} Reversal response
 */
async function initiateAuthReversalOperation(payload, config) {
  const { gid } = payload;
  
  // 1. Field validation
  validatePayload(payload, {
    operation: 'auth reversal',
    requiredFields: ['gid', 'merchantTxnId'],
    validateSchema: false
  });

  // 2. Generate tokens (use the payload we received)
  const { jwe, jws } = await generateTokens(payload, config, 'auth reversal');
  const requestData = jwe;
  const headers = buildJwtHeaders(jws);

  // 3. API call
  return makeTransactionServiceRequest({
    baseUrl: config.baseUrl,
    endpoint: ENDPOINTS.TRANSACTION_SERVICE.AUTH_REVERSAL,
    gid,
    requestData,
    headers,
    operation: 'auth reversal',
  });
}

/**
 * Initiate an auth reversal.
 * @param {Object} params - Reversal parameters
 * @param {string} params.gid - Global transaction ID
 * @param {string} params.merchantTxnId - Transaction ID
 * @param {Object} config - Configuration object
 * @returns {Promise<Object>} Reversal response
 */
async function initiateAuthReversal(params, config) {
  return initiateAuthReversalOperation(params, config);
}

module.exports = { initiateAuthReversal };