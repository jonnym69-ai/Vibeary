import React, { useState } from 'react';

const SubscriptionManager = ({ isPremium, onUpgrade, onCancel }) => {
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const plans = [
    {
      id: 'monthly',
      name: 'Monthly',
      price: '$9.99',
      period: '/month',
      features: [
        '🤖 Unlimited AI recommendations',
        '🔊 Premium voice reading',
        '📚 Unlimited library storage',
        '🎯 Personalized matching',
        '📱 Mobile-optimized experience'
      ],
      popular: true
    },
    {
      id: 'yearly',
      name: 'Yearly',
      price: '$99.99',
      period: '/year',
      savings: 'Save 17%',
      features: [
        '🤖 Unlimited AI recommendations',
        '🔊 Premium voice reading',
        '📚 Unlimited library storage',
        '🎯 Personalized matching',
        '📱 Mobile-optimized experience',
        '🎁 2 months free'
      ],
      popular: false
    }
  ];

  const handleCancel = () => {
    setShowCancelConfirm(true);
  };

  const confirmCancel = () => {
    // In real app, this would call your backend to cancel subscription
    onCancel();
    setShowCancelConfirm(false);
  };

  if (isPremium) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">💎 Premium Active</h3>
          <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
            Active
          </span>
        </div>
        
        <div className="space-y-4">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-700">
            <h4 className="text-white font-medium mb-2">Current Plan</h4>
            <p className="text-amber-400 text-lg font-bold">Premium Monthly - $9.99/month</p>
            <p className="text-slate-400 text-sm">Next billing date: March 12, 2026</p>
          </div>
          
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-700">
            <h4 className="text-white font-medium mb-2">Usage This Month</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">AI Recommendations</span>
                <span className="text-white">47 / unlimited</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Voice Reading</span>
                <span className="text-white">2.3 hours / unlimited</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Library Storage</span>
                <span className="text-white">23 books / unlimited</span>
              </div>
            </div>
          </div>
        </div>
        
        <button
          onClick={handleCancel}
          className="w-full bg-rose-600 hover:bg-rose-500 text-white font-medium py-3 px-4 rounded-lg transition-colors"
        >
          Cancel Subscription
        </button>
        
        {showCancelConfirm && (
          <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-sm z-50 flex items-center justify-center p-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md mx-auto">
              <h3 className="text-xl font-bold text-white mb-4">Cancel Premium?</h3>
              <p className="text-slate-300 mb-6">
                Are you sure you want to cancel your Premium subscription? You'll lose access to:
              </p>
              <ul className="space-y-2 text-slate-400 text-sm mb-6">
                <li>🤖 Unlimited AI recommendations</li>
                <li>🔊 Premium voice reading</li>
                <li>📚 Unlimited library storage</li>
                <li>🎯 Personalized matching</li>
              </ul>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowCancelConfirm(false)}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                >
                  Keep Premium
                </button>
                <button
                  onClick={confirmCancel}
                  className="flex-1 bg-rose-600 hover:bg-rose-500 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                >
                  Yes, Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold text-white mb-6">💎 Choose Your Premium Plan</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {plans.map(plan => (
          <div 
            key={plan.id}
            className={`bg-slate-900 border rounded-2xl p-6 relative ${
              plan.popular ? 'border-amber-500' : 'border-slate-800'
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3 -right-3 bg-amber-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                MOST POPULAR
              </div>
            )}
            
            <div className="text-center mb-4">
              <h4 className="text-xl font-bold text-white mb-2">{plan.name}</h4>
              <div className="flex items-center justify-center space-x-2 mb-2">
                <span className="text-3xl font-bold text-amber-400">{plan.price}</span>
                <span className="text-slate-400">{plan.period}</span>
              </div>
              {plan.savings && (
                <div className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-sm font-medium">
                  {plan.savings}
                </div>
              )}
            </div>
            
            <ul className="space-y-3 mb-6">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-start text-sm text-slate-300">
                  <span className="mr-2">{feature}</span>
                </li>
              ))}
            </ul>
            
            <button
              onClick={() => onUpgrade(plan.id)}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                plan.popular 
                  ? 'bg-amber-600 hover:bg-amber-500 text-white' 
                  : 'bg-slate-700 hover:bg-slate-600 text-white'
              }`}
            >
              {plan.popular ? 'Start Premium Trial' : 'Choose Plan'}
            </button>
          </div>
        ))}
      </div>
      
      <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 mt-6">
        <h4 className="text-lg font-bold text-white mb-4">🔒 Secure Payment</h4>
        <div className="space-y-3 text-sm text-slate-400">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
            <span>SSL Encrypted Payment</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-500 rounded-full mr-2"></div>
            <span>Cancel Anytime</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-purple-500 rounded-full mr-2"></div>
            <span>30-Day Money Back</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionManager;
