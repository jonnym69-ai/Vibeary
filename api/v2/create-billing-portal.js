// API endpoint to create a billing portal session for a connected account
// Allows customers to manage their subscriptions and billing information
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
    // Extract account data from request body
    const { accountId } = req.body;

    if (!accountId) {
      return res.status(400).json({
        error: 'Missing accountId in request body'
      });
    }

    // Define return URL
    // Where users go after managing their billing
    const baseUrl = process.env.APP_URL || 'http://localhost:3000'; // Default to localhost for dev
    const returnUrl = `${baseUrl}/connect`; // Return to the connect/dashboard page

    // Create the billing portal session
    // customer_account is the connected account ID for V2
    const session = await stripe.billingPortal.sessions.create({
      customer_account: accountId, // The connected account ID
      return_url: returnUrl, // Where to return after managing billing
    });

    // Return the portal URL for redirection
    res.status(200).json({
      url: session.url,
    });

  } catch (error) {
    console.error('Error creating billing portal session:', error);
    res.status(500).json({
      error: 'Failed to create billing portal session',
      details: error.message,
    });
  }
}
