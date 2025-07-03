const { post } = require('../core/http');
const { generateJWE, generateJWS } = require('../core/crypto');
const { validateRequiredFields } = require('../utils/validators');
const { logger } = require('../utils/logger');

/**
 * Initiate a refund.
 * @param {Object} params - Refund parameters
 * @param {string} params.gid - Global transaction ID
 * @param {string} params.refundType - Refund type ('F' or 'P')
 * @param {Object} [params.paymentData] - Payment data for partial refund
 * @param {Object} config - Configuration object
 * @returns {Promise<Object>} Refund response
 */
async function initiateRefund({ gid, refundType, paymentData }, config) {
  if (!gid || !refundType || (refundType !== 'F' && refundType !== 'P')) {
    throw new Error('Invalid or missing gid or refundType (must be F or P)');
  }
  if (refundType === 'P') {
    validateRequiredFields(
      { paymentData, 'paymentData.totalAmount': paymentData?.totalAmount },
      ['paymentData', 'paymentData.totalAmount']
    );
  }

  const merchantTxnId = `REF${Date.now()}`;
  const payload = refundType === 'F'
    ? { merchantTxnId, refundType: 'F' }
    : { merchantTxnId, refundType: 'P', paymentData: { totalAmount: paymentData.totalAmount } };

  const jwe = await generateJWE(payload, config);
  const jws = await generateJWS(jwe, config);

  try {
    logger.info(`Initiating refund: ${gid}`);
    const response = await post(
      `${config.baseUrl}/gl/v1/payments/${gid}/refund`,
      jwe,
      {
        'Content-Type': 'text/plain',
        'x-gl-token-external': jws,
      }
    );

    return {
      status: response.data.status || 'INITIATED',
      gid: response.data.gid || gid,
      message: response.data.message || 'Refund request processed',
      refundId: response.data.refundId || '',
    };
  } catch (error) {
    logger.error(`Refund failed: ${error.message}`);
    throw new Error(`Refund failed: ${error.message}`);
  }
}

module.exports = { initiateRefund };