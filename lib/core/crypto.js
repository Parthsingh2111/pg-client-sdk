const jose = require('jose');
const crypto = require('crypto');

/**
 * Convert PEM to key object.
 * @param {string} pem - PEM key
 * @param {boolean} isPrivate - Is private key
 * @returns {Promise<Object>} Key object
 */
async function pemToKey(pem, isPrivate = false) {
  // console.log(' Converting PEM to key object, isPrivate:', isPrivate);
  // console.log('PEM content:', pem);
  // console.log('PEM length:', pem.length, 'Type:', typeof pem);

  if (!pem || typeof pem !== 'string' || !pem.includes('-----')) {
    throw new Error(' Invalid PEM: must be a non-empty string with ----- delimiters');
  }

  try {
    return isPrivate
      ? await jose.importPKCS8(pem, 'RS256') // For signing (private key)
      : await jose.importSPKI(pem, 'RSA-OAEP-256'); // For encryption (public key)
  } catch (err) {
    console.error(' jose.import error:', err.message, err.stack);
    throw new Error(`Invalid PEM format: ${err.message}`);
  }
}

/**
 * Generate JWE for payload.
 * @param {Object} payload - Payload to encrypt
 * @param {Object} config - Configuration object
 * @returns {Promise<string>} JWE token
 */
async function generateJWE(payload, config) {
  // console.log('Generating JWE with payload:', JSON.stringify(payload, null, 2));
  // console.log(' Config in generateJWE:', JSON.stringify(config, null, 2));

  const iat = Date.now();
  const publicKey = await pemToKey(config.payglocalPublicKey, false);
  const payloadStr = JSON.stringify(payload);

  return await new jose.CompactEncrypt(new TextEncoder().encode(payloadStr))
    .setProtectedHeader({
      alg: 'RSA-OAEP-256',
      enc: 'A128CBC-HS256',
      iat: iat.toString(),
      exp: 300000,
      kid: config.publicKeyId,
      'issued-by': config.merchantId,
    })
    .encrypt(publicKey);
}

/**
 * Generate JWS for a digestable string (like a JWE or a request path).
 * @param {string} toDigest - The input string to hash (can be JWE or payloadPath)
 * @param {Object} config - Configuration object
 * @returns {Promise<string>} JWS token
 */
async function generateJWS(toDigest, config) {
  // console.log(' Generating JWS with input to digest:', toDigest);
  const iat = Date.now();

  const digest = crypto.createHash('sha256').update(toDigest).digest('base64');
  const digestObject = {
    digest,
    digestAlgorithm: 'SHA-256',
    exp: iat + 300000,
    iat: iat.toString(),
  };

  const privateKey = await pemToKey(config.merchantPrivateKey, true);

  return await new jose.SignJWT(digestObject)
    .setProtectedHeader({
      'issued-by': config.merchantId,
      alg: 'RS256',
      kid: config.privateKeyId,
      'x-gl-merchantId': config.merchantId,
      'x-gl-enc': 'true',
      'is-digested': 'true',
    })
    .sign(privateKey);
}


module.exports = { pemToKey, generateJWE, generateJWS };

