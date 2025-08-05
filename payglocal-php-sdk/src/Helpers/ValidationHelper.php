<?php

namespace PayGlocal\Helpers;

use InvalidArgumentException;

/**
 * Payload validation helper
 */
class ValidationHelper
{
    /**
     * Validate payload data
     * 
     * @param array $payload Payload to validate
     * @param array $options Validation options
     * @throws InvalidArgumentException
     */
    public static function validatePayload(array $payload, array $options = []): void
    {
        $operation = $options['operation'] ?? 'payment';
        $requiredFields = $options['requiredFields'] ?? [];
        $customValidation = $options['customValidation'] ?? null;

        // Basic required fields validation
        foreach ($requiredFields as $field) {
            if (!isset($payload[$field]) || empty($payload[$field])) {
                throw new InvalidArgumentException("Required field '{$field}' is missing or empty for {$operation} operation");
            }
        }

        // Operation-specific validation
        self::validateByOperation($payload, $operation);

        // Custom validation if provided
        if ($customValidation && is_callable($customValidation)) {
            $customValidation($payload);
        }
    }

    /**
     * Validate payload based on operation type
     * 
     * @param array $payload Payload to validate
     * @param string $operation Operation type
     * @throws InvalidArgumentException
     */
    private static function validateByOperation(array $payload, string $operation): void
    {
        switch ($operation) {
            case 'payment':
            case 'jwt-payment':
                self::validatePaymentData($payload);
                break;
            case 'refund':
                self::validateRefundData($payload);
                break;
            case 'capture':
                self::validateCaptureData($payload);
                break;
            case 'status':
                self::validateStatusData($payload);
                break;
            case 'si-payment':
                self::validateSiPaymentData($payload);
                break;
            case 'auth-payment':
                self::validateAuthPaymentData($payload);
                break;
        }
    }

    /**
     * Validate payment data
     * 
     * @param array $payload Payment payload
     * @throws InvalidArgumentException
     */
    private static function validatePaymentData(array $payload): void
    {
        // Validate merchant transaction ID
        if (isset($payload['merchantTxnId'])) {
            if (strlen($payload['merchantTxnId']) > 50) {
                throw new InvalidArgumentException('merchantTxnId cannot exceed 50 characters');
            }
        }

        // Validate payment data if present
        if (isset($payload['paymentData'])) {
            $paymentData = $payload['paymentData'];
            
            // Validate amount
            if (isset($paymentData['totalAmount'])) {
                if (!is_numeric($paymentData['totalAmount']) || $paymentData['totalAmount'] <= 0) {
                    throw new InvalidArgumentException('totalAmount must be a positive number');
                }
            }

            // Validate currency
            if (isset($paymentData['txnCurrency'])) {
                $validCurrencies = ['INR', 'USD', 'EUR', 'GBP'];
                if (!in_array($paymentData['txnCurrency'], $validCurrencies)) {
                    throw new InvalidArgumentException('txnCurrency must be one of: ' . implode(', ', $validCurrencies));
                }
            }

            // Validate billing data
            if (isset($paymentData['billingData'])) {
                self::validateBillingData($paymentData['billingData']);
            }
        }
    }

    /**
     * Validate billing data
     * 
     * @param array $billingData Billing data
     * @throws InvalidArgumentException
     */
    private static function validateBillingData(array $billingData): void
    {
        // Validate email
        if (isset($billingData['emailId']) && !filter_var($billingData['emailId'], FILTER_VALIDATE_EMAIL)) {
            throw new InvalidArgumentException('Invalid email format in billingData.emailId');
        }

        // Validate mobile number
        if (isset($billingData['mobileNumber'])) {
            if (!preg_match('/^[0-9]{10,15}$/', $billingData['mobileNumber'])) {
                throw new InvalidArgumentException('mobileNumber must be 10-15 digits');
            }
        }
    }

    /**
     * Validate refund data
     * 
     * @param array $payload Refund payload
     * @throws InvalidArgumentException
     */
    private static function validateRefundData(array $payload): void
    {
        if (isset($payload['refundAmount'])) {
            if (!is_numeric($payload['refundAmount']) || $payload['refundAmount'] <= 0) {
                throw new InvalidArgumentException('refundAmount must be a positive number');
            }
        }
    }

    /**
     * Validate capture data
     * 
     * @param array $payload Capture payload
     * @throws InvalidArgumentException
     */
    private static function validateCaptureData(array $payload): void
    {
        if (isset($payload['captureAmount'])) {
            if (!is_numeric($payload['captureAmount']) || $payload['captureAmount'] <= 0) {
                throw new InvalidArgumentException('captureAmount must be a positive number');
            }
        }
    }

    /**
     * Validate status check data
     * 
     * @param array $payload Status payload
     * @throws InvalidArgumentException
     */
    private static function validateStatusData(array $payload): void
    {
        // Basic validation - most status checks just need GID which is handled in the service
    }

    /**
     * Validate SI payment data
     * 
     * @param array $payload SI payment payload
     * @throws InvalidArgumentException
     */
    private static function validateSiPaymentData(array $payload): void
    {
        self::validatePaymentData($payload);
        
        // Additional SI-specific validations can be added here
        if (isset($payload['siData'])) {
            $siData = $payload['siData'];
            
            if (isset($siData['frequency']) && !in_array($siData['frequency'], ['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'])) {
                throw new InvalidArgumentException('SI frequency must be one of: DAILY, WEEKLY, MONTHLY, YEARLY');
            }
        }
    }

    /**
     * Validate auth payment data
     * 
     * @param array $payload Auth payment payload
     * @throws InvalidArgumentException
     */
    private static function validateAuthPaymentData(array $payload): void
    {
        self::validatePaymentData($payload);
        
        // Additional auth-specific validations can be added here
    }
}