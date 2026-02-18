// API endpoint to list products from a connected Stripe account
// Uses the Stripe-Account header to list products from the specified connected account
// Expands default_price for easy access to pricing information
// Requires STRIPE_SECRET_KEY environment variable

import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
if (!stripeSecretKey) {
  throw new Error('STRIPE_SECRET_KEY environment variable is not set. Please set it to your Stripe secret key.');
}

const stripe = new Stripe(stripeSecretKey);

export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed. Use GET.' });
  }

  try {
    // Get account ID from query parameters
    const { accountId } = req.query;

    if (!accountId) {
      return res.status(400).json({ error: 'Missing accountId query parameter' });
    }

    // List products from the connected account
    // Uses stripeAccount parameter to specify the connected account
    // Expands default_price to include pricing details
    // Limits to 20 products, only active ones
    const products = await stripe.products.list({
      limit: 20,
      active: true,
      expand: ['data.default_price'], // Include price details in the response
    }, {
      stripeAccount: accountId, // This header ensures products are listed from the connected account
    });

    // Format the response for easier frontend consumption
    const formattedProducts = products.data.map(product => ({
      id: product.id,
      name: product.name,
      description: product.description,
      images: product.images || [],
      price: product.default_price ? {
        id: product.default_price.id,
        amount: product.default_price.unit_amount,
        currency: product.default_price.currency,
        formatted: new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: product.default_price.currency.toUpperCase(),
        }).format(product.default_price.unit_amount / 100), // Convert cents to dollars
      } : null,
      created: product.created,
    }));

    res.status(200).json({
      products: formattedProducts,
    });

  } catch (error) {
    console.error('Error listing products:', error);
    res.status(500).json({
      error: 'Failed to list products',
      details: error.message,
    });
  }
}
