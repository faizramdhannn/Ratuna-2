'use client';

import { useState, useMemo } from 'react';
import { Search, ShoppingCart } from 'lucide-react';
import OrderCard from './OrderCard';

export default function OrderTab({ masterItems, stocks, categories, currentUser, onMessage }) {
  const [cart, setCart] = useState([]);
  const [cashierName, setCashierName] = useState(currentUser?.fullName || '');
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter active items only
  const activeItems = masterItems.filter(item => item.status === 'active');

  // Filter by category and search
  const filteredItems = useMemo(() => {
    return activeItems.filter(item => {
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const matchesSearch = item.item_name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeItems, selectedCategory, searchQuery]);

  const addToCart = (item) => {
    const stock = stocks.find(s => s.item_name === item.item_name);
    const currentQty = cart.find(c => c.item.item_name === item.item_name)?.quantity || 0;
    
    if (stock && parseInt(stock.quantity) <= currentQty) {
      onMessage('error', `Stock ${item.item_name} tidak mencukupi`);
      return;
    }

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
    
    const stock = stocks.find(s => s.item_name === itemName);
    if (stock && parseInt(stock.quantity) < newQuantity) {
      onMessage('error', `Stock tidak mencukupi. Tersedia: ${stock.quantity}`);
      return;
    }

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
    
    // Generate single order ID for entire transaction
    const orderId = `RTN-${Date.now().toString(36).toUpperCase()}`;
    
    try {
      for (const cartItem of cart) {
        const orderData = {
          order_id: orderId,
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

      onMessage('success', `Checkout berhasil! Order ID: ${orderId}`);
      setCart([]);
      if (window.refreshStocks) window.refreshStocks();
    } catch (error) {
      onMessage('error', error.message);
    }
    setLoading(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Menu Items - Left Side */}
      <div className="lg:col-span-8">
        <div className="bg-white border-2 border-black rounded-lg p-6">
          {/* Header with Search */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-4">Menu</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari menu..."
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-black focus:outline-none"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                selectedCategory === 'all' 
                  ? 'bg-black text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Semua
            </button>
            {categories.map((cat, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedCategory(cat.category_name)}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                  selectedCategory === cat.category_name 
                    ? 'bg-black text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat.category_name}
              </button>
            ))}
          </div>

          {/* Menu Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredItems.length === 0 ? (
              <div className="col-span-full text-center py-12 text-gray-500">
                Tidak ada menu ditemukan
              </div>
            ) : (
              filteredItems.map((item, idx) => {
                const stock = stocks.find(s => s.item_name === item.item_name);
                const stockQty = parseInt(stock?.quantity || 0);
                const isOutOfStock = stockQty === 0;

                return (
                  <div
                    key={idx}
                    onClick={() => !isOutOfStock && addToCart(item)}
                    className={`border-2 rounded-lg p-4 transition-all ${
                      isOutOfStock 
                        ? 'border-gray-200 opacity-50 cursor-not-allowed' 
                        : 'border-gray-200 hover:border-black cursor-pointer hover:shadow-lg'
                    }`}
                  >
                    <h3 className="font-bold text-lg mb-1 line-clamp-2">{item.item_name}</h3>
                    <p className="text-xs text-gray-500 mb-2">{item.category}</p>
                    <p className="text-xl font-bold text-black mb-1">
                      Rp {parseInt(item.hpj || 0).toLocaleString()}
                    </p>
                    <p className={`text-sm ${stockQty === 0 ? 'text-red-600' : stockQty < 10 ? 'text-yellow-600' : 'text-green-600'}`}>
                      Stock: {stockQty}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Cart - Right Side */}
      <div className="lg:col-span-4">
        <div className="bg-white border-2 border-black rounded-lg p-6 sticky top-4">
          <div className="flex items-center space-x-2 mb-4">
            <ShoppingCart className="w-6 h-6" />
            <h2 className="text-2xl font-bold">Keranjang</h2>
          </div>
          
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