const axios = require('axios');
const axiosRetry = require('axios-retry');

const { logger } = require('../utils/logger');

/**
 * HTTP client with retry logic.
 * @param {string} url - Request URL
 * @param {Object|string} data - Request payload
 * @param {Object} headers - Request headers
 * @returns {Promise<Object>} Response data
 */
const httpClient = axios.create({
  timeout: 10000,
  validateStatus: (status) => status >= 200 && status < 300,
});

// axiosRetry(httpClient, {
//   retries: 3,
//   retryDelay: (retryCount) => retryCount * 1000,
//   shouldResetTimeout: true,
// });

async function post(url, data, headers) {
  try {
    logger.debug(`POST ${url}`);
    const response = await httpClient.post(url, data, { headers });
    logger.debug(`Response: ${JSON.stringify(response.data, null, 2)}`);
    return response.data || {};
  } catch (error) {
    logger.error(`Request failed: ${error.message}`);
    if (error.response) {
      logger.error(`Response Data: ${JSON.stringify(error.response.data, null, 2)}`);
      logger.error(`Response Status: ${error.response.status}`);
      throw new Error(`API error: ${error.response.data?.message || error.message}`);
    } else if (error.request) {
      logger.error('No response received. Network error or timeout.');
      throw new Error('No response received. Network error or timeout.');
    } else {
      logger.error(`Request setup error: ${error.message}`);
      throw new Error(`Request setup error: ${error.message}`);
    }
  }
}

async function get(url, headers) {
  try {
    logger.debug(`GET ${url}`);
    const response = await httpClient.get(url, { headers });
    logger.debug(`Response: ${JSON.stringify(response.data, null, 2)}`);
    return response.data || {};
  } catch (error) {
    logger.error(`Request failed: ${error.message}`);
    if (error.response) {
      logger.error(`Response Data: ${JSON.stringify(error.response.data, null, 2)}`);
      logger.error(`Response Status: ${error.response.status}`);
      throw new Error(`API error: ${error.response.data?.message || error.message}`);
    } else if (error.request) {
      logger.error('No response received. Network error or timeout.');
      throw new Error('No response received. Network error or timeout.');
    } else {
      logger.error(`Request setup error: ${error.message}`);
      throw new Error(`Request setup error: ${error.message}`);
    }
  }
}

module.exports = { post, get };


