/**
 * Configuration class for PayGlocalClient.
 * @class
 * @param {Object} config - Configuration object
 */
const { configError } = require('../utils/errorHandler');
const { logger } = require('../utils/logger');

const BASE_URLS = {
  UAT: 'https://api.uat.payglocal.in',
  PROD: 'https://api.payglocal.in',
};

class Config {
  constructor(config = {}) {
    try {
      this.apiKey = config.apiKey || '';
      this.merchantId = config.merchantId || '';
      this.publicKeyId = config.publicKeyId || '';
      this.privateKeyId = config.privateKeyId || '';
      this.payglocalPublicKey = config.payglocalPublicKey || '';
      this.merchantPrivateKey = config.merchantPrivateKey || '';
      
      // Extract URL from environment flag
      const baseUrlKey = config.baseUrlVar || 'UAT';
      this.baseUrl = BASE_URLS[baseUrlKey.toUpperCase()] || BASE_URLS['UAT'];

      this.logLevel = config.logLevel || 'info';
      this.tokenExpiration = config.tokenExpiration || 300000;

      // Validate required fields
      if (!this.apiKey) throw configError('apiKey');
      if (!this.merchantId) throw configError('merchantId');
      if (!this.publicKeyId) throw configError('publicKeyId');
      if (!this.privateKeyId) throw configError('privateKeyId');
      if (!this.payglocalPublicKey) throw configError('payglocalPublicKey');
      if (!this.merchantPrivateKey) throw configError('merchantPrivateKey');

    } catch (error) {
      logger.error('Configuration error:', error.message);
      throw configError(error.message || 'Initialization failed');
    }
  }
}

module.exports = Config;
