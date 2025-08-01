const { generateTokens } = require('../helper/tokenHelper');
const { makeTransactionServiceRequest } = require('../helper/apiRequestHelper');
const { validateBasicFields, validateOperationType } = require('../helper/validationHelper');
const { buildJwtHeaders } = require('../helper/headerHelper');


/**
 * Common refund initiation function
 * @param {Object} params - Refund parameters
 * @param {Object} config - Configuration
 * @returns {Promise<Object>} Refund response
 */
async function initiateRefundOperation({ gid, merchantTxnId, refundType, paymentData }, config) {

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

  // 3. Prepare payload
  const payload = refundType === 'F'
    ? { merchantTxnId, refundType: 'F' }
    : { merchantTxnId, refundType: 'P', paymentData: { totalAmount: paymentData.totalAmount } };

  // 4. Generate tokens
  const { jwe, jws } = await generateTokens(payload, config, 'refund');

  // 5. API call
  return makeTransactionServiceRequest({
    serviceType: 'refund',
    gid,
    data: jwe,
    headers: buildJwtHeaders(jws),
    operation: 'refund',
    config
  });
}

/**
 * 
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