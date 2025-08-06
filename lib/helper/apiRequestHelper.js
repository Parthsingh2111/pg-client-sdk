const { get, post, put } = require('../core/http');
const { logger } = require('../utils/logger');
const { buildEndpoint } = require('../constants/endpoints');

/**
 * Make API request with simple error handling
 * @param {Object} options - Request options
 * @param {string} options.method - HTTP method
 * @param {string} options.baseUrl - Base URL
 * @param {string} options.endpoint - Endpoint path
 * @param {Object} options.endpointParams - Parameters for endpoint building
 * @param {Object} options.data - Request data/payload
 * @param {Object} options.headers - Request headers
 * @returns {Promise<Object>} API response
 */
async function makeApiRequest(options = {}) {
  const {
    method = 'POST',
    baseUrl,
    endpoint,
    endpointParams = {},
    data = null,
    headers = {}
  } = options;

  try {
    // Build full URL
    const fullEndpoint = buildEndpoint(endpoint, endpointParams);
    const fullUrl = `${baseUrl}${fullEndpoint}`;

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
      throw new Error('Empty response from API');
    }

    return response;

  } catch (error) {
    // Simply re-throw the error as-is
    throw error;
  }
}

/**
 * Make payment request
 * @param {Object} options - Request options
 * @returns {Promise<Object>} API response
 */
async function makePaymentRequest(options) {
  const { baseUrl, endpoint, requestData, headers } = options;
  
  return makeApiRequest({
    method: 'POST',
    baseUrl,
    endpoint,
    data: requestData,
    headers
  });
}

/**
 * Make transaction service request
 * @param {Object} options - Request options
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
  });
}

/**
 * Make SI service request
 * @param {Object} options - Request options
 * @returns {Promise<Object>} API response
 */
async function makeSiServiceRequest(options) {
  const { baseUrl, endpoint, requestData, headers, operation } = options;
  
  return makeApiRequest({
    method: operation === 'si activate' ? 'PUT' : 'POST',
    baseUrl,
    endpoint,
    data: requestData,
    headers
  });
}

module.exports = {
  makeApiRequest,
  makePaymentRequest,
  makeTransactionServiceRequest,
  makeSiServiceRequest
}; 