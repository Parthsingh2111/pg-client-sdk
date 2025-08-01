const { generateTokens } = require('../helper/tokenHelper');
const { validatePayload } = require('../helper/validationHelper');
const { makePostRequest } = require('../helper/apiRequestHelper');
const { extractPaymentResponse } = require('../helper/responseHelper');
const { buildJwtHeaders, buildApiKeyHeaders } = require('../helper/headerHelper');
const { ENDPOINTS } = require('../constants/endpoints');
const { paymentError } = require('../utils/errorHandler');



// Main Payment Initiator
async function initiatePayment(payload, config, options = {}) {
  const {
    operation = 'payment',
    endpoint = ENDPOINTS.PAYMENT.INITIATE,
    requiredFields = [],
    useJWT = true,
    customValidation = null,
    customHeaders = {},
    responseValidation = null
  } = options;

  
  const { merchantTxnId } = payload;

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
  const response = await makePostRequest({
    baseUrl: config.baseUrl,
    endpoint,
    data: requestData,
    headers,
    operation,
    merchantTxnId,
    responseValidator: responseValidation,
    responseProcessor: (response) => {
      // Use unified response extractor with appropriate operation type
      const operationType = operation.includes('Auth') ? 'auth' : 'payment';
      return extractPaymentResponse(response, { operation: operationType });
    }
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
    responseValidation: (response) => {
      // API Key payment uses different response structure
      const redirectUrl = response.redirectUrl || response.redirect_url || response.payment_link;
      const statusUrl = response.statusUrl || response.status_url || null;

      if (!redirectUrl) {
        throw new Error('No payment link received');
      }

      return { redirectUrl, statusUrl };
    }
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
        throw new Error(
          standingInstruction.data.type === 'FIXED'
            ? 'startDate is required for FIXED SI type'
            : 'startDate should not be included for VARIABLE SI type'
        );
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
    responseValidation: (response) => {
      // Auth payment has different validation logic
      const redirectUrl = extractPaymentUrl(response);
      const statusUrl = extractStatusUrl(response);

      if (!redirectUrl && !statusUrl) {
        throw new Error('No payment or statusUrl link received');
      }

      return { redirectUrl, statusUrl };
    }
  });
}


module.exports = { initiateApiKeyPayment, initiateJwtPayment, initiateSiPayment, initiateAuthPayment };

