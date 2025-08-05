/**
 * Centralized Error Handler for PayGlocal SDK
 */

const ERROR_TYPES = {
  CONFIG: 'CONFIG_ERROR',
  VALIDATION: 'VALIDATION_ERROR', 
  PAYMENT: 'PAYMENT_ERROR',
  NETWORK: 'NETWORK_ERROR',
  CRYPTO: 'CRYPTO_ERROR',
  API: 'API_ERROR',
  TIMEOUT: 'TIMEOUT_ERROR',
  SCHEMA: 'SCHEMA_ERROR',
  BUSINESS: 'BUSINESS_ERROR'
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
  error.name = type;
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
    `Missing required configuration: ${field}`,
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
 * Handle timeout errors
 * @param {string} operation - Operation that timed out
 * @param {number} timeout - Timeout duration in ms
 * @returns {Error} Timeout error
 */
function timeoutError(operation, timeout) {
  return createError(
    ERROR_TYPES.TIMEOUT,
    `${operation} timed out after ${timeout}ms`,
    { operation, timeout }
  );
}

/**
 * Handle schema validation errors
 * @param {string} field - Field that failed validation
 * @param {string} reason - Validation reason
 * @param {Array} errors - Validation errors array
 * @returns {Error} Schema error
 */
function schemaError(field, reason, errors = []) {
  return createError(
    ERROR_TYPES.SCHEMA,
    `Schema validation failed for ${field}: ${reason}`,
    { field, reason, errors }
  );
}

/**
 * Handle business logic errors
 * @param {string} operation - Business operation
 * @param {string} reason - Business rule violation
 * @returns {Error} Business error
 */
function businessError(operation, reason) {
  return createError(
    ERROR_TYPES.BUSINESS,
    `Business rule violation in ${operation}: ${reason}`,
    { operation, reason }
  );
}

module.exports = {
  ERROR_TYPES,
  createError,
  configError,
  validationError,
  paymentError,
  networkError,
  cryptoError,
  apiError,
  timeoutError,
  schemaError,
  businessError
}; 