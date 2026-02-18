// API endpoint to create a checkout session for purchasing a product from a connected account
// Uses Direct Charge with application fee to monetize transactions
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
    // Extract checkout data from request body
    const { accountId, priceId, quantity = 1 } = req.body;

    if (!accountId || !priceId) {
      return res.status(400).json({
        error: 'Missing required fields: accountId, priceId'
      });
    }

    // Define success and cancel URLs
    // In a real app, these should be your actual domain URLs
    const baseUrl = process.env.APP_URL || 'http://localhost:3000'; // Default to localhost for dev
    const successUrl = `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${baseUrl}/cancel`;

    // Calculate application fee (e.g., 10% of the transaction)
    // For demo purposes, we'll use a fixed fee - in production, calculate based on price
    const applicationFeeAmount = 100; // $1.00 application fee

    // Create the checkout session
    // Uses Direct Charge with application fee
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: priceId, // The price ID from the product
          quantity: parseInt(quantity),
        },
      ],
      payment_intent_data: {
        application_fee_amount: applicationFeeAmount, // Platform fee
      },
      mode: 'payment', // One-time payment
      success_url: successUrl,
      cancel_url: cancelUrl,
    }, {
      stripeAccount: accountId, // Process payment on the connected account
    });

    // Return the checkout session URL for redirection
    res.status(200).json({
      url: session.url,
      sessionId: session.id,
    });

  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({
      error: 'Failed to create checkout session',
      details: error.message,
    });
  }
}
