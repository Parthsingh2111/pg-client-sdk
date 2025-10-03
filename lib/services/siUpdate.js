const { generateTokens } = require('../helper/tokenHelper');
const { makeSiServiceRequest } = require('../helper/apiRequestHelper');
const { validatePayload } = require('../helper/validationHelper');
const { buildSiHeaders } = require('../helper/headerHelper');
const { ENDPOINTS } = require('../constants/endpoints');
const { logger } = require('../utils/logger');

/**
 * Common SI modify initiation function for PAUSE operations
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
    requiredFields: [
      'merchantTxnId',
      'standingInstruction',
      'standingInstruction.action',
      'standingInstruction.mandateId'
    ],
    validateSchema: false,
    operationType: {
      field: 'standingInstruction.action',
      validTypes: ['PAUSE']
    },
    conditionalValidation: {
      condition: 'standingInstruction.data',
      value: true,
      requiredFields: ['standingInstruction.data.startDate']
    }
  });

  // 2. Generate tokens (use the params we received)
  const { jwe, jws } = await generateTokens(params, config, 'si-modify');
  const requestData = jwe;
  const headers = buildSiHeaders(jws);

  // 3. API call
  const response = await makeSiServiceRequest({
    method: 'POST',
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
 * Common SI status update initiation function for ACTIVATE operations
 * @param {Object} params - SI status update parameters
 * @param {Object} config - Configuration
 * @returns {Promise<Object>} SI status update response
 */
async function initiateSiStatusUpdateOperation(params, config) {
  const { standingInstruction, merchantTxnId } = params;
  
  logger.info('Initiating SI activate operation', { 
    merchantTxnId, 
    action: standingInstruction?.action,
    mandateId: standingInstruction?.mandateId 
  });
  
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

  // 2. Generate tokens (use the params we received)
  const { jwe, jws } = await generateTokens(params, config, 'si-status');
  const requestData = jwe;
  const headers = buildSiHeaders(jws);

  // 3. API call
  const response = await makeSiServiceRequest({
    method: 'PUT',
    baseUrl: config.baseUrl,
    endpoint: ENDPOINTS.SI_SERVICE.STATUS,
    requestData,
    headers,
    operation: 'si activate',
  });

  logger.info('SI activate operation completed');

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

module.exports = { initiatePauseSI, initiateActivateSI }; 


