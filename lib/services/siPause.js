const { generateTokens } = require('../helper/tokenHelper');
const { makeSiServiceRequest } = require('../helper/apiRequestHelper');
const { validateBasicFields } = require('../helper/validationHelper');
const { buildJwtHeaders } = require('../helper/headerHelper');
const { ENDPOINTS } = require('../constants/endpoints');

/**
 * Common SI modification function
 * @param {Object} params - SI parameters
 * @param {Object} config - Configuration
 * @returns {Promise<Object>} SI response
 */
async function initiateSiModifyOperation(payload, config) {
  const { merchantTxnId, standingInstruction } = payload;
  
  // 1. Field validation
  validateBasicFields(
    { merchantTxnId, standingInstruction },
    ['merchantTxnId', 'standingInstruction'],
    'si pause'
  );

  // 2. Generate tokens (use the payload we received)
  const { jwe, jws } = await generateTokens(payload, config, 'si pause');
  const requestData = jwe;
  const headers = buildJwtHeaders(jws);

  // 3. API call
  return makeSiServiceRequest({
    baseUrl: config.baseUrl,
    endpoint: ENDPOINTS.SI_SERVICE.MODIFY,
    requestData,
    headers,
    operation: 'si pause',
    config,
    standingInstruction
  });
}

/**
 * Modify Standing Instruction (Pause / Pause with new startDate)
 * @param {Object} params - Parameters for SI modification
 * @param {string} params.merchantTxnId - Merchant transaction ID
 * @param {Object} params.standingInstruction - Standing instruction modification data
 * @param {string} params.standingInstruction.action - Action to perform (e.g., "PAUSE")
 * @param {string} params.standingInstruction.mandateId - Mandate ID
 * @param {Object} config - Configuration object
 * @returns {Promise<Object>} API response
 */
async function initiatePauseSI(params, config) {
  return initiateSiModifyOperation(params, config);
}

module.exports = { initiatePauseSI };  
