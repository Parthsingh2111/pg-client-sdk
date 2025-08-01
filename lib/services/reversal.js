const { generateTokens } = require('../helper/tokenHelper');
const { makeTransactionServiceRequest } = require('../helper/apiRequestHelper');
const { validateBasicFields } = require('../helper/validationHelper');
const { buildJwtHeaders } = require('../helper/headerHelper');


/**
 * Common auth reversal initiation function
 * @param {Object} params - Reversal parameters
 * @param {Object} config - Configuration
 * @returns {Promise<Object>} Reversal response
 */
async function initiateAuthReversalOperation({ gid, merchantTxnId }, config) {
  // 1. Field validation
  validateBasicFields(
    { gid, merchantTxnId },
    ['gid', 'merchantTxnId'],
    'Auth reversal'
  );

  // 2. Prepare payload
  const payload = { merchantTxnId };

  // 3. Generate tokens
  const { jwe, jws } = await generateTokens(payload, config, 'Auth reversal');
  // 4. API call
  return makeTransactionServiceRequest({
    serviceType: 'reversal',
    gid,
    data: jwe,
    headers: buildJwtHeaders(jws),
    operation: 'Auth reversal',
    config
  });
}

/**
 * Initiate an auth reversal.
 * @param {Object} params - Reversal parameters
 * @param {string} params.gid - Global transaction ID
 * @param {string} params.merchantTxnId - Transaction ID
 * @param {Object} config - Configuration object
 * @returns {Promise<Object>} Reversal response
 */
async function initiateAuthReversal(params, config) {
  return initiateAuthReversalOperation(params, config);
}

module.exports = { initiateAuthReversal };