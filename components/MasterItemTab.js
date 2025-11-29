'use client';

import { useState } from 'react';
import { Eye, EyeOff, Edit2, Trash2, X, Save } from 'lucide-react';

export default function MasterItemTab({ masterItems, categories, onRefresh, onMessage }) {
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  
  const [form, setForm] = useState({
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

  const openEditModal = (item) => {
    setEditingItem(item);
    setForm({
      item_name: item.item_name,
      category: item.category,
      hpp: item.hpp || '',
      operasional: item.operasional || '',
      worker: item.worker || '',
      marketing: item.marketing || '',
      hpj: item.hpj || '',
      net_sales: item.net_sales || '',
      status: item.status || 'draft'
    });
    setIsEditing(true);
  };

  const closeEditModal = () => {
    setIsEditing(false);
    setEditingItem(null);
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
  };

  const handleUpdate = async () => {
    if (!form.item_name || !form.category || !form.hpp || !form.hpj) {
      onMessage('error', 'Item name, category, HPP, dan HPJ harus diisi');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/master-items', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          rowIndex: editingItem._rowIndex
        })
      });
      const data = await res.json();
      if (data.success) {
        onMessage('success', 'Master item berhasil diupdate!');
        closeEditModal();
        onRefresh();
      } else {
        onMessage('error', data.error || 'Gagal mengupdate master item');
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
                disabled={isEditing}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Category *</label>
              <select
                value={form.category}
                onChange={(e) => setForm({...form, category: e.target.value})}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-black focus:outline-none"
                disabled={isEditing}
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
                type="text"
                inputMode="numeric"
                value={form.hpp}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, '');
                  setForm({...form, hpp: value});
                }}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-black focus:outline-none"
                placeholder="0"
                disabled={isEditing}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Operasional</label>
              <input
                type="text"
                inputMode="numeric"
                value={form.operasional}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, '');
                  setForm({...form, operasional: value});
                }}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-black focus:outline-none"
                placeholder="0"
                disabled={isEditing}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Worker</label>
              <input
                type="text"
                inputMode="numeric"
                value={form.worker}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, '');
                  setForm({...form, worker: value});
                }}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-black focus:outline-none"
                placeholder="0"
                disabled={isEditing}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Marketing</label>
              <input
                type="text"
                inputMode="numeric"
                value={form.marketing}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, '');
                  setForm({...form, marketing: value});
                }}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-black focus:outline-none"
                placeholder="0"
                disabled={isEditing}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">HPJ *</label>
              <input
                type="text"
                inputMode="numeric"
                value={form.hpj}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, '');
                  setForm({...form, hpj: value});
                }}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-black focus:outline-none"
                placeholder="0"
                disabled={isEditing}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Net Sales</label>
              <input
                type="text"
                inputMode="numeric"
                value={form.net_sales}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, '');
                  setForm({...form, net_sales: value});
                }}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-black focus:outline-none"
                placeholder="0"
                disabled={isEditing}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({...form, status: e.target.value})}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-black focus:outline-none"
                disabled={isEditing}
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading || isEditing}
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
                        onClick={() => openEditModal(item)}
                        className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
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

      {/* Edit Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold">Edit Master Item</h3>
              <button
                onClick={closeEditModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

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

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={closeEditModal}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg font-medium hover:bg-gray-100 transition-all"
                >
                  Batal
                </button>
                <button
                  onClick={handleUpdate}
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-black text-white rounded-lg font-bold hover:bg-gray-800 transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  <Save className="w-5 h-5" />
                  <span>{loading ? 'Processing...' : 'Simpan Perubahan'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}