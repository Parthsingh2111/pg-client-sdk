const { generateTokens } = require('../helper/tokenHelper');
const { makeSiServiceRequest } = require('../helper/apiRequestHelper');
const { validatePayload } = require('../helper/validationHelper');
const { buildSiHeaders } = require('../helper/headerHelper');
const { ENDPOINTS } = require('../constants/endpoints');
const { logger } = require('../utils/logger');

/**
 * Check SI status using mandateId
 * @param {Object} params - Payload containing standingInstruction.mandateId
 * @param {Object} config - Configuration object
 * @returns {Promise<Object>} API response
 */
async function initiateSiStatusCheck(params, config) {
  logger.info('Initiating SI status check');

  // Validate only required fields, process payload as-is [[memory:5125067]]
  validatePayload(params, {
    operation: 'SI status check',
    requiredFields: [
      'merchantTxnId',
      'standingInstruction',
      'standingInstruction.mandateId'
    ],
    validateSchema: false
  });

  const { jwe, jws } = await generateTokens(params, config, 'si-status');
  const headers = buildSiHeaders(jws);

  const response = await makeSiServiceRequest({
    method: 'POST',
    baseUrl: config.baseUrl,
    endpoint: ENDPOINTS.SI_SERVICE.STATUS,
    requestData: jwe,
    headers,
    operation: 'si status check'
  });

  logger.info('SI status check completed');
  return response;
}

module.exports = { initiateSiStatusCheck }; 