'use client';

import { useState, useEffect, useMemo } from 'react';
import { Plus, Search, ShoppingCart, Calendar } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import Modal, { ModalFooter } from '@/components/ui/Modal';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function ShoppingListTab({ onMessage }) {
  const [shoppingList, setShoppingList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    item_shopping: '',
    category: '',
    quantity: '',
    unit: '',
    price: ''
  });

  useEffect(() => {
    fetchShoppingList();
  }, []);

  const fetchShoppingList = async () => {
    try {
      const res = await fetch('/api/shopping-list');
      const data = await res.json();
      if (data.success) {
        setShoppingList(data.data);
      }
    } catch (error) {
      onMessage('error', 'Gagal mengambil data shopping list');
    }
  };

  const filteredList = useMemo(() => {
    return shoppingList.filter(item => {
      const matchesSearch = item.item_shopping.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [shoppingList, searchQuery, selectedCategory]);

  const handleOpenModal = () => {
    setFormData({
      item_shopping: '',
      category: '',
      quantity: '',
      unit: '',
      price: ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/shopping-list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (data.success) {
        onMessage('success', data.message);
        setShowModal(false);
        fetchShoppingList();
      } else {
        onMessage('error', data.error);
      }
    } catch (error) {
      onMessage('error', 'Terjadi kesalahan');
    }
    setLoading(false);
  };

  const getCategoryBadge = (category) => {
    const variants = {
      'Karyawan': 'info',
      'Bahan': 'success',
      'Operasional': 'warning',
      'Marketing': 'info',
      'Zakat': 'info'
    };
    return <Badge variant={variants[category] || 'default'}>{category}</Badge>;
  };

  const categories = ['Karyawan', 'Bahan', 'Operasional', 'Marketing', 'Zakat'];

  const totalByCategory = useMemo(() => {
    return categories.reduce((acc, cat) => {
      acc[cat] = filteredList
        .filter(item => item.category === cat)
        .reduce((sum, item) => sum + (parseInt(item.price)), 0);
      return acc;
    }, {});
  }, [filteredList]);

  const grandTotal = Object.values(totalByCategory).reduce((sum, val) => sum + val, 0);

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
        {/* Summary Cards */}
        {categories.map(cat => (
          <Card key={cat}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-shopify-gray-400">{cat}</p>
                {getCategoryBadge(cat)}
              </div>
              <p className="text-2xl font-bold text-white">
                {formatCurrency(totalByCategory[cat])}
              </p>
            </CardContent>
          </Card>
        ))}
        
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-white/80 mb-2">Total Keseluruhan</p>
            <p className="text-2xl font-bold text-white">
              {formatCurrency(grandTotal)}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Shopping List</CardTitle>
              <CardDescription>
                Daftar belanja dan pengeluaran
              </CardDescription>
            </div>
            <Button
              variant="primary"
              icon={Plus}
              onClick={handleOpenModal}
            >
              Tambah Item
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-shopify-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari item..."
                className="input-shopify pl-10"
              />
            </div>
            <Select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              options={[
                { value: 'all', label: 'Semua Kategori' },
                ...categories.map(cat => ({ value: cat, label: cat }))
              ]}
            />
          </div>

          {/* Shopping List Table */}
          <div className="overflow-x-auto">
            <table className="table-shopify">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tanggal</th>
                  <th>Item</th>
                  <th>Kategori</th>
                  <th>Quantity</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {filteredList.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-12 text-shopify-gray-400">
                      <ShoppingCart className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p>Tidak ada data</p>
                    </td>
                  </tr>
                ) : (
                  filteredList.map((item, idx) => (
                    <tr key={idx}>
                      <td className="font-mono text-sm">{item.shopping_id}</td>
                      <td className="text-sm">
                        {formatDate(item.shopping_date, { 
                          day: '2-digit', 
                          month: 'short', 
                          year: 'numeric' 
                        })}
                      </td>
                      <td className="font-medium">{item.item_shopping}</td>
                      <td>{getCategoryBadge(item.category)}</td>
                      <td>{item.quantity} {item.unit}</td>
                      <td>{formatCurrency(item.price)}</td>
                      <td className="font-semibold text-shopify-accent-success">
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Add Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Tambah Item Shopping List"
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nama Item"
            required
            value={formData.item_shopping}
            onChange={(e) => setFormData({...formData, item_shopping: e.target.value})}
            placeholder="Masukkan nama item"
          />

          <Select
            label="Kategori"
            required
            value={formData.category}
            onChange={(e) => setFormData({...formData, category: e.target.value})}
            options={[
              { value: '', label: 'Pilih Kategori' },
              ...categories.map(cat => ({ value: cat, label: cat }))
            ]}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Quantity"
              type="number"
              required
              value={formData.quantity}
              onChange={(e) => setFormData({...formData, quantity: e.target.value})}
              placeholder="0"
              min="1"
            />
            <Input
              label="Unit"
              required
              value={formData.unit}
              onChange={(e) => setFormData({...formData, unit: e.target.value})}
              placeholder="pcs, kg, liter, dll"
            />
          </div>

          <Input
            label="Total"
            type="number"
            required
            value={formData.price}
            onChange={(e) => setFormData({...formData, price: e.target.value})}
            placeholder="0"
            min="0"
          />

          {formData.quantity && formData.price && (
            <div className="p-4 bg-shopify-darker rounded-shopify border border-shopify-gray-800">
              <p className="text-sm text-shopify-gray-400 mb-1">Total Biaya</p>
              <p className="text-2xl font-bold text-white">
                {formatCurrency(parseInt(formData.price || 0))}
              </p>
            </div>
          )}

          <ModalFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowModal(false)}
              disabled={loading}
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={loading}
            >
              Simpan
            </Button>
          </ModalFooter>
        </form>
      </Modal>
    </>
  );
}