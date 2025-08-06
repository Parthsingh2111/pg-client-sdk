const { validateRequiredFields } = require('../utils/validators');
const { validatePaycollectPayload } = require('../utils/schemaValidator');
const { logger } = require('../utils/logger');

/**
 * Simple validation function
 * @param {Object} payload - Payload to validate
 * @param {Object} options - Validation options
 * @param {Array<string>} options.requiredFields - Array of required field paths
 * @param {Array<string>} options.basicRequiredFields - Array of basic required fields (checked first)
 * @param {boolean} options.validateSchema - Whether to validate schema (default: true)
 * @returns {void}
 */
function validatePayload(payload, options = {}) {
  const {
    requiredFields = [],
    validateSchema = true
  } = options;

  try {
    // 1. All Required Fields Validation (SECOND - to catch missing service-specific fields)
    if (requiredFields && requiredFields.length > 0) {
      const validationData = {};
      requiredFields.forEach(field => {
        const keys = field.split('.');
        let value = payload;
        for (const key of keys) {
          value = value?.[key];
        }
        validationData[field] = value;
      });
      
      validateRequiredFields(validationData, requiredFields);
    }

    // 2. Schema Validation (SECOND - only if required fields are present)
    if (validateSchema) {
      validatePaycollectPayload(payload);
    }
    logger.debug('Validation passed');
  } catch (error) {
    logger.error('Validation failed', error);
    throw new Error(error.message);
  }
}

module.exports = {
  validatePayload
}; 