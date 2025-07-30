const { post } = require('../core/http');
const { generateJWE, generateJWS } = require('../core/crypto');
const { validateRequiredFields } = require('../utils/validators');
const { logger } = require('../utils/logger');
const { ENDPOINTS, buildEndpoint } = require('../constants/endpoints');
const { paymentError, validationError } = require('../utils/errorHandler');

/**
 * Validate YYYYMMDD format for startDate
 */
function validateStartDateFormat(dateStr) {
  if (!/^\d{8}$/.test(dateStr)) {
    throw validationError('startDate', `Invalid format: ${dateStr}. Use 'YYYYMMDD' format.`);
  }

  const year = parseInt(dateStr.substring(0, 4), 10);
  const month = parseInt(dateStr.substring(4, 6), 10);
  const day = parseInt(dateStr.substring(6, 8), 10);

  if (
    isNaN(year) || isNaN(month) || isNaN(day) ||
    month < 1 || month > 12 ||
    day < 1 || day > 31 // basic check; you can make this stricter if needed
  ) {
    throw validationError('startDate', `Invalid value: ${dateStr}`);
  }
}

/**
 * Common SI modification function
 * @param {Object} params - SI parameters
 * @param {Object} config - Configuration
 * @returns {Promise<Object>} SI response
 */
async function initiateSiModifyOperation({ merchantTxnId, standingInstruction }, config) {
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

  // 2. Validate startDate format if provided
  const startDate = standingInstruction?.data?.startDate;
  if (startDate) {
    validateStartDateFormat(startDate);
  }

  // 3. Prepare payload
  const payload = {
    merchantTxnId,
    standingInstruction,
  };

  // 4. Generate tokens
 let jwe, jws;
try {
  jwe = await generateJWE(payload, config);
} catch (error) {
  logger.error('JWE generation failed for siPause:', error.message);
  throw paymentError('siPause', 'Failed to generate JWE');
}

try {
  jws = await generateJWS(jwe, config);
} catch (error) {
  logger.error('JWS generation failed for siPause:', error.message);
  throw paymentError('siPause', 'Failed to generate JWS');
}

  logger.debug('Tokens generated');

  // 5. API call
  try {
  logger.info(`Modifying Standing Instruction: ${merchantTxnId}`);
  const response = await post(
    `${config.baseUrl}${ENDPOINTS.SI_SERVICE.MODIFY}`,
    jwe,
    {
      'Content-Type': 'text/plain',
      'x-gl-token-external': jws,
    }
  );

  // 6. Response validation
  if (!response) {
    throw paymentError('SI modify', 'Empty response from API');
  }

  logger.debug('Response received');

  // 7. Return result
  return {
    status: response.status || 'SUCCESS',
    message: response.message || 'Standing instruction modified',
    mandateId: response.mandateId || standingInstruction.mandateId,
  };
}catch (error) {
    logger.error('API call failed for siPause:', error.message);
    throw paymentError('siPause', 'API call failed');
  }
}

/**
 * Modify Standing Instruction (Pause / Pause with new startDate)
 */
async function initiatePauseSI(params, config) {
  return initiateSiModifyOperation(params, config);
}

module.exports = { initiatePauseSI };  
