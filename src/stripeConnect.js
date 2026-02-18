import Stripe from 'stripe';

// Placeholder for Stripe secret key - replace with your actual key from https://dashboard.stripe.com/apikeys
const stripeSecretKey = import.meta.env.VITE_STRIPE_SECRET_KEY || 'sk_test_...'; // TODO: Replace with actual Stripe secret key

if (!stripeSecretKey || stripeSecretKey === 'sk_test_...') {
  throw new Error('Stripe secret key not set. Please set VITE_STRIPE_SECRET_KEY in your environment variables.');
}

// Create Stripe client for all Connect operations
export const stripeClient = new Stripe(stripeSecretKey);
