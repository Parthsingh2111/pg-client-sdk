<?php

namespace PayGlocal\Core;

use PayGlocal\Utils\Logger;
use InvalidArgumentException;

/**
 * Configuration class for PayGlocalClient
 */
class Config
{
    private const BASE_URLS = [
        'UAT' => 'https://api.uat.payglocal.in',
        'PROD' => 'https://api.payglocal.in',
    ];

    public string $apiKey;
    public string $merchantId;
    public string $publicKeyId;
    public string $privateKeyId;
    public string $payglocalPublicKey;
    public string $merchantPrivateKey;
    public string $baseUrl;
    public string $logLevel;
    public int $tokenExpiration;

    /**
     * Constructor
     * 
     * @param array $config Configuration array
     * @throws InvalidArgumentException
     */
    public function __construct(array $config = [])
    {
        try {
            $this->apiKey = $config['apiKey'] ?? '';
            $this->merchantId = $config['merchantId'] ?? '';
            $this->publicKeyId = $config['publicKeyId'] ?? '';
            $this->privateKeyId = $config['privateKeyId'] ?? '';
            $this->payglocalPublicKey = $config['payglocalPublicKey'] ?? '';
            $this->merchantPrivateKey = $config['merchantPrivateKey'] ?? '';
            
            // Extract URL from environment flag
            $baseUrlKey = $config['baseUrlVar'] ?? 'UAT';
            $this->baseUrl = self::BASE_URLS[strtoupper($baseUrlKey)] ?? self::BASE_URLS['UAT'];

            $this->logLevel = $config['logLevel'] ?? 'info';
            $this->tokenExpiration = $config['tokenExpiration'] ?? 300000; // 5 minutes in milliseconds

            // Validate required fields
            $this->validateRequiredFields();

        } catch (\Exception $error) {
            Logger::error('Configuration error: ' . $error->getMessage());
            throw new InvalidArgumentException('Configuration initialization failed: ' . $error->getMessage());
        }
    }

    /**
     * Validate required configuration fields
     * 
     * @throws InvalidArgumentException
     */
    private function validateRequiredFields(): void
    {
        $requiredFields = [
            'apiKey',
            'merchantId', 
            'publicKeyId',
            'privateKeyId',
            'payglocalPublicKey',
            'merchantPrivateKey'
        ];

        foreach ($requiredFields as $field) {
            if (empty($this->$field)) {
                throw new InvalidArgumentException("Required configuration field '{$field}' is missing or empty");
            }
        }
    }
}