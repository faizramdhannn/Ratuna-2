'use client';

import { useState } from 'react';
import OrderCard from './OrderCard';

export default function OrderTab({ masterItems, stocks, currentUser, onMessage }) {
  const [cart, setCart] = useState([]);
  const [cashierName, setCashierName] = useState(currentUser?.fullName || '');
  const [loading, setLoading] = useState(false);

  const addToCart = (item) => {
    const existingItem = cart.find(c => c.item.item_name === item.item_name);
    if (existingItem) {
      setCart(cart.map(c => 
        c.item.item_name === item.item_name 
          ? { ...c, quantity: c.quantity + 1 }
          : c
      ));
    } else {
      setCart([...cart, { item, quantity: 1 }]);
    }
    onMessage('success', `${item.item_name} ditambahkan ke keranjang`);
  };

  const updateQuantity = (itemName, newQuantity) => {
    if (newQuantity < 1) return;
    setCart(cart.map(c => 
      c.item.item_name === itemName 
        ? { ...c, quantity: newQuantity }
        : c
    ));
  };

  const removeFromCart = (itemName) => {
    setCart(cart.filter(c => c.item.item_name !== itemName));
    onMessage('success', 'Item dihapus dari keranjang');
  };

  const calculateTotal = () => {
    return cart.reduce((sum, c) => sum + (c.item.hpj * c.quantity), 0);
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      onMessage('error', 'Keranjang masih kosong');
      return;
    }

    if (!cashierName) {
      onMessage('error', 'Nama kasir harus diisi');
      return;
    }

    setLoading(true);
    try {
      for (const cartItem of cart) {
        const orderData = {
          item_name: cartItem.item.item_name,
          quantity_item: cartItem.quantity,
          total_amount: cartItem.item.hpj * cartItem.quantity,
          cashier_name: cashierName
        };

        const res = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderData)
        });

        const data = await res.json();
        if (!data.success) {
          throw new Error(data.error || 'Gagal membuat order');
        }
      }

      onMessage('success', 'Checkout berhasil!');
      setCart([]);
      if (window.refreshStocks) window.refreshStocks();
    } catch (error) {
      onMessage('error', error.message);
    }
    setLoading(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <div className="bg-white border-2 border-black rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-6">Pilih Item</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {masterItems.map((item, idx) => (
              <div
                key={idx}
                onClick={() => addToCart(item)}
                className="border-2 border-gray-200 rounded-lg p-4 hover:border-black cursor-pointer transition-all hover:shadow-lg"
              >
                <h3 className="font-bold text-lg mb-2">{item.item_name}</h3>
                <p className="text-2xl font-bold text-black">
                  Rp {parseInt(item.hpj || 0).toLocaleString()}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Stock: {stocks.find(s => s.item_name === item.item_name)?.quantity || 0}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="lg:col-span-1">
        <div className="bg-white border-2 border-black rounded-lg p-6 sticky top-4">
          <h2 className="text-2xl font-bold mb-4">Keranjang</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Nama Kasir</label>
            <input
              type="text"
              value={cashierName}
              onChange={(e) => setCashierName(e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-black focus:outline-none"
              placeholder="Nama kasir"
            />
          </div>

          <div className="space-y-3 mb-6 max-h-96 overflow-y-auto">
            {cart.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Keranjang kosong</p>
            ) : (
              cart.map((cartItem, idx) => (
                <OrderCard
                  key={idx}
                  item={cartItem.item}
                  quantity={cartItem.quantity}
                  onIncrease={() => updateQuantity(cartItem.item.item_name, cartItem.quantity + 1)}
                  onDecrease={() => updateQuantity(cartItem.item.item_name, cartItem.quantity - 1)}
                  onRemove={() => removeFromCart(cartItem.item.item_name)}
                />
              ))
            )}
          </div>

          <div className="border-t-2 border-gray-200 pt-4 mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-lg font-medium">Total Item:</span>
              <span className="text-lg font-bold">{cart.reduce((sum, c) => sum + c.quantity, 0)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xl font-bold">Total:</span>
              <span className="text-2xl font-bold">Rp {calculateTotal().toLocaleString()}</span>
            </div>
          </div>

          <button
            onClick={handleCheckout}
            disabled={loading || cart.length === 0}
            className="w-full bg-black text-white py-4 rounded-lg font-bold hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : 'Checkout'}
          </button>
        </div>
      </div>
    </div>
  );
}