const { generateTokens } = require('../helper/tokenHelper');
const { makeSiServiceRequest } = require('../helper/apiRequestHelper');
const { validateBasicFields } = require('../helper/validationHelper');
const { buildJwtHeaders } = require('../helper/headerHelper');
const { ENDPOINTS } = require('../constants/endpoints');

/**
 * Common SI status update function
 * @param {Object} params - SI parameters
 * @param {Object} config - Configuration
 * @returns {Promise<Object>} SI response
 */
async function initiateSiStatusUpdateOperation(payload, config) {
  const { merchantTxnId, standingInstruction } = payload;
  
  // 1. Field validation
  validateBasicFields(
    { merchantTxnId, standingInstruction },
    ['merchantTxnId', 'standingInstruction'],
    'si activate'
  );

  // 2. Generate tokens (use the payload we received)
  const { jwe, jws } = await generateTokens(payload, config, 'si activate');
  const requestData = jwe;
  const headers = buildJwtHeaders(jws);

  // 3. API call
  return makeSiServiceRequest({
    baseUrl: config.baseUrl,
    endpoint: ENDPOINTS.SI_SERVICE.STATUS,
    requestData,
    headers,
    operation: 'si activate',
    config,
    standingInstruction
  });
}

/**
 * Update Standing Instruction Status (e.g., ACTIVATE)
 * @param {Object} params - Parameters for SI status update
 * @param {string} params.merchantTxnId - Merchant transaction ID
 * @param {Object} params.standingInstruction - Standing instruction status data
 * @param {string} params.standingInstruction.action - Action to perform (e.g., "ACTIVATE")
 * @param {string} params.standingInstruction.mandateId - Mandate ID
 * @param {Object} config - Configuration object
 * @returns {Promise<Object>} API response
 */
async function initiateActivateSI(params, config) {
  return initiateSiStatusUpdateOperation(params, config);
}

module.exports = { initiateActivateSI };  
