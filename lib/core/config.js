/**
 * Configuration class for PayGlocalClient.
 * @class
 * @param {Object} config - Configuration object
 */

const { logger } = require('../utils/logger');

const BASE_URLS = {
  UAT: 'https://api.uat.payglocal.in',
  PROD: 'https://api.payglocal.in',
};

class Config {
  constructor(config = {}) {  // only 1 method will work at a time(apikey or token based)
    try {
      this.apiKey = config.apiKey || '';
      this.merchantId = config.merchantId || '';
      this.publicKeyId = config.publicKeyId || '';
      this.privateKeyId = config.privateKeyId || '';
      this.payglocalPublicKey = config.payglocalPublicKey || '';
      this.merchantPrivateKey = config.merchantPrivateKey || '';
      this.payglocalEnv = config.payglocalEnv;

       if (!this.payglocalEnv) throw new Error('Missing required configuration: payglocalEnv for base URL');

      // handling the base URL(choosing and switching) accoding to the environment choosed for transection by the merchant in the .env 
       const baseUrlEnv = (config.payglocalEnv).toUpperCase(); // 1 change) uat fall back should be removed
      
      if (!BASE_URLS[baseUrlEnv]) {
        logger.error(`Invalid environment "${baseUrlEnv}" provided. Must be "UAT" or "PROD".`);
        throw new Error(`Invalid environment "${baseUrlEnv}" provided. Must be "UAT" or "PROD".`);
      }
      
      this.baseUrl = BASE_URLS[baseUrlEnv];


      this.logLevel = config.logLevel || 'info';
      this.tokenExpiration = config.tokenExpiration || 300000;

      // Validate required fields
      if (!this.merchantId) throw new Error('Missing required configuration: merchantId');
      
      
      // If API key is provided, token fields are not needed(we dont need the token based credentials)
      if (this.apiKey) {
        // API Key authentication - no need for token fields
      } else {
        // Token authentication - require all token fields(we need the token based credentials)
        if (!this.publicKeyId || !this.privateKeyId || !this.payglocalPublicKey || !this.merchantPrivateKey) {
          throw new Error('Missing required configuration for token authentication: publicKeyId, privateKeyId, payglocalPublicKey, merchantPrivateKey');
        }
      }

    } catch (error) {
      logger.error('Configuration error:', error.message);
      throw new Error(error.message || 'Configuration initialization failed');
    }
  }
}

module.exports = Config;


