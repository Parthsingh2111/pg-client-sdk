const Config = require('./core/config');
const { generateJWE, generateJWS } = require('./core/crypto');
const { initiateApiKeyPayment, initiateJwtPayment, initiateSiPayment, initiateAuthPayment } = require('./services/payment');
const { initiateRefund } = require('./services/refund');
const { initiateCapture } = require('./services/capture');
const { initiateAuthReversal } = require('./services/reversal');
const { initiateCheckStatus } = require('./services/status');
const { initiatePauseSI, initiateActivateSI } = require('./services/siUpdate');
const { logger } = require('./utils/logger');


/**
 * PayGlocalClient for interacting with PayGlocal API.
 * @class
 * @param {Object} [config] - Configuration options
 */
class PayGlocalClient {
  constructor(config = {}) {
    this.config = new Config(config);
    logger.logConfig(this.config);
    logger.info('PayGlocalClient initialized successfully');
  }

  async initiateApiKeyPayment(params) { 
    return initiateApiKeyPayment(params, this.config);
  }

  async initiateJwtPayment(params) {
    return initiateJwtPayment(params, this.config);
  }

  async initiateSiPayment(params) {
    return initiateSiPayment(params, this.config);
  }

  async initiateAuthPayment(params) {
    return initiateAuthPayment(params, this.config);
  }

  async initiateRefund(params) {
    return initiateRefund(params, this.config);
  }

  async initiateCapture(params) {
    return initiateCapture(params, this.config);
  }

  async initiateAuthReversal(params) {
    return initiateAuthReversal(params, this.config);
  }

  async initiateCheckStatus(params) {
    return initiateCheckStatus(params, this.config);
  }

  async initiatePauseSI(params) {
    return initiatePauseSI(params, this.config);
  }

  async initiateActivateSI(params) {
    return initiateActivateSI(params, this.config);
  }


}

module.exports = PayGlocalClient;
