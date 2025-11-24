'use client';

import { useState } from 'react';
import { Eye, EyeOff, Edit2, Trash2 } from 'lucide-react';

export default function MasterItemTab({ masterItems, categories, onRefresh, onMessage }) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    item_name: '',
    category: '',
    hpp: '',
    operasional: '',
    worker: '',
    marketing: '',
    hpj: '',
    net_sales: '',
    status: 'draft' // draft or active
  });

  const handleSubmit = async () => {
    if (!form.item_name || !form.category || !form.hpp || !form.hpj) {
      onMessage('error', 'Item name, category, HPP, dan HPJ harus diisi');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/master-items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (data.success) {
        onMessage('success', 'Master item berhasil ditambahkan!');
        setForm({ 
          item_name: '', 
          category: '',
          hpp: '', 
          operasional: '', 
          worker: '', 
          marketing: '', 
          hpj: '', 
          net_sales: '',
          status: 'draft'
        });
        onRefresh();
      } else {
        onMessage('error', data.error || 'Gagal menambahkan master item');
      }
    } catch (error) {
      onMessage('error', 'Terjadi kesalahan');
    }
    setLoading(false);
  };

  const toggleStatus = async (item) => {
    const newStatus = item.status === 'active' ? 'draft' : 'active';
    
    try {
      const res = await fetch('/api/master-items', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...item,
          status: newStatus
        })
      });
      const data = await res.json();
      if (data.success) {
        onMessage('success', `Item ${newStatus === 'active' ? 'diaktifkan' : 'dijadikan draft'}`);
        onRefresh();
      } else {
        onMessage('error', data.error || 'Gagal mengupdate status');
      }
    } catch (error) {
      onMessage('error', 'Terjadi kesalahan');
    }
  };

  const deleteItem = async (item) => {
    if (!confirm(`Hapus item "${item.item_name}"?`)) return;

    try {
      const res = await fetch(`/api/master-items?rowIndex=${item._rowIndex}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        onMessage('success', 'Item berhasil dihapus');
        onRefresh();
      } else {
        onMessage('error', data.error || 'Gagal menghapus item');
      }
    } catch (error) {
      onMessage('error', 'Terjadi kesalahan');
    }
  };

  return (
    <div className="space-y-6">
      {/* Add Item Form */}
      <div className="bg-white border-2 border-black rounded-lg p-8">
        <h2 className="text-2xl font-bold mb-6">Tambah Master Item</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Item Name *</label>
              <input
                type="text"
                value={form.item_name}
                onChange={(e) => setForm({...form, item_name: e.target.value})}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-black focus:outline-none"
                placeholder="Nama item"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Category *</label>
              <select
                value={form.category}
                onChange={(e) => setForm({...form, category: e.target.value})}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-black focus:outline-none"
              >
                <option value="">-- Pilih Category --</option>
                {categories.map((cat, idx) => (
                  <option key={idx} value={cat.category_name}>
                    {cat.category_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">HPP *</label>
              <input
                type="number"
                value={form.hpp}
                onChange={(e) => setForm({...form, hpp: e.target.value})}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-black focus:outline-none"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Operasional</label>
              <input
                type="number"
                value={form.operasional}
                onChange={(e) => setForm({...form, operasional: e.target.value})}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-black focus:outline-none"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Worker</label>
              <input
                type="number"
                value={form.worker}
                onChange={(e) => setForm({...form, worker: e.target.value})}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-black focus:outline-none"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Marketing</label>
              <input
                type="number"
                value={form.marketing}
                onChange={(e) => setForm({...form, marketing: e.target.value})}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-black focus:outline-none"
                placeholder="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">HPJ *</label>
              <input
                type="number"
                value={form.hpj}
                onChange={(e) => setForm({...form, hpj: e.target.value})}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-black focus:outline-none"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Net Sales</label>
              <input
                type="number"
                value={form.net_sales}
                onChange={(e) => setForm({...form, net_sales: e.target.value})}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-black focus:outline-none"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({...form, status: e.target.value})}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-black focus:outline-none"
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-black text-white py-4 rounded-lg font-medium hover:bg-gray-800 transition-all disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Tambah Master Item'}
          </button>
        </div>
      </div>

      {/* Items List */}
      <div className="bg-white border-2 border-black rounded-lg p-8">
        <h3 className="text-xl font-bold mb-4">Daftar Master Items</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-black">
                <th className="text-left py-3 px-4 font-medium">Item Name</th>
                <th className="text-left py-3 px-4 font-medium">Category</th>
                <th className="text-left py-3 px-4 font-medium">HPP</th>
                <th className="text-left py-3 px-4 font-medium">HPJ</th>
                <th className="text-left py-3 px-4 font-medium">Net Sales</th>
                <th className="text-center py-3 px-4 font-medium">Status</th>
                <th className="text-center py-3 px-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {masterItems.map((item, idx) => (
                <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">{item.item_name}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 bg-gray-100 rounded text-sm">
                      {item.category}
                    </span>
                  </td>
                  <td className="py-3 px-4">Rp {parseInt(item.hpp || 0).toLocaleString()}</td>
                  <td className="py-3 px-4">Rp {parseInt(item.hpj || 0).toLocaleString()}</td>
                  <td className="py-3 px-4">Rp {parseInt(item.net_sales || 0).toLocaleString()}</td>
                  <td className="py-3 px-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      item.status === 'active' 
                        ? 'bg-green-200 text-green-800' 
                        : 'bg-yellow-200 text-yellow-800'
                    }`}>
                      {item.status?.toUpperCase() || 'DRAFT'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex justify-center space-x-2">
                      <button
                        onClick={() => toggleStatus(item)}
                        className={`p-2 rounded-lg transition-colors ${
                          item.status === 'active'
                            ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
                            : 'bg-green-100 text-green-600 hover:bg-green-200'
                        }`}
                        title={item.status === 'active' ? 'Set Draft' : 'Set Active'}
                      >
                        {item.status === 'active' ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => deleteItem(item)}
                        className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}