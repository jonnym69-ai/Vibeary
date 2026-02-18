// API endpoint to retrieve the status of a Stripe Connect V2 account
// This checks if the account is ready to process payments and if onboarding is complete
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

    // Retrieve the account using V2 API with required includes
    // This fetches the account configuration and requirements
    const account = await stripe.v2.core.accounts.retrieve(accountId, {
      include: ["configuration.merchant", "requirements"],
    });

    // Check if the account is ready to process payments
    // Card payments capability must be active
    const readyToProcessPayments = account?.configuration?.merchant?.capabilities?.card_payments?.status === "active";

    // Check requirements status
    // Requirements are considered complete if not currently due or past due
    const requirementsStatus = account.requirements?.summary?.minimum_deadline?.status;
    const onboardingComplete = requirementsStatus !== "currently_due" && requirementsStatus !== "past_due";

    // Return the status information
    res.status(200).json({
      accountId: account.id,
      display_name: account.display_name,
      contact_email: account.contact_email,
      readyToProcessPayments,
      requirementsStatus,
      onboardingComplete,
      requirements: account.requirements, // Full requirements object for detailed UI
      configuration: account.configuration, // Full configuration for debugging
    });

  } catch (error) {
    console.error('Error retrieving account status:', error);
    res.status(500).json({
      error: 'Failed to retrieve account status',
      details: error.message,
    });
  }
}
