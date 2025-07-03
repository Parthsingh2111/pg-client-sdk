const { post } = require('../core/http'); // assuming PUT handled via post with method override
const { generateJWE, generateJWS } = require('../core/crypto');
const { validateRequiredFields } = require('../utils/validators');
const { logger } = require('../utils/logger');

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
async function initiateActivateSI({ merchantTxnId, standingInstruction }, config) {
  // Validate required fields
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

  const payload = {
    merchantTxnId,
    standingInstruction,
  };

  const jwe = await generateJWE(payload, config);
  const jws = await generateJWS(jwe, config);

  try {
    logger.info(`Updating SI status: ${merchantTxnId}, Action: ${standingInstruction.action}`);
    const response = await post(
      `${config.baseUrl}/gl/v1/payments/si/status`,
      jwe,
      {
        'Content-Type': 'text/plain',
        'x-gl-token-external': jws,
        'x-http-method-override': 'PUT', // in case PUT isn't supported directly
      }
    );

    const data = response?.data || response;

    return {
      status: data.status || 'SUCCESS',
      message: data.message || 'Standing instruction status updated',
      mandateId: data.mandateId || standingInstruction.mandateId,
    };
  } catch (error) {
    logger.error(`SI Status update failed: ${error.message}`);
    throw new Error(`SI Status update failed: ${error.message}`);
  }
}

module.exports = { initiateActivateSI };  
