import { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

// Component for managing Stripe Connect onboarding
// Displays account status and provides onboarding link
// Uses simple styling consistent with the app's design
export default function ConnectOnboard() {
  const { user } = useAuth();
  const [accountId, setAccountId] = useState(null);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load user's connected account on component mount
  useEffect(() => {
    if (user) {
      loadAccount();
    }
  }, [user]);

  // Fetch the user's connected account from database
  const loadAccount = async () => {
    try {
      const response = await fetch(`/api/v2/get-user-account?userId=${user.id}`);
      const data = await response.json();
      if (data.account_id) {
        setAccountId(data.account_id);
        loadStatus(data.account_id);
      }
    } catch (err) {
      console.error('Failed to load account:', err);
      setError('Failed to load account');
    }
  };

  // Fetch account status from Stripe API
  const loadStatus = async (accId) => {
    try {
      const response = await fetch(`/api/v2/account-status?accountId=${accId}`);
      const data = await response.json();
      setStatus(data);
    } catch (err) {
      setError('Failed to load status');
    }
  };

  // Create a new connected account for the user
  const createAccount = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/v2/create-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          display_name: user.user_metadata?.full_name || user.email,
          contact_email: user.email,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setAccountId(data.account.id);
        setStatus({ onboardingComplete: false, readyToProcessPayments: false });
        // Automatically start onboarding after account creation
        startOnboarding(data.account.id);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  // Start the onboarding process by creating an account link
  const startOnboarding = async (accId = accountId) => {
    if (!accId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/v2/create-account-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId: accId }),
      });

      const data = await response.json();

      if (data.url) {
        // Redirect to Stripe onboarding
        window.location.href = data.url;
      } else {
        setError('Failed to create onboarding link');
      }
    } catch (err) {
      setError('Failed to start onboarding');
    } finally {
      setLoading(false);
    }
  };

  // Refresh status after returning from onboarding
  const refreshStatus = () => {
    if (accountId) {
      loadStatus(accountId);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Stripe Connect Onboarding</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {!accountId ? (
        <div className="text-center">
          <p className="mb-4 text-gray-600">
            Connect your Stripe account to start accepting payments.
          </p>
          <button
            onClick={createAccount}
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : 'Create Connected Account'}
          </button>
        </div>
      ) : (
        <div>
          <div className="mb-4">
            <h3 className="font-medium">Account Status</h3>
            {status ? (
              <div className="mt-2 space-y-2">
                <div className="flex justify-between">
                  <span>Onboarding Complete:</span>
                  <span className={status.onboardingComplete ? 'text-green-600' : 'text-red-600'}>
                    {status.onboardingComplete ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Ready to Process Payments:</span>
                  <span className={status.readyToProcessPayments ? 'text-green-600' : 'text-red-600'}>
                    {status.readyToProcessPayments ? 'Yes' : 'No'}
                  </span>
                </div>
                {status.requirementsStatus && (
                  <div className="flex justify-between">
                    <span>Requirements:</span>
                    <span className={
                      status.requirementsStatus === 'currently_due' || status.requirementsStatus === 'past_due'
                        ? 'text-red-600' : 'text-green-600'
                    }>
                      {status.requirementsStatus}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500">Loading status...</p>
            )}
          </div>

          <div className="space-y-2">
            {!status?.onboardingComplete && (
              <button
                onClick={() => startOnboarding()}
                disabled={loading}
                className="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
              >
                {loading ? 'Starting Onboarding...' : 'Complete Onboarding'}
              </button>
            )}

            <button
              onClick={refreshStatus}
              className="w-full bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
            >
              Refresh Status
            </button>
          </div>

          {status?.onboardingComplete && status?.readyToProcessPayments && (
            <div className="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
              ✅ Your account is ready to accept payments!
            </div>
          )}
        </div>
      )}
    </div>
  );
}
