const { post } = require('../core/http');
const { generateJWE, generateJWS } = require('../core/crypto');
const { validateRequiredFields } = require('../utils/validators');
const { logger } = require('../utils/logger');
const { ENDPOINTS, buildEndpoint } = require('../constants/endpoints');
const { paymentError, validationError } = require('../utils/errorHandler');

/**
 * Common refund initiation function
 * @param {Object} params - Refund parameters
 * @param {Object} config - Configuration
 * @returns {Promise<Object>} Refund response
 */
async function initiateRefundOperation({ gid, merchantTxnId, refundType, paymentData }, config) {

  console.log('Refund logic being executed from:', __filename);

  // 1. Basic validation
  
  if (!gid || !merchantTxnId || !refundType || (refundType !== 'F' && refundType !== 'P')) {
    logger.error('Missing required fields: gid, merchantTxnId, refundType or invalid refundType');
    throw validationError('refundType', 'must be F or P');
  }

  // 2. Conditional validation for partial refund
  if (refundType === 'P') {
    validateRequiredFields(
      { paymentData, 'paymentData.totalAmount': paymentData?.totalAmount },
      ['paymentData', 'paymentData.totalAmount']
    );
  }

  // 3. Prepare payload
  const payload = refundType === 'F'
    ? { merchantTxnId, refundType: 'F' }
    : { merchantTxnId, refundType: 'P', paymentData: { totalAmount: paymentData.totalAmount } };

  // 4. Generate tokens

let jwe, jws;
try {
  jwe = await generateJWE(payload, config);
} catch (error) {
  logger.error('JWE generation failed. for Refund:', error.message);
  throw paymentError('refund', 'Failed to generate JWE');
}

try {
  jws = await generateJWS(jwe, config);
} catch (error) {
  logger.error('JWS generation failed for Refund:', error.message);
  throw paymentError('refund', 'Failed to generate JWS');
}


  logger.debug('Token Generated');

  // 5. API call
  try {
  logger.info(`Initiating refund: ${gid}`);
  const endpoint = buildEndpoint(ENDPOINTS.TRANSACTION_SERVICE.REFUND, { gid });
  const response = await post(
    `${config.baseUrl}${endpoint}`,
    jwe,
    {
      'Content-Type': 'text/plain',
      'x-gl-token-external': jws,
    }
  );

  // 6. Response validation
  if (!response) {
    logger.error('Empty response from refund API');
    throw paymentError('refund', 'Empty response from refund API');
  }

  logger.debug('Received Response');

  // 7. Return result
  return {
    status: response.status,
    gid: response.gid,
    message: response.message,
  };
}catch (error) {
    logger.error('API call failed for Refund:', error.message);
    throw paymentError('refund', 'API call failed');
  }
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