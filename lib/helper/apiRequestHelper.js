const { post, get } = require('../core/http');
const { logger } = require('../utils/logger');
const { paymentError, apiError } = require('../utils/errorHandler');
const { buildEndpoint } = require('../constants/endpoints');
const { extractPaymentResponse } = require('./responseHelper');
const { ENDPOINTS } = require('../constants/endpoints');

/**
 * Make API request with standard error handling and response validation
 * @param {Object} options - Request options
 * @param {string} options.method - HTTP method ('POST' or 'GET')
 * @param {string} options.baseUrl - Base URL
 * @param {string} options.endpoint - Endpoint path
 * @param {Object} options.endpointParams - Parameters for endpoint building
 * @param {Object} options.data - Request data/payload
 * @param {Object} options.headers - Request headers
 * @param {string} options.operation - Operation name for logging and error messages
 * @param {string} options.merchantTxnId - Merchant transaction ID for logging
 * @param {Function} options.responseProcessor - Custom response processing function
 * @param {Function} options.responseValidator - Custom response validation function
 * @returns {Promise<Object>} API response
 */
async function makeApiRequest(options = {}) {
  const {
    method = 'POST',
    baseUrl,
    endpoint,
    endpointParams = {},
    data = null,
    headers = {},
    operation = 'operation',
    merchantTxnId = null,
    responseProcessor = null,
    responseValidator = null
  } = options;

  try {
    // Build full URL
    const fullEndpoint = buildEndpoint(endpoint, endpointParams);
    const fullUrl = `${baseUrl}${fullEndpoint}`;

    // Log the API call
    const logMessage = merchantTxnId 
      ? `Initiating ${operation}: ${merchantTxnId}`
      : `Initiating ${operation}`;
    
    logger.info(logMessage);

    // Make the API call
    let response;
    if (method.toUpperCase() === 'GET') {
      response = await get(fullUrl, headers);
    } else {
      response = await post(fullUrl, data, headers);
    }

    // Validate response exists
    if (!response) {
      throw paymentError(operation, 'Empty response from API');
    }

    // Custom response validation if provided
    if (responseValidator) {
      responseValidator(response);
    }

    logger.debug(`API call successful for ${operation}`);
    return response;

  } catch (error) {
    logger.error(`API call failed for ${operation}: ${error.message}`, { error });
    
    // If it's already a custom error, re-throw it
    if (error.name === 'PaymentError' || error.name === 'ApiError') {
      throw error;
    }
    
    // Otherwise, wrap it in a standard API error
    throw apiError(operation, 'API call failed', error);
  }
}

/**
 * Make POST request with standard error handling
 * @param {Object} options - Request options
 * @returns {Promise<Object>} API response
 */
async function makePostRequest(options) {
  return makeApiRequest({ ...options, method: 'POST' });
}

/**
 * Make GET request with standard error handling
 * @param {Object} options - Request options
 * @returns {Promise<Object>} API response
 */
async function makeGetRequest(options) {
  return makeApiRequest({ ...options, method: 'GET' });
}

/**
 * Make transaction service request (capture, refund, reversal, status)
 * @param {Object} options - Request options
 * @param {string} options.serviceType - Service type ('capture', 'refund', 'reversal', 'status')
 * @param {string} options.gid - Global transaction ID
 * @param {Object} options.data - Request data
 * @param {Object} options.headers - Request headers
 * @param {string} options.operation - Operation name
 * @param {Object} options.config - Configuration object
 * @returns {Promise<Object>} API response
 */
async function makeTransactionServiceRequest(options) {
  const { serviceType, gid, data, headers, operation, config } = options;
  
  
  const endpoints = {
    capture: ENDPOINTS.TRANSACTION_SERVICE.CAPTURE,
    refund: ENDPOINTS.TRANSACTION_SERVICE.REFUND,
    reversal: ENDPOINTS.TRANSACTION_SERVICE.AUTH_REVERSAL,
    status: ENDPOINTS.TRANSACTION_SERVICE.STATUS,
  };

  const endpoint = endpoints[serviceType];
  if (!endpoint) {
    throw new Error(`Invalid service type: ${serviceType}`);
  }

  return makeApiRequest({
    method: serviceType === 'status' ? 'GET' : 'POST',
    baseUrl: config.baseUrl,
    endpoint,
    endpointParams: { gid },
    data: serviceType === 'status' ? null : data,
    headers,
    operation,
    merchantTxnId: gid,
    responseProcessor: (response) => extractPaymentResponse(response, { operation: 'transaction' })
  });
}

/**
 * Make SI service request (modify, status)
 * @param {Object} options - Request options
 * @param {string} options.serviceType - Service type ('modify', 'status')
 * @param {Object} options.data - Request data
 * @param {Object} options.headers - Request headers
 * @param {string} options.operation - Operation name
 * @param {Object} options.config - Configuration object
 * @param {Object} options.standingInstruction - Standing instruction data for response processing
 * @returns {Promise<Object>} API response
 */
async function makeSiServiceRequest(options) {
  const { serviceType, data, headers, operation, config, standingInstruction } = options;
  
  const endpoints = {
    modify: SI_SERVICE.MODIFY,
    status: SI_SERVICE.STATUS,
  };

  const endpoint = endpoints[serviceType];
  if (!endpoint) {
    throw new Error(`Invalid SI service type: ${serviceType}`);
  }

  return makeApiRequest({
    method: 'POST',
    baseUrl: config.baseUrl,
    endpoint,
    data,
    headers,
    operation,
    responseProcessor: (response) => extractPaymentResponse(response, { 
      operation: 'si', 
      standingInstruction 
    })
  });
}

/**
 * Build full URL from base URL and endpoint
 * @param {string} baseUrl - Base URL
 * @param {string} endpoint - Endpoint path
 * @param {Object} params - URL parameters
 * @returns {string} Complete URL
 */
function buildFullUrl(baseUrl, endpoint, params = {}) {
  const fullEndpoint = buildEndpoint(endpoint, params);
  return `${baseUrl}${fullEndpoint}`;
}

module.exports = {
  makeApiRequest,
  makePostRequest,
  makeGetRequest,
  makeTransactionServiceRequest,
  makeSiServiceRequest,
  buildFullUrl
}; 