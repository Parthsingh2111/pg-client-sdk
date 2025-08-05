<?php

namespace PayGlocal\Services;

use PayGlocal\Core\Config;
use PayGlocal\Constants\Endpoints;
use PayGlocal\Helpers\TokenHelper;
use PayGlocal\Helpers\ValidationHelper;
use PayGlocal\Helpers\ApiRequestHelper;
use PayGlocal\Helpers\HeaderHelper;

/**
 * Payment service for handling all payment operations
 */
class PaymentService
{
    /**
     * Main payment initiator
     * 
     * @param array $payload Payment payload
     * @param Config $config Configuration object
     * @param array $options Operation options
     * @return mixed Payment response
     * @throws \Exception
     */
    public static function initiatePayment(array $payload, Config $config, array $options = [])
    {
        $operation = $options['operation'] ?? 'payment';
        $endpoint = $options['endpoint'] ?? Endpoints::PAYMENT['INITIATE'];
        $requiredFields = $options['requiredFields'] ?? [];
        $useJWT = $options['useJWT'] ?? true;
        $customValidation = $options['customValidation'] ?? null;
        $customHeaders = $options['customHeaders'] ?? [];

        // 1-3. Comprehensive Validation (Schema, Custom, Required Fields)
        ValidationHelper::validatePayload($payload, [
            'operation' => $operation,
            'requiredFields' => $requiredFields,
            'customValidation' => $customValidation
        ]);

        // 4. Token Generation and Header Building
        if ($useJWT) {
            $tokens = TokenHelper::generateTokens($payload, $config, $operation);
            $requestData = $tokens['jwe'];
            $headers = HeaderHelper::buildJwtHeaders($tokens['jws'], $customHeaders);
        } else {
            $requestData = $payload;
            $headers = HeaderHelper::buildApiKeyHeaders($config->apiKey, $customHeaders);
        }

        // 5. API Call with Response Processing
        $response = ApiRequestHelper::makePaymentRequest([
            'baseUrl' => $config->baseUrl,
            'endpoint' => $endpoint,
            'requestData' => $requestData,
            'headers' => $headers,
            'operation' => $operation,
        ]);

        return $response;
    }

    /**
     * Initiate API Key Payment
     * 
     * @param array $params Payment parameters
     * @param Config $config Configuration object
     * @return mixed Payment response
     * @throws \Exception
     */
    public static function initiateApiKeyPayment(array $params, Config $config)
    {
        return self::initiatePayment($params, $config, [
            'operation' => 'api-key-payment',
            'endpoint' => Endpoints::PAYMENT['INITIATE'],
            'requiredFields' => ['merchantTxnId', 'paymentData'],
            'useJWT' => false,
        ]);
    }

    /**
     * Initiate JWT Payment (Recommended)
     * 
     * @param array $params Payment parameters
     * @param Config $config Configuration object
     * @return mixed Payment response
     * @throws \Exception
     */
    public static function initiateJwtPayment(array $params, Config $config)
    {
        return self::initiatePayment($params, $config, [
            'operation' => 'jwt-payment',
            'endpoint' => Endpoints::PAYMENT['INITIATE'],
            'requiredFields' => ['merchantTxnId', 'paymentData'],
            'useJWT' => true,
        ]);
    }

    /**
     * Initiate Standing Instruction Payment
     * 
     * @param array $params SI payment parameters
     * @param Config $config Configuration object
     * @return mixed Payment response
     * @throws \Exception
     */
    public static function initiateSiPayment(array $params, Config $config)
    {
        return self::initiatePayment($params, $config, [
            'operation' => 'si-payment',
            'endpoint' => Endpoints::PAYMENT['INITIATE'],
            'requiredFields' => ['merchantTxnId', 'paymentData', 'siData'],
            'useJWT' => true,
        ]);
    }

    /**
     * Initiate Auth Payment
     * 
     * @param array $params Auth payment parameters
     * @param Config $config Configuration object
     * @return mixed Payment response
     * @throws \Exception
     */
    public static function initiateAuthPayment(array $params, Config $config)
    {
        return self::initiatePayment($params, $config, [
            'operation' => 'auth-payment',
            'endpoint' => Endpoints::PAYMENT['INITIATE'],
            'requiredFields' => ['merchantTxnId', 'paymentData'],
            'useJWT' => true,
            'customHeaders' => ['x-gl-auth' => 'true'],
        ]);
    }
}