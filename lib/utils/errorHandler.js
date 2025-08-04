/**
 * Centralized Error Handler for PayGlocal SDK
 */

const ERROR_TYPES = {
  CONFIG: 'CONFIG_ERROR',
  VALIDATION: 'VALIDATION_ERROR', 
  PAYMENT: 'PAYMENT_ERROR',
  NETWORK: 'NETWORK_ERROR',
  CRYPTO: 'CRYPTO_ERROR',
  API: 'API_ERROR'
};

/**
 * Create standardized SDK error
 * @param {string} type - Error type
 * @param {string} message - Error message
 * @param {Object} context - Additional context
 * @returns {Error} SDK error
 */
function createError(type, message, context = {}) {
  const error = new Error(message);
  error.type = type;
  error.context = context;
  error.isSDKError = true;
  error.timestamp = new Date().toISOString();
  return error;
}

/**
 * Handle configuration errors
 * @param {string} field - Missing field
 * @returns {Error} Configuration error
 */
function configError(field) {
  return createError(
    ERROR_TYPES.CONFIG,
    `Missing required config: ${field}`,
    { field }
  );
}

/**
 * Handle validation errors
 * @param {string} field - Invalid field
 * @param {string} reason - Validation reason
 * @returns {Error} Validation error
 */
function validationError(field, reason) {
  return createError(
    ERROR_TYPES.VALIDATION,
    `Validation failed for ${field}: ${reason}`,
    { field, reason }
  );
}

/**
 * Handle payment errors
 * @param {string} operation - Payment operation
 * @param {string} reason - Error reason
 * @param {Object} response - API response
 * @returns {Error} Payment error
 */
function paymentError(operation, reason, response = {}) {
  return createError(
    ERROR_TYPES.PAYMENT,
    `Payment ${operation} failed: ${reason}`,
    { operation, reason, response }
  );
}

/**
 * Handle network errors
 * @param {string} url - Request URL
 * @param {string} reason - Network error reason
 * @returns {Error} Network error
 */
function networkError(url, reason) {
  return createError(
    ERROR_TYPES.NETWORK,
    `Network error: ${reason}`,
    { url, reason }
  );
}

/**
 * Handle crypto errors
 * @param {string} operation - Crypto operation
 * @param {string} reason - Error reason
 * @returns {Error} Crypto error
 */
function cryptoError(operation, reason) {
  return createError(
    ERROR_TYPES.CRYPTO,
    `Crypto ${operation} failed: ${reason}`,
    { operation, reason }
  );
}

/**
 * Handle API errors
 * @param {number} status - HTTP status
 * @param {string} message - Error message
 * @param {Object} response - API response
 * @returns {Error} API error
 */
function apiError(status, message, response = {}) {
  return createError(
    ERROR_TYPES.API,
    `API Error ${status}: ${message}`,
    { status, message, response }
  );
}

/**
 * Check if error is SDK error
 * @param {Error} error - Error to check
 * @returns {boolean} True if SDK error
 */
function isSDKError(error) {
  return error && error.isSDKError === true;
}

/**
 * Get error summary for logging
 * @param {Error} error - Error to summarize
 * @returns {Object} Error summary
 */
function getErrorSummary(error) {
  if (!isSDKError(error)) {
    return {
      type: 'UNKNOWN',
      message: error.message,
      stack: error.stack
    };
  }

  return {
    type: error.type,
    message: error.message,
    context: error.context,
    timestamp: error.timestamp
  };
}

module.exports = {
  ERROR_TYPES,
  createError,
  configError,
  validationError,
  paymentError,
  networkError,
  apiError,
  isSDKError,
  getErrorSummary
}; 