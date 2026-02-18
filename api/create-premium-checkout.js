// API endpoint to create a custom checkout session for premium subscription
// Includes user_id in metadata so webhook can activate premium access
// Requires STRIPE_SECRET_KEY environment variable
/* eslint-disable no-undef */

import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
if (!stripeSecretKey) {
  throw new Error('STRIPE_SECRET_KEY environment variable is not set.');
}

const stripe = new Stripe(stripeSecretKey);

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    // Extract user_id from request body
    const { user_id } = req.body;

    if (!user_id) {
      return res.status(400).json({ error: 'Missing user_id in request body' });
    }

    // Define success and cancel URLs
    const baseUrl = process.env.APP_URL || 'http://localhost:3000';
    const successUrl = `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${baseUrl}/cancel`;

    // Create checkout session for premium subscription
    // Using the pricing table price - replace with actual price ID from your Stripe dashboard
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: 'price_1T1nMn5zp7Kd7fwD0zjn4Hrq', // Premium subscription price
          quantity: 1,
        },
      ],
      mode: 'subscription', // Subscription mode for recurring payments
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        user_id: user_id, // Include user_id in metadata for webhook processing
      },
    });

    // Return the session URL for redirection
    res.status(200).json({
      url: session.url,
    });

  } catch (error) {
    console.error('Error creating premium checkout session:', error);
    res.status(500).json({
      error: 'Failed to create checkout session',
      details: error.message,
    });
  }
}
