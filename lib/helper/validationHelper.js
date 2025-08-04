const { validateRequiredFields } = require('../utils/validators');
const { validatePaycollectPayload } = require('../utils/schemaValidator');
const { logger } = require('../utils/logger');
const { validationError } = require('../utils/errorHandler');

/**
 * Comprehensive validation function that handles all validation types in a single call
 * @param {Object} payload - Payload to validate
 * @param {Object} options - Validation options
 * @param {string} options.operation - Operation name for error messages
 * @param {Array<string>} options.requiredFields - Array of required field paths (e.g., ['gid', 'paymentData.totalAmount'])
 * @param {Function} options.customValidation - Custom validation function
 * @param {boolean} options.validateSchema - Whether to validate schema (default: true)
 * @param {Object} options.operationType - Operation type validation config
 * @param {string} options.operationType.field - Field name containing the operation type
 * @param {Array<string>} options.operationType.validTypes - Array of valid operation types
 * @param {Object} options.conditionalValidation - Conditional validation rules
 * @param {string} options.conditionalValidation.condition - Field path to check for condition
 * @param {*} options.conditionalValidation.value - Value to match for condition
 * @param {Array<string>} options.conditionalValidation.requiredFields - Required fields when condition is met
 * @param {Function} options.conditionalValidation.customValidation - Custom validation when condition is met
 * @returns {void}
 */
function validatePayload(payload, options = {}) {
  const {
    operation = 'operation',
    requiredFields = [],
    customValidation = null,
    validateSchema = true,
    operationType = null,
    conditionalValidation = null
  } = options;

  try {
    // 1. Schema Validation
    if (validateSchema) {
      validatePaycollectPayload(payload);
    }

    // 2. Required Fields Validation
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

    // 3. Operation Type Validation
    if (operationType) {
      const { field, validTypes } = operationType;
      const keys = field.split('.');
      let value = payload;
      for (const key of keys) {
        value = value?.[key];
      }
      
      if (!value || !validTypes.includes(value)) {
        throw validationError(operation, `Invalid ${field}. Must be one of: ${validTypes.join(', ')}`);
      }
    }

    // 4. Conditional Validation
    if (conditionalValidation) {
      const { condition, value, requiredFields: conditionalFields, customValidation: conditionalCustomValidation } = conditionalValidation;
      
      const keys = condition.split('.');
      let conditionValue = payload;
      for (const key of keys) {
        conditionValue = conditionValue?.[key];
      }

      if (conditionValue === value) {
        // Validate required fields for this condition
        if (conditionalFields && conditionalFields.length > 0) {
          const validationData = {};
          conditionalFields.forEach(field => {
            const fieldKeys = field.split('.');
            let fieldValue = payload;
            for (const key of fieldKeys) {
              fieldValue = fieldValue?.[key];
            }
            validationData[field] = fieldValue;
          });
          
          validateRequiredFields(validationData, conditionalFields);
        }

        // Execute custom validation for this condition
        if (conditionalCustomValidation) {
          conditionalCustomValidation(payload);
        }
      }
    }

  
    // 5. Amount Validation (COMMENTED OUT AS REQUESTED)
    // if (payload.paymentData) {
    //   const { totalAmount } = payload.paymentData;
    //  
    //   if (totalAmount !== undefined && totalAmount !== null) {
    //     const amount = parseFloat(totalAmount);
    //     if (isNaN(amount) || amount <= 0) {
    //       throw validationError(operation, `Invalid amount: ${totalAmount}. Amount must be a positive number.`);
    //     }
    //   }
    // }

    // 6. Custom Validation (always executed last)
    if (customValidation) {
      customValidation(payload);
    }

  } catch (error) {
    logger.error(`Validation failed for ${operation}: ${error.message}`, { error });
    throw validationError(operation, error.message, error);
  }
}



module.exports = {
  validatePayload,
}; 