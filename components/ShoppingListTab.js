'use client';

import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';

export default function ShoppingListTab({ onMessage }) {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([{
    item_shopping: '',
    quantity: '',
    unit: '',
    price: ''
  }]);

  const addItem = () => {
    setItems([...items, {
      item_shopping: '',
      quantity: '',
      unit: '',
      price: ''
    }]);
  };

  const removeItem = (index) => {
    if (items.length === 1) {
      onMessage('error', 'Minimal 1 item harus ada');
      return;
    }
    setItems(items.filter((_, idx) => idx !== index));
  };

  const updateItem = (index, field, value) => {
    setItems(items.map((item, idx) => 
      idx === index ? { ...item, [field]: value } : item
    ));
  };

  const handleSubmit = async () => {
    // Validate all items
    const validItems = items.filter(item => 
      item.item_shopping && item.quantity && item.unit && item.price
    );

    if (validItems.length === 0) {
      onMessage('error', 'Semua field harus diisi untuk minimal 1 item');
      return;
    }

    if (validItems.length < items.length) {
      onMessage('error', 'Ada item yang belum lengkap. Hapus atau lengkapi semua item.');
      return;
    }

    setLoading(true);
    
    // Generate single shopping ID for entire batch
    const shoppingId = `RTN-SHOP-${Date.now().toString(36).toUpperCase()}`;
    
    try {
      for (const item of validItems) {
        const res = await fetch('/api/shopping-list', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            shopping_id: shoppingId,
            ...item
          })
        });
        
        const data = await res.json();
        if (!data.success) {
          throw new Error(data.error || 'Gagal menambahkan shopping list');
        }
      }

      onMessage('success', `${validItems.length} item shopping list berhasil ditambahkan!`);
      setItems([{
        item_shopping: '',
        quantity: '',
        unit: '',
        price: ''
      }]);
    } catch (error) {
      onMessage('error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border-2 border-black rounded-lg p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Shopping List</h2>
        <button
          onClick={addItem}
          className="flex items-center space-x-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Item</span>
        </button>
      </div>

      <div className="space-y-3 mb-6">
        {/* Header */}
        <div className="grid grid-cols-12 gap-3 px-2 text-sm font-medium text-gray-600">
          <div className="col-span-4">Nama Item</div>
          <div className="col-span-2">Quantity</div>
          <div className="col-span-2">Unit</div>
          <div className="col-span-3">Harga</div>
          <div className="col-span-1"></div>
        </div>

        {/* Items */}
        {items.map((item, index) => (
          <div key={index} className="grid grid-cols-12 gap-3 items-center">
            <div className="col-span-4">
              <input
                type="text"
                value={item.item_shopping}
                onChange={(e) => updateItem(index, 'item_shopping', e.target.value)}
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-black focus:outline-none"
                placeholder="Nama item"
              />
            </div>
            <div className="col-span-2">
              <input
                type="number"
                value={item.quantity}
                onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-black focus:outline-none"
                placeholder="Qty"
                min="1"
              />
            </div>
            <div className="col-span-2">
              <input
                type="text"
                value={item.unit}
                onChange={(e) => updateItem(index, 'unit', e.target.value)}
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-black focus:outline-none"
                placeholder="kg/pcs/box"
              />
            </div>
            <div className="col-span-3">
              <input
                type="number"
                value={item.price}
                onChange={(e) => updateItem(index, 'price', e.target.value)}
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-black focus:outline-none"
                placeholder="Harga"
                min="0"
              />
            </div>
            <div className="col-span-1 flex justify-center">
              <button
                onClick={() => removeItem(index)}
                disabled={items.length === 1}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="border-t-2 border-gray-200 pt-4 mb-4">
        <div className="flex justify-between items-center text-lg">
          <span className="font-medium">Total Items:</span>
          <span className="font-bold">{items.length}</span>
        </div>
        <div className="flex justify-between items-center text-lg">
          <span className="font-medium">Total Estimasi:</span>
          <span className="font-bold">
            Rp {items.reduce((sum, item) => {
              const qty = parseFloat(item.quantity) || 0;
              const price = parseFloat(item.price) || 0;
              return sum + (qty * price);
            }, 0).toLocaleString()}
          </span>
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full bg-black text-white py-4 rounded-lg font-bold hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Processing...' : 'Submit Shopping List'}
      </button>
    </div>
  );
}