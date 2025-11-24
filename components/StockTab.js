'use client';

import { useState } from 'react';

export default function StockTab({ stocks, currentUser, onRefresh, onMessage }) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    item_name: '',
    quantity: '',
    rowIndex: null
  });

  const handleStockUpdate = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/stock', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (data.success) {
        onMessage('success', 'Stock berhasil diupdate!');
        setForm({ item_name: '', quantity: '', rowIndex: null });
        onRefresh();
      } else {
        onMessage('error', data.error || 'Gagal mengupdate stock');
      }
    } catch (error) {
      onMessage('error', 'Terjadi kesalahan');
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Stock Update Form */}
      {(currentUser?.role === 'superadmin' || currentUser?.role === 'admin') && (
        <div className="bg-white border-2 border-black rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-6">Update Stock</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Pilih Item</label>
              <select
                value={form.item_name}
                onChange={(e) => {
                  const selectedStock = stocks.find(s => s.item_name === e.target.value);
                  setForm({
                    item_name: e.target.value,
                    quantity: selectedStock ? selectedStock.quantity : '',
                    rowIndex: selectedStock ? selectedStock._rowIndex : null
                  });
                }}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-black focus:outline-none"
              >
                <option value="">-- Pilih Item --</option>
                {stocks.map((stock, idx) => (
                  <option key={idx} value={stock.item_name}>
                    {stock.item_name} (Stock: {stock.quantity})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Quantity Baru</label>
              <input
                type="number"
                value={form.quantity}
                onChange={(e) => setForm({...form, quantity: e.target.value})}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-black focus:outline-none"
                placeholder="Masukkan quantity"
                min="0"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleStockUpdate}
                disabled={loading || !form.item_name || form.quantity === ''}
                className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : 'Update Stock'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stock Overview Table */}
      <div className="bg-white border-2 border-black rounded-lg p-8">
        <h2 className="text-2xl font-bold mb-6">Stock Overview</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-black">
                <th className="text-left py-3 px-4 font-medium">Item Name</th>
                <th className="text-left py-3 px-4 font-medium">Quantity</th>
                <th className="text-left py-3 px-4 font-medium">Last Updated</th>
                <th className="text-left py-3 px-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {stocks.map((stock, idx) => {
                const qty = parseInt(stock.quantity || 0);
                const status = qty === 0 ? 'Out of Stock' : qty < 10 ? 'Low Stock' : 'Available';
                const statusColor = qty === 0 ? 'text-red-600' : qty < 10 ? 'text-yellow-600' : 'text-green-600';
                
                return (
                  <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{stock.item_name}</td>
                    <td className="py-3 px-4">{qty}</td>
                    <td className="py-3 px-4">{stock.updated_at ? new Date(stock.updated_at).toLocaleString() : '-'}</td>
                    <td className={`py-3 px-4 font-medium ${statusColor}`}>{status}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}