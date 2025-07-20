const Ajv = require('ajv');

const ajv = new Ajv({ allErrors: true, verbose: true, coerceTypes: false });

const payglocalSchema = {
  type: 'object',
  properties: {
    merchantTxnId: { type: 'string' },
    merchantUniqueId: { type: 'string', nullable: true },
    captureTxn: { type: ['boolean', 'null'] },
    paymentData: {
      type: 'object',
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
          },
          additionalProperties: false
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
          },
          additionalProperties: false
        },
        billingData: {
          type: 'object',
          properties: {
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            addressStreet1: { type: 'string' },
            addressStreet2: { type: 'string', nullable: true },
            addressCity: { type: 'string' },
            addressState: { type: 'string' },
            addressPostalCode: { type: 'string' },
            addressCountry: { type: 'string' },
            emailId: { type: 'string' },
            callingCode: { type: 'string' },
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
            merchantAssignedCustomerId: { type: 'string' },
            customerAccountType: { type: 'string' },
            customerSuccessOrderCount: { type: 'string' },
            customerAccountCreationDate: { type: 'string' },
            ipAddress: { type: 'string' },
            httpAccept: { type: 'string' },
            httpUserAgent: { type: 'string' }
          },
          additionalProperties: false
        },
        shippingData: {
          type: 'object',
          properties: {
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            addressStreet1: { type: 'string' },
            addressStreet2: { type: 'string', nullable: true },
            addressCity: { type: 'string' },
            addressState: { type: 'string' },
            addressPostalCode: { type: 'string' },
            addressCountry: { type: 'string' },
            emailId: { type: 'string' },
            callingCode: { type: 'string' },
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
              refundable: { type: 'string' },
              journeyType: {
                type: 'string',
                enum: ['RETURN', 'ONEWAY']
              },
              electronicTicket: { type: 'string' },
              reservationDate: { type: 'string' },
              ticketIssueCity: { type: 'string' },
              ticketIssueState: { type: 'string' },
              ticketIssueCountry: { type: 'string' },
              ticketIssuePostalCode: { type: 'string' },
              ticketType: { type: 'string' },
              reservationCode: { type: 'string' },
              reservationSystem: { type: 'string' },
              legData: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    arrivalDate: {
                      type: 'string',
                      // pattern: '^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}Z$'
                    },
                    arrivalAirportCode: { type: 'string' },
                    departureDate: {
                      type: 'string',
                      // pattern: '^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\d\{2}:\\d{2}Z$'
                    },
                    departureAirportCode: { type: 'string' },
                    carrierCode: { type: 'string' },
                    flightNumber: { type: 'string' },
                    serviceClass: { type: 'string' },
                    routeId: { type: 'string' },
                    legId: { type: 'string' },
                    departureCity: { type: 'string' },
                    arrivalCity: { type: 'string' },
                  },
                  additionalProperties: false
                }
              },
              passengerData: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    title: { type: 'string', nullable: true },
                    firstName: { type: 'string' },
                    lastName: { type: 'string' },
                    dateOfBirth: { type: 'string' },
                    type: { type: 'string' },
                    email: { type: 'string' },
                    passportCountry: { type: 'string' },
                    passportNumber: { type: 'string' },
                    passportIssueDate: { type: 'string' },
                    passportExpiryDate: { type: 'string' }
                  },
                  additionalProperties: false
                }
              }
            },
            additionalProperties: false
          }
        },
        lodgingData: {
          type: 'object',
          properties: {
            checkInDate: { type: 'string' },
            checkOutDate: { type: 'string' },
            city: { type: 'string' },
            country: { type: 'string' },
            lodgingType: { type: 'string' },
            lodgingName: { type: 'string' },
            rating: { type: 'string' },
            cancellationPolicy: { type: 'string' },
            bookingPersonFirstName: { type: 'string' },
            bookingPersonLastName: { type: 'string' },
            bookingPersonEmailid: { type: 'string' },
            bookingPersonPhoneNumber: { type: 'string' },
            bookingPersonCallingCode: { type: 'string' },
            rooms: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  numberOfGuests: { type: 'string' },
                  roomType: { type: 'string' },
                  roomCategory: { type: 'string' },
                  numberOfNights: { type: 'string' },
                  roomPrice: { type: 'string' },
                  guestFirstName: { type: 'string' },
                  guestLastName: { type: 'string' },
                  guestEmail: { type: 'string' }
                },
                additionalProperties: false
              }
            }
          },
          additionalProperties: false
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
                    departureCity: { type: 'string' },
                    departureCountry: { type: 'string' },
                    departureDate: { type: 'string' },
                    arrivalCity: { type: 'string' },
                    arrivalCountry: { type: 'string' },
                    arrivalDate: { type: 'string' }
                  },
                  additionalProperties: false
                }
              },
              passengerData: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    firstName: { type: 'string' },
                    lastName: { type: 'string' },
                    dateOfBirth: { type: 'string' },
                    passportCountry: { type: 'string' }
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
                    departureCity: { type: 'string' },
                    departureCountry: { type: 'string' },
                    departureDate: { type: 'string' },
                    arrivalCity: { type: 'string' },
                    arrivalCountry: { type: 'string' },
                    arrivalDate: { type: 'string' }
                  },
                  additionalProperties: false
                }
              },
              passengerData: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    firstName: { type: 'string' },
                    lastName: { type: 'string' },
                    dateOfBirth: { type: 'string' },
                    passportCountry: { type: 'string' }
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
              legData: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    routeId: { type: 'string' },
                    legId: { type: 'string' },
                    pickupDate: { type: 'string' }
                  },
                  additionalProperties: false
                }
              },
              passengerData: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    firstName: { type: 'string' },
                    lastName: { type: 'string' },
                    dateOfBirth: { type: 'string' },
                    passportCountry: { type: 'string' }
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
    },
    merchantCallbackURL: { type: 'string' }
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
    throw new Error(JSON.stringify({
      message: 'Payload validation failed',
      problematicFields
    }, null, 2));
  }
  console.log('Payload is valid, payload have passed payglocal schema validation for payCollect method');
  return { message: 'Payload is valid, payload have passed payglocal schema validation for payCollect method' };
};

module.exports = {
  validatePaycollectPayload
};