

/**
 * Validate required fields.
 * @param {Object} data - Data to validate
 * @param {string[]} fields - Required fields
 */

function validateRequiredFields(data, fields) {
  for (const field of fields) {
    const keys = field.split('.');
    let value = data;
    for (const key of keys) {
      value = value[key];
      if (value === undefined || value === null) {
        throw new Error(`Missing required field: ${field}`);
      }
    }
  }
}

module.exports = { 
  validateRequiredFields
};