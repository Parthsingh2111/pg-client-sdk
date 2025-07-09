// lib/utils/schemaValidator.js
const Ajv = require('ajv');
const ajv = new Ajv();
const paycollectSchema = {
  type: 'object',
  required: ['merchantTxnId', 'paymentData', 'merchantCallbackURL'],
  properties: {
    merchantTxnId: { type: 'string' },
    merchantUniqueId: { type: 'string' },
    merchantCallbackURL: { type: 'string' },
    paymentData: {
      type: 'object',
      required: ['totalAmount', 'txnCurrency'],
      properties: {
        totalAmount: { type: 'string' },
        txnCurrency: { type: 'string' },
        cardData: {
          type: 'object',
          properties: {
            number: { type: 'string' },
            expiryMonth: { type: 'string' },
            expiryYear: { type: 'string' },
            type: { type: 'string' },
            securityCode: { type: 'string' }
          }
        },
        tokenData: {
          type: 'object',
          properties: {
            altId: { type: 'string' },
            number: { type: 'string' },
            expiryMonth: { type: 'string' },
            expiryYear: { type: 'string' },
            securityCode: { type: 'string' },
            cryptogram: { type: 'string' },
            requestorID: { type: 'string' },
            hashOfFirstSix: { type: 'string' },
            firstSix: { type: 'string' },
            lastFour: { type: 'string' },
            cardBrand: { type: 'string' },
            cardCountryCode: { type: 'string' },
            cardIssuerName: { type: 'string' },
            cardType: { type: 'string' },
            cardCategory: { type: 'string' }
          }
        },
        billingData: {
          type: 'object',
          properties: {
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            addressStreet1: { type: 'string' },
            addressStreet2: { type: 'string' },
            addressCity: { type: 'string' },
            addressState: { type: 'string' },
            addressPostalCode: { type: 'string' },
            addressCountry: { type: 'string' },
            emailId: { type: 'string' },
            callingCode: { type: 'string' },
            phoneNumber: { type: 'string' }
          }
        }
      }
    },
    standingInstruction: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          properties: {
            amount: { type: 'string' },
            maxAmount: { type: 'string' },
            numberOfPayments: { type: 'string' },
            frequency: { type: 'string' },
            type: { type: 'string' },
            startDate: { type: 'string' }
          }
        }
      }
    },
    riskData: {
      type: 'object',
      properties: {
        orderData: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              productDescription: { type: 'string' },
              productSKU: { type: 'string' },
              productType: { type: 'string' },
              itemUnitPrice: { type: 'string' },
              itemQuantity: { type: 'string' }
            }
          }
        },
        customerData: {
          type: 'object',
          properties: {
            merchantAssignedCustomerId: { type: 'string' },
            customerAccountType: { type: 'string' },
            customerSuccessOrderCount: { type: 'string' },
            customerAccountCreationDate: { type: 'string' },
            ipAddress: { type: 'string' },
            httpAccept: { type: 'string' },
            httpUserAgent: { type: 'string' }
          }
        },
        shippingData: {
          type: 'object',
          properties: {
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            addressStreet1: { type: 'string' },
            addressStreet2: { type: 'string' },
            addressCity: { type: 'string' },
            addressState: { type: 'string' },
            addressPostalCode: { type: 'string' },
            addressCountry: { type: 'string' },
            emailId: { type: 'string' },
            callingCode: { type: 'string' },
            phoneNumber: { type: 'string' }
          }
        }
      }
    }
  },
  additionalProperties: true
};

const validatePaycollectPayload = (payload) => {
  const validate = ajv.compile(paycollectSchema);
  const valid = validate(payload);
  if (!valid) {
    const errors = validate.errors.map(err => `Field "${err.instancePath}" ${err.message}`);
    throw new Error('Payload validation failed:\n' + errors.join('\n'));
  }
  console.log('Payload is valid');
};

module.exports = {
  validatePaycollectPayload
};
