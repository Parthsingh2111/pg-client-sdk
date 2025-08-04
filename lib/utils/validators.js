

/**
 * Validate required fields.
 * @param {Object} data - Data to validate
 * @param {string[]} fields - Required fields
 */
const { validationError } = require('./errorHandler');

function validateRequiredFields(data, fields) {
  for (const field of fields) {
    const keys = field.split('.');
    let value = data;
    for (const key of keys) {
      value = value[key];
      if (value === undefined || value === null) {
        throw validationError(field, 'field is required');
      }
    }
  }
}

/**
 * Validate email format.
 * @param {string} email - Email to validate
 * @returns {string} Validated email
 */
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw validationError('email', 'invalid email format');
  }
  return email;
}



module.exports = { 
  validateRequiredFields, 
  validateEmail
};