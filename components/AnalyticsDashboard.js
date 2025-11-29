'use client';

import { useState, useEffect } from 'react';
import { Calendar, TrendingUp, ShoppingCart, CreditCard, DollarSign, Package } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

export default function AnalyticsDashboard({ onMessage }) {
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [analytics, setAnalytics] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalItems: 0,
    averageOrder: 0,
    qrisRevenue: 0,
    cashRevenue: 0,
    qrisOrders: 0,
    cashOrders: 0,
    topItems: [],
    totalHPP: 0,
    totalOperasional: 0,
    totalWorker: 0,
    totalMarketing: 0,
    totalNetSales: 0,
    totalCosts: 0,
    totalProfit: 0
  });

  useEffect(() => {
    const today = new Date();
    const lastWeek = new Date(today);
    lastWeek.setDate(today.getDate() - 7);
    
    setEndDate(today.toISOString().split('T')[0]);
    setStartDate(lastWeek.toISOString().split('T')[0]);
  }, []);

  useEffect(() => {
    if (startDate && endDate) {
      fetchOrders();
    }
  }, [startDate, endDate, paymentFilter]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      
      if (data.success) {
        const filteredOrders = filterOrders(data.data);
        setOrders(filteredOrders);
        await calculateAnalytics(filteredOrders);
      }
    } catch (error) {
      onMessage('error', 'Gagal mengambil data orders');
    }
    setLoading(false);
  };

  const filterOrders = (ordersData) => {
    return ordersData.filter(order => {
      const orderDate = new Date(order.created_at);
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      
      const isInDateRange = orderDate >= start && orderDate <= end;
      const matchesPayment = paymentFilter === 'all' || order.payment_method === paymentFilter;
      
      return isInDateRange && matchesPayment;
    });
  };

  const calculateAnalytics = async (ordersData) => {
    const orderGroups = {};
    ordersData.forEach(order => {
      if (!orderGroups[order.order_id]) {
        orderGroups[order.order_id] = {
          order_id: order.order_id,
          payment_method: order.payment_method,
          items: [],
          total: 0
        };
      }
      orderGroups[order.order_id].items.push(order);
      orderGroups[order.order_id].total += parseInt(order.total_amount || 0);
    });

    const uniqueOrders = Object.values(orderGroups);
    
    const totalRevenue = uniqueOrders.reduce((sum, order) => sum + order.total, 0);
    const totalOrders = uniqueOrders.length;
    const totalItems = ordersData.reduce((sum, order) => sum + parseInt(order.quantity_item || 0), 0);
    const averageOrder = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    const qrisOrders = uniqueOrders.filter(o => o.payment_method === 'QRIS');
    const cashOrders = uniqueOrders.filter(o => o.payment_method === 'Cash');
    const qrisRevenue = qrisOrders.reduce((sum, order) => sum + order.total, 0);
    const cashRevenue = cashOrders.reduce((sum, order) => sum + order.total, 0);
    
    const itemSales = {};
    ordersData.forEach(order => {
      if (!itemSales[order.item_name]) {
        itemSales[order.item_name] = {
          name: order.item_name,
          quantity: 0,
          revenue: 0
        };
      }
      itemSales[order.item_name].quantity += parseInt(order.quantity_item || 0);
      itemSales[order.item_name].revenue += parseInt(order.total_amount || 0);
    });
    
    const topItems = Object.values(itemSales)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    let totalHPP = 0;
    let totalOperasional = 0;
    let totalWorker = 0;
    let totalMarketing = 0;
    let totalNetSales = 0;

    try {
      const res = await fetch('/api/master-items');
      const data = await res.json();
      
      if (data.success) {
        const masterItems = data.data;
        
        ordersData.forEach(order => {
          const item = masterItems.find(m => m.item_name === order.item_name);
          if (item) {
            const qty = parseInt(order.quantity_item || 0);
            totalHPP += (parseFloat(item.hpp) || 0) * qty;
            totalOperasional += (parseFloat(item.operasional) || 0) * qty;
            totalWorker += (parseFloat(item.worker) || 0) * qty;
            totalMarketing += (parseFloat(item.marketing) || 0) * qty;
            totalNetSales += (parseFloat(item.net_sales) || 0) * qty;
          }
        });
      }
    } catch (error) {
      console.error('Error fetching master items:', error);
    }

    const totalCosts = totalHPP + totalOperasional + totalWorker + totalMarketing;
    const totalProfit = totalRevenue - totalCosts;

    setAnalytics({
      totalRevenue,
      totalOrders,
      totalItems,
      averageOrder,
      qrisRevenue,
      cashRevenue,
      qrisOrders: qrisOrders.length,
      cashOrders: cashOrders.length,
      topItems,
      totalHPP,
      totalOperasional,
      totalWorker,
      totalMarketing,
      totalNetSales,
      totalCosts,
      totalProfit
    });
  };

  const formatDateShort = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const StatCard = ({ icon: Icon, label, value, color, subtitle }) => (
    <div className="bg-white border-2 border-gray-200 rounded-lg p-4 hover:border-black transition-all">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs text-gray-600 mb-1">{label}</p>
          <p className={`text-xl font-bold ${color || 'text-black'}`}>{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-2 rounded-lg ${color === 'text-green-600' ? 'bg-green-100' : 
                                          color === 'text-blue-600' ? 'bg-blue-100' : 
                                          color === 'text-purple-600' ? 'bg-purple-100' : 
                                          'bg-gray-100'}`}>
          <Icon className={`w-5 h-5 ${color || 'text-gray-600'}`} />
        </div>
      </div>
    </div>
  );

  // Prepare data for bar chart
  const costBreakdownData = [
    { name: 'HPP', value: analytics.totalHPP, color: '#dc2626', label: 'Harga Pokok Penjualan' },
    { name: 'Operasional', value: analytics.totalOperasional, color: '#ea580c', label: 'Biaya Operasional' },
    { name: 'Worker', value: analytics.totalWorker, color: '#2563eb', label: 'Biaya Tenaga Kerja' },
    { name: 'Marketing', value: analytics.totalMarketing, color: '#ca8a04', label: 'Biaya Marketing' },
    { name: 'Net Sales', value: analytics.totalNetSales, color: '#059669', label: 'Penjualan Bersih' }
  ].filter(item => item.value > 0);

  const totalCostSum = costBreakdownData.reduce((sum, item) => sum + item.value, 0);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const percentage = totalCostSum > 0 ? ((data.value / totalCostSum) * 100).toFixed(1) : 0;
      return (
        <div className="bg-white border-2 border-gray-300 rounded-lg p-3 shadow-lg">
          <p className="font-bold text-gray-900">{data.payload.name}</p>
          <p className="text-sm text-gray-600">Rp {data.value.toLocaleString()}</p>
          <p className="text-xs text-gray-500">{percentage}% dari total</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4">
      {/* Filter Section */}
      <div className="bg-white border-2 border-black rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Analytics Dashboard</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Tanggal Mulai</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-black focus:outline-none"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Tanggal Akhir</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-black focus:outline-none"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Metode Pembayaran</label>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-black focus:outline-none"
            >
              <option value="all">Semua</option>
              <option value="QRIS">QRIS</option>
              <option value="Cash">Cash</option>
            </select>
          </div>
        </div>
        
        <button
          onClick={fetchOrders}
          disabled={loading}
          className="mt-4 w-full md:w-auto px-6 py-2 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-all disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Refresh Data'}
        </button>
      </div>

      {/* BARIS 1: Diagram Bar Chart Breakdown Biaya */}
      <div className="bg-white border-2 border-black rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Pembagian Biaya Operasional</h3>
          <div className="text-right">
            <p className="text-xs text-gray-600">Total Biaya</p>
            <p className="text-xl font-bold">Rp {totalCostSum.toLocaleString()}</p>
          </div>
        </div>
        {costBreakdownData.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Belum ada data biaya
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart 
              data={costBreakdownData} 
              layout="vertical"
              margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis 
                type="number" 
                tickFormatter={(value) => `Rp ${(value / 1000).toFixed(0)}k`}
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                type="category" 
                dataKey="name" 
                width={90}
                style={{ fontSize: '13px', fontWeight: '600' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                {costBreakdownData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
        
        {/* Percentage Labels */}
        {costBreakdownData.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mt-4 pt-4 border-t">
            {costBreakdownData.map((item, idx) => {
              const percentage = totalCostSum > 0 ? ((item.value / totalCostSum) * 100).toFixed(1) : 0;
              return (
                <div key={idx} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: item.color }}></div>
                  <div className="text-xs">
                    <p className="font-semibold text-gray-700">{item.name}</p>
                    <p className="text-gray-500">{percentage}%</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* BARIS 2: Total Penghasilan, Total Order, Rata-rata Order, Periode */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={DollarSign}
          label="Total Penghasilan"
          value={`Rp ${analytics.totalRevenue.toLocaleString()}`}
          color="text-green-600"
        />
        
        <StatCard
          icon={ShoppingCart}
          label="Total Order"
          value={analytics.totalOrders}
          color="text-blue-600"
          subtitle={`${analytics.totalItems} items terjual`}
        />
        
        <StatCard
          icon={TrendingUp}
          label="Rata-rata Order"
          value={`Rp ${Math.round(analytics.averageOrder).toLocaleString()}`}
          color="text-purple-600"
        />
        
        <StatCard
          icon={Calendar}
          label="Periode"
          value={`${analytics.totalOrders} transaksi`}
          subtitle={`${formatDateShort(startDate)} - ${formatDateShort(endDate)}`}
        />
      </div>

      {/* BARIS 3: HPP, Operasional, Worker, Marketing, Net Sales */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <div className="p-1.5 bg-red-200 rounded-lg">
              <Package className="w-4 h-4 text-red-700" />
            </div>
            <h4 className="font-bold text-sm text-red-900">HPP</h4>
          </div>
          <p className="text-xl font-bold text-red-900">
            Rp {analytics.totalHPP.toLocaleString()}
          </p>
          <p className="text-xs text-red-700 mt-1">Harga Pokok Penjualan</p>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <div className="p-1.5 bg-orange-200 rounded-lg">
              <svg className="w-4 h-4 text-orange-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h4 className="font-bold text-sm text-orange-900">Operasional</h4>
          </div>
          <p className="text-xl font-bold text-orange-900">
            Rp {analytics.totalOperasional.toLocaleString()}
          </p>
          <p className="text-xs text-orange-700 mt-1">Biaya Operasional</p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <div className="p-1.5 bg-blue-200 rounded-lg">
              <svg className="w-4 h-4 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h4 className="font-bold text-sm text-blue-900">Worker</h4>
          </div>
          <p className="text-xl font-bold text-blue-900">
            Rp {analytics.totalWorker.toLocaleString()}
          </p>
          <p className="text-xs text-blue-700 mt-1">Biaya Tenaga Kerja</p>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <div className="p-1.5 bg-yellow-200 rounded-lg">
              <svg className="w-4 h-4 text-yellow-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
              </svg>
            </div>
            <h4 className="font-bold text-sm text-yellow-900">Marketing</h4>
          </div>
          <p className="text-xl font-bold text-yellow-900">
            Rp {analytics.totalMarketing.toLocaleString()}
          </p>
          <p className="text-xs text-yellow-700 mt-1">Biaya Marketing</p>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-2 border-emerald-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <div className="p-1.5 bg-emerald-200 rounded-lg">
              <DollarSign className="w-4 h-4 text-emerald-700" />
            </div>
            <h4 className="font-bold text-sm text-emerald-900">Net Sales</h4>
          </div>
          <p className="text-xl font-bold text-emerald-900">
            Rp {analytics.totalNetSales.toLocaleString()}
          </p>
          <p className="text-xs text-emerald-700 mt-1">Penjualan Bersih</p>
        </div>
      </div>

      {/* BARIS 4: QRIS dan Cash */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="bg-white border-2 border-gray-200 rounded-lg p-4 hover:border-black transition-all">
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <CreditCard className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="font-bold text-base">QRIS</h3>
              <p className="text-xs text-gray-600">{analytics.qrisOrders} transaksi</p>
            </div>
          </div>
          <p className="text-2xl font-bold text-purple-600">
            Rp {analytics.qrisRevenue.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            {analytics.totalRevenue > 0 
              ? `${((analytics.qrisRevenue / analytics.totalRevenue) * 100).toFixed(1)}% dari total`
              : '0% dari total'}
          </p>
        </div>

        <div className="bg-white border-2 border-gray-200 rounded-lg p-4 hover:border-black transition-all">
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-bold text-base">Cash</h3>
              <p className="text-xs text-gray-600">{analytics.cashOrders} transaksi</p>
            </div>
          </div>
          <p className="text-2xl font-bold text-green-600">
            Rp {analytics.cashRevenue.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            {analytics.totalRevenue > 0 
              ? `${((analytics.cashRevenue / analytics.totalRevenue) * 100).toFixed(1)}% dari total`
              : '0% dari total'}
          </p>
        </div>
      </div>

      {/* Summary Section */}
      <div className="bg-white border-2 border-black rounded-lg p-6">
        <h3 className="text-xl font-bold mb-4">Ringkasan Keuangan</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 text-center">
            <p className="text-xs text-green-700 mb-2 font-medium">Total Pendapatan</p>
            <p className="text-2xl font-bold text-green-900">
              Rp {analytics.totalRevenue.toLocaleString()}
            </p>
          </div>

          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 text-center">
            <p className="text-xs text-red-700 mb-2 font-medium">Total Pengeluaran</p>
            <p className="text-2xl font-bold text-red-900">
              Rp {analytics.totalCosts.toLocaleString()}
            </p>
          </div>

          <div className={`${analytics.totalProfit >= 0 ? 'bg-blue-50 border-blue-200' : 'bg-red-50 border-red-200'} border-2 rounded-lg p-4 text-center`}>
            <p className={`text-xs ${analytics.totalProfit >= 0 ? 'text-blue-700' : 'text-red-700'} mb-2 font-medium`}>
              Keuntungan Bersih
            </p>
            <p className={`text-2xl font-bold ${analytics.totalProfit >= 0 ? 'text-blue-900' : 'text-red-900'}`}>
              Rp {analytics.totalProfit.toLocaleString()}
            </p>
            <p className="text-xs text-gray-600 mt-2">
              {analytics.totalRevenue > 0 
                ? `${((analytics.totalProfit / analytics.totalRevenue) * 100).toFixed(1)}% profit margin`
                : '0% profit margin'}
            </p>
          </div>
        </div>
      </div>

      {/* Top Items Section */}
      <div className="bg-white border-2 border-black rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Package className="w-6 h-6" />
          <h3 className="text-xl font-bold">Top 5 Item Terlaris</h3>
        </div>
        
        {analytics.topItems.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Tidak ada data penjualan
          </div>
        ) : (
          <div className="space-y-3">
            {analytics.topItems.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-10 h-10 bg-black text-white rounded-full font-bold">
                    {idx + 1}
                  </div>
                  <div>
                    <p className="font-bold text-lg">{item.name}</p>
                    <p className="text-sm text-gray-600">{item.quantity} item terjual</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">Rp {item.revenue.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">Total Revenue</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}