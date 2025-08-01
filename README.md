# PayGlocal Client SDK

A **production-ready**, secure, and modular Node.js SDK for integrating with the PayGlocal payment gateway. This SDK provides a comprehensive solution for all payment operations including API key payments, JWT-based payments, standing instructions (SI), auth payments, captures, refunds, reversals, and status checks.

---

## 🚀 Features

- **🔐 Enterprise Security**: JWE (RSA-OAEP-256) and JWS (RS256) encryption for all sensitive data
- **💳 Complete Payment Suite**: API key, JWT, SI, auth, captures, refunds, reversals, status checks
- **🛡️ Robust Validation**: Comprehensive input validation with custom business logic
- **📊 Advanced Logging**: Structured logging with configurable levels and sensitive data masking
- **⚡ High Performance**: Native fetch implementation with timeout protection
- **🏗️ Modular Architecture**: Clean separation of concerns with layered design
- **🔧 Developer Friendly**: Intuitive APIs, comprehensive error handling, and detailed documentation
- **📦 Minimal Dependencies**: Only essential dependencies for optimal performance

---

## 📦 Installation

```bash
npm install payglocal-client
```

---

## ⚙️ Configuration

### 1. Environment Setup

Create a `.env` file in your project root:

```env
# Required Configuration
PAYGLOCAL_API_KEY=your_api_key_here
PAYGLOCAL_MERCHANT_ID=your_merchant_id_here
PAYGLOCAL_PUBLIC_KEY_ID=your_public_key_id_here
PAYGLOCAL_PRIVATE_KEY_ID=your_private_key_id_here

# RSA Keys (PEM format)
PAYGLOCAL_PUBLIC_KEY=-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...\n-----END PUBLIC KEY-----
PAYGLOCAL_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----

# Environment Configuration
PAYGLOCAL_BASE_URL=https://api.uat.payglocal.in  # UAT or PROD
PAYGLOCAL_LOG_LEVEL=info  # error, warn, info, debug
```

### 2. SDK Initialization

```javascript
require('dotenv').config();
const PayGlocalClient = require('payglocal-client');

// Initialize the client
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

## 🎯 Quick Start Examples

### Payment Operations

#### 1. JWT-Based Payment (Recommended)

```javascript
async function createJwtPayment() {
  try {
    const payment = await client.initiateJwtPayment({
      merchantTxnId: 'TXN_' + Date.now(),
      paymentData: {
        totalAmount: '1000.00',
        txnCurrency: 'INR',
        billingData: {
          emailId: 'customer@example.com',
          firstName: 'John',
          lastName: 'Doe',
          mobileNumber: '9876543210'
        }
      },
      merchantCallbackURL: 'https://your-domain.com/payment/callback'
    });

    console.log('✅ Payment Created Successfully');
    console.log('Payment Link:', payment.paymentLink);
    console.log('Global Transaction ID (GID):', payment.gid);
    
    return payment;
  } catch (error) {
    console.error('❌ Payment Failed:', error.message);
    throw error;
  }
}
```

#### 2. API Key-Based Payment

```javascript
async function createApiKeyPayment() {
  try {
    const payment = await client.initiateApiKeyPayment({
      merchantTxnId: 'TXN_' + Date.now(),
      paymentData: {
        totalAmount: '500.00',
        txnCurrency: 'INR',
        billingData: {
          emailId: 'customer@example.com'
        }
      },
      merchantCallbackURL: 'https://your-domain.com/payment/callback'
    });

    console.log('✅ API Key Payment Created');
    console.log('Payment Link:', payment.paymentLink);
    
    return payment;
  } catch (error) {
    console.error('❌ API Key Payment Failed:', error.message);
    throw error;
  }
}
```

#### 3. Standing Instruction (SI) Payment

```javascript
async function createSiPayment() {
  try {
    const payment = await client.initiateSiPayment({
      merchantTxnId: 'SI_TXN_' + Date.now(),
      paymentData: {
        totalAmount: '1000.00',
        txnCurrency: 'INR',
        billingData: {
          emailId: 'customer@example.com'
        }
      },
      standingInstruction: {
        data: {
          numberOfPayments: 12,
          frequency: 'MONTHLY',
          type: 'FIXED',
          amount: '1000.00',
          startDate: '2024-02-01'
        }
      },
      merchantCallbackURL: 'https://your-domain.com/payment/callback'
    });

    console.log('✅ SI Payment Created');
    console.log('Payment Link:', payment.paymentLink);
    console.log('GID:', payment.gid);
    
    return payment;
  } catch (error) {
    console.error('❌ SI Payment Failed:', error.message);
    throw error;
  }
}
```

#### 4. Auth Payment

```javascript
async function createAuthPayment() {
  try {
    const payment = await client.initiateAuthPayment({
      merchantTxnId: 'AUTH_TXN_' + Date.now(),
      paymentData: {
        totalAmount: '2000.00',
        txnCurrency: 'INR',
        billingData: {
          emailId: 'customer@example.com'
        }
      },
      captureTxn: {
        captureType: 'AUTO',
        captureAmount: '2000.00'
      },
      merchantCallbackURL: 'https://your-domain.com/payment/callback'
    });

    console.log('✅ Auth Payment Created');
    console.log('Payment Link:', payment.paymentLink);
    console.log('GID:', payment.gid);
    
    return payment;
  } catch (error) {
    console.error('❌ Auth Payment Failed:', error.message);
    throw error;
  }
}
```

### Transaction Management

#### 1. Check Payment Status

```javascript
async function checkPaymentStatus(gid) {
  try {
    const status = await client.initiateCheckStatus({ gid });
    
    console.log('✅ Status Retrieved');
    console.log('Status:', status.status);
    console.log('GID:', status.gid);
    console.log('Message:', status.message);
    
    return status;
  } catch (error) {
    console.error('❌ Status Check Failed:', error.message);
    throw error;
  }
}
```

#### 2. Capture Payment

```javascript
async function capturePayment(gid, amount = null) {
  try {
    const capture = await client.initiateCapture({
      gid: gid,
      merchantTxnId: 'CAPTURE_' + Date.now(),
      captureType: amount ? 'PARTIAL' : 'FULL',
      paymentData: amount ? { totalAmount: amount } : undefined
    });

    console.log('✅ Payment Captured');
    console.log('Capture ID:', capture.captureId);
    console.log('Status:', capture.status);
    
    return capture;
  } catch (error) {
    console.error('❌ Capture Failed:', error.message);
    throw error;
  }
}
```

#### 3. Refund Payment

```javascript
async function refundPayment(gid, amount = null) {
  try {
    const refund = await client.initiateRefund({
      gid: gid,
      merchantTxnId: 'REFUND_' + Date.now(),
      refundType: amount ? 'P' : 'F', // P = Partial, F = Full
      paymentData: amount ? { totalAmount: amount } : undefined
    });

    console.log('✅ Payment Refunded');
    console.log('Refund ID:', refund.refundId);
    console.log('Status:', refund.status);
    
    return refund;
  } catch (error) {
    console.error('❌ Refund Failed:', error.message);
    throw error;
  }
}
```

#### 4. Auth Reversal

```javascript
async function reverseAuth(gid) {
  try {
    const reversal = await client.initiateAuthReversal({
      gid: gid,
      merchantTxnId: 'REVERSAL_' + Date.now()
    });

    console.log('✅ Auth Reversed');
    console.log('Reversal ID:', reversal.reversalId);
    console.log('Status:', reversal.status);
    
    return reversal;
  } catch (error) {
    console.error('❌ Auth Reversal Failed:', error.message);
    throw error;
  }
}
```

### Standing Instruction Management

#### 1. Pause SI

```javascript
async function pauseStandingInstruction(mandateId) {
  try {
    const pause = await client.initiatePauseSI({
      merchantTxnId: 'PAUSE_SI_' + Date.now(),
      standingInstruction: {
        action: 'PAUSE',
        mandateId: mandateId
      }
    });

    console.log('✅ SI Paused');
    console.log('Mandate ID:', pause.mandateId);
    console.log('Status:', pause.status);
    
    return pause;
  } catch (error) {
    console.error('❌ SI Pause Failed:', error.message);
    throw error;
  }
}
```

#### 2. Activate SI

```javascript
async function activateStandingInstruction(mandateId) {
  try {
    const activate = await client.initiateActivateSI({
      merchantTxnId: 'ACTIVATE_SI_' + Date.now(),
      standingInstruction: {
        action: 'ACTIVATE',
        mandateId: mandateId
      }
    });

    console.log('✅ SI Activated');
    console.log('Mandate ID:', activate.mandateId);
    console.log('Status:', activate.status);
    
    return activate;
  } catch (error) {
    console.error('❌ SI Activation Failed:', error.message);
    throw error;
  }
}
```

---

## 🏗️ Merchant Backend Integration

### Express.js Integration Example

```javascript
const express = require('express');
const PayGlocalClient = require('payglocal-client');
require('dotenv').config();

const app = express();
app.use(express.json());

// Initialize PayGlocal Client
const payglocalClient = new PayGlocalClient({
  apiKey: process.env.PAYGLOCAL_API_KEY,
  merchantId: process.env.PAYGLOCAL_MERCHANT_ID,
  publicKeyId: process.env.PAYGLOCAL_PUBLIC_KEY_ID,
  privateKeyId: process.env.PAYGLOCAL_PRIVATE_KEY_ID,
  payglocalPublicKey: process.env.PAYGLOCAL_PUBLIC_KEY,
  merchantPrivateKey: process.env.PAYGLOCAL_PRIVATE_KEY,
  baseUrl: process.env.PAYGLOCAL_BASE_URL,
  logLevel: process.env.PAYGLOCAL_LOG_LEVEL
});

// Payment Routes
app.post('/api/payments/create', async (req, res) => {
  try {
    const { amount, currency, customerEmail, customerName } = req.body;
    
    const payment = await payglocalClient.initiateJwtPayment({
      merchantTxnId: 'TXN_' + Date.now(),
      paymentData: {
        totalAmount: amount.toString(),
        txnCurrency: currency || 'INR',
        billingData: {
          emailId: customerEmail,
          firstName: customerName
        }
      },
      merchantCallbackURL: 'https://your-domain.com/api/payments/callback'
    });

    res.json({
      success: true,
      paymentLink: payment.paymentLink,
      gid: payment.gid
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Payment Status Check
app.get('/api/payments/status/:gid', async (req, res) => {
  try {
    const { gid } = req.params;
    const status = await payglocalClient.initiateCheckStatus({ gid });
    
    res.json({
      success: true,
      status: status.status,
      gid: status.gid,
      message: status.message
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Payment Callback Handler
app.post('/api/payments/callback', async (req, res) => {
  try {
    const { gid, status, merchantTxnId } = req.body;
    
    console.log('Payment Callback Received:', {
      gid,
      status,
      merchantTxnId
    });

    // Process the payment status
    if (status === 'SUCCESS') {
      // Update your database
      console.log('Payment successful for GID:', gid);
    } else if (status === 'FAILED') {
      console.log('Payment failed for GID:', gid);
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Callback processing error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Refund Route
app.post('/api/payments/refund', async (req, res) => {
  try {
    const { gid, amount } = req.body;
    
    const refund = await payglocalClient.initiateRefund({
      gid: gid,
      merchantTxnId: 'REFUND_' + Date.now(),
      refundType: amount ? 'P' : 'F',
      paymentData: amount ? { totalAmount: amount } : undefined
    });

    res.json({
      success: true,
      refundId: refund.refundId,
      status: refund.status
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
```

### Fastify Integration Example

```javascript
const fastify = require('fastify');
const PayGlocalClient = require('payglocal-client');
require('dotenv').config();

const app = fastify();

// Initialize PayGlocal Client
const payglocalClient = new PayGlocalClient({
  apiKey: process.env.PAYGLOCAL_API_KEY,
  merchantId: process.env.PAYGLOCAL_MERCHANT_ID,
  publicKeyId: process.env.PAYGLOCAL_PUBLIC_KEY_ID,
  privateKeyId: process.env.PAYGLOCAL_PRIVATE_KEY_ID,
  payglocalPublicKey: process.env.PAYGLOCAL_PUBLIC_KEY,
  merchantPrivateKey: process.env.PAYGLOCAL_PRIVATE_KEY,
  baseUrl: process.env.PAYGLOCAL_BASE_URL,
  logLevel: process.env.PAYGLOCAL_LOG_LEVEL
});

// Payment creation endpoint
app.post('/api/payments', async (request, reply) => {
  try {
    const { amount, currency, customerEmail } = request.body;
    
    const payment = await payglocalClient.initiateJwtPayment({
      merchantTxnId: 'TXN_' + Date.now(),
      paymentData: {
        totalAmount: amount.toString(),
        txnCurrency: currency || 'INR',
        billingData: { emailId: customerEmail }
      },
      merchantCallbackURL: 'https://your-domain.com/api/payments/callback'
    });

    return { success: true, paymentLink: payment.paymentLink, gid: payment.gid };
  } catch (error) {
    reply.code(400);
    return { success: false, error: error.message };
  }
});

// Status check endpoint
app.get('/api/payments/:gid/status', async (request, reply) => {
  try {
    const { gid } = request.params;
    const status = await payglocalClient.initiateCheckStatus({ gid });
    
    return { success: true, status: status.status, gid: status.gid };
  } catch (error) {
    reply.code(400);
    return { success: false, error: error.message };
  }
});

app.listen({ port: 3000 }, (err) => {
  if (err) throw err;
  console.log('🚀 Fastify server running on port 3000');
});
```

---

## 📊 Logging & Monitoring

### Log Levels

```javascript
// Configure logging level
const client = new PayGlocalClient({
  // ... other config
  logLevel: 'debug' // error, warn, info, debug
});
```

### Log Output Examples

```javascript
// Info Level
[2024-01-15T10:30:45.123Z] [INFO] [PAYGLOCAL-SDK] PayGlocalClient initialized successfully

// Debug Level (API calls)
[2024-01-15T10:30:46.456Z] [DEBUG] [PAYGLOCAL-SDK] Initiating JWT payment: TXN_1705311046456
[2024-01-15T10:30:47.789Z] [DEBUG] [PAYGLOCAL-SDK] API call successful for JWT payment

// Error Level
[2024-01-15T10:30:48.012Z] [ERROR] [PAYGLOCAL-SDK] Payment failed: Missing required field: merchantTxnId
```

---

## 🛡️ Error Handling

### Error Types

```javascript
try {
  const payment = await client.initiateJwtPayment(invalidParams);
} catch (error) {
  if (error.name === 'ValidationError') {
    console.error('Validation failed:', error.message);
  } else if (error.name === 'PaymentError') {
    console.error('Payment failed:', error.message);
  } else if (error.name === 'ApiError') {
    console.error('API error:', error.message);
  } else {
    console.error('Unexpected error:', error.message);
  }
}
```

### Common Error Scenarios

```javascript
// Missing required fields
try {
  await client.initiateJwtPayment({});
} catch (error) {
  console.error(error.message); // "Missing required field: merchantTxnId"
}

// Invalid configuration
try {
  const client = new PayGlocalClient({});
} catch (error) {
  console.error(error.message); // "Missing required configuration: apiKey"
}

// API errors
try {
  await client.initiateCheckStatus({ gid: 'invalid_gid' });
} catch (error) {
  console.error(error.message); // "Transaction not found"
}
```

---

## 🔧 Configuration Options

### Full Configuration Object

```javascript
const client = new PayGlocalClient({
  // Required Fields
  apiKey: 'your_api_key',
  merchantId: 'your_merchant_id',
  publicKeyId: 'your_public_key_id',
  privateKeyId: 'your_private_key_id',
  payglocalPublicKey: '-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----',
  merchantPrivateKey: '-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----',
  
  // Optional Fields
  baseUrl: 'https://api.uat.payglocal.in', // or PROD URL
  logLevel: 'info', // error, warn, info, debug
  tokenExpiration: 300000 // 5 minutes in milliseconds
});
```

### Environment Configuration

```javascript
// Production configuration
will be provided at Integration time!

// Development configuration
const devClient = new PayGlocalClient({
  apiKey: process.env.PAYGLOCAL_API_KEY,
  merchantId: process.env.PAYGLOCAL_MERCHANT_ID,
  publicKeyId: process.env.PAYGLOCAL_PUBLIC_KEY_ID,
  privateKeyId: process.env.PAYGLOCAL_PRIVATE_KEY_ID,
  payglocalPublicKey: process.env.PAYGLOCAL_PUBLIC_KEY,
  merchantPrivateKey: process.env.PAYGLOCAL_PRIVATE_KEY,
  baseUrl: 'https://api.uat.payglocal.in', // UAT URL
  logLevel: 'debug' // Detailed logging for development
});
```

---

## 📋 API Reference

### Payment Methods

| Method | Description | Parameters | Returns |
|--------|-------------|------------|---------|
| `initiateJwtPayment(params)` | JWT-based payment with encryption | `{merchantTxnId, paymentData, merchantCallbackURL}` | `{paymentLink, gid}` |
| `initiateApiKeyPayment(params)` | API key-based payment | `{merchantTxnId, paymentData, merchantCallbackURL}` | `{paymentLink, statusLink}` |
| `initiateSiPayment(params)` | Standing instruction payment | `{merchantTxnId, paymentData, standingInstruction, merchantCallbackURL}` | `{paymentLink, gid}` |
| `initiateAuthPayment(params)` | Auth payment | `{merchantTxnId, paymentData, captureTxn, merchantCallbackURL}` | `{paymentLink, gid}` |

### Transaction Management

| Method | Description | Parameters | Returns |
|--------|-------------|------------|---------|
| `initiateCheckStatus(params)` | Check payment status | `{gid}` | `{status, gid, message}` |
| `initiateCapture(params)` | Capture payment | `{gid, merchantTxnId, captureType, paymentData?}` | `{status, gid, captureId}` |
| `initiateRefund(params)` | Refund payment | `{gid, merchantTxnId, refundType, paymentData?}` | `{status, gid, refundId}` |
| `initiateAuthReversal(params)` | Reverse auth | `{gid, merchantTxnId}` | `{status, gid, reversalId}` |

### Standing Instruction Management

| Method | Description | Parameters | Returns |
|--------|-------------|------------|---------|
| `initiatePauseSI(params)` | Pause SI | `{merchantTxnId, standingInstruction}` | `{status, mandateId}` |
| `initiateActivateSI(params)` | Activate SI | `{merchantTxnId, standingInstruction}` | `{status, mandateId}` |

---

## 🚀 Best Practices

### 1. Error Handling

```javascript
// Always wrap SDK calls in try-catch
async function processPayment(paymentData) {
  try {
    const payment = await client.initiateJwtPayment(paymentData);
    return { success: true, data: payment };
  } catch (error) {
    console.error('Payment processing failed:', error.message);
    return { success: false, error: error.message };
  }
}
```

### 2. Transaction ID Generation

```javascript
// Use unique transaction IDs
function generateTransactionId() {
  return `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

const payment = await client.initiateJwtPayment({
  merchantTxnId: generateTransactionId(),
  // ... other params
});
```

### 3. Configuration Management

```javascript
// Use environment-specific configurations
const config = {
  apiKey: process.env.PAYGLOCAL_API_KEY,
  merchantId: process.env.PAYGLOCAL_MERCHANT_ID,
  // ... other config
};

if (process.env.NODE_ENV === 'production') {
  config.baseUrl = 'https://api.payglocal.in';
  config.logLevel = 'error';
} else {
  config.baseUrl = 'https://api.uat.payglocal.in';
  config.logLevel = 'debug';
}

const client = new PayGlocalClient(config);
```

### 4. Callback Handling

```javascript
// Implement idempotent callback handling
const processedTransactions = new Set();

app.post('/api/payments/callback', async (req, res) => {
  const { gid, status, merchantTxnId } = req.body;
  
  // Prevent duplicate processing
  if (processedTransactions.has(gid)) {
    return res.json({ success: true, message: 'Already processed' });
  }
  
  try {
    // Process the payment
    await processPaymentStatus(gid, status);
    processedTransactions.add(gid);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Callback processing failed:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});
```

---

## 🔍 Troubleshooting

### Common Issues

#### 1. Configuration Errors

```javascript
// Error: Missing required configuration: apiKey
// Solution: Ensure all required environment variables are set
console.log('API Key:', process.env.PAYGLOCAL_API_KEY ? 'Set' : 'Missing');
```

#### 2. Key Format Issues

```javascript
// Error: Invalid key format
// Solution: Ensure keys are in proper PEM format
const publicKey = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...
-----END PUBLIC KEY-----`;
```

#### 3. Network Issues

```javascript
// Error: Network timeout
// Solution: Check internet connection and API endpoint
const client = new PayGlocalClient({
  // ... config
  baseUrl: 'https://api.uat.payglocal.in' // Verify URL
});
```

#### 4. Validation Errors

```javascript
// Error: Missing required field: merchantTxnId
// Solution: Ensure all required fields are provided
const paymentData = {
  merchantTxnId: 'TXN_' + Date.now(), // Required
  paymentData: {
    totalAmount: '100.00', // Required
    txnCurrency: 'INR' // Required
  },
  merchantCallbackURL: 'https://your-domain.com/callback' // Required
};
```

### Debug Mode

```javascript
// Enable debug logging for troubleshooting
const client = new PayGlocalClient({
  // ... config
  logLevel: 'debug'
});

// Check logs for detailed API request/response information
```

---

## 📈 Performance Optimization

### 1. Connection Pooling

```javascript
// Reuse client instance
const client = new PayGlocalClient(config);

// Use the same client for all operations
app.post('/api/payments', async (req, res) => {
  const payment = await client.initiateJwtPayment(req.body);
  res.json(payment);
});
```

### 2. Async/Await Best Practices

```javascript
// Use Promise.all for parallel operations
async function processMultiplePayments(payments) {
  const results = await Promise.all(
    payments.map(payment => client.initiateJwtPayment(payment))
  );
  return results;
}
```

### 3. Error Recovery

```javascript
// Implement retry logic for transient failures
async function initiatePaymentWithRetry(paymentData, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await client.initiateJwtPayment(paymentData);
    } catch (error) {
      if (attempt === maxRetries) throw error;
      if (error.message.includes('timeout')) {
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        continue;
      }
      throw error;
    }
  }
}
```

---

## 🔒 Security Considerations

### 1. Key Management

```javascript
// Store keys securely
// ❌ Don't hardcode keys
const client = new PayGlocalClient({
  apiKey: 'hardcoded_key', // Bad
  merchantPrivateKey: 'hardcoded_key' // Bad
});

// ✅ Use environment variables
const client = new PayGlocalClient({
  apiKey: process.env.PAYGLOCAL_API_KEY, // Good
  merchantPrivateKey: process.env.PAYGLOCAL_PRIVATE_KEY // Good
});
```

### 2. Input Validation

```javascript
// Validate input before sending to SDK
function validatePaymentData(data) {
  if (!data.amount || data.amount <= 0) {
    throw new Error('Invalid amount');
  }
  if (!data.customerEmail || !data.customerEmail.includes('@')) {
    throw new Error('Invalid email');
  }
  return true;
}

// Use validation
app.post('/api/payments', async (req, res) => {
  try {
    validatePaymentData(req.body);
    const payment = await client.initiateJwtPayment(req.body);
    res.json(payment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
```

### 3. HTTPS Only

```javascript
// Ensure all communications use HTTPS
const client = new PayGlocalClient({
  // ... config
  baseUrl: 'https://api.payglocal.in' // Always use HTTPS
});
```

---

## 📚 Additional Resources

- [PayGlocal API Documentation](https://docs.payglocal.in)
- [Node.js Best Practices](https://nodejs.org/en/docs/guides/)
- [Express.js Documentation](https://expressjs.com/)
- [Fastify Documentation](https://www.fastify.io/docs/)

---

## 🤝 Support

For technical support, please contact:

- **Email**: singhparth2111@gmail.com
- **GitHub Issues**: [Create an issue](https://github.com/Parthsingh2111/pg-client-sdk/issues)
- **Documentation**: [SDK Documentation](https://github.com/Parthsingh2111/pg-client-sdk)

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Parth Singh** - [GitHub](https://github.com/Parthsingh2111)

---

*This SDK is currently in active development. For the latest updates and features, please check the [GitHub repository](https://github.com/Parthsingh2111/pg-client-sdk).*

