const { generateTokens } = require('../helper/tokenHelper');
const { makeTransactionServiceRequest } = require('../helper/apiRequestHelper');
const { validateGid } = require('../helper/validationHelper');
const { validationError } = require('../utils/errorHandler');

/**
 * Common status check function
 * @param {string} gid - Global transaction ID
 * @param {Object} config - Configuration
 * @returns {Promise<Object>} Status response
 */
async function initiateCheckStatusOperation(gid, config) {
  // 1. Basic validation
  validateGid(gid, 'status check');

  // 2. Generate tokens
  const { jws } = await generateTokens({}, config, 'status check', `/gl/v1/payments/${gid}/status`);

  // 3. API call
  return makeTransactionServiceRequest({
    serviceType: 'status',
    gid,
    data: null,
    headers: {
      'x-gl-token-external': jws,
    },
    operation: 'status check',
    config
  });
}


/**
 * Check payment status.
 * @param {string} gid - Global transaction ID
 * @param {Object} config - Configuration object
 * @returns {Promise<Object>} Status response
 */
async function initiateCheckStatus(gid, config) {
  return initiateCheckStatusOperation(gid, config);
}

module.exports = { initiateCheckStatus };






