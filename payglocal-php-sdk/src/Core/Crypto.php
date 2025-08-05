<?php

namespace PayGlocal\Core;

use Jose\Component\Core\AlgorithmManager;
use Jose\Component\Core\JWK;
use Jose\Component\Encryption\Algorithm\KeyEncryption\RSAOAEP256;
use Jose\Component\Encryption\Algorithm\ContentEncryption\A128CBCHS256;
use Jose\Component\Encryption\Compression\CompressionMethodManager;
use Jose\Component\Encryption\JWEBuilder;
use Jose\Component\Encryption\Serializer\CompactSerializer as JWECompactSerializer;
use Jose\Component\Signature\Algorithm\RS256;
use Jose\Component\Signature\JWSBuilder;
use Jose\Component\Signature\Serializer\CompactSerializer as JWSCompactSerializer;
use InvalidArgumentException;

/**
 * Cryptographic utilities for PayGlocal SDK
 */
class Crypto
{
    /**
     * Convert PEM to JWK
     * 
     * @param string $pem PEM key
     * @param bool $isPrivate Is private key
     * @return JWK Key object
     * @throws InvalidArgumentException
     */
    public static function pemToJwk(string $pem, bool $isPrivate = false): JWK
    {
        if (empty($pem) || strpos($pem, '-----') === false) {
            throw new InvalidArgumentException('Invalid PEM: must be a non-empty string with ----- delimiters');
        }

        try {
            return JWK::createFromPEM($pem);
        } catch (\Exception $e) {
            throw new InvalidArgumentException('Invalid PEM format: ' . $e->getMessage());
        }
    }

    /**
     * Generate JWE for payload
     * 
     * @param array $payload Payload to encrypt
     * @param Config $config Configuration object
     * @return string JWE token
     * @throws \Exception
     */
    public static function generateJWE(array $payload, Config $config): string
    {
        $iat = time() * 1000; // Convert to milliseconds
        $exp = $iat + $config->tokenExpiration;
        
        $publicKey = self::pemToJwk($config->payglocalPublicKey, false);
        $payloadJson = json_encode($payload);

        // Algorithm managers
        $keyEncryptionAlgorithmManager = new AlgorithmManager([
            new RSAOAEP256(),
        ]);
        
        $contentEncryptionAlgorithmManager = new AlgorithmManager([
            new A128CBCHS256(),
        ]);
        
        $compressionMethodManager = new CompressionMethodManager([]);

        // JWE Builder
        $jweBuilder = new JWEBuilder(
            $keyEncryptionAlgorithmManager,
            $contentEncryptionAlgorithmManager,
            $compressionMethodManager
        );

        $jwe = $jweBuilder
            ->create()
            ->withPayload($payloadJson)
            ->withSharedProtectedHeader([
                'alg' => 'RSA-OAEP-256',
                'enc' => 'A128CBC-HS256',
                'iat' => (string)$iat,
                'exp' => (string)$exp,
                'kid' => $config->publicKeyId,
                'issued-by' => $config->merchantId,
            ])
            ->addRecipient($publicKey)
            ->build();

        $serializer = new JWECompactSerializer();
        return $serializer->serialize($jwe, 0);
    }

    /**
     * Generate JWS for a digestible string
     * 
     * @param string $toDigest The input string to hash
     * @param Config $config Configuration object
     * @return string JWS token
     * @throws \Exception
     */
    public static function generateJWS(string $toDigest, Config $config): string
    {
        $iat = time() * 1000; // Convert to milliseconds
        $exp = $iat + $config->tokenExpiration;

        $digest = base64_encode(hash('sha256', $toDigest, true));
        $digestObject = [
            'digest' => $digest,
            'digestAlgorithm' => 'SHA-256',
            'exp' => $exp,
            'iat' => (string)$iat,
        ];

        $privateKey = self::pemToJwk($config->merchantPrivateKey, true);

        // Algorithm manager
        $algorithmManager = new AlgorithmManager([
            new RS256(),
        ]);

        // JWS Builder
        $jwsBuilder = new JWSBuilder($algorithmManager);

        $jws = $jwsBuilder
            ->create()
            ->withPayload(json_encode($digestObject))
            ->addSignature($privateKey, [
                'issued-by' => $config->merchantId,
                'alg' => 'RS256',
                'kid' => $config->privateKeyId,
                'x-gl-merchantId' => $config->merchantId,
                'x-gl-enc' => 'true',
                'is-digested' => 'true',
            ])
            ->build();

        $serializer = new JWSCompactSerializer();
        return $serializer->serialize($jws, 0);
    }
}