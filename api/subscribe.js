import { stripeClient } from '../../src/stripeConnect.js';

// API route to create a subscription checkout session for a connected account
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { priceId, accountId } = req.body;

    if (!priceId || !accountId) {
      return res.status(400).json({ error: 'Price ID and account ID are required' });
    }

    // Create checkout session for subscription
    const session = await stripeClient.checkout.sessions.create({
      customer_account: accountId, // Use customer_account for V2 accounts
      mode: 'subscription', // Subscription mode
      line_items: [
        {
          price: priceId, // Subscription price ID
          quantity: 1,
        },
      ],
      success_url: 'https://your-app.com/success?session_id={CHECKOUT_SESSION_ID}', // TODO: Replace with your success URL
      cancel_url: 'https://your-app.com/cancel', // TODO: Replace with your cancel URL
    });

    res.status(200).json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Error creating subscription session:', error);
    res.status(500).json({ error: error.message });
  }
}
