// API endpoint to create an account link for Stripe Connect V2 onboarding
// This generates a URL where the connected account can complete their onboarding
// Requires STRIPE_SECRET_KEY environment variable

import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
if (!stripeSecretKey) {
  throw new Error('STRIPE_SECRET_KEY environment variable is not set. Please set it to your Stripe secret key.');
}

const stripe = new Stripe(stripeSecretKey);

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    // Get account ID from request body
    const { accountId } = req.body;

    if (!accountId) {
      return res.status(400).json({ error: 'Missing accountId in request body' });
    }

    // Define the refresh and return URLs
    // In a real app, these should be your actual domain URLs
    // Refresh URL: where users go if the link expires
    // Return URL: where users go after completing onboarding, with accountId as query param
    const baseUrl = process.env.APP_URL || 'http://localhost:3000'; // Default to localhost for dev
    const refreshUrl = `${baseUrl}/connect`; // Page to refresh onboarding
    const returnUrl = `${baseUrl}/connect?accountId=${accountId}`; // Return to connect page with account ID

    // Create the account link using V2 API
    // This is for account onboarding, configuring both merchant and customer capabilities
    const accountLink = await stripe.v2.core.accountLinks.create({
      account: accountId,
      use_case: {
        type: 'account_onboarding',
        account_onboarding: {
          configurations: ['merchant', 'customer'], // Enable both merchant and customer configurations
          refresh_url: refreshUrl, // URL for expired links
          return_url: returnUrl, // URL to return after onboarding completion
        },
      },
    });

    // Return the account link URL
    // The frontend should redirect the user to this URL
    res.status(200).json({
      url: accountLink.url,
      expires_at: accountLink.expires_at, // When the link expires
    });

  } catch (error) {
    console.error('Error creating account link:', error);
    res.status(500).json({
      error: 'Failed to create account link',
      details: error.message,
    });
  }
}
