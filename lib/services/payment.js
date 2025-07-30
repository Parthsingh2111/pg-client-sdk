const { post } = require('../core/http');
const { generateJWE, generateJWS } = require('../core/crypto');
const { validateRequiredFields, validateEmail, sanitizeInput } = require('../utils/validators');
const { logger } = require('../utils/logger');
const { validatePaycollectPayload } = require('../utils/schemaValidator');
const { ENDPOINTS, buildEndpoint } = require('../constants/endpoints');
const { paymentError, cryptoError, apiError } = require('../utils/errorHandler');

/**
 * Extract payment URL from response
 * @param {Object} response - API response
 * @returns {string|null} Payment URL
 */

function extractPaymentUrl(response) {
  return response?.data?.redirectUrl ||
         response?.data?.redirect_url ||
         response?.data?.payment_link ||
         response?.redirectUrl ||
         response?.redirect_url ||
         response?.payment_link ||
         null;
}

// Extract Status URL
function extractStatusUrl(response) {
  return response?.data?.statusUrl ||
         response?.data?.status_url ||
         response?.statusUrl ||
         response?.status_url ||
         null;
}

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

  // 1. Schema Validation
  try {
    validatePaycollectPayload(payload);
  } catch (error) {
    logger.error(`Payload validation failed for ${operation}: ${error.message}`, { error });
    throw validationError(operation, 'Invalid payload structure', error);
  }

  // 2. Custom Validation
  try {
    if (customValidation) customValidation(payload);
  } catch (error) {
    logger.error(`Custom validation failed for ${operation}: ${error.message}`, { error });
    throw validationError(operation, `Custom validation failed: ${error.message}`, error);
  }

  // 3. Required Field Validation
  try {
    if (requiredFields.length > 0) {
      const validationData = {};
      requiredFields.forEach(field => {
        const keys = field.split('.');
        let value = payload;
        for (const key of keys) {
          value = value?.[key];
        }
        validationData[field] = value;
      });
      validateRequiredFields(validationData, requiredFields);
    }
  } catch (error) {
    logger.error(`Required field validation failed for ${operation}: ${error.message}`, { error });
    throw validationError(operation, `Missing required fields: ${error.message}`, error);
  }

  // 4. Token Generation (if JWT)
  let requestData;
  let headers;
  if (useJWT) {
    let jwe, jws;
    try {
      jwe = await generateJWE(payload, config);
    } catch (error) {
      logger.error(`JWE generation failed for ${operation}: ${error.message}`, { error });
      throw paymentError(operation, 'Failed to generate JWE', error);
    }

    try {
      jws = await generateJWS(jwe, config);
    } catch (error) {
      logger.error(`JWS generation failed for ${operation}: ${error.message}`, { error });
      throw paymentError(operation, 'Failed to generate JWS', error);
    }

    logger.debug(`Tokens generated for ${operation}`, { merchantTxnId });

    requestData = jwe;
    headers = {
      'Content-Type': 'text/plain',
      'x-gl-token-external': jws,
      ...customHeaders
    };
  } else {
    requestData = payload;
    headers = {
      'Content-Type': 'application/json',
      ...customHeaders
    };
  }

  // 5. API Call
  try {
    logger.info(`Initiating ${operation}: ${merchantTxnId}`);
    const response = await post(`${config.baseUrl}${endpoint}`, requestData, headers);

    if (!response) {
      throw paymentError(operation, 'Empty response from API');
    }

    // 6. Custom Response Validation (if provided)
    if (responseValidation) {
      responseValidation(response);
    }

    // 7. Extract Redirect & Status URLs
    const redirectUrl = extractPaymentUrl(response);
    const statusUrl = extractStatusUrl(response);

    if (!redirectUrl) {
      throw paymentError(operation, 'No payment link received in response', response);
    }

    const result = { paymentLink: redirectUrl, statusLink: statusUrl };
    logger.logPaymentOperation(operation, merchantTxnId, result);
    return result;
  } catch (error) {
    logger.error(`API call failed for ${operation}: ${error.message}`, { error });
    throw apiError(operation, 'API call failed', error);
  }
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

