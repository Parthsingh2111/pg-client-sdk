const { validateRequiredFields } = require('../utils/validators');
const { validatePaycollectPayload } = require('../utils/schemaValidator');
const { logger } = require('../utils/logger');
const { validationError } = require('../utils/errorHandler');

/**
 * Comprehensive validation function that handles all validation types
 * @param {Object} payload - Payload to validate
 * @param {Object} options - Validation options
 * @param {string} options.operation - Operation name for error messages
 * @param {Array<string>} options.requiredFields - Array of required field paths
 * @param {Function} options.customValidation - Custom validation function
 * @param {boolean} options.validateSchema - Whether to validate schema (default: true)
 * @returns {void}
 */
function validatePayload(payload, options = {}) {
  const {
    operation = 'operation',
    requiredFields = [],
    customValidation = null,
    validateSchema = true
  } = options;

  // 1. Schema Validation
  if (validateSchema) {
    try {
      validatePaycollectPayload(payload);
    } catch (error) {
      logger.error(`Payload validation failed for ${operation}: ${error.message}`, { error });
      throw validationError(operation, 'Invalid payload structure', error);
    }
  }

  // 2. Custom Validation
  if (customValidation) {
    try {
      customValidation(payload);
    } catch (error) {
      logger.error(`Custom validation failed for ${operation}: ${error.message}`, { error });
      throw validationError(operation, `Custom validation failed: ${error.message}`, error);
    }
  }

  // 3. Required Field Validation
  if (requiredFields && requiredFields.length > 0) {
    try {
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
    } catch (error) {
      logger.error(`Required field validation failed for ${operation}: ${error.message}`, { error });
      throw validationError(operation, `Missing required fields: ${error.message}`, error);
    }
  }
}

/**
 * Validate required fields with nested path support
 * @param {Object} payload - Payload to validate
 * @param {Array<string>} requiredFields - Array of required field paths (e.g., ['paymentData.totalAmount'])
 * @param {string} operation - Operation name for error messages
 * @returns {void}
 */
function validateRequiredFieldsWithPaths(payload, requiredFields, operation) {
  if (!requiredFields || requiredFields.length === 0) {
    return;
  }

  try {
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
  } catch (error) {
    logger.error(`Required field validation failed for ${operation}: ${error.message}`, { error });
    throw validationError(operation, `Missing required fields: ${error.message}`, error);
  }
}

/**
 * Execute custom validation function with error handling
 * @param {Function} customValidation - Custom validation function
 * @param {Object} payload - Payload to validate
 * @param {string} operation - Operation name for error messages
 * @returns {void}
 */
function executeCustomValidation(customValidation, payload, operation) {
  if (!customValidation) {
    return;
  }

  try {
    customValidation(payload);
  } catch (error) {
    logger.error(`Custom validation failed for ${operation}: ${error.message}`, { error });
    throw validationError(operation, `Custom validation failed: ${error.message}`, error);
  }
}

/**
 * Execute schema validation with error handling
 * @param {Object} payload - Payload to validate
 * @param {string} operation - Operation name for error messages
 * @returns {void}
 */
function executeSchemaValidation(payload, operation) {
  try {
    validatePaycollectPayload(payload);
  } catch (error) {
    logger.error(`Payload validation failed for ${operation}: ${error.message}`, { error });
    throw validationError(operation, 'Invalid payload structure', error);
  }
}

/**
 * Validate basic required fields
 * @param {Object} params - Parameters to validate
 * @param {Array<string>} requiredFields - Array of required field names
 * @param {string} operation - Operation name for error messages
 * @returns {void}
 */
function validateBasicFields(params, requiredFields, operation) {
  if (!requiredFields || requiredFields.length === 0) {
    return;
  }

  try {
    validateRequiredFields(params, requiredFields);
  } catch (error) {
    logger.error(`Basic field validation failed for ${operation}: ${error.message}`, { error });
    throw validationError(operation, `Missing required fields: ${error.message}`, error);
  }
}

/**
 * Validate GID parameter
 * @param {string} gid - Global transaction ID
 * @param {string} operation - Operation name for error messages
 * @returns {void}
 */
function validateGid(gid, operation) {
  if (!gid) {
    throw validationError(operation, 'Missing gid');
  }
}

/**
 * Validate merchant transaction ID
 * @param {string} merchantTxnId - Merchant transaction ID
 * @param {string} operation - Operation name for error messages
 * @returns {void}
 */
function validateMerchantTxnId(merchantTxnId, operation) {
  if (!merchantTxnId) {
    throw validationError(operation, 'Missing merchantTxnId');
  }
}

/**
 * Validate operation type (e.g., refund type, capture type)
 * @param {string} type - Type to validate
 * @param {Array<string>} validTypes - Array of valid types
 * @param {string} operation - Operation name for error messages
 * @returns {void}
 */
function validateOperationType(type, validTypes, operation) {
  if (!type || !validTypes.includes(type)) {
    throw validationError(operation, `Invalid type. Must be one of: ${validTypes.join(', ')}`);
  }
}

module.exports = {
  validatePayload,
  validateRequiredFieldsWithPaths,
  executeCustomValidation,
  executeSchemaValidation,
  validateBasicFields,
  validateGid,
  validateMerchantTxnId,
  validateOperationType
}; 