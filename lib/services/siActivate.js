const { post } = require('../core/http'); // assuming PUT handled via post with method override
const { generateJWE, generateJWS } = require('../core/crypto');
const { validateRequiredFields } = require('../utils/validators');
const { logger } = require('../utils/logger');
const { ENDPOINTS, buildEndpoint } = require('../constants/endpoints');
const { paymentError, validationError } = require('../utils/errorHandler');

/**
 * Common SI status update function
 * @param {Object} params - SI parameters
 * @param {Object} config - Configuration
 * @returns {Promise<Object>} SI response
 */
async function initiateSiStatusUpdateOperation({ merchantTxnId, standingInstruction }, config) {
  // 1. Field validation
  validateRequiredFields(
    {
      merchantTxnId,
      standingInstruction,
      'standingInstruction.action': standingInstruction?.action,
      'standingInstruction.mandateId': standingInstruction?.mandateId,
    },
    [
      'merchantTxnId',
      'standingInstruction',
      'standingInstruction.action',
      'standingInstruction.mandateId',
    ]
  );

  // 2. Prepare payload
  const payload = {
    merchantTxnId,
    standingInstruction,
  };

  // 3. Generate tokens
 let jwe, jws;
try {
  jwe = await generateJWE(payload, config);
} catch (error) {
  logger.error('JWE generation failed for siActivate:', error.message);
  throw paymentError('siAcitvate', 'Failed to generate JWE');
}

try {
  jws = await generateJWS(jwe, config);
} catch (error) {
  logger.error('JWS generation failed for siActivate:', error.message);
  throw paymentError('siAcitvate', 'Failed to generate JWS');
}

  logger.debug('Tokens generated');

  // 4. API call
  logger.info(`Updating SI status: ${merchantTxnId}, Action: ${standingInstruction.action}`);
  try {
  const response = await post(
    `${config.baseUrl}${ENDPOINTS.SI_SERVICE.STATUS}`,
    jwe,
    {
      'Content-Type': 'text/plain',
      'x-gl-token-external': jws,
      'x-http-method-override': 'PUT', // in case PUT isn't supported directly
    }
  );

  // 5. Response validation
  if (!response) {
    throw paymentError('SI status update', 'Empty response from API');
  }

  logger.debug('Response received');

  // 6. Return result
  return {
    status: response.status || 'SUCCESS',
    message: response.message || 'Standing instruction status updated',
    mandateId: response.mandateId || standingInstruction.mandateId,
  };
}catch (error) {
    logger.error('API call failed for siActivate:', error.message);
    throw paymentError('siActivate', 'API call failed');
  }
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
