'use client';

import { useState, useEffect, useRef } from 'react';
import { Eye, X, Calendar, User, CreditCard, Package, FileText, Printer } from 'lucide-react';
import SearchBar from '../common/SearchBar';
import BillOrder from './BillOrder';

export default function OrderListTab({ onMessage }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const billRef = useRef();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/orders/list');
      const data = await res.json();
      if (data.success) {
        setOrders(data.data);
      }
    } catch (error) {
      onMessage('error', 'Gagal mengambil data orders');
    }
    setLoading(false);
  };

  const fetchOrderDetail = async (orderId) => {
    try {
      const res = await fetch(`/api/orders/list?orderId=${orderId}`);
      const data = await res.json();
      if (data.success) {
        setSelectedOrder(data.data);
        setShowDetailModal(true);
      }
    } catch (error) {
      onMessage('error', 'Gagal mengambil detail order');
    }
  };

  const filteredOrders = orders.filter(order => 
    order.order_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.cashier_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.customer_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handlePrintBill = () => {
    if (!selectedOrder) {
      onMessage('error', 'Data order tidak ditemukan');
      return;
    }

    const printContent = document.getElementById('detail-bill-print-area');
    if (!printContent) {
      onMessage('error', 'Konten bill tidak ditemukan');
      return;
    }

    const printWindow = window.open('', '_blank', 'width=400,height=600');
    
    if (!printWindow) {
      onMessage('error', 'Gagal membuka window print. Pastikan popup tidak diblokir.');
      return;
    }
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Print Bill - ${selectedOrder.order_id}</title>
        <style>
          @page { 
            size: 58mm auto; 
            margin: 0; 
          }
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          body {
            font-family: 'Courier New', monospace;
            font-size: 9pt;
            line-height: 1.3;
            width: 58mm;
            padding: 3mm;
            background: white;
          }
          .bill-logo {
            text-align: center;
            margin-bottom: 3mm;
          }
          .logo-img {
            height: 35px;
            max-width: 50mm;
            object-fit: contain;
          }
          .bill-header {
            text-align: center;
            margin-bottom: 3mm;
          }
          .store-name {
            font-size: 13pt;
            font-weight: bold;
            margin-bottom: 2mm;
          }
          .store-address {
            font-size: 8pt;
            line-height: 1.3;
          }
          .divider {
            border-top: 1px dashed #000;
            margin: 2mm 0;
          }
          .info-table, .item-table, .total-table {
            width: 100%;
            border-collapse: collapse;
          }
          .info-table td, .item-table td, .total-table td {
            font-size: 8pt;
            padding: 1mm 0;
          }
          .info-label {
            width: 20mm;
            font-weight: 600;
          }
          .item-name {
            font-weight: bold;
            font-size: 9pt;
            margin-bottom: 1mm;
          }
          .item-subtotal {
            text-align: right;
            font-weight: 600;
          }
          .bill-notes {
            font-size: 8pt;
            padding: 2mm;
            background: #f5f5f5;
            margin: 2mm 0;
          }
          .total-main-row td {
            font-size: 11pt;
            font-weight: bold;
            padding: 2mm 0;
          }
          .text-right {
            text-align: right;
            font-weight: 600;
          }
          .bill-footer {
            text-align: center;
            font-size: 9pt;
            font-weight: bold;
            margin-top: 3mm;
          }
          @media print {
            body {
              width: 58mm;
              padding: 0;
            }
          }
        </style>
      </head>
      <body>
        ${printContent.innerHTML}
      </body>
      </html>
    `);
    
    printWindow.document.close();
    
    // Wait untuk gambar dan konten dimuat
    printWindow.onload = function() {
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
        
        // Tunggu setelah print dialog selesai
        setTimeout(() => {
          printWindow.close();
        }, 100);
        
        onMessage('success', 'Bill berhasil dicetak!');
      }, 500);
    };
    
    // Fallback jika onload tidak terpicu
    setTimeout(() => {
      if (printWindow && !printWindow.closed) {
        printWindow.focus();
        printWindow.print();
        setTimeout(() => {
          printWindow.close();
        }, 100);
      }
    }, 1000);
  };

  return (
    <>
      <div className="bg-shopify-charcoal border-2 border-black rounded-lg p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Daftar Order</h2>
          <button
            onClick={fetchOrders}
            className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-all"
          >
            Refresh
          </button>
        </div>

        <div className="mb-6">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Cari order (ID, Kasir, Customer)..."
          />
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
            <p className="mt-4 text-gray-600">Loading orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            {searchQuery ? 'Tidak ada order ditemukan' : 'Belum ada order'}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredOrders.map((order, idx) => (
              <div
                key={idx}
                className="border-2 border-gray-200 rounded-lg p-4 hover:border-black transition-all"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-bold text-lg">{order.order_id}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        order.payment_method === 'QRIS' 
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {order.payment_method}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-3">
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(order.created_at)}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-gray-600">
                        <User className="w-4 h-4" />
                        <span>Kasir: {order.cashier_name}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-gray-600">
                        <User className="w-4 h-4" />
                        <span>Customer: {order.customer_name}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Package className="w-4 h-4" />
                        <span>{order.total_items} item(s)</span>
                      </div>
                    </div>

                    {order.notes && (
                      <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded text-sm flex items-start space-x-2">
                        <FileText className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <span className="text-blue-800">{order.notes}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-500">Total Pembayaran</p>
                        <p className="text-xl font-bold">
                          Rp {order.total_amount.toLocaleString()}
                        </p>
                      </div>
                      <button
                        onClick={() => fetchOrderDetail(order.order_id)}
                        className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all"
                      >
                        <Eye className="w-4 h-4" />
                        <span>Detail</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold">Detail Order</h3>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Hidden Bill Component for Printing */}
            <div className="hidden">
              <BillOrder 
                ref={billRef}
                orderData={{
                  order_id: selectedOrder.order_id,
                  created_at: selectedOrder.created_at,
                  cashier_name: selectedOrder.cashier_name,
                  customer_name: selectedOrder.customer_name,
                  payment_method: selectedOrder.payment_method,
                  cash_paid: selectedOrder.cash_paid,
                  change: selectedOrder.change,
                  notes: selectedOrder.notes,
                  total_amount: selectedOrder.total_amount
                }}
                items={selectedOrder.items}
              />
            </div>

            {/* Visible Bill Preview */}
            <div className="border-2 border-gray-200 rounded-lg mb-6 overflow-hidden">
              <div id="detail-bill-print-area">
                <BillOrder 
                  orderData={{
                    order_id: selectedOrder.order_id,
                    created_at: selectedOrder.created_at,
                    cashier_name: selectedOrder.cashier_name,
                    customer_name: selectedOrder.customer_name,
                    payment_method: selectedOrder.payment_method,
                    cash_paid: selectedOrder.cash_paid,
                    change: selectedOrder.change,
                    notes: selectedOrder.notes,
                    total_amount: selectedOrder.total_amount
                  }}
                  items={selectedOrder.items}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDetailModal(false)}
                className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg font-medium hover:bg-gray-100 transition-all"
              >
                Tutup
              </button>
              <button
                onClick={handlePrintBill}
                className="flex-1 px-6 py-3 bg-black text-white rounded-lg font-bold hover:bg-gray-800 transition-all flex items-center justify-center space-x-2"
              >
                <Printer className="w-5 h-5" />
                <span>Print Bill</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}