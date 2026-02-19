import { useState, useEffect, useCallback } from 'react';

// Component for managing subscriptions on a connected Stripe account
// Shows current subscription status and provides options to subscribe or manage billing
// Uses simple styling consistent with the app
export default function SubscriptionV2({ accountId, subscriptionPriceId }) {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch subscriptions for the connected account
  const loadSubscriptions = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/v2/get-subscriptions?accountId=${accountId}`);
      const data = await response.json();

      if (data.subscriptions) {
        setSubscriptions(data.subscriptions);
      } else {
        setError('Failed to load subscriptions');
      }
    } catch {
      setError('Failed to load subscriptions');
    } finally {
      setLoading(false);
    }
  }, [accountId]);

  // Load subscriptions when accountId changes
  useEffect(() => {
    if (accountId) {
      loadSubscriptions();
    }
  }, [loadSubscriptions]);

  // Get the active subscription
  const activeSubscription = subscriptions.find(sub => sub.status === 'active' || sub.status === 'trialing');

  // Handle subscription creation
  const handleSubscribe = async () => {
    if (!subscriptionPriceId) {
      setError('No subscription price configured');
      return;
    }

    setError(null);

    try {
      const response = await fetch('/api/v2/create-subscription-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountId,
          priceId: subscriptionPriceId,
        }),
      });

      const data = await response.json();

      if (data.url) {
        // Redirect to Stripe Checkout
        window.location.assign(data.url);
      } else {
        setError(data.error || 'Failed to create subscription checkout');
      }
    } catch {
      setError('Failed to initiate subscription');
    }
  };

  // Handle billing portal access
  const handleManageBilling = async () => {
    setError(null);

    try {
      const response = await fetch('/api/v2/create-billing-portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountId,
        }),
      });

      const data = await response.json();

      if (data.url) {
        // Redirect to Billing Portal
        window.location.assign(data.url);
      } else {
        setError(data.error || 'Failed to create billing portal');
      }
    } catch {
      setError('Failed to access billing portal');
    }
  };

  if (!accountId) {
    return (
      <div className="text-center py-4">
        <p className="text-gray-500">No connected account selected</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Subscription Management</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-4">
          <p className="text-gray-500">Loading subscriptions...</p>
        </div>
      ) : (
        <div>
          <div className="mb-4">
            <h3 className="font-medium">Current Subscription</h3>
            {activeSubscription ? (
              <div className="mt-2 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
                <p><strong>Status:</strong> {activeSubscription.status}</p>
                <p><strong>Period:</strong> {new Date(activeSubscription.current_period_start).toLocaleDateString()} - {new Date(activeSubscription.current_period_end).toLocaleDateString()}</p>
              </div>
            ) : (
              <div className="mt-2 p-3 bg-gray-100 border border-gray-400 text-gray-700 rounded">
                <p>No active subscription</p>
              </div>
            )}
          </div>

          <div className="space-y-2">
            {!activeSubscription && (
              <button
                onClick={handleSubscribe}
                disabled={!subscriptionPriceId}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {subscriptionPriceId ? 'Subscribe Now' : 'No Subscription Plan Available'}
              </button>
            )}

            {activeSubscription && (
              <button
                onClick={handleManageBilling}
                className="w-full bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
              >
                Manage Billing
              </button>
            )}

            <button
              onClick={loadSubscriptions}
              className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded"
            >
              Refresh Status
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
