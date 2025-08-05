/**
 * HTTP client using native fetch with timeout protection
 */

const { logger } = require('../utils/logger');
const { apiError, networkError, timeoutError } = require('../utils/errorHandler');

/**
 * Make HTTP request with timeout
 * @param {string} url - Request URL
 * @param {Object} options - Fetch options
 * @returns {Promise<Object>} Response data
 */
async function makeRequest(url, options) {
  const controller = new AbortController();
  const timeout = 90000; // 90 second timeout
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const fetchOptions = {
      ...options,
      signal: controller.signal,
      headers: {
        'User-Agent': 'PayGlocal-SDK/1.0.3',
        ...options.headers
      }
    };
    const response = await fetch(url, fetchOptions);
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.text().catch(() => 'Unknown error');
      const error = new Error(`HTTP ${response.status}: ${errorData}`);
      error.status = response.status;
      error.response = response;
      throw error;
    }

    let data;
    try {
      data = await response.json();
    } catch (jsonError) {
      data = await response.text();
      if (typeof data === 'string' && (data.trim().startsWith('{') || data.trim().startsWith('['))) {
        try {
          data = JSON.parse(data);
        } catch (parseError) {
          logger.debug('Response is not valid JSON, keeping as string');
        }
      }
    }
    return data;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

/**
 * Make POST request
 * @param {string} url - Request URL
 * @param {Object|string} data - Request payload
 * @param {Object} headers - Request headers
 * @returns {Promise<Object>} Response data
 */

async function post(url, data, headers = {}) {
  try {
    logger.logRequest('POST', url, headers, data);
    
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };
    
    // Handle different data types
    if (typeof data === 'string') {
      options.body = data;
      options.headers['Content-Type'] = 'text/plain';
    } else if (data !== null && data !== undefined) {
      options.body = JSON.stringify(data);
    }
    
    const response = await makeRequest(url, options);
    logger.logResponse('POST', url, 200, response);
    
    return response || {};
  } catch (error) {
    logger.error(`POST request failed: ${url}`, error);
    
    if (error.response) {
      logger.logResponse('POST', url, error.status, error.message);
      throw apiError(error.status, error.message, error.response);
    } else if (error.name === 'AbortError') {
      throw timeoutError('POST request', 90000);
    } else {
      throw networkError(url, error.message);
    }
  }
}

/**
 * Make GET request
 * @param {string} url - Request URL
 * @param {Object} headers - Request headers
 * @returns {Promise<Object>} Response data
 */
async function get(url, headers = {}) {
  try {
    logger.logRequest('GET', url, headers);
    
    const options = {
      method: 'GET',
      headers: {
        ...headers
      }
    };
    
    const response = await makeRequest(url, options);
    logger.logResponse('GET', url, 200, response);
    
    return response || {};
  } catch (error) {
    logger.error(`GET request failed: ${url}`, error);
    
    if (error.response) {
      logger.logResponse('GET', url, error.status, error.message);
      throw apiError(error.status, error.message, error.response);
    } else if (error.name === 'AbortError') {
      throw timeoutError('GET request', 90000);
    } else {
      throw networkError(url, error.message);
    }
  }
}



async function put(url, data, headers = {}) {
  try {
    logger.logRequest('PUT', url, headers, data);

    const options = {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    // Handle different data types
    if (typeof data === 'string') {
      options.body = data;
      options.headers['Content-Type'] = 'text/plain';
    } else if (data !== null && data !== undefined) {
      options.body = JSON.stringify(data);
    }

    const response = await makeRequest(url, options);
    logger.logResponse('PUT', url, 200, response);

    return response || {};
  } catch (error) {
    logger.error(`PUT request failed: ${url}`, error);

    if (error.response) {
      logger.logResponse('PUT', url, error.status, error.message);
      throw apiError(error.status, error.message, error.response);
    } else if (error.name === 'AbortError') {
      throw timeoutError('PUT request', 90000);
    } else {
      throw networkError(url, error.message);
    }
  }
}

module.exports = { post, get, put };


