/**
 * Configuration class for PayGlocalClient.
 * @class
 * @param {Object} config - Configuration object
 */
class Config {
  constructor(config = {}) {
    this.apiKey = config.apiKey || '';
    this.merchantId = config.merchantId || '';
    this.publicKeyId = config.publicKeyId || '';
    this.privateKeyId = config.privateKeyId || '';
    this.payglocalPublicKey = config.payglocalPublicKey || '';
    this.merchantPrivateKey = config.merchantPrivateKey || '';
    this.baseUrl = config.baseUrl || 'https://api.uat.payglocal.in';
    this.logLevel = config.logLevel || 'info';
    this.tokenExpiration = config.tokenExpiration || 300000; // 5 minutes default

    // Validate required fields
    if (!this.apiKey) throw new Error('Missing required config: apiKey');
    if (!this.merchantId) throw new Error('Missing required config: merchantId');
    if (!this.publicKeyId) throw new Error('Missing required config: publicKeyId');
    if (!this.privateKeyId) throw new Error('Missing required config: privateKeyId');
    if (!this.payglocalPublicKey) throw new Error('Missing required config: payglocalPublicKey');
    if (!this.merchantPrivateKey) throw new Error('Missing required config: merchantPrivateKey');
  }
}

module.exports = Config;