import { stripeClient } from '../../src/stripeConnect.js';

// API route to create a checkout session for purchasing a product from a connected account
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { priceId, quantity = 1, accountId } = req.body;

    if (!priceId || !accountId) {
      return res.status(400).json({ error: 'Price ID and account ID are required' });
    }

    // Create checkout session with application fee for the platform
    const session = await stripeClient.checkout.sessions.create({
      line_items: [
        {
          price: priceId, // The price ID of the product
          quantity: quantity, // Quantity, default 1
        },
      ],
      payment_intent_data: {
        application_fee_amount: 123, // Example application fee in cents (1.23 USD) - adjust as needed
      },
      mode: 'payment', // For one-time payment
      success_url: 'https://your-app.com/success?session_id={CHECKOUT_SESSION_ID}', // TODO: Replace with your success URL
      cancel_url: 'https://your-app.com/cancel', // TODO: Replace with your cancel URL
    }, {
      stripeAccount: accountId, // Charge goes to connected account
    });

    res.status(200).json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: error.message });
  }
}
