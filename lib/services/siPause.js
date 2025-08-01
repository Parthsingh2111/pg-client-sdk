const { generateTokens } = require('../helper/tokenHelper');
const { makeSiServiceRequest } = require('../helper/apiRequestHelper');
const { validateRequiredFieldsWithPaths } = require('../helper/validationHelper');
const { buildJwtHeaders } = require('../helper/headerHelper');


/**
 * Common SI modification function
 * @param {Object} params - SI parameters
 * @param {Object} config - Configuration
 * @returns {Promise<Object>} SI response
 */
async function initiateSiModifyOperation({ merchantTxnId, standingInstruction }, config) {

  if(standingInstruction.data){
    validateRequiredFieldsWithPaths(
      standingInstruction.data,
      [
      'merchantTxnId',
      'standingInstruction',
      'standingInstruction.action',
      'standingInstruction.mandateId',
      "standingInstruction.data.startDate",
      ],
      'siPause'
    );
  }

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
