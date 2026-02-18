import React, { useEffect, useState } from 'react';

// Component for displaying a storefront of products from a connected account
// Uses clean HTML with basic styling similar to the app's Tailwind theme
const Storefront = ({ accountId }) => {
  // State for products
  const [products, setProducts] = useState([]);

  // Fetch products on component mount
  useEffect(() => {
    if (accountId) {
      fetch(`/api/products?accountId=${accountId}`)
        .then(res => res.json())
        .then(data => setProducts(data.products || []))
        .catch(error => console.error('Error fetching products:', error));
    }
  }, [accountId]);

  // Function to handle purchase
  const buyProduct = async (priceId) => {
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId, accountId }),
      });
      const data = await res.json();
      if (res.ok) {
        window.location.href = data.url; // Redirect to Stripe checkout
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      alert(`Error purchasing product: ${error.message}`);
    }
  };

  return (
    <div className="p-6 bg-slate-950 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-white">Storefront</h1>

      {/* Display products in a grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {products.map(product => (
          <div key={product.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            {/* Product Name */}
            <h3 className="text-lg font-bold text-white mb-2">{product.name}</h3>

            {/* Product Description */}
            <p className="text-slate-400 mb-4">{product.description}</p>

            {/* Product Price */}
            <p className="text-amber-500 font-bold mb-4">
              ${(product.default_price.unit_amount / 100).toFixed(2)}
            </p>

            {/* Buy Button */}
            <button
              onClick={() => buyProduct(product.default_price.id)}
              className="w-full bg-amber-600 hover:bg-amber-500 text-white py-2 rounded-xl"
            >
              Buy Now
            </button>
          </div>
        ))}
      </div>

      {/* Message if no products */}
      {products.length === 0 && (
        <p className="text-slate-400 text-center mt-10">No products available.</p>
      )}
    </div>
  );
};

export default Storefront;
