'use client';

import { useState, useMemo } from 'react';
import { Plus, Edit2, Trash2, Search, Package, Filter } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import Modal, { ModalFooter } from '@/components/ui/Modal';
import PageHeader from '@/components/ui/PageHeader';
import { formatCurrency } from '@/lib/utils';

export default function MasterItemTab({ masterItems, categories, onRefresh, onMessage }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
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

  const filteredItems = useMemo(() => {
    return masterItems.filter(item => {
      const matchesSearch = item.item_name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [masterItems, searchQuery, selectedCategory]);

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditItem(item);
      setFormData({
        item_name: item.item_name,
        category: item.category,
        hpp: item.hpp,
        operasional: item.operasional,
        worker: item.worker,
        marketing: item.marketing,
        hpj: item.hpj,
        net_sales: item.net_sales,
        status: item.status
      });
    } else {
      setEditItem(null);
      setFormData({
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
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = editItem ? '/api/master-items' : '/api/master-items';
      const method = editItem ? 'PUT' : 'POST';
      const payload = editItem 
        ? { ...formData, rowIndex: editItem._rowIndex }
        : formData;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (data.success) {
        onMessage('success', data.message);
        setShowModal(false);
        onRefresh();
      } else {
        onMessage('error', data.error);
      }
    } catch (error) {
      onMessage('error', 'Terjadi kesalahan');
    }
    setLoading(false);
  };

  const handleDelete = async (item) => {
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
        onMessage('error', data.error);
      }
    } catch (error) {
      onMessage('error', 'Gagal menghapus item');
    }
  };

  const getStatusBadge = (status) => {
    return status === 'active' ? (
      <Badge variant="success">Active</Badge>
    ) : (
      <Badge variant="warning">Draft</Badge>
    );
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Master Item</CardTitle>
              <CardDescription>
                Kelola daftar produk dan harga
              </CardDescription>
            </div>
            <Button
              variant="primary"
              icon={Plus}
              onClick={() => handleOpenModal()}
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
                ...categories.map(cat => ({
                  value: cat.category_name,
                  label: cat.category_name
                }))
              ]}
            />
          </div>

          {/* Items Table */}
          <div className="overflow-x-auto">
            <table className="table-shopify">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Kategori</th>
                  <th>HPP</th>
                  <th>HPJ</th>
                  <th>Net Sales</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-12 text-shopify-gray-400">
                      Tidak ada data
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item, idx) => (
                    <tr key={idx}>
                      <td className="font-medium">{item.item_name}</td>
                      <td>{item.category}</td>
                      <td>{formatCurrency(item.hpp)}</td>
                      <td className="font-semibold">{formatCurrency(item.hpj)}</td>
                      <td className="text-shopify-accent-success font-medium">
                        {formatCurrency(item.net_sales)}
                      </td>
                      <td>{getStatusBadge(item.status)}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={Edit2}
                            onClick={() => handleOpenModal(item)}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={Trash2}
                            onClick={() => handleDelete(item)}
                            className="text-shopify-accent-critical hover:bg-red-900/20"
                          />
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editItem ? 'Edit Item' : 'Tambah Item Baru'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nama Item"
              required
              value={formData.item_name}
              onChange={(e) => setFormData({...formData, item_name: e.target.value})}
              placeholder="Masukkan nama item"
            />
            <Select
              label="Kategori"
              required
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              options={[
                { value: '', label: 'Pilih Kategori' },
                ...categories.map(cat => ({
                  value: cat.category_name,
                  label: cat.category_name
                }))
              ]}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="HPP (Harga Pokok Penjualan)"
              type="number"
              required
              value={formData.hpp}
              onChange={(e) => setFormData({...formData, hpp: e.target.value})}
              placeholder="0"
            />
            <Input
              label="Operasional"
              type="number"
              value={formData.operasional}
              onChange={(e) => setFormData({...formData, operasional: e.target.value})}
              placeholder="0"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Worker"
              type="number"
              value={formData.worker}
              onChange={(e) => setFormData({...formData, worker: e.target.value})}
              placeholder="0"
            />
            <Input
              label="Marketing"
              type="number"
              value={formData.marketing}
              onChange={(e) => setFormData({...formData, marketing: e.target.value})}
              placeholder="0"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="HPJ (Harga Pokok Jual)"
              type="number"
              required
              value={formData.hpj}
              onChange={(e) => setFormData({...formData, hpj: e.target.value})}
              placeholder="0"
            />
            <Input
              label="Net Sales"
              type="number"
              value={formData.net_sales}
              onChange={(e) => setFormData({...formData, net_sales: e.target.value})}
              placeholder="0"
            />
          </div>

          <Select
            label="Status"
            required
            value={formData.status}
            onChange={(e) => setFormData({...formData, status: e.target.value})}
            options={[
              { value: 'draft', label: 'Draft' },
              { value: 'active', label: 'Active' }
            ]}
          />

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
              {editItem ? 'Update' : 'Simpan'}
            </Button>
          </ModalFooter>
        </form>
      </Modal>
    </>
  );
}