const Ajv = require('ajv');
const { validationError } = require('./errorHandler');
const ajv = new Ajv({ allErrors: true, verbose: true, coerceTypes: false });

const payglocalSchema = {
  type: 'object',
  required: ['merchantTxnId','merchantCallbackURL', 'paymentData'],
  properties: {
    merchantTxnId: { type: 'string' },
    // merchantId: { type: 'string' },
    merchantUniqueId: { type: ['string', 'null'] },
    merchantCallbackURL: { type: 'string' },
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
          },
          additionalProperties: false
        },
        tokenData: {
          type: 'object',
          properties: {
            number: { type: 'string' },
            expiryMonth: { type: 'string' },
            expiryYear: { type: 'string' },
            cryptogram: { type: 'string' },
            firstSix: { type: 'string' },
            lastFour: { type: 'string' },
            cardBrand: { type: 'string' },
            cardCountryCode: { type: 'string' },
            cardIssuerName: { type: 'string' },
            cardType: { type: 'string' },
            cardCategory: { type: 'string' }
          },
          additionalProperties: false
        },
        billingData: {
          type: 'object',
          properties: {
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            addressStreet1: { type: 'string' },
            addressStreet2: { type: ['string', 'null'] },
            addressCity: { type: 'string' },
            addressState: { type: 'string' },
            addressPostalCode: { type: 'string' },
            emailId: { type: 'string' },
            phoneNumber: { type: 'string' }
          },
          additionalProperties: false
        }
      },
      additionalProperties: false
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
          },
          additionalProperties: false
        }
      },
      additionalProperties: false
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
            },
            additionalProperties: false
          }
        },
        customerData: {
          type: 'object',
          properties: {
            customerAccountType: { type: 'string' },
            customerSuccessOrderCount: { type: 'string' },
            customerAccountCreationDate: { type: 'string' },
            merchantAssignedCustomerId: { type: 'string' }
          },
          additionalProperties: false
        },
        shippingData: {
          type: 'object',
          properties: {
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
            phoneNumber: { type: 'string' }
          },
          additionalProperties: false
        },
        flightData: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              agentCode: { type: 'string' },
              agentName: { type: 'string' },
              ticketNumber: { type: 'string' },
              reservationDate: { type: 'string' },
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
                    routeId: { type: 'string' },
                    legId: { type: 'string' },
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
                  },
                  additionalProperties: false
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
                    dateOfBirth: { type: 'string' },
                    type: { type: 'string' },
                    email: { type: 'string' },
                    passportNumber: { type: 'string' },
                    passportCountry: { type: 'string' },
                    passportIssueDate: { type: 'string' },
                    passportExpiryDate: { type: 'string' },
                    referenceNumber: { type: 'string' }
                  },
                  additionalProperties: false
                }
              }
            },
            additionalProperties: false
          }
        },
        trainData: {
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
                    trainNumber: { type: 'string' },
                    departureDate: { type: 'string' },
                    departureCity: { type: 'string' },
                    departureCountry: { type: 'string' },
                    arrivalDate: { type: 'string' },
                    arrivalCity: { type: 'string' },
                    arrivalCountry: { type: 'string' }
                  },
                  additionalProperties: false
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
                    dateOfBirth: { type: 'string' },
                    type: { type: 'string' },
                    email: { type: 'string' },
                    passportNumber: { type: 'string' },
                    passportCountry: { type: 'string' },
                    passportIssueDate: { type: 'string' },
                    passportExpiryDate: { type: 'string' },
                    referenceNumber: { type: 'string' }
                  },
                  additionalProperties: false
                }
              }
            },
            additionalProperties: false
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
                  },
                  additionalProperties: false
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
                    dateOfBirth: { type: 'string' },
                    type: { type: 'string' },
                    email: { type: 'string' },
                    passportNumber: { type: 'string' },
                    passportCountry: { type: 'string' },
                    passportIssueDate: { type: 'string' },
                    passportExpiryDate: { type: 'string' },
                    referenceNumber: { type: 'string' }
                  },
                  additionalProperties: false
                }
              }
            },
            additionalProperties: false
          }
        },
        shipData: {
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
                    shipNumber: { type: 'string' },
                    departureDate: { type: 'string' },
                    departureCity: { type: 'string' },
                    departureCountry: { type: 'string' },
                    arrivalDate: { type: 'string' },
                    arrivalCity: { type: 'string' },
                    arrivalCountry: { type: 'string' }
                  },
                  additionalProperties: false
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
                    dateOfBirth: { type: 'string' },
                    type: { type: 'string' },
                    email: { type: 'string' },
                    passportNumber: { type: 'string' },
                    passportCountry: { type: 'string' },
                    passportIssueDate: { type: 'string' },
                    passportExpiryDate: { type: 'string' },
                    referenceNumber: { type: 'string' }
                  },
                  additionalProperties: false
                }
              }
            },
            additionalProperties: false
          }
        },
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
                    departureCity: { type: 'string' },
                    departureCountry: { type: 'string' },
                    arrivalCity: { type: 'string' },
                    arrivalCountry: { type: 'string' }
                  },
                  additionalProperties: false
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
                    dateOfBirth: { type: 'string' },
                    type: { type: 'string' },
                    email: { type: 'string' },
                    passportNumber: { type: 'string' },
                    passportCountry: { type: 'string' },
                    passportIssueDate: { type: 'string' },
                    passportExpiryDate: { type: 'string' },
                    referenceNumber: { type: 'string' }
                  },
                  additionalProperties: false
                }
              }
            },
            additionalProperties: false
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
                  },
                  additionalProperties: false
                }
              }
            },
            additionalProperties: false
          }
        }
      },
      additionalProperties: false
    }
  },
  additionalProperties: false
};

const validatePaycollectPayload = (payload) => {
  const validate = ajv.compile(payglocalSchema);
  const valid = validate(payload);
  
  if (!valid) {
    const problematicFields = validate.errors.map(err => {
      const field = err.instancePath || 'root';
      const errorType = err.keyword;
      let message;
      
      if (errorType === 'additionalProperties') {
        const additionalProperty = err.params.additionalProperty;
        message = `Unrecognized field "${additionalProperty}"`;
      } else if (errorType === 'type') {
        const value = field.split('/').reduce((obj, key) => obj && obj[key], payload);
        message = `Invalid type: expected ${err.schemaPath.split('/').pop()}, got ${typeof value}`;
      } else {
        message = err.message;
      }
      
      return { field, error: message };
    });
    
    throw validationError('payload', `Schema validation failed: ${JSON.stringify(problematicFields)}`);
  }
  
  return { message: 'Payload is valid, payload have passed payglocal schema validation for payCollect method' };
};

module.exports = {
  validatePaycollectPayload
};


