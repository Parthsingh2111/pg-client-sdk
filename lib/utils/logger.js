/**
 * Enhanced Logger for PayGlocal SDK
 * Provides structured logging with different levels and formatting
 */

class Logger {
  constructor(level = 'info') {
    this.levels = {
      error: 0,
      warn: 1,
      info: 2,
      debug: 3
    };
    this.level = this.normalizeLevel(level);
  }

  /**
   * Normalize log level to handle case variations
   * @param {string} level - Log level
   * @returns {string} Normalized level
   */
  normalizeLevel(level) {
    const normalized = level.toLowerCase();
    if (this.levels.hasOwnProperty(normalized)) {
      return normalized;
    }
    console.warn(`[LOGGER] Invalid log level "${level}", defaulting to "info"`);
    return 'info';
  }

  /**
   * Check if a log level should be output
   * @param {string} level - Log level to check
   * @returns {boolean} Whether to log
   */
  shouldLog(level) {
    return this.levels[level] <= this.levels[this.level];
  }

  /**
   * Get current timestamp
   * @returns {string} ISO timestamp
   */
  getTimestamp() {
    return new Date().toISOString();
  }

  /**
   * Format log message with timestamp and level
   * @param {string} level - Log level
   * @param {string} message - Log message
   * @param {Object} [data] - Additional data to log
   * @returns {string} Formatted log message
   */
  formatMessage(level, message, data = null) {
    const timestamp = this.getTimestamp();
    const prefix = `[${timestamp}] [${level.toUpperCase()}] [PAYGLOCAL-SDK]`;
    
    if (data) {
      return `${prefix} ${message} ${JSON.stringify(data, null, 2)}`;
    }
    return `${prefix} ${message}`;
  }

  /**
   * Log error messages (always shown)
   * @param {string} message - Error message
   * @param {Error|Object} [error] - Error object or additional data
   */
  error(message, error = null) {
    if (!this.shouldLog('error')) return;
    
    if (error instanceof Error) {
      console.error(this.formatMessage('error', message, {
        error: error.message,
        stack: error.stack,
        name: error.name
      }));
    } else {
      console.error(this.formatMessage('error', message, error));
    }
  }

  /**
   * Log warning messages
   * @param {string} message - Warning message
   * @param {Object} [data] - Additional data
   */
  warn(message, data = null) {
    if (!this.shouldLog('warn')) return;
    console.warn(this.formatMessage('warn', message, data));
  }

  /**
   * Log info messages
   * @param {string} message - Info message
   * @param {Object} [data] - Additional data
   */
  info(message, data = null) {
    if (!this.shouldLog('info')) return;
    console.log(this.formatMessage('info', message, data));
    }

  /**
   * Log debug messages (only shown in debug mode)
   * @param {string} message - Debug message
   * @param {Object} [data] - Additional data
   */
  debug(message, data = null) {
    if (!this.shouldLog('debug')) return;
    console.debug(this.formatMessage('debug', message, data));
  }

  /**
   * Log API request details
   * @param {string} method - HTTP method
   * @param {string} url - Request URL
   * @param {Object} [headers] - Request headers (sensitive data will be masked)
   * @param {Object} [data] - Request data
   */
  logRequest(method, url, headers = {}, data = null) {
    if (!this.shouldLog('debug')) return;
    
    // Mask sensitive headers
    const maskedHeaders = { ...headers };
    if (maskedHeaders['x-gl-auth']) {
      maskedHeaders['x-gl-auth'] = '***MASKED***';
    }
    if (maskedHeaders['x-gl-token-external']) {
      maskedHeaders['x-gl-token-external'] = '***MASKED***';
    }

    this.debug(`API Request: ${method} ${url}`, {
      headers: maskedHeaders,
      data: data ? (typeof data === 'string' ? '[JWE/JWS Token]' : data) : null
    });
    }

  /**
   * Log API response details
   * @param {string} method - HTTP method
   * @param {string} url - Request URL
   * @param {number} status - Response status
   * @param {Object} [data] - Response data
   */
  logResponse(method, url, status, data = null) {
    if (!this.shouldLog('debug')) return;
    
    this.debug(`API Response: ${method} ${url} - ${status}`, {
      status,
      data: data || null
    });
  }

  /**
   * Log payment operation details
   * @param {string} operation - Operation name (e.g., 'initiateJwtPayment')
   * @param {string} merchantTxnId - Transaction ID
   * @param {Object} [result] - Operation result
   */
  logPaymentOperation(operation, merchantTxnId, result = null) {
    this.info(`Payment Operation: ${operation}`, {
      merchantTxnId,
      success: !!result,
      hasPaymentLink: result?.paymentLink ? true : false,
      hasStatusLink: result?.statusLink ? true : false
    });
  }

  /**
   * Log configuration details (without sensitive data)
   * @param {Object} config - Configuration object
   */
  logConfig(config) {
    if (!this.shouldLog('debug')) return;
    
    const safeConfig = {
      merchantId: config.merchantId,
      publicKeyId: config.publicKeyId,
      privateKeyId: config.privateKeyId,
      baseUrl: config.baseUrl,
      logLevel: config.logLevel,
      tokenExpiration: config.tokenExpiration,
      hasApiKey: !!config.apiKey,
      hasPayglocalPublicKey: !!config.payglocalPublicKey,
      hasMerchantPrivateKey: !!config.merchantPrivateKey
    };
    
    this.debug('SDK Configuration', safeConfig);
  }
}

// Create logger instance with environment variable or default
const logger = new Logger(process.env.PAYGLOCAL_LOG_LEVEL || 'info');

module.exports = { logger, Logger };







