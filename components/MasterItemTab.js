'use client';

import { useState } from 'react';

export default function MasterItemTab({ masterItems, onRefresh, onMessage }) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    item_name: '',
    hpp: '',
    operasional: '',
    worker: '',
    marketing: '',
    hpj: '',
    net_sales: ''
  });

  const handleSubmit = async () => {
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
        setForm({ item_name: '', hpp: '', operasional: '', worker: '', marketing: '', hpj: '', net_sales: '' });
        onRefresh();
      } else {
        onMessage('error', data.error || 'Gagal menambahkan master item');
      }
    } catch (error) {
      onMessage('error', 'Terjadi kesalahan');
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border-2 border-black rounded-lg p-8">
        <h2 className="text-2xl font-bold mb-6">Tambah Master Item</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Item Name</label>
            <input
              type="text"
              value={form.item_name}
              onChange={(e) => setForm({...form, item_name: e.target.value})}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-black focus:outline-none"
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">HPP</label>
              <input
                type="number"
                value={form.hpp}
                onChange={(e) => setForm({...form, hpp: e.target.value})}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-black focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Operasional</label>
              <input
                type="number"
                value={form.operasional}
                onChange={(e) => setForm({...form, operasional: e.target.value})}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-black focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Worker</label>
              <input
                type="number"
                value={form.worker}
                onChange={(e) => setForm({...form, worker: e.target.value})}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-black focus:outline-none"
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Marketing</label>
              <input
                type="number"
                value={form.marketing}
                onChange={(e) => setForm({...form, marketing: e.target.value})}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-black focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">HPJ</label>
              <input
                type="number"
                value={form.hpj}
                onChange={(e) => setForm({...form, hpj: e.target.value})}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-black focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Net Sales</label>
              <input
                type="number"
                value={form.net_sales}
                onChange={(e) => setForm({...form, net_sales: e.target.value})}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-black focus:outline-none"
              />
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

      <div className="bg-white border-2 border-black rounded-lg p-8">
        <h3 className="text-xl font-bold mb-4">Daftar Master Items</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-black">
                <th className="text-left py-3 px-4 font-medium">Item Name</th>
                <th className="text-left py-3 px-4 font-medium">HPP</th>
                <th className="text-left py-3 px-4 font-medium">HPJ</th>
                <th className="text-left py-3 px-4 font-medium">Net Sales</th>
              </tr>
            </thead>
            <tbody>
              {masterItems.map((item, idx) => (
                <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="py-3 px-4">{item.item_name}</td>
                  <td className="py-3 px-4">Rp {parseInt(item.hpp || 0).toLocaleString()}</td>
                  <td className="py-3 px-4">Rp {parseInt(item.hpj || 0).toLocaleString()}</td>
                  <td className="py-3 px-4">Rp {parseInt(item.net_sales || 0).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}