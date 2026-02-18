import React, { useState } from 'react';

// Modal component for onboarding users to Stripe Connect
// Uses clean HTML with basic styling similar to the app's Tailwind theme
const OnboardModal = ({ onClose, setAccountId }) => {
  // State for user input
  const [displayName, setDisplayName] = useState('');
  const [contactEmail, setContactEmail] = useState('');

  // State for account and onboarding
  const [accountId, setLocalAccountId] = useState(null);
  const [onboardingUrl, setOnboardingUrl] = useState(null);

  // State for onboarding status
  const [status, setStatus] = useState({ ready: false, complete: false });

  // Function to create a connected account
  const createAccount = async () => {
    try {
      const res = await fetch('/api/create-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName, contactEmail }),
      });
      const data = await res.json();
      if (res.ok) {
        setLocalAccountId(data.accountId); // Store the account ID
      if (setAccountId) setAccountId(data.accountId); // Update parent state
        alert('Connected account created successfully!');
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      alert(`Error creating account: ${error.message}`);
    }
  };

  // Function to start onboarding process
  const startOnboarding = async () => {
    try {
      const res = await fetch('/api/onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId }),
      });
      const data = await res.json();
      if (res.ok) {
        setOnboardingUrl(data.url); // Store the onboarding URL
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      alert(`Error starting onboarding: ${error.message}`);
    }
  };

  // Function to check onboarding status
  const checkStatus = async () => {
    try {
      const res = await fetch(`/api/account-status?accountId=${accountId}`);
      const data = await res.json();
      if (res.ok) {
        setStatus({ ready: data.readyToProcessPayments, complete: data.onboardingComplete });
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      alert(`Error checking status: ${error.message}`);
    }
  };

  // Function to create a subscription (example)
  const handleSubscribe = async () => {
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId: 'price_...', accountId }), // TODO: Replace with actual subscription price ID
      });
      const data = await res.json();
      if (res.ok) {
        window.location.href = data.url; // Redirect to Stripe checkout
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      alert(`Error subscribing: ${error.message}`);
    }
  };

  // Function to open billing portal
  const handlePortal = async () => {
    try {
      const res = await fetch('/api/billing-portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId }),
      });
      const data = await res.json();
      if (res.ok) {
        window.location.href = data.url; // Redirect to billing portal
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      alert(`Error opening portal: ${error.message}`);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">Onboard to Stripe Connect</h2>

        {/* Step 1: Create Account */}
        {!accountId && (
          <>
            <input
              type="text"
              placeholder="Display Name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full mb-4 p-3 bg-slate-800 border border-slate-700 rounded-xl text-white"
            />
            <input
              type="email"
              placeholder="Contact Email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              className="w-full mb-4 p-3 bg-slate-800 border border-slate-700 rounded-xl text-white"
            />
            <button onClick={createAccount} className="w-full bg-amber-600 hover:bg-amber-500 text-white py-3 rounded-xl">
              Create Connected Account
            </button>
          </>
        )}

        {/* Step 2: Start Onboarding */}
        {accountId && !onboardingUrl && (
          <>
            <p className="mb-4">Account created: {accountId}</p>
            <button onClick={startOnboarding} className="w-full bg-amber-600 hover:bg-amber-500 text-white py-3 rounded-xl mb-4">
              Start Onboarding
            </button>
            <button onClick={checkStatus} className="w-full bg-slate-600 hover:bg-slate-500 text-white py-3 rounded-xl mb-4">
              Check Onboarding Status
            </button>
            <p>Ready to process payments: {status.ready ? 'Yes' : 'No'}</p>
            <p>Onboarding complete: {status.complete ? 'Yes' : 'No'}</p>
          </>
        )}

        {/* Step 3: Complete Onboarding */}
        {onboardingUrl && (
          <a href={onboardingUrl} target="_blank" className="w-full bg-amber-600 hover:bg-amber-500 text-white py-3 rounded-xl text-center block mb-4">
            Complete Onboarding
          </a>
        )}

        {/* Additional Actions if onboarded */}
        {status.complete && (
          <>
            <button onClick={handleSubscribe} className="w-full bg-amber-600 hover:bg-amber-500 text-white py-3 rounded-xl mb-4">
              Subscribe to Premium
            </button>
            <button onClick={handlePortal} className="w-full bg-slate-600 hover:bg-slate-500 text-white py-3 rounded-xl mb-4">
              Manage Billing
            </button>
          </>
        )}

        <button onClick={onClose} className="w-full bg-slate-600 hover:bg-slate-500 text-white py-3 rounded-xl">
          Close
        </button>
      </div>
    </div>
  );
};

export default OnboardModal;
