const { generateTokens } = require('../helper/tokenHelper');
const { makeTransactionServiceRequest } = require('../helper/apiRequestHelper');
const { validatePayload } = require('../helper/validationHelper');
const { buildJwtHeaders } = require('../helper/headerHelper');
const { ENDPOINTS } = require('../constants/endpoints');

/**
 * Common status check initiation function
 * @param {Object} params - Status check parameters
 * @param {Object} config - Configuration
 * @returns {Promise<Object>} Status response
 */
async function initiateCheckStatusOperation(params, config) {
  const {gid} = params;
  
  // 1. Comprehensive validation (without schema validation for transaction services)
  validatePayload(params, {
    operation: 'status check',
    requiredFields: ['gid'],
    validateSchema: false // Disable schema validation for transaction services
  });


  // 3. Generate tokens (use the params we received)
  const endpointPath = `/gl/v1/payments/${gid}/status`;
  const { jws } = await generateTokens({}, config, 'status', endpointPath);
  
  const requestData = null
  const headers = buildJwtHeaders(jws);

  // 4. API call
  return makeTransactionServiceRequest({
    baseUrl: config.baseUrl,
    endpoint: ENDPOINTS.TRANSACTION_SERVICE.STATUS,
    gid,
    requestData,
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






