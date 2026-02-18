// API endpoint to create a product on a connected Stripe account
// Uses the Stripe-Account header to create products on the specified connected account
// Requires STRIPE_SECRET_KEY environment variable

import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
if (!stripeSecretKey) {
  throw new Error('STRIPE_SECRET_KEY environment variable is not set. Please set it to your Stripe secret key.');
}

const stripe = new Stripe(stripeSecretKey);

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    // Extract product data from request body
    const { accountId, name, description, priceInCents, currency = 'usd' } = req.body;

    if (!accountId || !name || !priceInCents) {
      return res.status(400).json({
        error: 'Missing required fields: accountId, name, priceInCents'
      });
    }

    // Validate price
    if (priceInCents < 50) { // Stripe minimum is 50 cents for USD
      return res.status(400).json({
        error: 'Price must be at least 50 cents (5000 for non-USD currencies)'
      });
    }

    // Create the product on the connected account
    // Uses stripeAccount parameter to specify the connected account
    const product = await stripe.products.create({
      name: name,
      description: description,
      default_price_data: {
        unit_amount: parseInt(priceInCents), // Ensure it's an integer
        currency: currency.toLowerCase(),
      },
    }, {
      stripeAccount: accountId, // This header ensures the product is created on the connected account
    });

    // Return the created product details
    res.status(200).json({
      success: true,
      product: {
        id: product.id,
        name: product.name,
        description: product.description,
        default_price: product.default_price, // Price ID
        created: product.created,
      },
    });

  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({
      error: 'Failed to create product',
      details: error.message,
    });
  }
}
