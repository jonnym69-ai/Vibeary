import { stripeClient } from '../../src/stripeConnect.js';

// API route to list products from a connected account
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { accountId } = req.query;

    if (!accountId) {
      return res.status(400).json({ error: 'Account ID is required' });
    }

    // List products from the connected account, expanding default price
    const products = await stripeClient.products.list({
      limit: 20, // Limit to 20 products
      active: true, // Only active products
      expand: ['data.default_price'], // Expand price data
    }, {
      stripeAccount: accountId, // Use connected account
    });

    res.status(200).json({ products: products.data });
  } catch (error) {
    console.error('Error listing products:', error);
    res.status(500).json({ error: error.message });
  }
}
