import { stripeClient } from '../../src/stripeConnect.js';

// API route to check onboarding status of a connected account
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { accountId } = req.query;

    if (!accountId) {
      return res.status(400).json({ error: 'Account ID is required' });
    }

    // Retrieve account details including configuration and requirements
    const account = await stripeClient.v2.core.accounts.retrieve(accountId, {
      include: ["configuration.merchant", "requirements"], // Include merchant config and requirements
    });

    // Check if account is ready to process payments
    const readyToProcessPayments = account?.configuration?.merchant?.capabilities?.card_payments?.status === "active";

    // Check requirements status
    const requirementsStatus = account.requirements?.summary?.minimum_deadline?.status;
    const onboardingComplete = requirementsStatus !== "currently_due" && requirementsStatus !== "past_due";

    res.status(200).json({
      readyToProcessPayments,
      onboardingComplete,
      requirementsStatus
    });
  } catch (error) {
    console.error('Error retrieving account:', error);
    res.status(500).json({ error: error.message });
  }
}
