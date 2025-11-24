'use client';

import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

export default function StockTab({ stocks, currentUser, onRefresh, onMessage }) {
  const [loading, setLoading] = useState({});

  const handleStockChange = async (stock, change) => {
    const newQuantity = parseInt(stock.quantity || 0) + change;
    
    if (newQuantity < 0) {
      onMessage('error', 'Stock tidak boleh negatif');
      return;
    }

    setLoading(prev => ({ ...prev, [stock.item_name]: true }));
    
    try {
      const res = await fetch('/api/stock', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          item_name: stock.item_name,
          quantity: newQuantity,
          rowIndex: stock._rowIndex
        })
      });
      
      const data = await res.json();
      if (data.success) {
        onMessage('success', `Stock ${stock.item_name} berhasil diupdate!`);
        onRefresh();
      } else {
        onMessage('error', data.error || 'Gagal mengupdate stock');
      }
    } catch (error) {
      onMessage('error', 'Terjadi kesalahan');
    } finally {
      setLoading(prev => ({ ...prev, [stock.item_name]: false }));
    }
  };

  const isAdmin = currentUser?.role === 'superadmin' || currentUser?.role === 'admin';

  return (
    <div className="bg-white border-2 border-black rounded-lg p-8">
      <h2 className="text-2xl font-bold mb-6">Stock Management</h2>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-black">
              <th className="text-left py-3 px-4 font-medium">Item Name</th>
              <th className="text-center py-3 px-4 font-medium">Quantity</th>
              {isAdmin && <th className="text-center py-3 px-4 font-medium">Actions</th>}
              <th className="text-left py-3 px-4 font-medium">Last Updated</th>
              <th className="text-left py-3 px-4 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {stocks.map((stock, idx) => {
              const qty = parseInt(stock.quantity || 0);
              const status = qty === 0 ? 'Out of Stock' : qty < 10 ? 'Low Stock' : 'Available';
              const statusColor = qty === 0 ? 'text-red-600' : qty < 10 ? 'text-yellow-600' : 'text-green-600';
              const isLoadingThis = loading[stock.item_name];
              
              return (
                <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">{stock.item_name}</td>
                  <td className="py-3 px-4">
                    <div className="flex justify-center items-center">
                      <span className="text-xl font-bold">{qty}</span>
                    </div>
                  </td>
                  {isAdmin && (
                    <td className="py-3 px-4">
                      <div className="flex justify-center items-center space-x-2">
                        <button
                          onClick={() => handleStockChange(stock, -1)}
                          disabled={isLoadingThis || qty === 0}
                          className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Kurangi 1"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleStockChange(stock, -10)}
                          disabled={isLoadingThis || qty < 10}
                          className="px-3 py-2 text-sm bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Kurangi 10"
                        >
                          -10
                        </button>
                        <button
                          onClick={() => handleStockChange(stock, 10)}
                          disabled={isLoadingThis}
                          className="px-3 py-2 text-sm bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Tambah 10"
                        >
                          +10
                        </button>
                        <button
                          onClick={() => handleStockChange(stock, 1)}
                          disabled={isLoadingThis}
                          className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Tambah 1"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  )}
                  <td className="py-3 px-4 text-sm">
                    {stock.updated_at ? new Date(stock.updated_at).toLocaleString('id-ID') : '-'}
                  </td>
                  <td className={`py-3 px-4 font-medium ${statusColor}`}>{status}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}