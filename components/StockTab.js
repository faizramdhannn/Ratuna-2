'use client';

import { useState, useMemo } from 'react';
import { Plus, Edit2, Package, Search, AlertTriangle, CheckCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import Modal, { ModalFooter } from '@/components/ui/Modal';
import { formatDate } from '@/lib/utils';

export default function StockTab({ stocks, currentUser, onRefresh, onMessage }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editStock, setEditStock] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    item_name: '',
    quantity: ''
  });

  const filteredStocks = useMemo(() => {
    return stocks.filter(stock =>
      stock.item_name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [stocks, searchQuery]);

  const handleOpenModal = (stock = null) => {
    if (stock) {
      setEditStock(stock);
      setFormData({
        item_name: stock.item_name,
        quantity: stock.quantity
      });
    } else {
      setEditStock(null);
      setFormData({
        item_name: '',
        quantity: ''
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const method = editStock ? 'PUT' : 'POST';
      const payload = editStock
        ? { ...formData, rowIndex: editStock._rowIndex }
        : formData;

      const res = await fetch('/api/stock', {
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

  const getStockBadge = (quantity) => {
    const qty = parseInt(quantity);
    if (qty === 0) {
      return <Badge variant="critical" icon={AlertTriangle}>Out of Stock</Badge>;
    } else if (qty < 10) {
      return <Badge variant="warning" icon={AlertTriangle}>Low Stock</Badge>;
    } else {
      return <Badge variant="success" icon={CheckCircle}>In Stock</Badge>;
    }
  };

  const getStockStatusColor = (quantity) => {
    const qty = parseInt(quantity);
    if (qty === 0) return 'text-shopify-accent-critical';
    if (qty < 10) return 'text-yellow-500';
    return 'text-shopify-accent-success';
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Manajemen Stock</CardTitle>
              <CardDescription>
                Kelola persediaan barang
              </CardDescription>
            </div>
            {currentUser?.role && ['superadmin', 'admin'].includes(currentUser.role) && (
              <Button
                variant="primary"
                icon={Plus}
                onClick={() => handleOpenModal()}
              >
                Tambah Stock
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent>
          {/* Search */}
          <div className="mb-6">
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
          </div>

          {/* Stock Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredStocks.length === 0 ? (
              <div className="col-span-full text-center py-12 text-shopify-gray-400">
                <Package className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Tidak ada data stock</p>
              </div>
            ) : (
              filteredStocks.map((stock, idx) => (
                <Card key={idx} hover className="relative overflow-hidden">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-white mb-1">
                          {stock.item_name}
                        </h3>
                        <p className="text-xs text-shopify-gray-400">
                          Update: {formatDate(stock.updated_at)}
                        </p>
                      </div>
                      {currentUser?.role && ['superadmin', 'admin'].includes(currentUser.role) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={Edit2}
                          onClick={() => handleOpenModal(stock)}
                        />
                      )}
                    </div>

                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-shopify-gray-400 mb-1">Quantity</p>
                        <p className={`text-3xl font-bold ${getStockStatusColor(stock.quantity)}`}>
                          {stock.quantity}
                        </p>
                      </div>

                      <div>
                        {getStockBadge(stock.quantity)}
                      </div>
                    </div>
                  </CardContent>

                  {/* Stock Level Indicator */}
                  <div 
                    className="absolute bottom-0 left-0 right-0 h-1"
                    style={{
                      background: parseInt(stock.quantity) === 0 
                        ? '#DE3618' 
                        : parseInt(stock.quantity) < 10 
                        ? '#FFC453' 
                        : '#00A47C'
                    }}
                  />
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editStock ? 'Edit Stock' : 'Tambah Stock Baru'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nama Item"
            required
            value={formData.item_name}
            onChange={(e) => setFormData({...formData, item_name: e.target.value})}
            placeholder="Masukkan nama item"
            disabled={!!editStock}
          />

          <Input
            label="Quantity"
            type="number"
            required
            value={formData.quantity}
            onChange={(e) => setFormData({...formData, quantity: e.target.value})}
            placeholder="0"
            min="0"
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
              {editStock ? 'Update' : 'Simpan'}
            </Button>
          </ModalFooter>
        </form>
      </Modal>
    </>
  );
}