import { stripeClient } from '../../src/stripeConnect.js';

// Webhook secret - set in Vercel environment variables
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_...'; // TODO: Replace with actual webhook secret from Stripe dashboard

// API route to handle Stripe webhooks for Connect events
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sig = req.headers['stripe-signature'];

  try {
    // Parse the thin event using the webhook secret
    const thinEvent = stripeClient.webhooks.parseThinEvent(req.body, sig, webhookSecret);

    // Fetch the full event data to understand the changes
    const event = await stripeClient.v2.core.events.retrieve(thinEvent.id);

    // Handle different event types
    switch (event.type) {
      case 'v2.core.account[requirements].updated':
        // Handle changes to account requirements (e.g., new documents needed)
        console.log('Account requirements updated:', event.data.object.id);
        // TODO: Notify the connected account owner to update information
        break;

      case 'v2.core.account[configuration.merchant].capability_status_updated':
        // Handle changes to merchant capabilities (e.g., card payments enabled)
        console.log('Merchant capability status updated:', event.data.object.id);
        // TODO: Update your database with the new capability status
        break;

      case 'v2.core.account[configuration.customer].capability_status_updated':
        // Handle changes to customer capabilities
        console.log('Customer capability status updated:', event.data.object.id);
        // TODO: Update your database with the new capability status
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.status(200).json({ received: true });
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
}
