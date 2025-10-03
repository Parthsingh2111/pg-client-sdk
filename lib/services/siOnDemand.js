const { generateTokens } = require('../helper/tokenHelper');
const { makeSiServiceRequest } = require('../helper/apiRequestHelper');
const { validatePayload } = require('../helper/validationHelper');
const { buildSiHeaders } = require('../helper/headerHelper');
const { ENDPOINTS } = require('../constants/endpoints');
const { logger } = require('../utils/logger');

/**
 * Initiate SI on-demand sale using mandateId
 * @param {Object} params - Payload containing standingInstruction.mandateId (and optionally merchantTxnId)
 * @param {Object} config - Configuration object
 * @returns {Promise<Object>} API response
 */
async function initiateSiOnDemandVariable(params, config) {
  logger.info('Initiating SI on-demand sale, variable amount');

  // 1. Validate minimal required fields (no schema validation)
  validatePayload(params, {
    operation: 'SI on-demand sale',
    requiredFields: [
      'merchantTxnId',
      'paymentData',
      'paymentData.totalAmount',
      'standingInstruction',
      'standingInstruction.mandateId'
    ],
    validateSchema: false
  });

  // 2. Generate tokens using the payload as-is
  const { jwe, jws } = await generateTokens(params, config, 'si-on-demand-sale');
  const requestData = jwe;
  const headers = buildSiHeaders(jws);

  // 3. API call to SALE endpoint
  const response = await makeSiServiceRequest({
    method: 'POST',
    baseUrl: config.baseUrl,
    endpoint: ENDPOINTS.SI_SERVICE.SALE,
    requestData,
    headers,
    operation: 'si on-demand sale, variable amount'
  });

  logger.info('SI on-demand sale completed');
  return response;
}



// for fixed
async function initiateSiOnDemandFixed(params, config) {
  logger.info('Initiating SI on-demand Fixed amount');

  // 1. Validate minimal required fields (no schema validation)
  validatePayload(params, {
    operation: 'SI on-demand sale',
    requiredFields: [
      'merchantTxnId',
      'standingInstruction',
      'standingInstruction.mandateId'
    ],
    validateSchema: false
  });

  // 2. Generate tokens using the payload as-is
  const { jwe, jws } = await generateTokens(params, config, 'si-on-demand-sale');
  const requestData = jwe;
  const headers = buildSiHeaders(jws);

  // 3. API call to SALE endpoint
  const response = await makeSiServiceRequest({
    method: 'POST',
    baseUrl: config.baseUrl,
    endpoint: ENDPOINTS.SI_SERVICE.SALE,
    requestData,
    headers,
    operation: 'si on-demand sale, fixed amount'
  });

  logger.info('SI on-demand sale completed');
  return response;
}

module.exports = { initiateSiOnDemandVariable,initiateSiOnDemandFixed }; 