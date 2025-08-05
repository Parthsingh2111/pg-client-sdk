const { generateTokens } = require('../helper/tokenHelper');
const { makeSiServiceRequest } = require('../helper/apiRequestHelper');
const { validatePayload } = require('../helper/validationHelper');
const { buildSiHeaders } = require('../helper/headerHelper');
const { ENDPOINTS } = require('../constants/endpoints');

/**
 * Common SI status update initiation function
 * @param {Object} params - SI status update parameters
 * @param {Object} config - Configuration
 * @returns {Promise<Object>} SI status update response
 */
async function initiateSiStatusUpdateOperation(params, config) {
  const { standingInstruction } = params;
  
  // 1. Comprehensive validation (without schema validation for SI services)
  validatePayload(params, {
    operation: 'SI activate',
    requiredFields: ['merchantTxnId', 'standingInstruction', 'standingInstruction.action', 'standingInstruction.mandateId'],
    validateSchema: false, // Disable schema validation for SI services
    operationType: {
      field: 'standingInstruction.action',
      validTypes: ['ACTIVATE']
    }
  });

  // 3. Generate tokens (use the params we received)
  const { jwe, jws } = await generateTokens(params, config, 'si-status');
  const requestData = jwe;
  const headers = buildSiHeaders(jws, 'PUT');

  // 4. API call
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
 * Activate a standing instruction.
 * @param {Object} params - SI activate parameters
 * @param {string} params.merchantTxnId - Merchant transaction ID
 * @param {Object} params.standingInstruction - Standing instruction details
 * @param {string} params.standingInstruction.action - Action ('ACTIVATE')
 * @param {string} params.standingInstruction.mandateId - Mandate ID
 * @param {Object} config - Configuration object
 * @returns {Promise<Object>} SI activate response
 */
async function initiateActivateSI(params, config) {
  return initiateSiStatusUpdateOperation(params, config);
}

module.exports = { initiateActivateSI };  
