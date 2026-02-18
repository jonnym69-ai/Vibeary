// API endpoint to create a subscription checkout session for a connected account
// Uses V2 accounts where one ID serves as both customer and connected account
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
    // Extract subscription data from request body
    const { accountId, priceId } = req.body;

    if (!accountId || !priceId) {
      return res.status(400).json({
        error: 'Missing required fields: accountId, priceId'
      });
    }

    // Define success and cancel URLs
    // In a real app, these should be your actual domain URLs
    const baseUrl = process.env.APP_URL || 'http://localhost:3000'; // Default to localhost for dev
    const successUrl = `${baseUrl}/subscription-success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${baseUrl}/subscription-cancel`;

    // Create the subscription checkout session
    // For V2 accounts, customer_account is the connected account ID
    const session = await stripe.checkout.sessions.create({
      customer_account: accountId, // The connected account ID (V2)
      mode: 'subscription', // Subscription mode
      line_items: [
        {
          price: priceId, // The subscription price ID
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    // Return the checkout session URL for redirection
    res.status(200).json({
      url: session.url,
      sessionId: session.id,
    });

  } catch (error) {
    console.error('Error creating subscription checkout session:', error);
    res.status(500).json({
      error: 'Failed to create subscription checkout session',
      details: error.message,
    });
  }
}
