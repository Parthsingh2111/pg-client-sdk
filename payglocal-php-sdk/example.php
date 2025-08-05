<?php
/**
 * PayGlocal PHP SDK Example
 * 
 * This example demonstrates how to use the PayGlocal PHP SDK
 * for various payment operations.
 */

require_once 'vendor/autoload.php';

use PayGlocal\PayGlocalClient;

// Example configuration (replace with your actual credentials)
$config = [
    'apiKey' => 'your_api_key_here',
    'merchantId' => 'your_merchant_id_here',
    'publicKeyId' => 'your_public_key_id_here',
    'privateKeyId' => 'your_private_key_id_here',
    'payglocalPublicKey' => '-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...
-----END PUBLIC KEY-----',
    'merchantPrivateKey' => '-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...
-----END PRIVATE KEY-----',
    'baseUrlVar' => 'UAT', // Use 'PROD' for production
    'logLevel' => 'info'
];

try {
    // Initialize the PayGlocal client
    $client = new PayGlocalClient($config);
    echo "✅ PayGlocal PHP SDK initialized successfully!\n\n";

    // Example 1: JWT Payment (Recommended)
    echo "=== JWT Payment Example ===\n";
    $jwtPayment = $client->initiateJwtPayment([
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
    
    echo "Payment Link: " . ($jwtPayment['paymentLink'] ?? 'N/A') . "\n";
    echo "GID: " . ($jwtPayment['gid'] ?? 'N/A') . "\n\n";

    // Example 2: Check Status (uncomment and use actual GID)
    /*
    echo "=== Status Check Example ===\n";
    $status = $client->initiateCheckStatus([
        'gid' => 'your_actual_gid_here'
    ]);
    echo "Status: " . ($status['txnStatus'] ?? 'N/A') . "\n\n";
    */

    // Example 3: Refund (uncomment and use actual GID)
    /*
    echo "=== Refund Example ===\n";
    $refund = $client->initiateRefund([
        'gid' => 'your_actual_gid_here',
        'refundAmount' => '500.00',
        'refundReason' => 'Customer requested refund'
    ]);
    echo "Refund ID: " . ($refund['refundId'] ?? 'N/A') . "\n\n";
    */

} catch (InvalidArgumentException $e) {
    echo "❌ Configuration Error: " . $e->getMessage() . "\n";
} catch (RuntimeException $e) {
    echo "❌ Runtime Error: " . $e->getMessage() . "\n";
} catch (Exception $e) {
    echo "❌ General Error: " . $e->getMessage() . "\n";
}

echo "Example completed.\n";