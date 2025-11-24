'use client';

import { useState } from 'react';

export default function ShoppingListTab({ onMessage }) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    item_shopping: '',
    quantity: '',
    price: ''
  });

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/shopping-list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (data.success) {
        onMessage('success', 'Shopping list berhasil ditambahkan!');
        setForm({ item_shopping: '', quantity: '', price: '' });
      } else {
        onMessage('error', data.error || 'Gagal menambahkan shopping list');
      }
    } catch (error) {
      onMessage('error', 'Terjadi kesalahan');
    }
    setLoading(false);
  };

  return (
    <div className="bg-white border-2 border-black rounded-lg p-8">
      <h2 className="text-2xl font-bold mb-6">Tambah Shopping List</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Item Shopping</label>
          <input
            type="text"
            value={form.item_shopping}
            onChange={(e) => setForm({...form, item_shopping: e.target.value})}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-black focus:outline-none"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Quantity</label>
            <input
              type="number"
              value={form.quantity}
              onChange={(e) => setForm({...form, quantity: e.target.value})}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-black focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Price</label>
            <input
              type="number"
              value={form.price}
              onChange={(e) => setForm({...form, price: e.target.value})}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-black focus:outline-none"
            />
          </div>
        </div>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-black text-white py-4 rounded-lg font-medium hover:bg-gray-800 transition-all disabled:opacity-50"
        >
          {loading ? 'Processing...' : 'Tambah Shopping List'}
        </button>
      </div>
    </div>
  );
}