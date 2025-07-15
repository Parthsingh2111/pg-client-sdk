const { post } = require('../core/http');
const { generateJWE, generateJWS } = require('../core/crypto');
const { validateRequiredFields, validateEmail, sanitizeInput } = require('../utils/validators');
const { logger } = require('../utils/logger');
const { validatePaycollectPayload } = require('../utils/schemaValidator');

/**
 * Initiate API Key-based payment.
 * @param {Object} params - Payment parameters
 * @param {string} params.merchantTxnId - Transaction ID
 * @param {Object} params.paymentData - Payment details
 * @param {string} params.merchantCallbackURL - Callback URL
 * @param {Object} config - Configuration object
 * @returns {Promise<Object>} Payment response
 */
async function initiateApiKeyPayment(payload, config) {
  const {
    merchantTxnId,
    paymentData,
    merchantCallbackURL
  } = payload;

 try {
    validatePaycollectPayload(payload); // ✅ Add this
  } catch (err) {
    throw new Error(`Schema validation failed: ${err.message}`);
  }

  validateRequiredFields(
    {
      merchantTxnId,
      paymentData,
      merchantCallbackURL,
      'paymentData.totalAmount': paymentData?.totalAmount,
      'paymentData.txnCurrency': paymentData?.txnCurrency,
    },
    [
      'merchantTxnId',
      'paymentData',
      'merchantCallbackURL',
      'paymentData.totalAmount',
      'paymentData.txnCurrency',

    ]
  );

  // if (paymentData?.billingData?.emailId) {
  //   paymentData.billingData.emailId = validateEmail(sanitizeInput(paymentData.billingData.emailId));
  // }

  try {
    logger.info(`Initiating API key payment: ${merchantTxnId}`);
    const response = await post(
      `${config.baseUrl}/gl/v1/payments/initiate/paycollect`,
      payload,
      {
        'x-gl-auth': config.apiKey,
        'Content-Type': 'application/json',
      }
    );

    if (!response) {
      logger.error('Empty response from API');
      throw new Error('Empty response from API');
    }
    
    
    const redirectUrl = response.redirectUrl || response.redirect_url || response.payment_link;
    const statusUrl = response.statusUrl || response.status_url || null;

    if (!redirectUrl) {
      logger.error('No payment link received in response');
      throw new Error('No payment link received');
    }

    logger.info(`API key payment initiated: ${merchantTxnId}, Redirect: ${redirectUrl}`);
    return { paymentLink: redirectUrl, statusLink: statusUrl };
  } catch (error) {
  const errorMessage = (error && error.message) ? error.message : JSON.stringify(error);
  console.error(`🔁 API key payment failed: ${errorMessage}`);
  throw new Error(`Payment initiation failed: ${errorMessage}`);
}
}

/**
 * Initiate JWT-based payment.
 * @param {Object} params - Payment parameters
 * @param {string} params.merchantTxnId - Transaction ID
 * @param {Object} params.paymentData - Payment details Capture transaction details
 * @param {string} params.merchantCallbackURL - Callback URL
 * @param {Object} config - Configuration object
 * @returns {Promise<Object>} Payment response
 */
async function initiateJwtPayment(payload, config) {
  const {
    merchantTxnId,
    paymentData,
    merchantCallbackURL
  } = payload;

 try {
    validatePaycollectPayload(payload); 
  } catch (err) {
    throw new Error(`Schema validation failed: ${err.message}`);
  }
  
  validateRequiredFields(
    {
      merchantTxnId,
      paymentData,
      merchantCallbackURL,
      'paymentData.totalAmount': paymentData?.totalAmount,
      'paymentData.txnCurrency': paymentData?.txnCurrency,
    },
    [
      'merchantTxnId',
      'paymentData',
      'merchantCallbackURL',
      'paymentData.totalAmount',
      'paymentData.txnCurrency',
    ]
  );

  // if (paymentData?.billingData?.emailId) {
  //   paymentData.billingData.emailId = validateEmail(sanitizeInput(paymentData.billingData.emailId));
  // }

  const jwe = await generateJWE(payload, config);
  const jws = await generateJWS(jwe, config);

  logger.debug('jwe and jws token created');

  try {
    logger.info(`Initiating JWT payment: ${merchantTxnId}`);
    const response = await post(
      `${config.baseUrl}/gl/v1/payments/initiate/paycollect`,
      jwe,
      {
        'Content-Type': 'text/plain',
        'x-gl-token-external': jws,
      }
    );

     console.log('response', response);

    if (!response) {
      logger.error('Empty response from API');
      throw new Error('Empty response from API');
    }

    logger.debug('Received Response');

const redirectUrl =
  response?.data?.redirectUrl ||
  response?.data?.redirect_url ||
  response?.data?.payment_link;

const statusUrl =
  response?.data?.statusUrl ||
  response?.data?.status_url ||
  null;

    if (!redirectUrl) {
      logger.error('No payment link received in response');
      throw new Error('No payment link received');
    }

    logger.info(`JWT payment initiated: ${merchantTxnId}, Redirect: ${redirectUrl}`);
    return {paymentLink: redirectUrl};
  } catch (error) {
    logger.error(`JWT payment failed: ${error.message}`);
    throw new Error(`JWT Payment initiation failed: ${error.message}`);
  }
}

/**
 * Initiate Standing Instruction (SI) payment.
 * @param {Object} params - Payment parameters
 * @param {string} params.merchantTxnId - Transaction ID
 * @param {Object} params.paymentData - Payment details
 * @param {Object} params.standingInstruction - SI details
 * @param {string} params.merchantCallbackURL - Callback URL
 * @param {Object} config - Configuration object
 * @returns {Promise<Object>} Payment response
 */
async function initiateSiPayment(payload, config) {
  const {
    merchantTxnId,
    paymentData,
    standingInstruction,
    merchantCallbackURL
  } = payload;

 try {
    validatePaycollectPayload(payload); // ✅ Add this
  } catch (err) {
    throw new Error(`Schema validation failed: ${err.message}`);
  }

  validateRequiredFields(
    {
      merchantTxnId,
      paymentData,
      standingInstruction,
      merchantCallbackURL,
      'paymentData.totalAmount': paymentData?.totalAmount,
      'paymentData.txnCurrency': paymentData?.txnCurrency,
      'standingInstruction.data': standingInstruction?.data,
      'standingInstruction.data.numberOfPayments': standingInstruction?.data?.numberOfPayments,
      'standingInstruction.data.frequency': standingInstruction?.data?.frequency,
      'standingInstruction.data.type': standingInstruction?.data?.type,
    },
    [
      'merchantTxnId',
      'paymentData',
      'standingInstruction',
      'merchantCallbackURL',
      'paymentData.totalAmount',
      'paymentData.txnCurrency',
      'standingInstruction.data',
      'standingInstruction.data.numberOfPayments',
      'standingInstruction.data.frequency',
      'standingInstruction.data.type',
    ]
  );

  // Conditional validations
  if (standingInstruction.data.type === 'FIXED' && !standingInstruction.data.startDate) {
    throw new Error('startDate is required for FIXED SI type');
  }
  if (standingInstruction.data.type === 'VARIABLE' && standingInstruction.data.startDate) {
    throw new Error('startDate should not be included for VARIABLE SI type');
  }
  if (!(standingInstruction.data.amount || standingInstruction.data.maxAmount)) {
    throw new Error('Either amount or maxAmount is required for standingInstruction.data');
  }

  const jwe = await generateJWE(payload, config);
  const jws = await generateJWS(jwe, config);

  logger.debug('jwe and jws token created');

  try {
    logger.info(`Initiating SI payment: ${merchantTxnId}`);
    const response = await post(
      `${config.baseUrl}/gl/v1/payments/initiate/paycollect`,
      jwe,
      {
        'Content-Type': 'text/plain',
        'x-gl-token-external': jws,
      }
    );
    

    console.log('response', response);
   
    if (!response) {
      logger.error('Empty response from API'); 
      throw new Error('Empty response from API');
    }

    logger.debug('Received Response');

const redirectUrl =
  response?.data?.redirectUrl ||
  response?.data?.redirect_url ||
  response?.data?.payment_link;

const statusUrl =
  response?.data?.statusUrl ||
  response?.data?.status_url ||
  null;


    if (!redirectUrl) {
      logger.error('No payment link received in response');
      throw new Error('No payment link received');
    }

  
    logger.info(`SI payment initiated: ${merchantTxnId}, Redirect: ${redirectUrl}`);
    return { paymentLink: redirectUrl };
  } catch (error) {
    logger.error(`SI payment failed: ${error.message}`);
    throw new Error(`SI Payment initiation failed: ${error.message}`);
  }
}

/**
 * Initiate Auth payment.
 * @param {Object} params - Payment parameters
 * @param {string} params.merchantTxnId - Transaction ID
 * @param {Object} params.paymentData - Payment details
 * @param {Object} params.billingData - Billing details
 * @param {Object} params.captureTxn - Capture transaction details
 * @param {string} params.merchantCallbackURL - Callback URL
 * @param {Object} config - Configuration object
 * @returns {Promise<Object>} Payment response
 */
async function initiateAuthPayment(payload, config) {
  // Destructure only required fields for validation
  const {
    merchantTxnId,
    paymentData,
    captureTxn,
    merchantCallbackURL
  } = payload;

 try {
    validatePaycollectPayload(payload); 
  } catch (err) {
    throw new Error(`Schema validation failed: ${err.message}`);
  }

  // Validate only required fields
  validateRequiredFields(
    {
      merchantTxnId,
      paymentData,
      captureTxn,
      merchantCallbackURL,
      'paymentData.totalAmount': paymentData?.totalAmount,
      'paymentData.txnCurrency': paymentData?.txnCurrency,
    },
    [
      'merchantTxnId',
      'paymentData',
      'captureTxn',
      'merchantCallbackURL',
      'paymentData.totalAmount',
      'paymentData.txnCurrency',
    ]
  );



  const jwe = await generateJWE(payload, config);
  const jws = await generateJWS(jwe, config);
  

  logger.debug('jwe and jws token created');


  try {
    logger.info(`Initiating Auth payment: ${merchantTxnId}`);
    const response = await post(
      `${config.baseUrl}/gl/v1/payments/initiate/paycollect`,
      jwe,
      {
        'Content-Type': 'text/plain',
        'x-gl-token-external': jws,
      }
    );


    if (!response) {
      logger.error('Empty response from API');
      throw new Error('Empty response from API');
    }

   

const redirectUrl =
  response?.data?.redirectUrl ||
  response?.data?.redirect_url ||
  response?.data?.payment_link;

const statusUrl =
  response?.data?.statusUrl ||
  response?.data?.status_url ||
  null;

    if (!redirectUrl&&!statusUrl) {
      logger.error('No payment link or statusUrl received in response');
      throw new Error('No payment or statusUrl link received');
    }
      logger.debug('redirectUrl received');
    

    logger.info(`Auth payment initiated: ${merchantTxnId}, Redirect: ${redirectUrl}`);
    return { paymentLink: redirectUrl };
  } catch (error) {
    logger.error(`Auth payment failed: ${error.message}`);
    throw new Error(`Auth Payment initiation failed: ${error.message}`);
  }
}

module.exports = { initiateApiKeyPayment, initiateJwtPayment, initiateSiPayment, initiateAuthPayment };

