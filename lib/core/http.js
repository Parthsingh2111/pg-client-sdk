/**
 * HTTP client using native fetch with timeout protection
 */

const { logger } = require('../utils/logger');
const { version } = require('../../package.json');
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
        // 'User-Agent': 'PayGlocal-SDK/1.0.3',
          'pg-sdk-version': `PayGlocal-SDK/${version}`,// can we removed just to see user used which version of the sdk
        ...options.headers
      }
    };
    const response = await fetch(url, fetchOptions);
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.text().catch(() => 'Unknown error');
      throw new Error(`HTTP ${response.status}: ${errorData}`);
    }
     
    const data = await response.json();
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
    logger.logResponse('POST', url, response.status, response);
    
    return response || {};
  } catch (error) {
    logger.error(`POST request failed: ${url}`, error);
    throw error;
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
    throw error;
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
    throw error;
  }
}

module.exports = { post, get, put };


