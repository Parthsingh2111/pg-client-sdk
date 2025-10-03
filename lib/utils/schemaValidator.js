const Ajv = require('ajv');
const { logger } = require('./logger');

const ajv = new Ajv({ allErrors: true, verbose: true, coerceTypes: false });

// Define the expected hierarchical structure
// Define the expected object hierarchy (objects only, not individual fields)
const expectedHierarchy = {
  root: ["merchantTxnId","merchantUniqueId","captureTxn","gpiTxnTimeout","totalAmount","txnCurrency","paymentData", "standingInstruction", "riskData","merchantCallbackURL"],
  paymentData: ["totalAmount","cardData", "tokenData", "billingData"], // add currency
  standingInstruction: ["data"],
  riskData: ["orderData", "customerData", "shippingData", "flightData", "trainData", "busData", "cabData", "lodgingData"],
  riskData_flightData: ["legData", "passengerData"],
  riskData_trainData: ["legData", "passengerData"],
  riskData_busData: ["legData", "passengerData"],
  riskData_cabData: ["legData", "passengerData"],
  riskData_lodgingData: ["rooms"]
};
/**
 * Validates hierarchical placement of objects in the payload
 * @param {Object} payload - The payload to validate
 * @returns {Object} - Object containing warnings and validation result
 */
function validateHierarchicalPlacement(payload) {
  const warnings = [];

  function isContainer(val) {
    if (!val || typeof val !== 'object') return false;
    if (Array.isArray(val)) return true; // Arrays are containers
    if (val.constructor === Object) return true; // Plain objects are containers
    return false; // Everything else (Date, RegExp, etc.) is not a container
  }

  function nextPathFor(expectedPath, key) {
    let next = expectedPath;
    if (expectedPath === 'root') {
      if (key === 'paymentData') next = 'paymentData';
      else if (key === 'standingInstruction') next = 'standingInstruction';
      else if (key === 'riskData') next = 'riskData';
    } else if (expectedPath === 'paymentData') {
      if (key === 'cardData') next = 'cardData';
      else if (key === 'tokenData') next = 'tokenData';
      else if (key === 'billingData') next = 'billingData';
    } else if (expectedPath === 'standingInstruction') {
      if (key === 'data') next = 'standingInstruction_data';
    } else if (expectedPath === 'riskData') {
      if (key === 'orderData') next = 'riskData_orderData';
      else if (key === 'customerData') next = 'riskData_customerData';
      else if (key === 'shippingData') next = 'riskData_shippingData';
      else if (key === 'flightData') next = 'riskData_flightData';
      else if (key === 'trainData') next = 'riskData_trainData';
      else if (key === 'busData') next = 'riskData_busData';
      else if (key === 'cabData') next = 'riskData_cabData';
      else if (key === 'lodgingData') next = 'riskData_lodgingData';
    } else if (expectedPath === 'riskData_flightData') {
      if (key === 'legData') next = 'riskData_flightData_legData';
      else if (key === 'passengerData') next = 'riskData_flightData_passengerData';
    } else if (expectedPath === 'riskData_trainData') {
      if (key === 'legData') next = 'riskData_trainData_legData';
      else if (key === 'passengerData') next = 'riskData_trainData_passengerData';
    } else if (expectedPath === 'riskData_busData') {
      if (key === 'legData') next = 'riskData_busData_legData';
      else if (key === 'passengerData') next = 'riskData_busData_passengerData';
    } else if (expectedPath === 'riskData_cabData') {
      if (key === 'legData') next = 'riskData_cabData_legData';
      else if (key === 'passengerData') next = 'riskData_cabData_passengerData';
    } else if (expectedPath === 'riskData_lodgingData') {
      if (key === 'rooms') next = 'riskData_lodgingData_rooms';
    }
    return next;
  }

  function check(obj, path = '', expectedPath = 'root') {
    if (!obj || typeof obj !== 'object') return;

    for (const [key, value] of Object.entries(obj)) {
      const currentPath = path ? `${path}.${key}` : key;

      // Only warn for containers (objects/arrays), never primitives
      if (isContainer(value)) {
        const expected = expectedHierarchy[expectedPath] || [];
        if (!expected.includes(key)) {
          warnings.push({
            type: 'hierarchical_placement',
            message: `Object "${key}" at path "${currentPath}" might be misplaced`,
            currentPath,
            expectedPath,
            objectType: Array.isArray(value) ? 'array' : 'object'
          });
          // Do not recurse into misplaced subtree
          continue;
        }

        // Recurse into correctly placed containers
        const nextExpected = nextPathFor(expectedPath, key);
        if (Array.isArray(value)) {
          value.forEach((item, idx) => {
            if (isContainer(item)) {
              check(item, `${currentPath}[${idx}]`, nextExpected);
            }
          });
        } else {
          check(value, currentPath, nextExpected);
        }
      }
    }
  }

  // Start validation from root
  check(payload, '', 'root');

  return {
    isValid: true, // Always valid, just warnings
    warnings,
    misplacedObjects: warnings // keep legacy field name for compatibility
  };
}

const payglocalSchema = {
  type: 'object',
  required: ['merchantTxnId','merchantCallbackURL', 'paymentData'],
  properties: {
    merchantTxnId: { type: 'string' },
    // merchantId: { type: 'string' },
    merchantUniqueId: { type: ['string', 'null'] },
    captureTxn: { type: ['boolean', 'null'] }, // Adjusted for BooleanStringField
    gpiTxnTimeout: { type: 'string' },
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
            securityCode: { type: 'string' },
            type: { type: 'string' }
          }
          // additionalProperties: false  // Commented out for SDK flexibility
        },
        tokenData: {
          type: 'object',
          properties: {
            altId: { type: 'string' },
            number: { type: 'string' },
            expiryMonth: { type: 'string' },
            expiryYear: { type: 'string' },
            securityCode: { type: 'string' },
            requestorID: { type: 'string' },
            hashOfFirstSix: { type: 'string' },
            cryptogram: { type: 'string' },
            firstSix: { type: 'string' },
            lastFour: { type: 'string' },
            cardBrand: { type: 'string' },
            cardCountryCode: { type: 'string' },
            cardIssuerName: { type: 'string' },
            cardType: { type: 'string' },
            cardCategory: { type: 'string' },
            referenceNo: { type: 'string' }
          }
          // additionalProperties: false  // Commented out for SDK flexibility
        },
        billingData: {
          type: 'object',
          properties: {
            fullName: { type: 'string' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            addressStreet1: { type: 'string' },
            addressStreet2: { type: ['string', 'null'] },
            addressCity: { type: 'string' },
            addressState: { type: 'string' },
            addressStateCode: { type: 'string' },
            addressPostalCode: { type: 'string' },
            addressCountry: { type: 'string' },
            emailId: { type: 'string' },
            callingCode: { type: 'string' },
            phoneNumber: { type: 'string' },
            panNumber: { type: 'string' }
          }
          // additionalProperties: false  // Commented out for SDK flexibility
        }
      }
      // additionalProperties: false  // Commented out for SDK flexibility
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
          // additionalProperties: false  // Commented out for SDK flexibility
        }
      }
      // additionalProperties: false  // Commented out for SDK flexibility
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
            // additionalProperties: false  // Commented out for SDK flexibility
          }
        },
        customerData: {
          type: 'object',
          properties: {
            customerAccountType: { type: 'string' },
            customerSuccessOrderCount: { type: 'string' },
            customerAccountCreationDate: { type: 'string' },
            merchantAssignedCustomerId: { type: 'string' }
          }
          // additionalProperties: false  // Commented out for SDK flexibility
        },
        shippingData: {
          type: 'object',
          properties: {
            fullName: { type: 'string' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            addressStreet1: { type: 'string' },
            addressStreet2: { type: ['string', 'null'] },
            addressCity: { type: 'string' },
            addressState: { type: 'string' },
            addressStateCode: { type: 'string' },
            addressPostalCode: { type: 'string' },
            addressCountry: { type: 'string' },
            emailId: { type: 'string' },
            callingCode: { type: 'string' },
            phoneNumber: { type: 'string' }
          }
          // additionalProperties: false  // Commented out for SDK flexibility
        },
        flightData: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              agentCode: { type: 'string' },
              agentName: { type: 'string' },
              ticketNumber: { type: 'string' },
              reservationDate: { type: 'string'},
              ticketIssueCity: { type: 'string' },
              ticketIssueState: { type: 'string' },
              ticketIssueCountry: { type: 'string' },
              ticketIssuePostalCode: { type: 'string' },
              reservationCode: { type: 'string' },
              reservationSystem: { type: 'string' },
              journeyType: { type: 'string' },
              electronicTicket: { type: 'string' },
              refundable: { type: 'string' },
              ticketType: { type: 'string' },
              legData: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    routeId: { anyOf: [{ type: 'string'}, { type: 'number' }] },
                    legId: { anyOf: [{ type: 'string'}, { type: 'number' }] },
                    flightNumber: { type: 'string' },
                    departureDate: { type: 'string' },
                    departureAirportCode: { type: 'string' },
                    departureCity: { type: 'string' },
                    departureCountry: { type: 'string' },
                    arrivalDate: { type: 'string' },
                    arrivalAirportCode: { type: 'string' },
                    arrivalCity: { type: 'string' },
                    arrivalCountry: { type: 'string' },
                    carrierCode: { type: 'string' },
                    carrierName: { type: 'string' },
                    serviceClass: { type: 'string' }
                  }
                  // additionalProperties: false  // Commented out for SDK flexibility
                }
              },
              passengerData: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    title: { type: ['string', 'null'] },
                    firstName: { type: 'string' },
                    lastName: { type: 'string' },
                    dateOfBirth: { type: 'string',pattern: '^[0-9]{1,8}$' },
                    type: { type: 'string' },
                    email: { type: 'string' },
                    passportNumber: { type: 'string' },
                    passportCountry: { type: 'string' },
                    passportIssueDate: { type: 'string', maxLength: 8},
                    passportExpiryDate: { type: 'string', maxLength: 8},
                    referenceNumber: { type: 'string' }
                  }
                  // additionalProperties: false  // Commented out for SDK flexibility
                }
              }
            }
            // additionalProperties: false  // Commented out for SDK flexibility
          }
        },
        trainData: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              ticketNumber: { type: 'string' },
              reservationDate: { type: 'string', maxLength: 8, pattern: '^[0-9]{1,8}$' },
              legData: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    routeId: { anyOf: [{ type: 'string'}, { type: 'number' }] },
                    legId: { anyOf: [{ type: 'string'}, { type: 'number' }] },
                    trainNumber: { type: 'string' },
                    departureDate: { type: 'string' },
                    departureCity: { type: 'string' },
                    departureCountry: { type: 'string' },
                    arrivalDate: { type: 'string' },
                    arrivalCity: { type: 'string' },
                    arrivalCountry: { type: 'string' }
                  }
                  // additionalProperties: false  // Commented out for SDK flexibility
                }
              },
              passengerData: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    // title: { type: ['string', 'null'] },
                    firstName: { type: 'string' },
                    lastName: { type: 'string' },
                    dateOfBirth: { type: 'string',},
                    // type: { type: 'string' },
                    // email: { type: 'string' },
                    // passportNumber: { type: 'string' },
                    // passportCountry: { type: 'string' },
                    // passportIssueDate: { type: 'string'},
                    // passportExpiryDate: { type: 'string'},
                    // referenceNumber: { type: 'string' }
                  }
                  // additionalProperties: false  // Commented out for SDK flexibility
                }
              }
            }
            // additionalProperties: false  // Commented out for SDK flexibility
          }
        },
        busData: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              ticketNumber: { type: 'string' },
              reservationDate: { type: 'string' },
              legData: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    routeId: { type: 'string' },
                    legId: { type: 'string' },
                    busNumber: { type: 'string' },
                    departureDate: { type: 'string' },
                    departureCity: { type: 'string' },
                    departureCountry: { type: 'string' },
                    arrivalDate: { type: 'string' },
                    arrivalCity: { type: 'string' },
                    arrivalCountry: { type: 'string' }
                  }
                  // additionalProperties: false  // Commented out for SDK flexibility
                }
              },
              passengerData: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    // title: { type: ['string', 'null'] },
                    firstName: { type: 'string' },
                    lastName: { type: 'string' },
                    dateOfBirth: { type: 'string' },
                    // type: { type: 'string' },
                    // email: { type: 'string' },
                    // passportNumber: { type: 'string' },
                    passportCountry: { type: 'string' },
                    // passportIssueDate: { type: 'string' },
                    // passportExpiryDate: { type: 'string' },
                    // referenceNumber: { type: 'string' }
                  }
                  // additionalProperties: false  // Commented out for SDK flexibility
                }
              }
            }
            // additionalProperties: false  // Commented out for SDK flexibility
          }
        },
        // shipData: {
        //   type: 'array',
        //   items: {
        //     type: 'object',
        //     properties: {
        //       ticketNumber: { type: 'string' },
        //       reservationDate: { type: 'string' },
        //       legData: {
        //         type: 'array',
        //         items: {
        //           type: 'object',
        //           properties: {
        //             routeId: { type: 'string' },
        //             legId: { type: 'string' },
        //             shipNumber: { type: 'string' },
        //             departureDate: { type: 'string' },
        //             departureCity: { type: 'string' },
        //             departureCountry: { type: 'string' },
        //             arrivalDate: { type: 'string' },
        //             arrivalCity: { type: 'string' },
        //             arrivalCountry: { type: 'string' }
        //           }
        //           // additionalProperties: false  // Commented out for SDK flexibility
        //         }
        //       },
        //       passengerData: {
        //         type: 'array',
        //         items: {
        //           type: 'object',
        //           properties: {
        //             title: { type: ['string', 'null'] },
        //             firstName: { type: 'string' },
        //             lastName: { type: 'string' },
        //             dateOfBirth: { type: 'string' },
        //             type: { type: 'string' },
        //             email: { type: 'string' },
        //             passportNumber: { type: 'string' },
        //             passportCountry: { type: 'string' },
        //             passportIssueDate: { type: 'string' },
        //             passportExpiryDate: { type: 'string' },
        //             referenceNumber: { type: 'string' }
        //           }
        //           // additionalProperties: false  // Commented out for SDK flexibility
        //         }
        //       }
        //     }
        //     // additionalProperties: false  // Commented out for SDK flexibility
        //   }
        // },
        cabData: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              reservationDate: { type: 'string' },
              legData: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    routeId: { type: 'string' },
                    legId: { type: 'string' },
                    pickupDate: { type: 'string' },
                    // departureCity: { type: 'string' },
                    // departureCountry: { type: 'string' },
                    // arrivalCity: { type: 'string' },
                    // arrivalCountry: { type: 'string' }
                  }
                  // additionalProperties: false  // Commented out for SDK flexibility
                }
              },
              passengerData: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    // title: { type: ['string', 'null'] },
                    firstName: { type: 'string' },
                    lastName: { type: 'string' },
                    dateOfBirth: { type: 'string' },
                    // type: { type: 'string' },
                    // email: { type: 'string' },
                    // passportNumber: { type: 'string' },
                    passportCountry: { type: 'string' },
                    // passportIssueDate: { type: 'string' },
                    // passportExpiryDate: { type: 'string' },
                    // referenceNumber: { type: 'string' }
                  }
                  // additionalProperties: false  // Commented out for SDK flexibility
                }
              }
            }
            // additionalProperties: false  // Commented out for SDK flexibility
          }
        },
        lodgingData: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              checkInDate: { type: 'string' },
              checkOutDate: { type: 'string' },
              lodgingType: { type: 'string' },
              lodgingName: { type: 'string' },
              city: { type: 'string' },
              country: { type: 'string' },
              rating: { type: 'string' },
              cancellationPolicy: { type: 'string' },
              bookingPersonFirstName: { type: 'string' },
              bookingPersonLastName: { type: 'string' },
              bookingPersonEmailId: { type: 'string' },
              bookingPersonCallingCode: { type: 'string' },
              bookingPersonPhoneNumber: { type: 'string' },
              rooms: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    roomType: { type: 'string' },
                    roomCategory: { type: 'string' },
                    roomPrice: { type: 'string' },
                    numberOfGuests: { type: 'string' },
                    numberOfNights: { type: 'string' },
                    guestFirstName: { type: 'string' },
                    guestLastName: { type: 'string' },
                    guestEmail: { type: 'string' }
                  }
                  // additionalProperties: false  // Commented out for SDK flexibility
                }
              }
            }
            // additionalProperties: false  // Commented out for SDK flexibility
          }
        }
      }
      // additionalProperties: false  // Commented out for SDK flexibility
    },
    merchantCallbackURL: { type: 'string' }
  }
  // additionalProperties: false  // Commented out for SDK flexibility
};

function pointerToDotPath(pointer) {
  // Convert Ajv JSON pointer "/riskData/flightData/0/legData/0/routeId" to
  // "riskData.flightData[0].legData[0].routeId"
  if (!pointer || pointer === '') return 'root';
  const parts = pointer.split('/').slice(1); // drop leading ''
  let out = '';
  for (const part of parts) {
    if (part === '') continue;
    if (/^\d+$/.test(part)) {
      out += `[${part}]`;
    } else {
      out += (out.length ? '.' : '') + part;
    }
  }
  return out || 'root';
}

const validatePaycollectPayload = (payload) => {
  const validate = ajv.compile(payglocalSchema);
  const valid = validate(payload);
  
  if (!valid) {
    const errorsMap = {};
    validate.errors.forEach(err => {
      const fieldPath = pointerToDotPath(err.instancePath);
      let mapped;
      if (err.keyword === 'pattern' && /\^\[0-9\]\+\$|\^\[0-9\]\{1,8\}\$/.test(err.params?.pattern || '')) {
        mapped = 'NOT_NUMERIC';
      } else if (err.keyword === 'maxLength' && err.params?.limit === 8) {
        mapped = 'OVER_MAX_LENGTH, expected maxLength: 8';
      } else {
        mapped = err.message;
      }
      // Prefer first message per field
      if (!errorsMap[fieldPath]) {
        errorsMap[fieldPath] = mapped;
      }
    });

    const responseShape = {
      gid: null,
      status: 'REQUEST_ERROR',
      message: 'Invalid request fields',
      timestamp: new Date().toISOString(),
      reasonCode: 'LOCAL-400-001',
      data: null,
      errors: errorsMap
    };

    throw new Error(JSON.stringify(responseShape));
  }

  // Perform hierarchical validation after schema validation passes
  const hierarchicalValidation = validateHierarchicalPlacement(payload);
  
  // Log warnings if any objects are misplaced
  if (hierarchicalValidation.warnings.length > 0) {
    logger.warn('Hierarchical placement warnings detected', {
      warningCount: hierarchicalValidation.warnings.length,
      warnings: hierarchicalValidation.warnings
    });
    
    // Log each warning individually for better visibility
    hierarchicalValidation.warnings.forEach(warning => {
      logger.warn(`Hierarchical Warning: ${warning.message}`, {
        currentPath: warning.currentPath,
        expectedPath: warning.expectedPath,
        objectType: warning.objectType
      });
    });
  }

  logger.debug('Payload has passed payglocal schema validation for payCollect method');
  return { 
    message: 'Payload is valid, payload have passed payglocal schema validation for payCollect method',
    hierarchicalWarnings: hierarchicalValidation.warnings,
    warningCount: hierarchicalValidation.warnings.length
  };
};

module.exports = {
  validatePaycollectPayload,
  validateHierarchicalPlacement
};





// orderData,customerData,shippingData,flightData,trainData,busData,cabData,lodgingData
























// const Ajv = require('ajv');
// const { logger } = require('./logger');

// const ajv = new Ajv({ allErrors: true, verbose: true, coerceTypes: false });

// // Define the expected hierarchical structure
// // Define the expected object hierarchy (objects only, not individual fields)
// const expectedHierarchy = {
//   root: ["paymentData", "standingInstruction", "riskData"],
//   paymentData: ["cardData", "tokenData", "billingData"],
//   standingInstruction: ["data"],
//   riskData: ["orderData", "customerData", "shippingData", "flightData", "trainData", "busData", "shipData", "cabData", "lodgingData"],
//   riskData_flightData: ["legData", "passengerData"],
//   riskData_trainData: ["legData", "passengerData"],
//   riskData_busData: ["legData", "passengerData"],
//   riskData_shipData: ["legData", "passengerData"],
//   riskData_cabData: ["legData", "passengerData"],
//   riskData_lodgingData: ["rooms"]
// };
// /**
//  * Validates hierarchical placement of objects in the payload
//  * @param {Object} payload - The payload to validate
//  * @returns {Object} - Object containing warnings and validation result
//  */
// function validateHierarchicalPlacement(payload) {
//   const warnings = [];
//   const misplacedObjects = [];

//   function checkObjectPlacement(obj, path = '', expectedPath = '') {
//     if (!obj || typeof obj !== 'object') return;

//     for (const [key, value] of Object.entries(obj)) {
//       const currentPath = path ? `${path}.${key}` : key;
      
//       // Only check if this is an object (not primitive values or arrays)
//       if (value && typeof value === "object" && !Array.isArray(value)) {
//         // Check if this object should be at this level
//         if (expectedHierarchy[expectedPath || "root"]) {
//           const expectedObjects = expectedHierarchy[expectedPath || "root"];
//           if (!expectedObjects.includes(key)) {
//             // This object might be misplaced
//             misplacedObjects.push({
//               key,
//               currentPath,
//               expectedPath: expectedPath || "root",
//               objectType: "object"
//             });
//           }
//         }
//       }

//       // Recursively check nested objects
//       if (value && typeof value === 'object' && !Array.isArray(value)) {
//         let nextExpectedPath = expectedPath;
        
//         // Determine the expected path for nested objects
//         if (expectedPath === 'root') {
//           if (key === 'paymentData') nextExpectedPath = 'paymentData';
//           else if (key === 'standingInstruction') nextExpectedPath = 'standingInstruction';
//           else if (key === 'riskData') nextExpectedPath = 'riskData';
//         } else if (expectedPath === 'paymentData') {
//           if (key === 'cardData') nextExpectedPath = 'cardData';
//           else if (key === 'tokenData') nextExpectedPath = 'tokenData';
//           else if (key === 'billingData') nextExpectedPath = 'billingData';
//         } else if (expectedPath === 'standingInstruction') {
//           if (key === 'data') nextExpectedPath = 'standingInstruction_data';
//         } else if (expectedPath === 'riskData') {
//           if (key === 'orderData') nextExpectedPath = 'riskData_orderData';
//           else if (key === 'customerData') nextExpectedPath = 'riskData_customerData';
//           else if (key === 'shippingData') nextExpectedPath = 'riskData_shippingData';
//           else if (key === 'flightData') nextExpectedPath = 'riskData_flightData';
//           else if (key === 'trainData') nextExpectedPath = 'riskData_trainData';
//           else if (key === 'busData') nextExpectedPath = 'riskData_busData';
//           else if (key === 'shipData') nextExpectedPath = 'riskData_shipData';
//           else if (key === 'cabData') nextExpectedPath = 'riskData_cabData';
//           else if (key === 'lodgingData') nextExpectedPath = 'riskData_lodgingData';
//         } else if (expectedPath === 'riskData_flightData') {
//           if (key === 'legData') nextExpectedPath = 'riskData_flightData_legData';
//           else if (key === 'passengerData') nextExpectedPath = 'riskData_flightData_passengerData';
//         } else if (expectedPath === 'riskData_trainData') {
//           if (key === 'legData') nextExpectedPath = 'riskData_trainData_legData';
//           else if (key === 'passengerData') nextExpectedPath = 'riskData_trainData_passengerData';
//         } else if (expectedPath === 'riskData_busData') {
//           if (key === 'legData') nextExpectedPath = 'riskData_busData_legData';
//           else if (key === 'passengerData') nextExpectedPath = 'riskData_busData_passengerData';
//         } else if (expectedPath === 'riskData_shipData') {
//           if (key === 'legData') nextExpectedPath = 'riskData_shipData_legData';
//           else if (key === 'passengerData') nextExpectedPath = 'riskData_shipData_passengerData';
//         } else if (expectedPath === 'riskData_cabData') {
//           if (key === 'legData') nextExpectedPath = 'riskData_cabData_legData';
//           else if (key === 'passengerData') nextExpectedPath = 'riskData_cabData_passengerData';
//         } else if (expectedPath === 'riskData_lodgingData') {
//           if (key === 'rooms') nextExpectedPath = 'riskData_lodgingData_rooms';
//         }

//         checkObjectPlacement(value, currentPath, nextExpectedPath);
//       }
//     }
//   }

//   // Start validation from root
//   checkObjectPlacement(payload, '', 'root');

//   // Generate warnings for misplaced objects
//   if (misplacedObjects.length > 0) {
//     for (const misplaced of misplacedObjects) {
//       warnings.push({
//         type: 'hierarchical_placement',
//         message: `Object "${misplaced.key}" at path "${misplaced.currentPath}" might be misplaced. Expected at level: ${misplaced.expectedPath}`,
//         currentPath: misplaced.currentPath,
//         expectedPath: misplaced.expectedPath,
//         objectType: misplaced.value
//       });
//     }
//   }

//   return {
//     isValid: true, // Always valid, just warnings
//     warnings,
//     misplacedObjects
//   };
// }

// const payglocalSchema = {
//   type: 'object',
//   required: ['merchantTxnId','merchantCallbackURL', 'paymentData'],
//   properties: {
//     merchantTxnId: { type: 'string' },
//     // merchantId: { type: 'string' },
//     merchantUniqueId: { type: ['string', 'null'] },
//     merchantCallbackURL: { type: 'string' },
//     captureTxn: { type: ['boolean', 'null'] }, // Adjusted for BooleanStringField
//     gpiTxnTimeout: { type: 'string' },
//     paymentData: {
//       type: 'object',
//       required: ['totalAmount', 'txnCurrency'],
//       properties: {
//         totalAmount: { type: 'string' },
//         txnCurrency: { type: 'string' },
//         cardData: {
//           type: 'object',
//           properties: {
//             number: { type: 'string' },
//             expiryMonth: { type: 'string' },
//             expiryYear: { type: 'string' },
//             securityCode: { type: 'string' },
//             type: { type: 'string' }
//           }
//           // additionalProperties: false  // Commented out for SDK flexibility
//         },
//         tokenData: {
//           type: 'object',
//           properties: {
//             altId: { type: 'string' },
//             number: { type: 'string' },
//             expiryMonth: { type: 'string' },
//             expiryYear: { type: 'string' },
//             securityCode: { type: 'string' },
//             requestorID: { type: 'string' },
//             hashOfFirstSix: { type: 'string' },
//             cryptogram: { type: 'string' },
//             firstSix: { type: 'string' },
//             lastFour: { type: 'string' },
//             cardBrand: { type: 'string' },
//             cardCountryCode: { type: 'string' },
//             cardIssuerName: { type: 'string' },
//             cardType: { type: 'string' },
//             cardCategory: { type: 'string' },
//             referenceNo: { type: 'string' }
//           }
//           // additionalProperties: false  // Commented out for SDK flexibility
//         },
//         billingData: {
//           type: 'object',
//           properties: {
//             fullName: { type: 'string' },
//             firstName: { type: 'string' },
//             lastName: { type: 'string' },
//             addressStreet1: { type: 'string' },
//             addressStreet2: { type: ['string', 'null'] },
//             addressCity: { type: 'string' },
//             addressState: { type: 'string' },
//             addressStateCode: { type: 'string' },
//             addressPostalCode: { type: 'string' },
//             addressCountry: { type: 'string' },
//             emailId: { type: 'string' },
//             callingCode: { type: 'string' },
//             phoneNumber: { type: 'string' },
//             panNumber: { type: 'string' }
//           }
//           // additionalProperties: false  // Commented out for SDK flexibility
//         }
//       }
//       // additionalProperties: false  // Commented out for SDK flexibility
//     },
//         standingInstruction: {
//       type: 'object',
//       properties: {
//         data: {
//           type: 'object',
//           properties: {
//             amount: { type: 'string' },
//             maxAmount: { type: 'string' },
//             numberOfPayments: { type: 'string' },
//             frequency: { type: 'string' },
//             type: { type: 'string' },
//             startDate: { type: 'string' }
//           }
//           // additionalProperties: false  // Commented out for SDK flexibility
//         }
//       }
//       // additionalProperties: false  // Commented out for SDK flexibility
//     },
//     riskData: {
//       type: 'object',
//       properties: {
//         orderData: {
//           type: 'array',
//           items: {
//             type: 'object',
//             properties: {
//               productDescription: { type: 'string' },
//               productSKU: { type: 'string' },
//               productType: { type: 'string' },
//               itemUnitPrice: { type: 'string' },
//               itemQuantity: { type: 'string' }
//             }
//             // additionalProperties: false  // Commented out for SDK flexibility
//           }
//         },
//         customerData: {
//           type: 'object',
//           properties: {
//             customerAccountType: { type: 'string' },
//             customerSuccessOrderCount: { type: 'string' },
//             customerAccountCreationDate: { type: 'string' },
//             merchantAssignedCustomerId: { type: 'string' }
//           }
//           // additionalProperties: false  // Commented out for SDK flexibility
//         },
//         shippingData: {
//           type: 'object',
//           properties: {
//             fullName: { type: 'string' },
//             firstName: { type: 'string' },
//             lastName: { type: 'string' },
//             addressStreet1: { type: 'string' },
//             addressStreet2: { type: ['string', 'null'] },
//             addressCity: { type: 'string' },
//             addressState: { type: 'string' },
//             addressStateCode: { type: 'string' },
//             addressPostalCode: { type: 'string' },
//             addressCountry: { type: 'string' },
//             emailId: { type: 'string' },
//             callingCode: { type: 'string' },
//             phoneNumber: { type: 'string' }
//           }
//           // additionalProperties: false  // Commented out for SDK flexibility
//         },
//         flightData: {
//           type: 'array',
//           items: {
//             type: 'object',
//             properties: {
//               agentCode: { type: 'string' },
//               agentName: { type: 'string' },
//               ticketNumber: { type: 'string' },
//               reservationDate: { type: 'string'},
//               ticketIssueCity: { type: 'string' },
//               ticketIssueState: { type: 'string' },
//               ticketIssueCountry: { type: 'string' },
//               ticketIssuePostalCode: { type: 'string' },
//               reservationCode: { type: 'string' },
//               reservationSystem: { type: 'string' },
//               journeyType: { type: 'string' },
//               electronicTicket: { type: 'string' },
//               refundable: { type: 'string' },
//               ticketType: { type: 'string' },
//               legData: {
//                 type: 'array',
//                 items: {
//                   type: 'object',
//                   properties: {
//                     routeId: { anyOf: [{ type: 'string'}, { type: 'number' }] },
//                     legId: { anyOf: [{ type: 'string'}, { type: 'number' }] },
//                     flightNumber: { type: 'string' },
//                     departureDate: { type: 'string' },
//                     departureAirportCode: { type: 'string' },
//                     departureCity: { type: 'string' },
//                     departureCountry: { type: 'string' },
//                     arrivalDate: { type: 'string' },
//                     arrivalAirportCode: { type: 'string' },
//                     arrivalCity: { type: 'string' },
//                     arrivalCountry: { type: 'string' },
//                     carrierCode: { type: 'string' },
//                     carrierName: { type: 'string' },
//                     serviceClass: { type: 'string' }
//                   }
//                   // additionalProperties: false  // Commented out for SDK flexibility
//                 }
//               },
//               passengerData: {
//                 type: 'array',
//                 items: {
//                   type: 'object',
//                   properties: {
//                     title: { type: ['string', 'null'] },
//                     firstName: { type: 'string' },
//                     lastName: { type: 'string' },
//                     dateOfBirth: { type: 'string',pattern: '^[0-9]{1,8}$' },
//                     type: { type: 'string' },
//                     email: { type: 'string' },
//                     passportNumber: { type: 'string' },
//                     passportCountry: { type: 'string' },
//                     passportIssueDate: { type: 'string', maxLength: 8},
//                     passportExpiryDate: { type: 'string', maxLength: 8},
//                     referenceNumber: { type: 'string' }
//                   }
//                   // additionalProperties: false  // Commented out for SDK flexibility
//                 }
//               }
//             }
//             // additionalProperties: false  // Commented out for SDK flexibility
//           }
//         },
//         trainData: {
//           type: 'array',
//           items: {
//             type: 'object',
//             properties: {
//               ticketNumber: { type: 'string' },
//               reservationDate: { type: 'string', maxLength: 8, pattern: '^[0-9]{1,8}$' },
//               legData: {
//                 type: 'array',
//                 items: {
//                   type: 'object',
//                   properties: {
//                     routeId: { anyOf: [{ type: 'string'}, { type: 'number' }] },
//                     legId: { anyOf: [{ type: 'string'}, { type: 'number' }] },
//                     trainNumber: { type: 'string' },
//                     departureDate: { type: 'string' },
//                     departureCity: { type: 'string' },
//                     departureCountry: { type: 'string' },
//                     arrivalDate: { type: 'string' },
//                     arrivalCity: { type: 'string' },
//                     arrivalCountry: { type: 'string' }
//                   }
//                   // additionalProperties: false  // Commented out for SDK flexibility
//                 }
//               },
//               passengerData: {
//                 type: 'array',
//                 items: {
//                   type: 'object',
//                   properties: {
//                     title: { type: ['string', 'null'] },
//                     firstName: { type: 'string' },
//                     lastName: { type: 'string' },
//                     dateOfBirth: { type: 'string',},
//                     type: { type: 'string' },
//                     email: { type: 'string' },
//                     passportNumber: { type: 'string' },
//                     passportCountry: { type: 'string' },
//                     passportIssueDate: { type: 'string'},
//                     passportExpiryDate: { type: 'string'},
//                     referenceNumber: { type: 'string' }
//                   }
//                   // additionalProperties: false  // Commented out for SDK flexibility
//                 }
//               }
//             }
//             // additionalProperties: false  // Commented out for SDK flexibility
//           }
//         },
//         busData: {
//           type: 'array',
//           items: {
//             type: 'object',
//             properties: {
//               ticketNumber: { type: 'string' },
//               reservationDate: { type: 'string' },
//               legData: {
//                 type: 'array',
//                 items: {
//                   type: 'object',
//                   properties: {
//                     routeId: { type: 'string' },
//                     legId: { type: 'string' },
//                     busNumber: { type: 'string' },
//                     departureDate: { type: 'string' },
//                     departureCity: { type: 'string' },
//                     departureCountry: { type: 'string' },
//                     arrivalDate: { type: 'string' },
//                     arrivalCity: { type: 'string' },
//                     arrivalCountry: { type: 'string' }
//                   }
//                   // additionalProperties: false  // Commented out for SDK flexibility
//                 }
//               },
//               passengerData: {
//                 type: 'array',
//                 items: {
//                   type: 'object',
//                   properties: {
//                     title: { type: ['string', 'null'] },
//                     firstName: { type: 'string' },
//                     lastName: { type: 'string' },
//                     dateOfBirth: { type: 'string' },
//                     type: { type: 'string' },
//                     email: { type: 'string' },
//                     passportNumber: { type: 'string' },
//                     passportCountry: { type: 'string' },
//                     passportIssueDate: { type: 'string' },
//                     passportExpiryDate: { type: 'string' },
//                     referenceNumber: { type: 'string' }
//                   }
//                   // additionalProperties: false  // Commented out for SDK flexibility
//                 }
//               }
//             }
//             // additionalProperties: false  // Commented out for SDK flexibility
//           }
//         },
//         shipData: {
//           type: 'array',
//           items: {
//             type: 'object',
//             properties: {
//               ticketNumber: { type: 'string' },
//               reservationDate: { type: 'string' },
//               legData: {
//                 type: 'array',
//                 items: {
//                   type: 'object',
//                   properties: {
//                     routeId: { type: 'string' },
//                     legId: { type: 'string' },
//                     shipNumber: { type: 'string' },
//                     departureDate: { type: 'string' },
//                     departureCity: { type: 'string' },
//                     departureCountry: { type: 'string' },
//                     arrivalDate: { type: 'string' },
//                     arrivalCity: { type: 'string' },
//                     arrivalCountry: { type: 'string' }
//                   }
//                   // additionalProperties: false  // Commented out for SDK flexibility
//                 }
//               },
//               passengerData: {
//                 type: 'array',
//                 items: {
//                   type: 'object',
//                   properties: {
//                     title: { type: ['string', 'null'] },
//                     firstName: { type: 'string' },
//                     lastName: { type: 'string' },
//                     dateOfBirth: { type: 'string' },
//                     type: { type: 'string' },
//                     email: { type: 'string' },
//                     passportNumber: { type: 'string' },
//                     passportCountry: { type: 'string' },
//                     passportIssueDate: { type: 'string' },
//                     passportExpiryDate: { type: 'string' },
//                     referenceNumber: { type: 'string' }
//                   }
//                   // additionalProperties: false  // Commented out for SDK flexibility
//                 }
//               }
//             }
//             // additionalProperties: false  // Commented out for SDK flexibility
//           }
//         },
//         cabData: {
//           type: 'array',
//           items: {
//             type: 'object',
//             properties: {
//               reservationDate: { type: 'string' },
//               legData: {
//                 type: 'array',
//                 items: {
//                   type: 'object',
//                   properties: {
//                     routeId: { type: 'string' },
//                     legId: { type: 'string' },
//                     pickupDate: { type: 'string' },
//                     departureCity: { type: 'string' },
//                     departureCountry: { type: 'string' },
//                     arrivalCity: { type: 'string' },
//                     arrivalCountry: { type: 'string' }
//                   }
//                   // additionalProperties: false  // Commented out for SDK flexibility
//                 }
//               },
//               passengerData: {
//                 type: 'array',
//                 items: {
//                   type: 'object',
//                   properties: {
//                     title: { type: ['string', 'null'] },
//                     firstName: { type: 'string' },
//                     lastName: { type: 'string' },
//                     dateOfBirth: { type: 'string' },
//                     type: { type: 'string' },
//                     email: { type: 'string' },
//                     passportNumber: { type: 'string' },
//                     passportCountry: { type: 'string' },
//                     passportIssueDate: { type: 'string' },
//                     passportExpiryDate: { type: 'string' },
//                     referenceNumber: { type: 'string' }
//                   }
//                   // additionalProperties: false  // Commented out for SDK flexibility
//                 }
//               }
//             }
//             // additionalProperties: false  // Commented out for SDK flexibility
//           }
//         },
//         lodgingData: {
//           type: 'array',
//           items: {
//             type: 'object',
//             properties: {
//               checkInDate: { type: 'string' },
//               checkOutDate: { type: 'string' },
//               lodgingType: { type: 'string' },
//               lodgingName: { type: 'string' },
//               city: { type: 'string' },
//               country: { type: 'string' },
//               rating: { type: 'string' },
//               cancellationPolicy: { type: 'string' },
//               bookingPersonFirstName: { type: 'string' },
//               bookingPersonLastName: { type: 'string' },
//               bookingPersonEmailId: { type: 'string' },
//               bookingPersonCallingCode: { type: 'string' },
//               bookingPersonPhoneNumber: { type: 'string' },
//               rooms: {
//                 type: 'array',
//                 items: {
//                   type: 'object',
//                   properties: {
//                     roomType: { type: 'string' },
//                     roomCategory: { type: 'string' },
//                     roomPrice: { type: 'string' },
//                     numberOfGuests: { type: 'string' },
//                     numberOfNights: { type: 'string' },
//                     guestFirstName: { type: 'string' },
//                     guestLastName: { type: 'string' },
//                     guestEmail: { type: 'string' }
//                   }
//                   // additionalProperties: false  // Commented out for SDK flexibility
//                 }
//               }
//             }
//             // additionalProperties: false  // Commented out for SDK flexibility
//           }
//         }
//       }
//       // additionalProperties: false  // Commented out for SDK flexibility
//     }
//   }
//   // additionalProperties: false  // Commented out for SDK flexibility
// };

// function pointerToDotPath(pointer) {
//   // Convert Ajv JSON pointer "/riskData/flightData/0/legData/0/routeId" to
//   // "riskData.flightData[0].legData[0].routeId"
//   if (!pointer || pointer === '') return 'root';
//   const parts = pointer.split('/').slice(1); // drop leading ''
//   let out = '';
//   for (const part of parts) {
//     if (part === '') continue;
//     if (/^\d+$/.test(part)) {
//       out += `[${part}]`;
//     } else {
//       out += (out.length ? '.' : '') + part;
//     }
//   }
//   return out || 'root';
// }

// const validatePaycollectPayload = (payload) => {
//   const validate = ajv.compile(payglocalSchema);
//   const valid = validate(payload);
  
//   if (!valid) {
//     const errorsMap = {};
//     validate.errors.forEach(err => {
//       const fieldPath = pointerToDotPath(err.instancePath);
//       let mapped;
//       if (err.keyword === 'pattern' && /\^\[0-9\]\+\$|\^\[0-9\]\{1,8\}\$/.test(err.params?.pattern || '')) {
//         mapped = 'NOT_NUMERIC';
//       } else if (err.keyword === 'maxLength' && err.params?.limit === 8) {
//         mapped = 'OVER_MAX_LENGTH, expected maxLength: 8';
//       } else {
//         mapped = err.message;
//       }
//       // Prefer first message per field
//       if (!errorsMap[fieldPath]) {
//         errorsMap[fieldPath] = mapped;
//       }
//     });

//     const responseShape = {
//       gid: null,
//       status: 'REQUEST_ERROR',
//       message: 'Invalid request fields',
//       timestamp: new Date().toISOString(),
//       reasonCode: 'LOCAL-400-001',
//       data: null,
//       errors: errorsMap
//     };

//     throw new Error(JSON.stringify(responseShape));
//   }

//   // Perform hierarchical validation after schema validation passes
//   const hierarchicalValidation = validateHierarchicalPlacement(payload);
  
//   // Log warnings if any objects are misplaced
//   if (hierarchicalValidation.warnings.length > 0) {
//     logger.warn('Hierarchical placement warnings detected', {
//       warningCount: hierarchicalValidation.warnings.length,
//       warnings: hierarchicalValidation.warnings
//     });
    
//     // Log each warning individually for better visibility
//     hierarchicalValidation.warnings.forEach(warning => {
//       logger.warn(`Hierarchical Warning: ${warning.message}`, {
//         currentPath: warning.currentPath,
//         expectedPath: warning.expectedPath,
//         objectType: warning.objectType
//       });
//     });
//   }

//   logger.debug('Payload has passed payglocal schema validation for payCollect method');
//   return { 
//     message: 'Payload is valid, payload have passed payglocal schema validation for payCollect method',
//     hierarchicalWarnings: hierarchicalValidation.warnings,
//     warningCount: hierarchicalValidation.warnings.length
//   };
// };

// module.exports = {
//   validatePaycollectPayload,
//   validateHierarchicalPlacement
// };


