# PayGlocal Client SDK v2.0.0

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
PAYGLOCAL_MERCHANT_ID=your_merchant_id_here
PAYGLOCAL_PUBLIC_KEY_ID=your_public_key_id_here
PAYGLOCAL_PRIVATE_KEY_ID=your_private_key_id_here

# RSA Keys (PEM format) - File paths
PAYGLOCAL_PUBLIC_KEY=keys/payglocal_public_key
PAYGLOCAL_PRIVATE_KEY=keys/payglocal_private_key

# Environment Configuration
PAYGLOCAL_Env_VAR=UAT  # UAT or PROD
PAYGLOCAL_LOG_LEVEL=info  # error, warn, info, debug

# Optional: API Key (for API key-based authentication)
PAYGLOCAL_API_KEY=your_api_key_here
```

### 2. Key Files Setup

Create a `keys` directory in your project root and place your PEM key files:

```
project/
├── keys/
│   ├── payglocal_public_key
│   └── payglocal_private_key
├── .env
└── index.js
```

### 3. SDK Initialization

```javascript
require('dotenv').config();
const PayGlocalClient = require('payglocal-client');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Key normalization function
function normalizePemKey(key) {
  return key
    .trim()
    .replace(/\r\n|\r/g, '\n')
    .replace(/\n\s*\n/g, '\n')
    .replace(/[^\x00-\x7F]/g, '');
}

// Read and normalize PEM key content
const payglocalPublicKey = normalizePemKey(
  fs.readFileSync(path.resolve(__dirname, process.env.PAYGLOCAL_PUBLIC_KEY), 'utf8')
);
const merchantPrivateKey = normalizePemKey(
  fs.readFileSync(path.resolve(__dirname, process.env.PAYGLOCAL_PRIVATE_KEY), 'utf8')
);

// Validate keys
try {
  crypto.createPublicKey(payglocalPublicKey);
  console.log('Public key is valid');
} catch (e) {
  console.error('Invalid public key:', e.message);
}

try {
  crypto.createPrivateKey(merchantPrivateKey);
  console.log('Private key is valid');
} catch (e) {
  console.error('Invalid private key:', e.message);
}

// Initialize the client
const client = new PayGlocalClient({
  apiKey: process.env.PAYGLOCAL_API_KEY,
  merchantId: process.env.PAYGLOCAL_MERCHANT_ID,
  publicKeyId: process.env.PAYGLOCAL_PUBLIC_KEY_ID,
  privateKeyId: process.env.PAYGLOCAL_PRIVATE_KEY_ID,
  payglocalPublicKey,
  merchantPrivateKey,
  payglocalEnv: process.env.PAYGLOCAL_Env_VAR,
  logLevel: process.env.PAYGLOCAL_LOG_LEVEL || 'debug'
});
```

---

## 🎯 Quick Start Examples

### Payment Operations

#### 1. JWT-Based Payment (Recommended)

```javascript
async function createJwtPayment() {
  try {
    const response = await client.initiateJwtPayment({
      merchantTxnId: 'TXN_' + Date.now(),
      paymentData: {
        totalAmount: '1000.00',
        txnCurrency: 'INR',
        billingData: {
          emailId: 'customer@example.com',
          firstName: 'John',
          lastName: 'Doe',
          phoneNumber: '9876543210'
        }
      },
      merchantCallbackURL: 'https://your-domain.com/payment/callback'
    });

    console.log('JWT Payment Response:', response);
    return response;
  } catch (error) {
    console.error('JWT Payment Error:', error.message);
    throw error;
  }
}
```

#### 2. API Key-Based Payment

```javascript
async function createApiKeyPayment() {
  try {
    const response = await client.initiateApiKeyPayment({
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

    console.log('API Key Payment Response:', response);
    return response;
  } catch (error) {
    console.error('API Key Payment Error:', error.message);
    throw error;
  }
}
```

#### 3. Standing Instruction (SI) Payment

```javascript
async function createSiPayment() {
  try {
    const response = await client.initiateSiPayment({
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
          numberOfPayments: '12',
          frequency: 'MONTHLY',
          type: 'FIXED',
          amount: '1000.00',
          startDate: '2025-09-01'
        }
      },
      merchantCallbackURL: 'https://your-domain.com/payment/callback'
    });

    console.log('SI Payment Response:', response);
    return response;
  } catch (error) {
    console.error('SI Payment Error:', error.message);
    throw error;
  }
}
```

#### 4. Auth Payment

```javascript
async function createAuthPayment() {
  try {
    const response = await client.initiateAuthPayment({
      merchantTxnId: 'AUTH_TXN_' + Date.now(),
      paymentData: {
        totalAmount: '2000.00',
        txnCurrency: 'INR',
        billingData: {
          emailId: 'customer@example.com'
        }
      },
      captureTxn: false,
      merchantCallbackURL: 'https://your-domain.com/payment/callback'
    });

    console.log('Auth Payment Response:', response);
    return response;
  } catch (error) {
    console.error('Auth Payment Error:', error.message);
    throw error;
  }
}
```

### Transaction Management

#### 1. Check Payment Status

```javascript
async function checkPaymentStatus(gid) {
  try {
    const response = await client.initiateCheckStatus({ gid });
    
    console.log('Status Retrieved');
    console.log('Status:', response.status);
    console.log('GID:', response.gid);
    console.log('Message:', response.message);
    console.log('Raw Response:', response);
    
    return response;
  } catch (error) {
    console.error('Status Check Error:', error.message);
    throw error;
  }
}
```

#### 2. Capture Payment

```javascript
async function capturePayment(gid, amount = null) {
  try {
    const payload = amount 
      ? { 
          captureType: 'P', 
          gid, 
          merchantTxnId: 'CAPTURE_' + Date.now(),
          paymentData: { totalAmount: amount }
        }
      : { 
          captureType: 'F', 
          gid, 
          merchantTxnId: 'CAPTURE_' + Date.now()
        };

    const response = await client.initiateCapture(payload);

    console.log('Payment Captured');
    console.log('Status:', response.status);
    console.log('Raw Response:', response);
    
    return response;
  } catch (error) {
    console.error('Capture Error:', error.message);
    throw error;
  }
}
```

#### 3. Refund Payment

```javascript
async function refundPayment(gid, amount = null) {
  try {
    const payload = {
      refundType: amount ? 'P' : 'F',
      gid,
      merchantTxnId: 'REFUND_' + Date.now(),
      paymentData: amount ? { totalAmount: amount } : { totalAmount: 0 }
    };

    const response = await client.initiateRefund(payload);

    console.log('Payment Refunded');
    console.log('Status:', response.status);
    console.log('Raw Response:', response);
    
    return response;
  } catch (error) {
    console.error('Refund Error:', error.message);
    throw error;
  }
}
```

#### 4. Auth Reversal

```javascript
async function reverseAuth(gid) {
  try {
    const response = await client.initiateAuthReversal({
      gid: gid,
      merchantTxnId: 'REVERSAL_' + Date.now()
    });

    console.log('Auth Reversed');
    console.log('Status:', response.status);
    console.log('Raw Response:', response);
    
    return response;
  } catch (error) {
    console.error('Auth Reversal Error:', error.message);
    throw error;
  }
}
```

### Standing Instruction Management

#### 1. Pause SI

```javascript
async function pauseStandingInstruction(mandateId, startDate = null) {
  try {
    const standingInstruction = {
      action: 'PAUSE',
      mandateId
    };

    if (startDate) {
      standingInstruction.data = { startDate };
    }

    const response = await client.initiatePauseSI({
      merchantTxnId: 'PAUSE_SI_' + Date.now(),
      standingInstruction
    });

    console.log('SI Paused');
    console.log('Status:', response.status);
    console.log('Raw Response:', response);
    
    return response;
  } catch (error) {
    console.error('SI Pause Error:', error.message);
    throw error;
  }
}
```

#### 2. Activate SI

```javascript
async function activateStandingInstruction(mandateId) {
  try {
    const response = await client.initiateActivateSI({
      merchantTxnId: 'ACTIVATE_SI_' + Date.now(),
      standingInstruction: {
        action: 'ACTIVATE',
        mandateId: mandateId
      }
    });

    console.log('SI Activated');
    console.log('Status:', response.status);
    console.log('Raw Response:', response);
    
    return response;
  } catch (error) {
    console.error('SI Activation Error:', error.message);
    throw error;
  }
}
```

---

## 🏗️ Express.js Backend Integration

### Complete Backend Implementation

```javascript
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const PayGlocalClient = require('payglocal-client');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

dotenv.config();
const port = process.env.PORT || 3000;
const app = express();

app.use(cors());
app.use(express.json());

// Key normalization function
function normalizePemKey(key) {
  return key
    .trim()
    .replace(/\r\n|\r/g, '\n')
    .replace(/\n\s*\n/g, '\n')
    .replace(/[^\x00-\x7F]/g, '');
}

// Read and normalize PEM key content
const payglocalPublicKey = normalizePemKey(
  fs.readFileSync(path.resolve(__dirname, process.env.PAYGLOCAL_PUBLIC_KEY), 'utf8')
);
const merchantPrivateKey = normalizePemKey(
  fs.readFileSync(path.resolve(__dirname, process.env.PAYGLOCAL_PRIVATE_KEY), 'utf8')
);

// Validate keys
try {
  crypto.createPublicKey(payglocalPublicKey);
  console.log('Public key is valid');
} catch (e) {
  console.error('Invalid public key:', e.message);
}

try {
  crypto.createPrivateKey(merchantPrivateKey);
  console.log('Private key is valid');
} catch (e) {
  console.error('Invalid private key:', e.message);
}

// Initialize PayGlocal Client
const client = new PayGlocalClient({
  apiKey: process.env.PAYGLOCAL_API_KEY,
  merchantId: process.env.PAYGLOCAL_MERCHANT_ID,
  publicKeyId: process.env.PAYGLOCAL_PUBLIC_KEY_ID,
  privateKeyId: process.env.PAYGLOCAL_PRIVATE_KEY_ID,
  payglocalPublicKey,
  merchantPrivateKey,
  payglocalEnv: process.env.PAYGLOCAL_Env_VAR,
  logLevel: process.env.PAYGLOCAL_LOG_LEVEL || 'debug'
});

// JWT Payment Route
app.post('/api/pay/jwt', async (req, res) => {
  try {
    const { merchantTxnId, paymentData, merchantCallbackURL } = req.body;
    
    if (!merchantTxnId || !paymentData || !merchantCallbackURL) {
      return res.status(400).json({ 
        status: 'error',
        message: 'Missing required fields',
        code: 'VALIDATION_ERROR',
        details: { requiredFields: ['merchantTxnId', 'paymentData', 'merchantCallbackURL'] }
      });
    }

    const payload = { merchantTxnId, paymentData, merchantCallbackURL };
    console.log('Initiating JWT payment with payload:', payload);

    const payment = await client.initiateJwtPayment(payload);
    console.log('Raw SDK Response:', payment);

    // Check for SDK errors
    if (payment?.status === 'REQUEST_ERROR' || payment?.status === 'ERROR' || payment?.error) {
      throw new Error(`PayGlocal SDK Error: ${payment.message || payment.error || 'Unknown error'}`);
    }

    // Extract payment link and gid
    const paymentLink = payment?.data?.redirectUrl || 
                       payment?.data?.redirect_url || 
                       payment?.data?.payment_link ||
                       payment?.redirectUrl ||
                       payment?.redirect_url ||
                       payment?.payment_link ||
                       payment?.data?.paymentLink ||
                       payment?.paymentLink;
                       
    const gid = payment?.gid || 
                payment?.data?.gid || 
                payment?.transactionId ||
                payment?.data?.transactionId;

    const formattedResponse = {
      status: 'SUCCESS',
      message: 'Payment initiated successfully',
      payment_link: paymentLink,
      gid: gid,
      raw_response: payment
    };
    
    res.status(200).json(formattedResponse);
  } catch (error) {
    console.error('JWT Payment Error:', error);
    res.status(500).json({ 
      status: 'error',
      message: error.message || 'Payment failed',
      code: 'PAYMENT_ERROR'
    });
  }
});

// SI Payment Route
app.post('/api/pay/si', async (req, res) => {
  try {
    const { merchantTxnId, paymentData, merchantCallbackURL, standingInstruction } = req.body;
    
    if (!merchantTxnId || !paymentData || !merchantCallbackURL || !standingInstruction) {
      return res.status(400).json({ 
        status: 'error',
        message: 'Missing required fields',
        code: 'VALIDATION_ERROR',
        details: { requiredFields: ['merchantTxnId', 'paymentData', 'merchantCallbackURL', 'standingInstruction'] }
      });
    }

    const payload = { merchantTxnId, paymentData, standingInstruction, merchantCallbackURL };
    console.log('Initiating SI payment with payload:', payload);

    const payment = await client.initiateSiPayment(payload);
    console.log('Raw SDK Response:', payment);

    // Check for SDK errors
    if (payment?.status === 'REQUEST_ERROR' || payment?.status === 'ERROR' || payment?.error) {
      throw new Error(`PayGlocal SDK Error: ${payment.message || payment.error || 'Unknown error'}`);
    }

    // Extract payment link, gid, and mandateId
    const paymentLink = payment?.data?.redirectUrl || 
                       payment?.data?.redirect_url || 
                       payment?.data?.payment_link ||
                       payment?.redirectUrl ||
                       payment?.redirect_url ||
                       payment?.payment_link ||
                       payment?.data?.paymentLink ||
                       payment?.paymentLink;
                       
    const gid = payment?.gid || 
                payment?.data?.gid || 
                payment?.transactionId ||
                payment?.data?.transactionId;
                
    const mandateId = payment?.mandateId || 
                     payment?.data?.mandateId ||
                     payment?.standingInstruction?.mandateId;

    const formattedResponse = {
      status: 'SUCCESS',
      message: 'SI Payment initiated successfully',
      payment_link: paymentLink,
      gid: gid,
      mandateId: mandateId,
      raw_response: payment
    };
    
    res.status(200).json(formattedResponse);
  } catch (error) {
    console.error('SI Payment Error:', error);
    res.status(500).json({ 
      status: 'error',
      message: error.message || 'SI Payment failed',
      code: 'SI_PAYMENT_ERROR'
    });
  }
});

// Auth Payment Route
app.post('/api/pay/auth', async (req, res) => {
  try {
    const { merchantTxnId, paymentData, captureTxn, riskData, merchantCallbackURL } = req.body;
    
    if (!merchantTxnId || !paymentData || !merchantCallbackURL) {
      return res.status(400).json({ 
        status: 'error',
        message: 'Missing required fields',
        code: 'VALIDATION_ERROR',
        details: { requiredFields: ['merchantTxnId', 'paymentData', 'merchantCallbackURL'] }
      });
    }

    const payload = { merchantTxnId, paymentData, captureTxn, riskData, merchantCallbackURL };
    console.log('Initiating Auth payment with payload:', payload);

    const payment = await client.initiateAuthPayment(payload);
    console.log('Raw SDK Response:', payment);

    // Extract payment link and gid
    const paymentLink = payment?.data?.redirectUrl || 
                       payment?.data?.redirect_url || 
                       payment?.data?.payment_link ||
                       payment?.redirectUrl ||
                       payment?.redirect_url ||
                       payment?.payment_link ||
                       payment?.data?.paymentLink ||
                       payment?.paymentLink;
                       
    const gid = payment?.gid || 
                payment?.data?.gid || 
                payment?.transactionId ||
                payment?.data?.transactionId;

    const formattedResponse = {
      status: 'SUCCESS',
      message: 'Auth Payment initiated successfully',
      payment_link: paymentLink,
      gid: gid,
      raw_response: payment
    };
    
    res.status(200).json(formattedResponse);
  } catch (error) {
    console.error('Auth Payment Error:', error);
    res.status(500).json({ 
      status: 'error',
      message: error.message || 'Auth Payment failed',
      code: 'AUTH_PAYMENT_ERROR'
    });
  }
});

// Refund Route
app.post('/api/refund', async (req, res) => {
  try {
    const { gid, refundType, paymentData } = req.body;
    
    if (!gid) {
      return res.status(400).json({ 
        status: 'error',
        message: 'Missing gid',
        code: 'VALIDATION_ERROR',
        details: { requiredFields: ['gid'] }
      });
    }

    if (refundType === 'P' && (!paymentData || !paymentData.totalAmount)) {
      return res.status(400).json({ 
        status: 'error',
        message: 'Missing paymentData.totalAmount for partial refund',
        code: 'VALIDATION_ERROR',
        details: { requiredFields: ['paymentData.totalAmount'] }
      });
    }

    const payload = {
      refundType,
      gid,
      merchantTxnId: 'REFUND_' + Date.now(),
      paymentData: refundType === 'F' ? { totalAmount: 0 } : { totalAmount: paymentData.totalAmount }
    };

    const refundDetail = await client.initiateRefund(payload);
    console.log('Raw SDK Response:', refundDetail);
    
    // Check for SDK errors
    if (refundDetail?.status === 'REQUEST_ERROR' || refundDetail?.status === 'ERROR' || refundDetail?.error) {
      throw new Error(`PayGlocal SDK Error: ${refundDetail.message || refundDetail.error || 'Unknown error'}`);
    }
    
    // Extract fields from response
    const refundGid = refundDetail?.gid || 
                     refundDetail?.data?.gid || 
                     refundDetail?.transactionId ||
                     refundDetail?.data?.transactionId;
                     
    const refundId = refundDetail?.refundId || 
                    refundDetail?.data?.refundId ||
                    refundDetail?.id ||
                    refundDetail?.data?.id;
                    
    const status = refundDetail?.status || 
                  refundDetail?.data?.status ||
                  refundDetail?.result ||
                  refundDetail?.data?.result;

    const formattedResponse = {
      status: 'SUCCESS',
      message: `Refund ${status ? status.toLowerCase() : 'initiated'} successfully`,
      gid: refundGid,
      refundId: refundId,
      transactionStatus: status,
      raw_response: refundDetail
    };
    
    res.status(200).json(formattedResponse);
  } catch (error) {
    console.error('Refund Error:', error);
    res.status(500).json({ 
      status: 'error',
      message: error.message || 'Refund failed',
      code: 'REFUND_ERROR'
    });
  }
});

// Capture Route
app.post('/api/cap', async (req, res) => {
  try {
    const { captureType, paymentData } = req.body;
    const { gid } = req.query;

    if (!gid) {
      return res.status(400).json({ 
        status: 'error',
        message: 'Missing gid',
        code: 'VALIDATION_ERROR',
        details: { requiredFields: ['gid'] }
      });
    }

    if (captureType === 'P' && (!paymentData || !paymentData.totalAmount)) {
      return res.status(400).json({ 
        status: 'error',
        message: 'Missing paymentData.totalAmount for partial capture',
        code: 'VALIDATION_ERROR',
        details: { requiredFields: ['paymentData.totalAmount'] }
      });
    }

    const payload = captureType === 'F'
      ? { captureType: 'F', gid, merchantTxnId: 'CAPTURE_' + Date.now() }
      : {
          captureType: 'P',
          gid,
          merchantTxnId: 'CAPTURE_' + Date.now(),
          paymentData: { totalAmount: paymentData.totalAmount }
        };

    const payment = await client.initiateCapture(payload);
    console.log('Raw SDK Response:', payment);
    
    // Extract fields from response
    const captureGid = payment?.gid || 
                      payment?.data?.gid || 
                      payment?.transactionId ||
                      payment?.data?.transactionId;
                      
    const captureId = payment?.captureId || 
                     payment?.data?.captureId ||
                     payment?.id ||
                     payment?.data?.id;
                     
    const captureStatus = payment?.status || 
                         payment?.data?.status ||
                         payment?.result ||
                         payment?.data?.result;

    const formattedResponse = {
      status: 'SUCCESS',
      message: `Capture ${captureStatus ? captureStatus.toLowerCase() : 'initiated'} successfully`,
      gid: captureGid,
      captureId: captureId,
      transactionStatus: captureStatus,
      raw_response: payment
    };
    
    res.status(200).json(formattedResponse);
  } catch (error) {
    console.error('Capture Error:', error);
    res.status(500).json({ 
      status: 'error',
      message: error.message || 'Capture failed',
      code: 'CAPTURE_ERROR'
    });
  }
});

// Auth Reversal Route
app.post('/api/authreversal', async (req, res) => {
  try {
    const { gid } = req.query;
    
    if (!gid) {
      return res.status(400).json({ 
        status: 'error',
        message: 'Missing gid',
        code: 'VALIDATION_ERROR',
        details: { requiredFields: ['gid'] }
      });
    }

    const payload = { gid, merchantTxnId: 'REVERSAL_' + Date.now() };
    const payment = await client.initiateAuthReversal(payload);
    console.log('Raw SDK Response:', payment);
    
    // Extract fields from response
    const reversalGid = payment?.gid || 
                       payment?.data?.gid || 
                       payment?.transactionId ||
                       payment?.data?.transactionId;
                       
    const reversalId = payment?.reversalId || 
                      payment?.data?.reversalId ||
                      payment?.id ||
                      payment?.data?.id;
                      
    const reversalStatus = payment?.status || 
                          payment?.data?.status ||
                          payment?.result ||
                          payment?.data?.result;

    const formattedResponse = {
      status: 'SUCCESS',
      message: `Auth reversal ${reversalStatus ? reversalStatus.toLowerCase() : 'initiated'} successfully`,
      gid: reversalGid,
      reversalId: reversalId,
      transactionStatus: reversalStatus,
      raw_response: payment
    };
    
    res.status(200).json(formattedResponse);
  } catch (error) {
    console.error('Auth Reversal Error:', error);
    res.status(500).json({ 
      status: 'error',
      message: error.message || 'Auth reversal failed',
      code: 'AUTH_REVERSAL_ERROR'
    });
  }
});

// Status Check Route
app.get('/api/status', async (req, res) => {
  try {
    const { gid } = req.query;

    if (!gid) {
      return res.status(400).json({ 
        status: 'error',
        message: 'Missing gid',
        code: 'VALIDATION_ERROR',
        details: { requiredFields: ['gid'] }
      });
    }

    const payload = { gid };
    const payment = await client.initiateCheckStatus(payload);
    console.log('Raw SDK Response:', payment);
    
    // Extract fields from response
    const statusGid = payment?.gid || 
                     payment?.data?.gid || 
                     payment?.transactionId ||
                     payment?.data?.transactionId;
                     
    const statusResult = payment?.status || 
                        payment?.data?.status ||
                        payment?.result ||
                        payment?.data?.result ||
                        payment?.transactionStatus ||
                        payment?.data?.transactionStatus;

    const formattedResponse = {
      status: 'SUCCESS',
      message: `Status check completed - Transaction ${statusResult ? statusResult.toLowerCase() : 'status retrieved'}`,
      gid: statusGid,
      transactionStatus: statusResult,
      raw_response: payment
    };
    
    res.status(200).json(formattedResponse);
  } catch (error) {
    console.error('Status Check Error:', error);
    res.status(500).json({ 
      status: 'error',
      message: error.message || 'Status check failed',
      code: 'STATUS_CHECK_ERROR'
    });
  }
});

// SI Pause/Activate Route
app.post('/api/pauseActivate', async (req, res) => {
  try {
    const { standingInstruction } = req.body;
    
    if (!standingInstruction) {
      return res.status(400).json({ 
        status: 'error',
        message: 'Missing standingInstruction',
        code: 'VALIDATION_ERROR',
        details: { requiredFields: ['standingInstruction'] }
      });
    }

    if (!standingInstruction.action || !standingInstruction.mandateId) {
      return res.status(400).json({ 
        status: 'error',
        message: 'Missing action or mandateId in standingInstruction',
        code: 'VALIDATION_ERROR',
        details: { requiredFields: ['standingInstruction.action', 'standingInstruction.mandateId'] }
      });
    }

    const payload = {
      merchantTxnId: 'SI_' + Date.now(),
      standingInstruction,
    };

    console.log('Initiating SI with payload:', payload);

    const action = standingInstruction.action.toUpperCase();
    let response;
     
    if (action === 'PAUSE') {
      response = await client.initiatePauseSI(payload);
    } else if (action === 'ACTIVATE') {
      response = await client.initiateActivateSI(payload);
    } else {
      return res.status(400).json({ 
        status: 'error',
        message: `Unsupported action: ${standingInstruction.action}`,
        code: 'VALIDATION_ERROR',
        details: { supportedActions: ['PAUSE','ACTIVATE'] }
      });
    }

    console.log('Raw SDK Response:', response);

    // Extract fields from response
    const siMandateId = response?.mandateId || 
                       response?.data?.mandateId ||
                       response?.standingInstruction?.mandateId;
                       
    const siStatus = response?.status || 
                    response?.data?.status ||
                    response?.result ||
                    response?.data?.result;

    const formattedResponse = {
      status: 'SUCCESS',
      message: `SI ${action} ${siStatus ? siStatus.toLowerCase() : 'completed'} successfully`,
      mandateId: siMandateId,
      action: standingInstruction.action,
      transactionStatus: siStatus,
      raw_response: response
    };
    
    res.status(200).json(formattedResponse);
  } catch (error) {
    console.error('SI pause/activate Error:', error);
    res.status(500).json({ 
      status: 'error',
      message: error.message || 'SI pause/activate failed',
      code: 'SI_ERROR'
    });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
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
  console.error(error.message); // "Missing required configuration: merchantId"
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
  merchantId: 'your_merchant_id',
  publicKeyId: 'your_public_key_id',
  privateKeyId: 'your_private_key_id',
  payglocalPublicKey: '-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----',
  merchantPrivateKey: '-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----',
  
  // Optional Fields
  apiKey: 'your_api_key', // For API key authentication
  payglocalEnv: 'UAT', // UAT or PROD
  logLevel: 'info', // error, warn, info, debug
  tokenExpiration: 300000 // 5 minutes in milliseconds
});
```

### Environment Configuration

```javascript
// Production configuration
const prodClient = new PayGlocalClient({
  merchantId: process.env.PAYGLOCAL_MERCHANT_ID,
  publicKeyId: process.env.PAYGLOCAL_PUBLIC_KEY_ID,
  privateKeyId: process.env.PAYGLOCAL_PRIVATE_KEY_ID,
  payglocalPublicKey: process.env.PAYGLOCAL_PUBLIC_KEY,
  merchantPrivateKey: process.env.PAYGLOCAL_PRIVATE_KEY,
  payglocalEnv: 'PROD',
  logLevel: 'error'
});

// Development configuration
const devClient = new PayGlocalClient({
  merchantId: process.env.PAYGLOCAL_MERCHANT_ID,
  publicKeyId: process.env.PAYGLOCAL_PUBLIC_KEY_ID,
  privateKeyId: process.env.PAYGLOCAL_PRIVATE_KEY_ID,
  payglocalPublicKey: process.env.PAYGLOCAL_PUBLIC_KEY,
  merchantPrivateKey: process.env.PAYGLOCAL_PRIVATE_KEY,
  payglocalEnv: 'UAT',
  logLevel: 'debug'
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

## Best Practices

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
  merchantId: process.env.PAYGLOCAL_MERCHANT_ID,
  publicKeyId: process.env.PAYGLOCAL_PUBLIC_KEY_ID,
  privateKeyId: process.env.PAYGLOCAL_PRIVATE_KEY_ID,
  payglocalPublicKey: process.env.PAYGLOCAL_PUBLIC_KEY,
  merchantPrivateKey: process.env.PAYGLOCAL_PRIVATE_KEY,
};

if (process.env.NODE_ENV === 'production') {
  config.payglocalEnv = 'PROD';
  config.logLevel = 'error';
} else {
  config.payglocalEnv = 'UAT';
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
// Error: Missing required configuration: merchantId
// Solution: Ensure all required environment variables are set
console.log('Merchant ID:', process.env.PAYGLOCAL_MERCHANT_ID ? 'Set' : 'Missing');
```

#### 2. Key Format Issues

```javascript
// Error: Invalid key format
// Solution: Ensure keys are in proper PEM format and file paths are correct
const publicKey = fs.readFileSync(path.resolve(__dirname, 'keys/payglocal_public_key'), 'utf8');
```

#### 3. Network Issues

```javascript
// Error: Network timeout
// Solution: Check internet connection and API endpoint
const client = new PayGlocalClient({
  // ... config
  payglocalEnv: 'UAT' // Verify environment
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
// Don't hardcode keys
const client = new PayGlocalClient({
  merchantPrivateKey: 'hardcoded_key', // Bad
});

// Use environment variables and file system
const client = new PayGlocalClient({
  merchantPrivateKey: fs.readFileSync(path.resolve(__dirname, 'keys/payglocal_private_key'), 'utf8'), // Good
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
  payglocalEnv: 'PROD' // Always use HTTPS in production
});
```

---

## Additional Resources

- [PayGlocal API Documentation](https://docs.payglocal.in)
- [Node.js Best Practices](https://nodejs.org/en/docs/guides/)
- [Express.js Documentation](https://expressjs.com/)
- [Fastify Documentation](https://www.fastify.io/docs/)

---

## Support

For technical support, please contact:

- **Email**: singhparth2111@gmail.com
- **GitHub Issues**: [Create an issue](https://github.com/Parthsingh2111/pg-client-sdk/issues)
- **Documentation**: [SDK Documentation](https://github.com/Parthsingh2111/pg-client-sdk)

---

## License

MIT License - see [LICENSE](LICENSE) file for details.

---

## Author

**Parth Singh** - [GitHub](https://github.com/Parthsingh2111)

---

*This SDK is currently in active development. For the latest updates and features, please check the [GitHub repository](https://github.com/Parthsingh2111/pg-client-sdk).*

