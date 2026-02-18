import React, { useState } from 'react';

// Modal component for creating products on a connected account
// Uses clean HTML with basic styling similar to the app's Tailwind theme
const ProductForm = ({ accountId, onClose }) => {
  // State for product details
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');

  // Function to create a product
  const createProduct = async () => {
    try {
      const res = await fetch('/api/create-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          priceInCents: parseInt(price) * 100, // Convert dollars to cents
          currency: 'usd',
          accountId,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        alert('Product created successfully!');
        onClose(); // Close the modal
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      alert(`Error creating product: ${error.message}`);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">Create Product</h2>

        {/* Product Name Input */}
        <input
          type="text"
          placeholder="Product Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full mb-4 p-3 bg-slate-800 border border-slate-700 rounded-xl text-white"
        />

        {/* Product Description Input */}
        <textarea
          placeholder="Product Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full mb-4 p-3 bg-slate-800 border border-slate-700 rounded-xl text-white"
          rows="3"
        />

        {/* Product Price Input */}
        <input
          type="number"
          placeholder="Price in USD"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="w-full mb-4 p-3 bg-slate-800 border border-slate-700 rounded-xl text-white"
        />

        {/* Create Product Button */}
        <button onClick={createProduct} className="w-full bg-amber-600 hover:bg-amber-500 text-white py-3 rounded-xl">
          Create Product
        </button>

        {/* Close Button */}
        <button onClick={onClose} className="w-full bg-slate-600 hover:bg-slate-500 text-white py-3 rounded-xl mt-4">
          Close
        </button>
      </div>
    </div>
  );
};

export default ProductForm;
