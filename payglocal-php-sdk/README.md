# PayGlocal PHP Client SDK

A **production-ready**, secure, and modular PHP SDK for integrating with the PayGlocal payment gateway. This SDK provides a comprehensive solution for all payment operations including API key payments, JWT-based payments, standing instructions (SI), auth payments, captures, refunds, reversals, and status checks.

---

## 🚀 Features

- **🔐 Enterprise Security**: JWE (RSA-OAEP-256) and JWS (RS256) encryption for all sensitive data
- **💳 Complete Payment Suite**: API key, JWT, SI, auth, captures, refunds, reversals, status checks
- **🛡️ Robust Validation**: Comprehensive input validation with custom business logic
- **📊 Advanced Logging**: Structured logging with configurable levels and sensitive data masking
- **⚡ High Performance**: cURL-based HTTP client with timeout protection
- **🏗️ Modular Architecture**: Clean separation of concerns with layered design
- **🔧 Developer Friendly**: Intuitive APIs, comprehensive error handling, and detailed documentation
- **📦 Minimal Dependencies**: Only essential dependencies for optimal performance

---

## 📦 Installation

### Via Composer

```bash
composer require payglocal/client-php
```

### Manual Installation

1. Download the SDK
2. Include the autoloader:

```php
require_once 'vendor/autoload.php';
```

---

## ⚙️ Configuration

### 1. Environment Setup

Create a `.env` file in your project root or set environment variables:

```env
# Required Configuration
PAYGLOCAL_API_KEY=your_api_key_here
PAYGLOCAL_MERCHANT_ID=your_merchant_id_here
PAYGLOCAL_PUBLIC_KEY_ID=your_public_key_id_here
PAYGLOCAL_PRIVATE_KEY_ID=your_private_key_id_here

# RSA Keys (PEM format)
PAYGLOCAL_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...
-----END PUBLIC KEY-----"

PAYGLOCAL_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...
-----END PRIVATE KEY-----"

# Environment Configuration
PAYGLOCAL_BASE_URL_VAR=UAT  # UAT or PROD
PAYGLOCAL_LOG_LEVEL=info    # error, warn, info, debug
```

### 2. SDK Initialization

```php
<?php
require_once 'vendor/autoload.php';

use PayGlocal\PayGlocalClient;

// Initialize the client
$client = new PayGlocalClient([
    'apiKey' => $_ENV['PAYGLOCAL_API_KEY'],
    'merchantId' => $_ENV['PAYGLOCAL_MERCHANT_ID'],
    'publicKeyId' => $_ENV['PAYGLOCAL_PUBLIC_KEY_ID'],
    'privateKeyId' => $_ENV['PAYGLOCAL_PRIVATE_KEY_ID'],
    'payglocalPublicKey' => $_ENV['PAYGLOCAL_PUBLIC_KEY'],
    'merchantPrivateKey' => $_ENV['PAYGLOCAL_PRIVATE_KEY'],
    'baseUrlVar' => $_ENV['PAYGLOCAL_BASE_URL_VAR'],
    'logLevel' => $_ENV['PAYGLOCAL_LOG_LEVEL']
]);
```

---

## 🎯 Quick Start Examples

### Payment Operations

#### 1. JWT-Based Payment (Recommended)

```php
<?php
try {
    $payment = $client->initiateJwtPayment([
        'merchantTxnId' => 'TXN_' . time(),
        'paymentData' => [
            'totalAmount' => '1000.00',
            'txnCurrency' => 'INR',
            'billingData' => [
                'emailId' => 'customer@example.com',
                'firstName' => 'John',
                'lastName' => 'Doe',
                'mobileNumber' => '9876543210'
            ]
        ],
        'merchantCallbackURL' => 'https://your-domain.com/payment/callback'
    ]);

    echo "✅ Payment Created Successfully\n";
    echo "Payment Link: " . $payment['paymentLink'] . "\n";
    echo "Global Transaction ID (GID): " . $payment['gid'] . "\n";
    
} catch (Exception $error) {
    echo "❌ Payment Failed: " . $error->getMessage() . "\n";
}
```

#### 2. API Key Payment

```php
<?php
try {
    $payment = $client->initiateApiKeyPayment([
        'merchantTxnId' => 'TXN_' . time(),
        'paymentData' => [
            'totalAmount' => '500.00',
            'txnCurrency' => 'INR',
            'billingData' => [
                'emailId' => 'customer@example.com',
                'firstName' => 'Jane',
                'lastName' => 'Smith',
                'mobileNumber' => '9876543210'
            ]
        ]
    ]);

    echo "✅ API Key Payment Created Successfully\n";
    print_r($payment);
    
} catch (Exception $error) {
    echo "❌ Payment Failed: " . $error->getMessage() . "\n";
}
```

#### 3. Standing Instruction (SI) Payment

```php
<?php
try {
    $siPayment = $client->initiateSiPayment([
        'merchantTxnId' => 'SI_TXN_' . time(),
        'paymentData' => [
            'totalAmount' => '1500.00',
            'txnCurrency' => 'INR',
            'billingData' => [
                'emailId' => 'recurring@example.com',
                'firstName' => 'Recurring',
                'lastName' => 'Customer',
                'mobileNumber' => '9876543210'
            ]
        ],
        'siData' => [
            'frequency' => 'MONTHLY',
            'startDate' => '2024-02-01',
            'endDate' => '2024-12-31',
            'maxAmount' => '2000.00'
        ]
    ]);

    echo "✅ SI Payment Created Successfully\n";
    echo "SI ID: " . $siPayment['siId'] . "\n";
    
} catch (Exception $error) {
    echo "❌ SI Payment Failed: " . $error->getMessage() . "\n";
}
```

#### 4. Auth Payment (Pre-authorization)

```php
<?php
try {
    $authPayment = $client->initiateAuthPayment([
        'merchantTxnId' => 'AUTH_TXN_' . time(),
        'paymentData' => [
            'totalAmount' => '2000.00',
            'txnCurrency' => 'INR',
            'billingData' => [
                'emailId' => 'auth@example.com',
                'firstName' => 'Auth',
                'lastName' => 'Customer',
                'mobileNumber' => '9876543210'
            ]
        ]
    ]);

    echo "✅ Auth Payment Created Successfully\n";
    echo "Auth GID: " . $authPayment['gid'] . "\n";
    
} catch (Exception $error) {
    echo "❌ Auth Payment Failed: " . $error->getMessage() . "\n";
}
```

### Transaction Management

#### 1. Check Payment Status

```php
<?php
try {
    $status = $client->initiateCheckStatus([
        'gid' => 'your_transaction_gid_here'
    ]);

    echo "✅ Status Retrieved Successfully\n";
    echo "Transaction Status: " . $status['txnStatus'] . "\n";
    echo "Amount: " . $status['amount'] . "\n";
    
} catch (Exception $error) {
    echo "❌ Status Check Failed: " . $error->getMessage() . "\n";
}
```

#### 2. Initiate Refund

```php
<?php
try {
    $refund = $client->initiateRefund([
        'gid' => 'your_transaction_gid_here',
        'refundAmount' => '500.00',
        'refundReason' => 'Customer requested refund'
    ]);

    echo "✅ Refund Initiated Successfully\n";
    echo "Refund ID: " . $refund['refundId'] . "\n";
    
} catch (Exception $error) {
    echo "❌ Refund Failed: " . $error->getMessage() . "\n";
}
```

#### 3. Capture Pre-authorized Payment

```php
<?php
try {
    $capture = $client->initiateCapture([
        'gid' => 'your_auth_transaction_gid_here',
        'captureAmount' => '1500.00'
    ]);

    echo "✅ Capture Successful\n";
    echo "Captured Amount: " . $capture['capturedAmount'] . "\n";
    
} catch (Exception $error) {
    echo "❌ Capture Failed: " . $error->getMessage() . "\n";
}
```

#### 4. Reverse Auth Payment

```php
<?php
try {
    $reversal = $client->initiateAuthReversal([
        'gid' => 'your_auth_transaction_gid_here'
    ]);

    echo "✅ Auth Reversal Successful\n";
    print_r($reversal);
    
} catch (Exception $error) {
    echo "❌ Auth Reversal Failed: " . $error->getMessage() . "\n";
}
```

### Standing Instruction Management

#### 1. Pause Standing Instruction

```php
<?php
try {
    $pauseResult = $client->initiatePauseSI([
        'siId' => 'your_si_id_here',
        'reason' => 'Customer requested pause'
    ]);

    echo "✅ SI Paused Successfully\n";
    print_r($pauseResult);
    
} catch (Exception $error) {
    echo "❌ SI Pause Failed: " . $error->getMessage() . "\n";
}
```

#### 2. Activate Standing Instruction

```php
<?php
try {
    $activateResult = $client->initiateActivateSI([
        'siId' => 'your_si_id_here'
    ]);

    echo "✅ SI Activated Successfully\n";
    print_r($activateResult);
    
} catch (Exception $error) {
    echo "❌ SI Activation Failed: " . $error->getMessage() . "\n";
}
```

---

## 🔧 Advanced Configuration

### Custom Logger Configuration

```php
<?php
use PayGlocal\Utils\Logger;

// Set custom log level
Logger::setLevel('debug');

// The SDK will automatically use the configured log level
$client = new PayGlocalClient($config);
```

### Custom Timeout Configuration

```php
<?php
$client = new PayGlocalClient([
    // ... other config
    'tokenExpiration' => 600000, // 10 minutes in milliseconds
]);
```

### Environment-Specific Configuration

```php
<?php
// UAT Environment
$uatClient = new PayGlocalClient([
    // ... other config
    'baseUrlVar' => 'UAT'
]);

// Production Environment
$prodClient = new PayGlocalClient([
    // ... other config
    'baseUrlVar' => 'PROD'
]);
```

---

## 🛡️ Security Features

### 1. **JWE Encryption**
- All sensitive payloads are encrypted using RSA-OAEP-256
- AES-128-CBC-HMAC-SHA-256 for content encryption

### 2. **JWS Signing**
- All requests are signed using RS256 algorithm
- SHA-256 digest verification for request integrity

### 3. **Sensitive Data Masking**
- Automatic masking of sensitive data in logs
- API keys, tokens, and PII are redacted

### 4. **Input Validation**
- Comprehensive payload validation
- Business rule enforcement
- Type checking and format validation

---

## 🚨 Error Handling

### Exception Types

```php
<?php
use PayGlocal\PayGlocalClient;

try {
    $client = new PayGlocalClient($config);
    $payment = $client->initiateJwtPayment($paymentData);
} catch (InvalidArgumentException $e) {
    // Configuration or validation errors
    echo "Configuration Error: " . $e->getMessage();
} catch (RuntimeException $e) {
    // API or network errors
    echo "Runtime Error: " . $e->getMessage();
} catch (Exception $e) {
    // General errors
    echo "Error: " . $e->getMessage();
}
```

### Common Error Scenarios

1. **Configuration Errors**: Missing required fields, invalid PEM keys
2. **Validation Errors**: Invalid payload data, missing required fields
3. **Network Errors**: Connection timeouts, DNS resolution failures
4. **API Errors**: Authentication failures, business rule violations

---

## 📋 Requirements

- **PHP**: >= 7.4
- **Extensions**: 
  - `ext-json`
  - `ext-openssl`
  - `ext-curl`
- **Dependencies**:
  - `firebase/php-jwt`: ^6.0
  - `web-token/jwt-library`: ^3.0

---

## 🧪 Testing

### Basic Test

```php
<?php
require_once 'vendor/autoload.php';

use PayGlocal\PayGlocalClient;

// Test configuration
$client = new PayGlocalClient([
    'apiKey' => 'test_api_key',
    'merchantId' => 'test_merchant',
    'publicKeyId' => 'test_pub_key_id',
    'privateKeyId' => 'test_priv_key_id',
    'payglocalPublicKey' => $testPublicKey,
    'merchantPrivateKey' => $testPrivateKey,
    'baseUrlVar' => 'UAT',
    'logLevel' => 'debug'
]);

echo "✅ PayGlocal PHP SDK initialized successfully!\n";
```

---

## 📝 Changelog

### Version 2.0.0
- Initial PHP SDK release
- Complete feature parity with JavaScript SDK
- JWE/JWS encryption support
- Comprehensive validation
- Advanced logging
- Full payment operation support

---

## 🤝 Support

- **Documentation**: [PayGlocal Developer Docs](https://docs.payglocal.in)
- **Support Email**: support@payglocal.com
- **GitHub Issues**: [Report Issues](https://github.com/PayGlocal/payglocal-php-sdk/issues)

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Built with ❤️ by the PayGlocal team
- Inspired by modern PHP development practices
- Designed for enterprise-grade reliability