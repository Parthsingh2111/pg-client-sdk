# PayGlocal Client SDK for Pay Collect Method

A lightweight, secure, and modular Node.js SDK for integrating with the PayGlocal payment gateway.  
This SDK supports API key payments, JWT-based payments, standing instructions (SI), auth payments, captures, refunds, reversals, and status checks — with robust security features like JWE/JWS encryption and schema validation.

---

##  Features

- **Secure Transactions**: Uses JWE (RSA-OAEP-256) and JWS (RS256) for encrypted and signed payloads.
- **Comprehensive Payment Options**: API key, JWT, SI, auth, captures, refunds, reversals.
- **Reliable API Calls**: Built-in retries with exponential backoff using native fetch.
- **Input Validation**: Schema validation with `ajv` and custom checks.
- **Developer-Friendly**: Intuitive APIs, configurable logging, and sandbox support.
- **Node.js Compatible**: Works with Node.js 18.x and 20.x; supports Express/Fastify.
- **Minimal Dependencies**: Uses native fetch instead of axios for better performance and fewer dependencies.

---

###  Field Support Notice

> **This SDK is built to support only the mandatory fields required to successfully initiate and process transactions.**  
> If your use case requires additional optional fields (such as advanced billing details, custom metadata, or specific business logic), please refer to the [official PayGlocal API documentation](https://docs.payglocal.in), and study the payglocal complete payload or reach out to the PayGlocal support team for guidance on how to extend the integration.


##  Installation

Install via npm:

```bash
npm install payglocal-client
```

---

##  Setup

# 1. Configure Environment Variables

Create a `.env` file in your project root:

```env
PAYGLOCAL_API_KEY=your_api_key
PAYGLOCAL_MERCHANT_ID=your_merchant_id
PAYGLOCAL_PUBLIC_KEY_ID=your_public_key_id
PAYGLOCAL_PRIVATE_KEY_ID=your_private_key_id
PAYGLOCAL_PUBLIC_KEY=-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----
PAYGLOCAL_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----
PAYGLOCAL_BASE_URL=https://api.uat.payglocal.in
PAYGLOCAL_LOG_LEVEL=info
```

---

##  Logging

The SDK includes a comprehensive logging system with multiple levels and structured output:

### Log Levels
- **`error`**: Critical errors and failures
- **`warn`**: Warning messages and potential issues  
- **`info`**: General information and successful operations
- **`debug`**: Detailed debugging information (API requests, responses, etc.)

### Environment Variable
```env
PAYGLOCAL_LOG_LEVEL=debug  # Set to 'error', 'warn', 'info', or 'debug'
```

### Log Output Format
```
[2025-07-28T13:27:15.996Z] [INFO] [PAYGLOCAL-SDK] Payment Operation: initiateJwtPayment {
  "merchantTxnId": "TXN123",
  "success": true,
  "hasPaymentLink": true,
  "hasStatusLink": true
}
```

### Features
- **Structured JSON logging** for easy parsing
- **Timestamped entries** with ISO format
- **Sensitive data masking** (API keys, tokens)
- **API request/response logging** in debug mode
- **Payment operation tracking** with success/failure indicators
- **Configuration logging** (without sensitive data)

### Example Usage
```js
// Set log level via environment variable
process.env.PAYGLOCAL_LOG_LEVEL = 'debug';

// Or configure in client initialization
const client = new PayGlocalClient({
  // ... other config
  logLevel: 'debug'
});
```

Install `dotenv`:

```bash
npm install dotenv
```

---

## 2. Initialize the SDK

```js
require('dotenv').config();
const PayGlocalClient = require('payglocal-client');

const client = new PayGlocalClient({
  apiKey: process.env.PAYGLOCAL_API_KEY,
  merchantId: process.env.PAYGLOCAL_MERCHANT_ID,
  publicKeyId: process.env.PAYGLOCAL_PUBLIC_KEY_ID,
  privateKeyId: process.env.PAYGLOCAL_PRIVATE_KEY_ID,
  payglocalPublicKey: process.env.PAYGLOCAL_PUBLIC_KEY,
  merchantPrivateKey: process.env.PAYGLOCAL_PRIVATE_KEY,
  baseUrl: process.env.PAYGLOCAL_BASE_URL,
  logLevel: process.env.PAYGLOCAL_LOG_LEVEL
});
```

---

### 3. Quick Start

```js
async function initiatePayment() {
  try {
    const payment = await client.initiateJwtPayment({
      merchantTxnId: 'TXN123',
      paymentData: {
        totalAmount: '100.00',
        txnCurrency: 'INR',
        billingData: { emailId: 'user@example.com' }
      },
      merchantCallbackURL: 'https://merchant.com/callback'
    });

    console.log('Payment Link:', payment.paymentLink);
    console.log('GID:', payment.gid);
  } catch (error) {
    console.error('Payment failed:', error.message);
  }
}

initiatePayment();
```

---

##  API Reference

### `initiateApiKeyPayment(params)`
Initiates an API key-based payment.  
**Params**: `{ merchantTxnId, paymentData, merchantCallbackURL }`  
**Returns**: `{ paymentLink, statusLink }`

---

### `initiateJwtPayment(params)`
Initiates a JWT-based payment with JWE/JWS.  
**Params**: `{ merchantTxnId, paymentData, merchantCallbackURL }`  
**Returns**: `{ paymentLink, gid }`

---

### `initiateSiPayment(params)`
Initiates a standing instruction payment.  
**Params**: `{ merchantTxnId, paymentData, standingInstruction, merchantCallbackURL }`  
**Returns**: `{ paymentLink, gid }`

---

### `initiateAuthPayment(params)`
Initiates an auth payment.  
**Params**: `{ merchantTxnId, paymentData, captureTxn, merchantCallbackURL }`  
**Returns**: `{ paymentLink, gid }`

---

### `initiateCapture(params)`
Captures a payment (full or partial).  
**Params**: `{ gid, merchantTxnId, captureType, paymentData }`  
**Returns**: `{ status, gid, message, captureId }`

---

### `initiateRefund(params)`
Initiates a refund (full or partial).  
**Params**: `{ gid, refundType, paymentData }`  
**Returns**: `{ status, gid, message, refundId }`

---

### `initiateAuthReversal(params)`
Reverses an auth transaction.  
**Params**: `{ gid, merchantTxnId }`  
**Returns**: `{ status, gid, message, reversalId }`

---

### `initiateCheckStatus(gid)`
Checks payment status.  
**Params**: `gid (string)`  
**Returns**: `{ status, gid, message }`

---

### `initiatePauseSI(params)`
Pauses a standing instruction.  
**Params**: `{ merchantTxnId, standingInstruction }`  
**Returns**: `{ status, message, mandateId }`

---

### `initiateActivateSI(params)`
Activates a standing instruction.  
**Params**: `{ merchantTxnId, standingInstruction }`  
**Returns**: `{ status, message, mandateId }`

---

##  Error Handling

All methods throw custom errors. Example:

```js
try {
  await client.initiateJwtPayment({ /* invalid params */ });
} catch (error) {
  console.error(error.message); // e.g., "Missing required field: merchantTxnId"
}
```

---

##  Webhook Handling (Coming Soon)

Webhook validation support is under development for secure callback processing.

---

##  Security

- **JWE/JWS**: Payload encryption and signing via `jose` library.
- **Input Validation**: Strict AJV validation and custom logic.
- **HTTPS**: All API calls use secure endpoints.
- **PCI-DSS Awareness**: Billing and card data validated to match standards.

---

##  Troubleshooting

- **Missing Config**: Ensure all `.env` variables are set.
- **Invalid Keys**: Double-check your PEM public/private key formats.
- **API Errors**: Set `PAYGLOCAL_LOG_LEVEL=debug` for more logs.
- **Dependency Issues**: Run `npm audit` to identify/fix issues.

---

##  Development

- **Build**:  
  ```bash
  npm run build
  ```
- **Testing**: Unit tests are planned for future releases. Contributions welcome!

- **Supported Node.js**: 18.x and 20.x

---

##  Contributing

1. Fork: [https://github.com/Parthsingh2111/pg-client-sdk](https://github.com/Parthsingh2111/pg-client-sdk)
2. Create a feature branch:  
   ```bash
   git checkout -b feature-name
   ```
3. Commit:  
   ```bash
   git commit -m "Add feature"
   ```
4. Push and open a pull request.

---

##  License

MIT License

---

##  Author/Team

Made by [PayGlocal team]


##  Contact

For support, contact **Parth Singh** or open an issue on GitHub. //currently development stage

