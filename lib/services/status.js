const { generateTokens } = require('../helper/tokenHelper');
const { makeTransactionServiceRequest } = require('../helper/apiRequestHelper');
const { validateBasicFields } = require('../helper/validationHelper');
const { buildJwtHeaders } = require('../helper/headerHelper');
const { ENDPOINTS } = require('../constants/endpoints');
const { logger } = require('../utils/logger');

/**
 * Common status check function
 * @param {Object} params - Status check parameters
 * @param {Object} config - Configuration
 * @returns {Promise<Object>} Status response
 */
async function initiateCheckStatusOperation(payload, config) {
  const { gid } = payload;
  
  // 1. Basic validation
  validateBasicFields({ gid }, ['gid'], 'status check');

  // 2. Generate tokens (use endpoint path as digest input for JWS)
  const endpointPath = `/gl/v1/payments/${gid}/status`;
  const { jws } = await generateTokens({}, config, 'status check', endpointPath);
  const headers = buildJwtHeaders(jws);

  // 3. API call
  return makeTransactionServiceRequest({
    baseUrl: config.baseUrl,
    endpoint: ENDPOINTS.TRANSACTION_SERVICE.STATUS,
    gid,
    requestData: null,
    headers,
    operation: 'status check',
  });
}

/**
 * Check payment status.
 * @param {Object} params - Status check parameters
 * @param {string} params.gid - Global transaction ID
 * @param {Object} config - Configuration object
 * @returns {Promise<Object>} Status response
 */
async function initiateCheckStatus(params, config) {
  return initiateCheckStatusOperation(params, config);
}

module.exports = { initiateCheckStatus };






