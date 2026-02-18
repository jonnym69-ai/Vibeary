import { stripeClient } from '../../src/stripeConnect.js';

// API route to create a billing portal session for a connected account
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { accountId } = req.body;

    if (!accountId) {
      return res.status(400).json({ error: 'Account ID is required' });
    }

    // Create billing portal session for the connected account
    const session = await stripeClient.billingPortal.sessions.create({
      customer_account: accountId, // Use customer_account for V2
      return_url: 'https://your-app.com/dashboard', // TODO: Replace with your dashboard URL
    });

    res.status(200).json({ url: session.url });
  } catch (error) {
    console.error('Error creating billing portal session:', error);
    res.status(500).json({ error: error.message });
  }
}
