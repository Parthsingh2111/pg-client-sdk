const { generateTokens } = require('../helper/tokenHelper');
const { makeSiServiceRequest } = require('../helper/apiRequestHelper');
const { validatePayload } = require('../helper/validationHelper');
const { buildSiHeaders } = require('../helper/headerHelper');
const { ENDPOINTS } = require('../constants/endpoints');
const { logger } = require('../utils/logger');

/**
 * Common SI modify initiation function
 * @param {Object} params - SI modify parameters
 * @param {Object} config - Configuration
 * @returns {Promise<Object>} SI modify response
 */
async function initiateSiModifyOperation(params, config) {
  const { standingInstruction, merchantTxnId } = params;
  
  logger.info('Initiating SI pause operation', { 
    merchantTxnId, 
    action: standingInstruction?.action,
    mandateId: standingInstruction?.mandateId 
  });
  
  // 1. Comprehensive validation (without schema validation for SI services)
  validatePayload(params, {
    operation: 'SI pause',
    requiredFields: ['merchantTxnId', 'standingInstruction', 'standingInstruction.action', 'standingInstruction.mandateId'],
    validateSchema: false, // Disable schema validation for SI services
    operationType: {
      field: 'standingInstruction.action',
      validTypes: ['PAUSE']
    }
  });

  // 3. Generate tokens (use the params we received)
  const { jwe, jws } = await generateTokens(params, config, 'si-modify');
  const requestData = jwe;
  const headers = buildSiHeaders(jws);

  // 4. API call
  const response = await makeSiServiceRequest({
    baseUrl: config.baseUrl,
    endpoint: ENDPOINTS.SI_SERVICE.MODIFY,
    requestData,
    headers,
    operation: 'si pause'
  });

  logger.info('SI pause operation completed');

  return response;
}

/**
 * Pause a standing instruction.
 * @param {Object} params - SI pause parameters
 * @param {string} params.merchantTxnId - Merchant transaction ID
 * @param {Object} params.standingInstruction - Standing instruction details
 * @param {string} params.standingInstruction.action - Action ('PAUSE')
 * @param {string} params.standingInstruction.mandateId - Mandate ID
 * @param {Object} config - Configuration object
 * @returns {Promise<Object>} SI pause response
 */
async function initiatePauseSI(params, config) {
  return initiateSiModifyOperation(params, config);
}

module.exports = { initiatePauseSI };  
