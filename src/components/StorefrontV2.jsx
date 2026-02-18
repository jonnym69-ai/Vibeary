import { useState, useEffect } from 'react';

// Component for displaying a storefront of products from a connected Stripe account
// Shows products in a clean grid layout with purchase buttons
// Uses simple styling consistent with the app
export default function StorefrontV2({ accountId }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load products when accountId changes
  useEffect(() => {
    if (accountId) {
      loadProducts();
    }
  }, [accountId]);

  // Fetch products from the connected account
  const loadProducts = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/v2/list-products?accountId=${accountId}`);
      const data = await response.json();

      if (data.products) {
        setProducts(data.products);
      } else {
        setError('Failed to load products');
      }
    } catch (err) {
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  // Handle product purchase
  const handlePurchase = async (product) => {
    if (!product.price) {
      setError('Product has no price configured');
      return;
    }

    setError(null);

    try {
      const response = await fetch('/api/v2/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountId,
          priceId: product.price.id,
          quantity: 1,
        }),
      });

      const data = await response.json();

      if (data.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else {
        setError(data.error || 'Failed to create checkout session');
      }
    } catch (err) {
      setError('Failed to initiate purchase');
    }
  };

  if (!accountId) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No connected account selected</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-6">Storefront</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">
          <p className="text-gray-500">Loading products...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No products available</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div key={product.id} className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
              {/* Product Image Placeholder */}
              <div className="h-48 bg-gray-100 flex items-center justify-center">
                {product.images && product.images.length > 0 ? (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-gray-400 text-sm">No Image</div>
                )}
              </div>

              {/* Product Details */}
              <div className="p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2">{product.name}</h3>

                {product.description && (
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {product.description}
                  </p>
                )}

                <div className="flex items-center justify-between mb-4">
                  {product.price ? (
                    <span className="text-xl font-bold text-gray-900">
                      {product.price.formatted}
                    </span>
                  ) : (
                    <span className="text-gray-500">Price not set</span>
                  )}
                </div>

                <button
                  onClick={() => handlePurchase(product)}
                  disabled={!product.price}
                  className="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {product.price ? 'Buy Now' : 'Not Available'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
