const { get, post, put } = require('../core/http');
const { logger } = require('../utils/logger');
const { paymentError, apiError } = require('../utils/errorHandler');
const { buildEndpoint } = require('../constants/endpoints');
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
  } = options;

  try {
    // Build full URL
    const fullEndpoint = buildEndpoint(endpoint, endpointParams);
    const fullUrl = `${baseUrl}${fullEndpoint}`;

    // Log the API call
    logger.info(`Initiating ${operation}`);

    // Make the API call
    let response;
    if (method.toUpperCase() === 'GET') {
      response = await get(fullUrl, headers);
    } else if (method.toUpperCase() === 'PUT') {
      response = await put(fullUrl, data, headers);
    } else {
      response = await post(fullUrl, data, headers);
    }

    // Validate response exists
    if (!response) {
      logger.error(`Empty response from API for ${operation}`);
      throw paymentError(operation, 'Empty response from API');
    }

    logger.debug(`API call successful for ${operation}`);
    return response;

  } catch (error) {
    logger.error(`API call failed for ${operation}: ${error.message}`, { error });
    
    if (error.name === 'PaymentError' || error.name === 'ApiError') {
      throw error;
    }
  }
}

/**
 * Make payment request with standard error handling
 * @param {Object} options - Request options
 * @param {string} options.baseUrl - Base URL
 * @param {string} options.endpoint - Endpoint path
 * @param {Object} options.requestData - Request data
 * @param {Object} options.headers - Request headers
 * @p
 * aram {string} options.operation - Operation name
 * @returns {Promise<Object>} API response
 */
async function makePaymentRequest(options) {
  const { baseUrl, endpoint, requestData, headers, operation } = options;
  
  return makeApiRequest({
    method: 'POST',
    baseUrl,
    endpoint,
    data: requestData,
    headers,
    operation,
  });
}

/**
 * Make transaction service request (capture, refund, reversal, status)
 * @param {Object} options - Request options
 * @param {string} options.baseUrl - Base URL
 * @param {string} options.endpoint - Endpoint path
 * @param {string} options.gid - Global transaction ID
 * @param {Object} options.requestData - Request data
 * @param {Object} options.headers - Request headers
 * @param {string} options.operation - Operation name
 * @returns {Promise<Object>} API response
 */
async function makeTransactionServiceRequest(options) {
  const { baseUrl, endpoint, gid, requestData, headers, operation } = options;
  
  return makeApiRequest({
    method: operation === 'status check' ? 'GET' : 'POST',
    baseUrl,
    endpoint,
    endpointParams: { gid },
    data: requestData,
    headers,
    operation,
  });
}

/**
 * Make SI service request (modify, status)
 * @param {Object} options - Request options
 * @param {string} options.baseUrl - Base URL
 * @param {string} options.endpoint - Endpoint path
 * @param {Object} options.requestData - Request data
 * @param {Object} options.headers - Request headers
 * @param {string} options.operation - Operation name
 * @param {Object} options.config - Configuration object
 * @param {Object} options.standingInstruction - Standing instruction data for response processing
 * @returns {Promise<Object>} API response
 */
async function makeSiServiceRequest(options) {
  const { baseUrl, endpoint, requestData, headers, operation, config, standingInstruction } = options;
  
  return makeApiRequest({
    method: operation === 'si activate' ? 'PUT' : 'POST',
    baseUrl,
    endpoint,
    data: requestData,
    headers,
    operation,
  });
}

module.exports = {
  makeApiRequest,
  makePaymentRequest,
  makeTransactionServiceRequest,
  makeSiServiceRequest,
}; 