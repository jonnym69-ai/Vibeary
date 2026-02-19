import { useState } from 'react';
import ConnectOnboard from './ConnectOnboard';
import ProductCreateV2 from './ProductCreateV2';
import StorefrontV2 from './StorefrontV2';
import SubscriptionV2 from './SubscriptionV2';

// Dashboard component that combines all Stripe Connect V2 features
// Provides a tabbed interface for onboarding, product management, storefront, and subscriptions
// Uses clean, simple styling
export default function ConnectDashboard() {
  const [activeTab, setActiveTab] = useState('onboard');
  const [accountId, setAccountId] = useState(null);

  // Handle account creation/update
  const handleAccountUpdate = (newAccountId) => {
    setAccountId(newAccountId);
  };

  // Handle new product creation
  const handleProductCreated = (product) => {
    // Switch to storefront to see the new product
    setActiveTab('storefront');
  };

  const tabs = [
    { id: 'onboard', label: 'Onboarding', component: ConnectOnboard },
    { id: 'products', label: 'Create Product', component: ProductCreateV2 },
    { id: 'storefront', label: 'Storefront', component: StorefrontV2 },
    { id: 'subscription', label: 'Subscription', component: SubscriptionV2 },
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Stripe Connect V2 Dashboard</h1>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 mb-6">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === tab.id
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div>
        {ActiveComponent && (
          <ActiveComponent
            accountId={accountId}
            onAccountUpdate={handleAccountUpdate}
            onProductCreated={handleProductCreated}
            subscriptionPriceId={import.meta.env.VITE_SUBSCRIPTION_PRICE_ID || 'price_placeholder'} // TODO: Set actual price ID
          />
        )}
      </div>

      {/* Account Info */}
      {accountId && (
        <div className="mt-6 p-4 bg-gray-100 rounded-lg">
          <h3 className="font-medium mb-2">Connected Account</h3>
          <p className="text-sm text-gray-600">Account ID: {accountId}</p>
        </div>
      )}
    </div>
  );
}
