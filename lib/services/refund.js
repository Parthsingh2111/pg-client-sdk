const { generateTokens } = require('../helper/tokenHelper');
const { makeTransactionServiceRequest } = require('../helper/apiRequestHelper');
const { validateBasicFields, validateOperationType } = require('../helper/validationHelper');
const { buildJwtHeaders } = require('../helper/headerHelper');
const { ENDPOINTS } = require('../constants/endpoints');

/**
 * Common refund initiation function
 * @param {Object} params - Refund parameters
 * @param {Object} config - Configuration
 * @returns {Promise<Object>} Refund response
 */
async function initiateRefundOperation(payload, config) {
  const { gid, merchantTxnId, refundType, paymentData } = payload;
  
  // 1. Basic validation
  validateBasicFields({ gid, merchantTxnId, refundType }, ['gid', 'merchantTxnId', 'refundType'], 'refund');
  validateOperationType(refundType, ['F', 'P'], 'refund');

  // 2. Conditional validation for partial refund
  if (refundType === 'P') {
    validateBasicFields(
      { paymentData, 'paymentData.totalAmount': paymentData?.totalAmount },
      ['paymentData', 'paymentData.totalAmount'],
      'refund'
    );
  }

  // 3. Generate tokens (use the payload we received)
  const { jwe, jws } = await generateTokens(payload, config, 'refund');
  const requestData = jwe;
  const headers = buildJwtHeaders(jws);

  // 4. API call
  return makeTransactionServiceRequest({
    baseUrl: config.baseUrl,
    endpoint: ENDPOINTS.TRANSACTION_SERVICE.REFUND,
    gid,
    requestData,
    headers,
    operation: 'refund',
  });
}

/**
 * Initiate a refund.
 * @param {Object} params - Refund parameters
 * @param {string} params.gid - Global transaction ID
 * @param {string} params.merchantTxnId - Merchant transaction ID
 * @param {string} params.refundType - Refund type ('F' or 'P')
 * @param {Object} [params.paymentData] - Payment data for partial refund
 * @param {Object} config - Configuration object
 * @returns {Promise<Object>} Refund response
 */
async function initiateRefund(params, config) {
  return initiateRefundOperation(params, config);
}

module.exports = { initiateRefund };