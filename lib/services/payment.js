const { generateTokens } = require('../helper/tokenHelper');
const { validatePayload } = require('../helper/validationHelper');
const { makePaymentRequest } = require('../helper/apiRequestHelper');
const { buildJwtHeaders, buildApiKeyHeaders } = require('../helper/headerHelper');
const { ENDPOINTS } = require('../constants/endpoints');
const { logger } = require('../utils/logger');


// Main Payment Initiator
async function initiatePayment(params, config, options = {}) {
  const {
    operation = 'payment',
    endpoint = ENDPOINTS.PAYMENT.INITIATE,
    requiredFields = [],
    useJWT = true,
    customValidation = null,
    customHeaders = {},
  } = options;

  logger.info(`Initiating ${operation}`, { 
    merchantTxnId: params.merchantTxnId,
    useJWT,
    endpoint 
  });

  // 1-3. Comprehensive Validation (Schema, Custom, Required Fields)
  validatePayload(params, {
    operation,
    requiredFields,
    customValidation
  });

  // 4. Token Generation and Header Building
  let requestData;
  let headers;
  if (useJWT) {
    const { jwe, jws } = await generateTokens(params, config, operation);
    requestData = jwe;
    headers = buildJwtHeaders(jws, customHeaders);
  } else {
    requestData = params;
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

  logger.info(`${operation} completed successfully`, { 
    merchantTxnId: params.merchantTxnId,
    responseStatus: response?.status || 'unknown'
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
async function initiateApiKeyPayment(params, config) {
  return initiatePayment(params, config, {
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
async function initiateJwtPayment(params, config) {
  return initiatePayment(params, config, {
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
async function initiateSiPayment(params, config) {
  return initiatePayment(params, config, {
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
    customValidation: (params) => {
      const { standingInstruction } = params;

      // Validate SI type
      if (!['FIXED', 'VARIABLE'].includes(standingInstruction.data.type)) {
        throw new Error('Invalid SI type. Must be either FIXED or VARIABLE');
      }

      // Conditional validations for SI
      if (standingInstruction.data.type === 'FIXED' && !standingInstruction.data.startDate) {
        throw new Error('startDate is required for FIXED SI type');
      }

      if (standingInstruction.data.type === 'VARIABLE' && standingInstruction.data.startDate) {
        throw new Error('startDate should not be included for VARIABLE SI type');
      }

      if (!(standingInstruction.data.amount || standingInstruction.data.maxAmount)) {
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
async function initiateAuthPayment(params, config) {
  return initiatePayment(params, config, {
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

