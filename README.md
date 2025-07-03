PayGlocal Client
A Node.js SDK for integrating with the PayGlocal payment platform.
Installation
npm install payglocal-client

Setup
Create a .env file in your project root:
PAYGLOCAL_API_KEY=your_api_key
PAYGLOCAL_MERCHANT_ID=your_merchant_id
PAYGLOCAL_PUBLIC_KEY_ID=pub123
PAYGLOCAL_PRIVATE_KEY_ID=priv123
PAYGLOCAL_PUBLIC_KEY=-----BEGIN PUBLIC KEY-----...
PAYGLOCAL_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----...
PAYGLOCAL_BASE_URL=https://uat.payglocal.com

Replace placeholders with credentials from the PayGlocal merchant dashboard.
Usage
const PayGlocalClient = require('payglocal-client');

const client = new PayGlocalClient();

async function run() {
  try {
    // Example: Initiate API Key Payment
    const payment = await client.initiateApiKeyPayment({
      merchantTxnId: `TXN${Date.now()}`,
      paymentData: {
        totalAmount: 1000,
        txnCurrency: 'INR',
        billingData: { emailId: 'user@example.com' },
      },
      merchantCallbackURL: 'https://your-site.com/callback',
    });
    console.log('Payment Link:', payment.paymentLink);
    console.log('Status Link:', payment.statusLink);

    // Example: Check Status
    const status = await client.checkStatus('test-gid');
    console.log('Status:', status.status);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

run();

Testing
Use the UAT URL for testing:
PAYGLOCAL_BASE_URL=https://uat.payglocal.com

Verify transactions via the PayGlocal merchant dashboard.
Going Live
Update the base URL to the production environment:
PAYGLOCAL_BASE_URL=https://api.payglocal.com

Supported Methods

initiateApiKeyPayment: Initiate payment with API key.
initiateJwtPayment: Initiate payment with JWT.
initiateSiPayment: Initiate Standing Instruction payment.
initiateAuthPayment: Initiate Auth payment.
initiateRefund: Process a refund.
initiateCapture: Capture a payment.
initiateAuthReversal: Reverse an auth transaction.
checkStatus: Check transaction status.
