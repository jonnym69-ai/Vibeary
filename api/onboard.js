import { stripeClient } from '../../src/stripeConnect.js';

// API route to create onboarding account link for Stripe Connect
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { accountId } = req.body;

    if (!accountId) {
      return res.status(400).json({ error: 'Account ID is required' });
    }

    // Create account link for onboarding using V2 API
    const accountLink = await stripeClient.v2.core.accountLinks.create({
      account: accountId, // The connected account ID
      use_case: {
        type: 'account_onboarding', // For initial onboarding
        account_onboarding: {
          configurations: ['merchant', 'customer'], // Include both merchant and customer configurations
          refresh_url: 'https://your-app.com/onboard', // URL to return to if onboarding expires - TODO: Replace with your app URL
          return_url: `https://your-app.com/onboard?accountId=${accountId}`, // URL to return to after onboarding - TODO: Replace with your app URL
        },
      },
    });

    res.status(200).json({ url: accountLink.url });
  } catch (error) {
    console.error('Error creating account link:', error);
    res.status(500).json({ error: error.message });
  }
}
