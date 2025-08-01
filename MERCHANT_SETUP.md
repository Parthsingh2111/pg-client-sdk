# 🏪 Merchant Backend Integration Guide

Quick setup guide for integrating PayGlocal SDK into your merchant backend.

---

## 🚀 Quick Setup (5 Minutes)

### 1. Install Dependencies

```bash
npm install payglocal-client dotenv
```

### 2. Environment Configuration

Create `.env` file:

```env
# PayGlocal Configuration
PAYGLOCAL_API_KEY=your_api_key_here
PAYGLOCAL_MERCHANT_ID=your_merchant_id_here
PAYGLOCAL_PUBLIC_KEY_ID=your_public_key_id_here
PAYGLOCAL_PRIVATE_KEY_ID=your_private_key_id_here
PAYGLOCAL_PUBLIC_KEY=-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...\n-----END PUBLIC KEY-----
PAYGLOCAL_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----

# Environment
PAYGLOCAL_BASE_URL=https://api.uat.payglocal.in
PAYGLOCAL_LOG_LEVEL=info
```

### 3. SDK Integration

```javascript
// config/payglocal.js
require('dotenv').config();
const PayGlocalClient = require('payglocal-client');

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

module.exports = payglocalClient;
```

### 4. Express.js Routes

```javascript
// routes/payments.js
const express = require('express');
const router = express.Router();
const payglocalClient = require('../config/payglocal');

// Create Payment
router.post('/create', async (req, res) => {
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

// Check Status
router.get('/status/:gid', async (req, res) => {
  try {
    const { gid } = req.params;
    const status = await payglocalClient.initiateCheckStatus({ gid });
    
    res.json({
      success: true,
      status: status.status,
      gid: status.gid
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Refund Payment
router.post('/refund', async (req, res) => {
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

module.exports = router;
```

### 5. Callback Handler

```javascript
// routes/callbacks.js
const express = require('express');
const router = express.Router();

router.post('/payment', async (req, res) => {
  try {
    const { gid, status, merchantTxnId } = req.body;
    
    console.log('Payment Callback:', { gid, status, merchantTxnId });

    // Update your database
    if (status === 'SUCCESS') {
      // Payment successful - update order status
      await updateOrderStatus(merchantTxnId, 'PAID');
    } else if (status === 'FAILED') {
      // Payment failed - update order status
      await updateOrderStatus(merchantTxnId, 'FAILED');
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Callback error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
```

### 6. Main App Setup

```javascript
// app.js
const express = require('express');
const paymentRoutes = require('./routes/payments');
const callbackRoutes = require('./routes/callbacks');

const app = express();

app.use(express.json());

// Routes
app.use('/api/payments', paymentRoutes);
app.use('/api/callbacks', callbackRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
```

---

## 🔧 Fastify Setup

```javascript
// server.js
const fastify = require('fastify');
const payglocalClient = require('./config/payglocal');

const app = fastify();

// Create payment
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
      merchantCallbackURL: 'https://your-domain.com/api/callbacks/payment'
    });

    return { success: true, paymentLink: payment.paymentLink, gid: payment.gid };
  } catch (error) {
    reply.code(400);
    return { success: false, error: error.message };
  }
});

// Check status
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

## 🗄️ Database Integration

### MongoDB Example

```javascript
// models/Payment.js
const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  merchantTxnId: { type: String, required: true, unique: true },
  gid: { type: String, required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  status: { type: String, enum: ['PENDING', 'SUCCESS', 'FAILED'], default: 'PENDING' },
  customerEmail: { type: String, required: true },
  paymentLink: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Payment', paymentSchema);
```

### Payment Service

```javascript
// services/paymentService.js
const Payment = require('../models/Payment');
const payglocalClient = require('../config/payglocal');

class PaymentService {
  async createPayment(paymentData) {
    try {
      // Create payment in PayGlocal
      const payglocalPayment = await payglocalClient.initiateJwtPayment({
        merchantTxnId: paymentData.merchantTxnId,
        paymentData: {
          totalAmount: paymentData.amount.toString(),
          txnCurrency: paymentData.currency || 'INR',
          billingData: {
            emailId: paymentData.customerEmail,
            firstName: paymentData.customerName
          }
        },
        merchantCallbackURL: 'https://your-domain.com/api/callbacks/payment'
      });

      // Save to database
      const payment = new Payment({
        merchantTxnId: paymentData.merchantTxnId,
        gid: payglocalPayment.gid,
        amount: paymentData.amount,
        currency: paymentData.currency || 'INR',
        customerEmail: paymentData.customerEmail,
        paymentLink: payglocalPayment.paymentLink
      });

      await payment.save();

      return {
        success: true,
        payment: payment,
        paymentLink: payglocalPayment.paymentLink
      };
    } catch (error) {
      throw new Error(`Payment creation failed: ${error.message}`);
    }
  }

  async updatePaymentStatus(merchantTxnId, status) {
    try {
      const payment = await Payment.findOneAndUpdate(
        { merchantTxnId: merchantTxnId },
        { 
          status: status,
          updatedAt: new Date()
        },
        { new: true }
      );

      if (!payment) {
        throw new Error('Payment not found');
      }

      return payment;
    } catch (error) {
      throw new Error(`Status update failed: ${error.message}`);
    }
  }

  async getPaymentByGid(gid) {
    try {
      const payment = await Payment.findOne({ gid: gid });
      return payment;
    } catch (error) {
      throw new Error(`Payment retrieval failed: ${error.message}`);
    }
  }
}

module.exports = new PaymentService();
```

---

## 🔄 Production Deployment

### 1. Environment Variables

```bash
# Production .env
PAYGLOCAL_API_KEY=your_production_api_key
PAYGLOCAL_MERCHANT_ID=your_production_merchant_id
PAYGLOCAL_PUBLIC_KEY_ID=your_production_public_key_id
PAYGLOCAL_PRIVATE_KEY_ID=your_production_private_key_id
PAYGLOCAL_PUBLIC_KEY=your_production_public_key
PAYGLOCAL_PRIVATE_KEY=your_production_private_key
PAYGLOCAL_BASE_URL=https://api.payglocal.in
PAYGLOCAL_LOG_LEVEL=error
```

### 2. PM2 Configuration

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'merchant-backend',
    script: 'app.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
```

### 3. Nginx Configuration

```nginx
# /etc/nginx/sites-available/merchant-backend
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name your-domain.com;

    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 🧪 Testing

### Unit Tests

```javascript
// tests/payment.test.js
const request = require('supertest');
const app = require('../app');

describe('Payment API', () => {
  test('should create payment', async () => {
    const response = await request(app)
      .post('/api/payments/create')
      .send({
        amount: 1000,
        currency: 'INR',
        customerEmail: 'test@example.com',
        customerName: 'Test User'
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.paymentLink).toBeDefined();
    expect(response.body.gid).toBeDefined();
  });

  test('should check payment status', async () => {
    const gid = 'test_gid';
    const response = await request(app)
      .get(`/api/payments/status/${gid}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });
});
```

### Integration Tests

```javascript
// tests/integration.test.js
const payglocalClient = require('../config/payglocal');

describe('PayGlocal SDK Integration', () => {
  test('should initialize client', () => {
    expect(payglocalClient).toBeDefined();
  });

  test('should create JWT payment', async () => {
    const payment = await payglocalClient.initiateJwtPayment({
      merchantTxnId: 'TEST_TXN_' + Date.now(),
      paymentData: {
        totalAmount: '100.00',
        txnCurrency: 'INR',
        billingData: {
          emailId: 'test@example.com'
        }
      },
      merchantCallbackURL: 'https://test.com/callback'
    });

    expect(payment.paymentLink).toBeDefined();
    expect(payment.gid).toBeDefined();
  });
});
```

---

## 📊 Monitoring & Logging

### Winston Logger Setup

```javascript
// config/logger.js
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

module.exports = logger;
```

### Payment Monitoring

```javascript
// middleware/paymentMonitor.js
const logger = require('../config/logger');

const paymentMonitor = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    
    logger.info('Payment API Request', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: duration,
      userAgent: req.get('User-Agent'),
      ip: req.ip
    });
  });
  
  next();
};

module.exports = paymentMonitor;
```

---

## 🔒 Security Checklist

- [ ] Environment variables are properly set
- [ ] HTTPS is enabled in production
- [ ] API keys are not exposed in logs
- [ ] Input validation is implemented
- [ ] Rate limiting is configured
- [ ] CORS is properly configured
- [ ] Database connections are secured
- [ ] Error messages don't expose sensitive data

---

## 🚀 Performance Optimization

### 1. Connection Pooling

```javascript
// Reuse client instance
const payglocalClient = require('./config/payglocal');

// Use the same client for all operations
app.post('/api/payments', async (req, res) => {
  const payment = await payglocalClient.initiateJwtPayment(req.body);
  res.json(payment);
});
```

### 2. Caching

```javascript
// Cache payment status
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 300 }); // 5 minutes

app.get('/api/payments/status/:gid', async (req, res) => {
  const { gid } = req.params;
  
  // Check cache first
  const cachedStatus = cache.get(gid);
  if (cachedStatus) {
    return res.json(cachedStatus);
  }
  
  // Fetch from API
  const status = await payglocalClient.initiateCheckStatus({ gid });
  
  // Cache the result
  cache.set(gid, status);
  
  res.json(status);
});
```

---

## 📞 Support

For integration support:

- **Email**: singhparth2111@gmail.com
- **GitHub**: [Create an issue](https://github.com/Parthsingh2111/pg-client-sdk/issues)
- **Documentation**: [Full SDK Documentation](README.md)

---

*This guide provides a quick start for merchant backend integration. For detailed API documentation, refer to the main [README.md](README.md) file.* 