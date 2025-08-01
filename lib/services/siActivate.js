const { generateTokens } = require('../helper/tokenHelper');
const { makeSiServiceRequest } = require('../helper/apiRequestHelper');
const { validateRequiredFieldsWithPaths } = require('../helper/validationHelper');
const { buildSiHeaders } = require('../helper/headerHelper');
const { validationError } = require('../utils/errorHandler');

/**
 * Common SI status update function
 * @param {Object} params - SI parameters
 * @param {Object} config - Configuration
 * @returns {Promise<Object>} SI response
 */
async function initiateSiStatusUpdateOperation({ merchantTxnId, standingInstruction }, config) {
  // 1. Field validation
  validateRequiredFieldsWithPaths(
    { merchantTxnId, standingInstruction },
    [
      'merchantTxnId',
      'standingInstruction',
      'standingInstruction.action',
      'standingInstruction.mandateId',
    ],
    'siActivate'
  );

  // 2. Prepare payload
  const payload = {
    merchantTxnId,
    standingInstruction,
  };

  // 3. Generate tokens
  const { jwe, jws } = await generateTokens(payload, config, 'siActivate');

  // 4. API call
  return makeSiServiceRequest({
    serviceType: 'status',
    data: jwe,
    headers: buildSiHeaders(jws, 'PUT'),
    operation: 'siActivate',
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
