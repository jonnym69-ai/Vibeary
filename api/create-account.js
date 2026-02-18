import { stripeClient } from '../../src/stripeConnect.js';

// API route to create a Stripe Connect account using V2 API
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Extract user details from request body - in a real app, get from authenticated user
    const { displayName, contactEmail } = req.body;

    if (!displayName || !contactEmail) {
      return res.status(400).json({ error: 'Display name and contact email are required' });
    }

    // Create connected account using Stripe V2 API with specified properties
    const account = await stripeClient.v2.core.accounts.create({
      display_name: displayName, // From user input
      contact_email: contactEmail, // From user input
      identity: {
        country: 'us', // Set to US for this example
      },
      dashboard: 'full', // Allow full dashboard access
      defaults: {
        responsibilities: {
          fees_collector: 'stripe', // Stripe handles fees
          losses_collector: 'stripe', // Stripe handles losses
        },
      },
      configuration: {
        customer: {}, // Basic customer configuration
        merchant: {
          capabilities: {
            card_payments: {
              requested: true, // Request card payments capability
            },
          },
        },
      },
    });

    // TODO: Store the mapping from your user ID to account.id in your database
    // For example: await db.users.update(userId, { stripeAccountId: account.id });

    res.status(200).json({ accountId: account.id });
  } catch (error) {
    console.error('Error creating account:', error);
    res.status(500).json({ error: error.message });
  }
}
