/**
 * HTTP client using native fetch with retry logic
 * Used Fetch  for better performance and fewer dependencies
 */

const { logger } = require('../utils/logger');

/**
 * Sleep utility for retry delays
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise<void>}
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Exponential backoff delay
 * @param {number} attempt - Current attempt number
 * @param {number} baseDelay - Base delay in milliseconds
 * @returns {number} Delay in milliseconds
 */
const exponentialDelay = (attempt, baseDelay = 1000) => {
  return Math.min(baseDelay * Math.pow(2, attempt), 10000);
};

/**
 * Check if error is retryable
 * @param {Error} error - Error to check
 * @returns {boolean} Whether error is retryable
 */
const isRetryableError = (error) => {
  // Network errors
  if (error.name === 'TypeError' && error.message.includes('fetch')) {
    return true;
  }
  
  // HTTP 5xx errors
  if (error.status >= 500 && error.status < 600) {
    return true;
  }
  
  // Timeout errors
  if (error.name === 'AbortError') {
    return true;
  }
  
  return false;
};

/**
 * Make HTTP request with retry logic
 * @param {string} url - Request URL
 * @param {Object} options - Fetch options
 * @param {number} maxRetries - Maximum retry attempts
 * @returns {Promise<Object>} Response data
 */
async function makeRequest(url, options, maxRetries = 3) {
  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
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
      
      // Check if response is ok (status 200-299)
      if (!response.ok) {
        const errorData = await response.text().catch(() => 'Unknown error');
        const error = new Error(`HTTP ${response.status}: ${errorData}`);
        error.status = response.status;
        error.response = response;
        throw error;
      }
      
      // Parse response
      const contentType = response.headers.get('content-type');
      let data;
      
      // Try to parse as JSON first, fallback to text
      try {
        data = await response.json();
      } catch (jsonError) {
        // If JSON parsing fails, get as text
        data = await response.text();
        
        // Try to parse text as JSON if it looks like JSON
        if (typeof data === 'string' && (data.trim().startsWith('{') || data.trim().startsWith('['))) {
          try {
            data = JSON.parse(data);
          } catch (parseError) {
            // Keep as string if JSON parsing fails
            logger.debug('Response is not valid JSON, keeping as string');
          }
        }
      }
      
      return data;
      
    } catch (error) {
      lastError = error;
      
      // Don't retry on last attempt
      if (attempt === maxRetries) {
        break;
      }
      
      // Don't retry non-retryable errors
      if (!isRetryableError(error)) {
        break;
      }
      
      // Log retry attempt
      logger.debug(`Request failed (attempt ${attempt + 1}/${maxRetries + 1}): ${error.message}`);
      
      // Wait before retry
      const delay = exponentialDelay(attempt);
      await sleep(delay);
    }
  }
  
  throw lastError;
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
      throw new Error(`API error: ${error.message}`);
    } else if (error.name === 'AbortError') {
      throw new Error('Request timeout');
    } else {
      throw new Error(`Request failed: ${error.message}`);
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
      throw new Error(`API error: ${error.message}`);
    } else if (error.name === 'AbortError') {
      throw new Error('Request timeout');
    } else {
      throw new Error(`Request failed: ${error.message}`);
    }
  }
}

module.exports = { post, get };


