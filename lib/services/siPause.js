const { generateTokens } = require('../helper/tokenHelper');
const { makeSiServiceRequest } = require('../helper/apiRequestHelper');
const { validateRequiredFieldsWithPaths } = require('../helper/validationHelper');
const { validateStartDateFormat } = require('../helper/dateHelper');
const { buildJwtHeaders } = require('../helper/headerHelper');
const { validationError } = require('../utils/errorHandler');



/**
 * Common SI modification function
 * @param {Object} params - SI parameters
 * @param {Object} config - Configuration
 * @returns {Promise<Object>} SI response
 */
async function initiateSiModifyOperation({ merchantTxnId, standingInstruction }, config) {
  // 1. Field validation
  validateRequiredFieldsWithPaths(
    { merchantTxnId, standingInstruction },
    [
      'merchantTxnId',
      'standingInstruction',
      'standingInstruction.action',
      'standingInstruction.mandateId',
    ],
    'siPause'
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
  const { jwe, jws } = await generateTokens(payload, config, 'siPause');

  // 5. API call
  return makeSiServiceRequest({
    serviceType: 'modify',
    data: jwe,
    headers: buildJwtHeaders(jws),
    operation: 'siPause',
    config,
    standingInstruction
  });
}

/**
 * Modify Standing Instruction (Pause / Pause with new startDate)
 */
async function initiatePauseSI(params, config) {
  return initiateSiModifyOperation(params, config);
}

module.exports = { initiatePauseSI };  
