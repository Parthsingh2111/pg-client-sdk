const { post } = require('../core/http');
const { generateJWE, generateJWS } = require('../core/crypto');
const { validateRequiredFields } = require('../utils/validators');
const { logger } = require('../utils/logger');

/**
 * Validate YYYYMMDD format for startDate
 */
function validateStartDateFormat(dateStr) {
  if (!/^\d{8}$/.test(dateStr)) {
    throw new Error(`Invalid startDate format: ${dateStr}. Use 'YYYYMMDD' format.`);
  }

  const year = parseInt(dateStr.substring(0, 4), 10);
  const month = parseInt(dateStr.substring(4, 6), 10);
  const day = parseInt(dateStr.substring(6, 8), 10);

  if (
    isNaN(year) || isNaN(month) || isNaN(day) ||
    month < 1 || month > 12 ||
    day < 1 || day > 31 // basic check; you can make this stricter if needed
  ) {
    throw new Error(`Invalid startDate value: ${dateStr}`);
  }
}

/**
 * Modify Standing Instruction (Pause / Pause with new startDate)
 */
async function initiatePauseSI({ merchantTxnId, standingInstruction }, config) {
  validateRequiredFields(
    {
      merchantTxnId,
      standingInstruction,
      'standingInstruction.action': standingInstruction?.action,
      'standingInstruction.mandateId': standingInstruction?.mandateId,
    },
    [
      'merchantTxnId',
      'standingInstruction',
      'standingInstruction.action',
      'standingInstruction.mandateId',
    ]
  );

  

  // Validate startDate format if provided
  const startDate = standingInstruction?.data?.startDate;
  if (startDate) {
    validateStartDateFormat(startDate);
  }

  const payload = {
    merchantTxnId,
    standingInstruction,
  };

  const jwe = await generateJWE(payload, config);
  const jws = await generateJWS(jwe, config);


  logger.debug('tokkens generated');

  try {
    logger.info(`Modifying Standing Instruction: ${merchantTxnId}`);
    const response = await post(
      `${config.baseUrl}/gl/v1/payments/si/modify`,
      jwe,
      {
        'Content-Type': 'text/plain',
        'x-gl-token-external': jws,
      }
    );

    if (!response) {
      logger.error('Empty response from Api ');
      throw new Error('Empty response from Api');
    }

    logger.debug('response Received');

    const data = response?.data || response;

    return {
      status: data.status || 'SUCCESS',
      message: data.message || 'Standing instruction modified',
      mandateId: data.mandateId || standingInstruction.mandateId,
    };
  } catch (error) {
    logger.error(`SI Modify failed: ${error.message}`);
    throw new Error(`SI Modify failed: ${error.message}`);
  }
}

module.exports = { initiatePauseSI };  
