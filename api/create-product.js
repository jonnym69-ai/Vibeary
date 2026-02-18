import { stripeClient } from '../../src/stripeConnect.js';

// API route to create a product on a connected account
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, description, priceInCents, currency = 'usd', accountId } = req.body;

    if (!name || !priceInCents || !accountId) {
      return res.status(400).json({ error: 'Name, price, and account ID are required' });
    }

    // Create product on the connected account using Stripe-Account header
    const product = await stripeClient.products.create({
      name: name, // Product name
      description: description, // Product description
      default_price_data: {
        unit_amount: priceInCents, // Price in cents
        currency: currency, // Currency, default USD
      },
    }, {
      stripeAccount: accountId, // Pass connected account ID as Stripe-Account header
    });

    res.status(200).json({ product });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: error.message });
  }
}
