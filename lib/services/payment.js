const { generateTokens } = require('../helper/tokenHelper');
const { validatePayload } = require('../helper/validationHelper');
const { makePaymentRequest } = require('../helper/apiRequestHelper');
const { buildJwtHeaders, buildApiKeyHeaders } = require('../helper/headerHelper');
const { ENDPOINTS } = require('../constants/endpoints');
const { logger } = require('../utils/logger');



// Main Payment Initiator
async function initiatePayment(payload, config, options = {}) {
  const {
    operation = 'payment',
    endpoint = ENDPOINTS.PAYMENT.INITIATE,
    requiredFields = [],
    useJWT = true,
    customValidation = null,
    customHeaders = {},
  } = options;

  // 1-3. Comprehensive Validation (Schema, Custom, Required Fields)
  validatePayload(payload, {
    operation,
    requiredFields,
    customValidation
  });


  // 4. Token Generation and Header Building
  let requestData;
  let headers;
  if (useJWT) {
    const { jwe, jws } = await generateTokens(payload, config, operation);
    requestData = jwe;
    headers = buildJwtHeaders(jws, customHeaders);
  } else {
    requestData = payload;
    headers = buildApiKeyHeaders(config.apiKey, customHeaders);
  }



  // 5. API Call with Response Processing
  const response = await makePaymentRequest({
    baseUrl: config.baseUrl,
    endpoint,
    requestData,
    headers,
    operation,
  });

  return response;
}



/**
 * Initiate API Key-based payment.
 * @param {Object} params - Payment parameters
 * @param {string} params.merchantTxnId - Transaction ID
 * @param {Object} params.paymentData - Payment details
 * @param {string} params.merchantCallbackURL - Callback URL
 * @param {Object} config - Configuration object
 * @returns {Promise<Object>} Payment response
 */
async function initiateApiKeyPayment(payload, config) {

  return initiatePayment(payload, config, {
    operation: 'API key payment',
    useJWT: false,
    requiredFields: [
      'merchantTxnId',
      'paymentData',
      'merchantCallbackURL',
      'paymentData.totalAmount',
      'paymentData.txnCurrency',
    ],
    customHeaders: {
      'x-gl-auth': config.apiKey,
    },
  });
}




/**
 * Initiate JWT-based payment.
 * @param {Object} params - Payment parameters
 * @param {string} params.merchantTxnId - Transaction ID
 * @param {Object} params.paymentData - Payment details
 * @param {string} params.merchantCallbackURL - Callback URL
 * @param {Object} config - Configuration object
 * @returns {Promise<Object>} Payment response
 */
async function initiateJwtPayment(payload, config) {
  return initiatePayment(payload, config, {
    operation: 'JWT payment',
    requiredFields: [
      'merchantTxnId',
      'paymentData',
      'merchantCallbackURL',
      'paymentData.totalAmount',
      'paymentData.txnCurrency',
    ]
  });
}



/**
 * Initiate Standing Instruction (SI) payment.
 * @param {Object} params - Payment parameters
 * @param {string} params.merchantTxnId - Transaction ID
 * @param {Object} params.paymentData - Payment details
 * @param {Object} params.standingInstruction - SI details
 * @param {string} params.merchantCallbackURL - Callback URL
 * @param {Object} config - Configuration object
 * @returns {Promise<Object>} Payment response
 */
async function initiateSiPayment(payload, config) {
  return initiatePayment(payload, config, {
    operation: 'SI payment',
    requiredFields: [
      'merchantTxnId',
      'paymentData',
      'standingInstruction',
      'merchantCallbackURL',
      'paymentData.totalAmount',
      'paymentData.txnCurrency',
      'standingInstruction.data',
      'standingInstruction.data.numberOfPayments',
      'standingInstruction.data.frequency',
      'standingInstruction.data.type',
    ],

    customValidation: (payload) => {
      const { standingInstruction } = payload;

      // Conditional validations for SI
      if (
        (standingInstruction.data.type === 'FIXED' && !standingInstruction.data.startDate) ||
        (standingInstruction.data.type === 'VARIABLE' && standingInstruction.data.startDate)
      ) {

        logger.error(
          `Invalid startDate for SI type ${standingInstruction.data.type}: ${standingInstruction.data.startDate}`
        );

        throw new Error(
          standingInstruction.data.type === 'FIXED'
            ? 'startDate is required for FIXED SI type'
            : 'startDate should not be included for VARIABLE SI type'
        );
      }

      if (!(standingInstruction.data.amount || standingInstruction.data.maxAmount)) {
        logger.error('Either amount or maxAmount is required for standingInstruction.data');
        throw new Error('Either amount or maxAmount is required for standingInstruction.data');
      }
    }
  });
}


/**
 * Initiate Auth payment.
 * @param {Object} params - Payment parameters
 * @param {string} params.merchantTxnId - Transaction ID
 * @param {Object} params.paymentData - Payment details
 * @param {Object} params.billingData - Billing details
 * @param {Object} params.captureTxn - Capture transaction details
 * @param {string} params.merchantCallbackURL - Callback URL
 * @param {Object} config - Configuration object
 * @returns {Promise<Object>} Payment response
 */
async function initiateAuthPayment(payload, config) {
  return initiatePayment(payload, config, {
    operation: 'Auth payment',
    requiredFields: [
      'merchantTxnId',
      'paymentData',
      'captureTxn',
      'merchantCallbackURL',
      'paymentData.totalAmount',
      'paymentData.txnCurrency',
    ],

  });
}


module.exports = { initiateApiKeyPayment, initiateJwtPayment, initiateSiPayment, initiateAuthPayment };

