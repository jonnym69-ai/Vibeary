import React, { useState } from 'react';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const StripePayment = ({ clientSecret, onSuccess, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setProcessing(true);
    setError(null);

    if (!stripe || !elements) {
      return;
    }

    const cardElement = elements.getElement(CardElement);
    const { error: paymentError, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: cardElement,
    });

    if (paymentError) {
      setError(paymentError.message);
      setProcessing(false);
      return;
    }

    const { error: confirmError } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: paymentMethod.id,
    });

    if (confirmError) {
      setError(confirmError.message);
      setProcessing(false);
    } else {
      setProcessing(false);
      onSuccess();
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
      <h3 className="text-xl font-bold text-white mb-4">💳 Complete Your Premium Upgrade</h3>
      
      <div className="mb-6">
        <p className="text-slate-300 mb-2">Unlock all premium features:</p>
        <ul className="space-y-2 text-sm text-slate-400">
          <li>🤖 Unlimited AI recommendations</li>
          <li>🔊 Premium voice reading</li>
          <li>📚 Unlimited library storage</li>
          <li>🎯 Personalized matching</li>
          <li>📱 Mobile-optimized experience</li>
        </ul>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-700">
          <CardElement 
            className="bg-slate-800 text-white border-slate-600 rounded-lg p-3"
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#ffffff',
                  '::placeholder': {
                    color: '#94a3b8',
                  },
                },
              },
            }}
          />
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-400 p-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="flex space-x-3">
          <button
            type="submit"
            disabled={processing}
            className="flex-1 bg-amber-600 hover:bg-amber-500 disabled:bg-slate-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            {processing ? (
              <span className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processing...
              </span>
            ) : (
              `💎 Pay $9.99/month`
            )}
          </button>
          
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default StripePayment;
