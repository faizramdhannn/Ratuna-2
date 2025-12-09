'use client';

import { useState, useEffect, useMemo } from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingCart, 
  Package,
  Calendar,
  ArrowUp,
  ArrowDown,
  Filter
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { formatCurrency, formatNumber } from '@/lib/utils';

export default function AnalyticsDashboard({ onMessage }) {
  const [orders, setOrders] = useState([]);
  const [shoppingList, setShoppingList] = useState([]);
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState('7days');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ordersRes, shoppingRes, stocksRes] = await Promise.all([
        fetch('/api/orders'),
        fetch('/api/shopping-list'),
        fetch('/api/stock')
      ]);

      const [ordersData, shoppingData, stocksData] = await Promise.all([
        ordersRes.json(),
        shoppingRes.json(),
        stocksRes.json()
      ]);

      if (ordersData.success) setOrders(ordersData.data);
      if (shoppingData.success) setShoppingList(shoppingData.data);
      if (stocksData.success) setStocks(stocksData.data);
    } catch (error) {
      onMessage('error', 'Gagal mengambil data analytics');
    }
    setLoading(false);
  };

  const getFilteredOrders = useMemo(() => {
    const now = new Date();
    let startDate;

    switch(dateFilter) {
      case 'today':
        startDate = new Date(now.setHours(0, 0, 0, 0));
        break;
      case '7days':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case '30days':
        startDate = new Date(now.setDate(now.getDate() - 30));
        break;
      case '90days':
        startDate = new Date(now.setDate(now.getDate() - 90));
        break;
      case 'custom':
        if (customStartDate && customEndDate) {
          return orders.filter(order => {
            const orderDate = new Date(order.created_at);
            return orderDate >= new Date(customStartDate) && orderDate <= new Date(customEndDate);
          });
        }
        return orders;
      default:
        return orders;
    }

    return orders.filter(order => new Date(order.created_at) >= startDate);
  }, [orders, dateFilter, customStartDate, customEndDate]);

  // Calculate metrics
  const totalRevenue = getFilteredOrders.reduce((sum, order) => sum + parseInt(order.total_amount || 0), 0);
  const totalExpenses = shoppingList.reduce((sum, item) => sum + parseInt(item.price || 0), 0);
  const totalOrders = getFilteredOrders.length;
  const lowStockItems = stocks.filter(s => parseInt(s.quantity) < 10).length;
  const outOfStockItems = stocks.filter(s => parseInt(s.quantity) === 0).length;

  // Get today's orders
  const today = new Date().toDateString();
  const todayOrders = orders.filter(order => 
    new Date(order.created_at).toDateString() === today
  );
  const todayRevenue = todayOrders.reduce((sum, order) => 
    sum + parseInt(order.total_amount || 0), 0
  );

  // Calculate profit
  const profit = totalRevenue - totalExpenses;
  const profitPercentage = totalRevenue > 0 
    ? ((profit / totalRevenue) * 100).toFixed(1) 
    : 0;

  // Chart data
  const chartData = useMemo(() => {
    const dailyRevenue = {};
    getFilteredOrders.forEach(order => {
      const date = new Date(order.created_at).toLocaleDateString('id-ID', { 
        day: '2-digit', 
        month: 'short' 
      });
      dailyRevenue[date] = (dailyRevenue[date] || 0) + parseInt(order.total_amount || 0);
    });

    return Object.entries(dailyRevenue).map(([date, revenue]) => ({
      date,
      revenue
    }));
  }, [getFilteredOrders]);

  const maxRevenue = Math.max(...chartData.map(d => d.revenue), 1);

  const StatCard = ({ title, value, icon: Icon, trend, trendValue, color = 'primary' }) => {
    const colorClasses = {
      primary: 'bg-shopify-accent-primary/20 text-shopify-accent-primary',
      success: 'bg-green-900/30 text-shopify-accent-success',
      warning: 'bg-yellow-900/30 text-yellow-500',
      critical: 'bg-red-900/30 text-shopify-accent-critical'
    };

    return (
      <Card hover>
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm text-shopify-gray-400 mb-1">{title}</p>
              <p className="text-3xl font-bold text-white">{value}</p>
            </div>
            <div className={`w-12 h-12 rounded-shopify flex items-center justify-center ${colorClasses[color]}`}>
              <Icon className="w-6 h-6" />
            </div>
          </div>
          {trend !== undefined && (
            <div className="flex items-center gap-2">
              {trend > 0 ? (
                <ArrowUp className="w-4 h-4 text-shopify-accent-success" />
              ) : (
                <ArrowDown className="w-4 h-4 text-shopify-accent-critical" />
              )}
              <span className={`text-sm font-medium ${
                trend > 0 ? 'text-shopify-accent-success' : 'text-shopify-accent-critical'
              }`}>
                {Math.abs(trend)}%
              </span>
              {trendValue && (
                <span className="text-sm text-shopify-gray-400">{trendValue}</span>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="spinner-shopify w-12 h-12 mx-auto mb-4"></div>
          <p className="text-shopify-gray-400">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter Section */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-shopify-gray-400" />
              <span className="text-sm font-medium text-shopify-gray-300">Filter Periode:</span>
            </div>
            
            <div className="flex gap-2 flex-wrap">
              {[
                { value: 'today', label: 'Hari Ini' },
                { value: '7days', label: '7 Hari' },
                { value: '30days', label: '30 Hari' },
                { value: '90days', label: '90 Hari' },
                { value: 'custom', label: 'Custom' }
              ].map(filter => (
                <button
                  key={filter.value}
                  onClick={() => setDateFilter(filter.value)}
                  className={`px-4 py-2 rounded-shopify text-sm font-medium transition-all ${
                    dateFilter === filter.value
                      ? 'bg-shopify-accent-primary text-white'
                      : 'bg-shopify-darker text-shopify-gray-400 hover:text-white hover:bg-shopify-gray-800'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            {dateFilter === 'custom' && (
              <div className="flex gap-3 items-center">
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="input-shopify text-sm"
                />
                <span className="text-shopify-gray-400">-</span>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="input-shopify text-sm"
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value={formatCurrency(totalRevenue)}
          icon={DollarSign}
          color="success"
          trend={12.5}
          trendValue="vs last month"
        />
        <StatCard
          title="Total Orders"
          value={formatNumber(totalOrders)}
          icon={ShoppingCart}
          color="primary"
          trend={8.2}
          trendValue="vs last month"
        />
        <StatCard
          title="Total Expenses"
          value={formatCurrency(totalExpenses)}
          icon={TrendingUp}
          color="warning"
        />
        <StatCard
          title="Net Profit"
          value={formatCurrency(profit)}
          icon={DollarSign}
          color={profit > 0 ? 'success' : 'critical'}
          trend={profit > 0 ? 15 : -5}
          trendValue={`${profitPercentage}% margin`}
        />
      </div>

      {/* Revenue Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Trend</CardTitle>
          <CardDescription>Daily revenue over selected period</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {chartData.length === 0 ? (
              <p className="text-center py-12 text-shopify-gray-400">
                Tidak ada data untuk periode ini
              </p>
            ) : (
              chartData.map((item, idx) => (
                <div key={idx} className="flex items-center gap-4">
                  <div className="w-20 text-sm text-shopify-gray-400 font-medium">
                    {item.date}
                  </div>
                  <div className="flex-1 h-10 bg-shopify-darker rounded-shopify overflow-hidden">
                    <div
                      className="h-full bg-gradient-accent flex items-center justify-end pr-3 transition-all duration-500"
                      style={{ width: `${(item.revenue / maxRevenue) * 100}%` }}
                    >
                      <span className="text-white text-sm font-semibold">
                        {formatCurrency(item.revenue)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card hover>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-shopify-blue-900/30 rounded-shopify flex items-center justify-center">
                <Calendar className="w-6 h-6 text-shopify-blue-300" />
              </div>
              <div>
                <p className="text-sm text-shopify-gray-400">Today's Revenue</p>
                <p className="text-2xl font-bold text-white">
                  {formatCurrency(todayRevenue)}
                </p>
                <p className="text-xs text-shopify-gray-500 mt-1">
                  {todayOrders.length} orders
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card hover>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-yellow-900/30 rounded-shopify flex items-center justify-center">
                <Package className="w-6 h-6 text-yellow-500" />
              </div>
              <div>
                <p className="text-sm text-shopify-gray-400">Low Stock Items</p>
                <p className="text-2xl font-bold text-yellow-500">
                  {formatNumber(lowStockItems)}
                </p>
                <p className="text-xs text-shopify-gray-500 mt-1">
                  Requires attention
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card hover>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-900/30 rounded-shopify flex items-center justify-center">
                <Package className="w-6 h-6 text-shopify-accent-critical" />
              </div>
              <div>
                <p className="text-sm text-shopify-gray-400">Out of Stock</p>
                <p className="text-2xl font-bold text-shopify-accent-critical">
                  {formatNumber(outOfStockItems)}
                </p>
                <p className="text-xs text-shopify-gray-500 mt-1">
                  Needs restock
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Latest 5 transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {getFilteredOrders.slice(0, 5).map((order, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-shopify-darker rounded-shopify">
                  <div>
                    <p className="font-medium text-white text-sm">{order.item_name}</p>
                    <p className="text-xs text-shopify-gray-400">
                      {new Date(order.created_at).toLocaleString('id-ID')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-shopify-accent-success">
                      {formatCurrency(order.total_amount)}
                    </p>
                    <p className="text-xs text-shopify-gray-400">
                      {order.quantity_item}x
                    </p>
                  </div>
                </div>
              ))}
              {getFilteredOrders.length === 0 && (
                <p className="text-center py-8 text-shopify-gray-400">
                  Belum ada order
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Stock Alert</CardTitle>
            <CardDescription>Items requiring attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stocks
                .filter(s => parseInt(s.quantity) < 10)
                .slice(0, 5)
                .map((stock, idx) => {
                  const qty = parseInt(stock.quantity);
                  const isOutOfStock = qty === 0;
                  return (
                    <div key={idx} className="flex items-center justify-between p-3 bg-shopify-darker rounded-shopify">
                      <div className="flex-1">
                        <p className="font-medium text-white text-sm">{stock.item_name}</p>
                        <p className="text-xs text-shopify-gray-400">
                          Current stock level
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold text-lg ${
                          isOutOfStock ? 'text-shopify-accent-critical' : 'text-yellow-500'
                        }`}>
                          {qty}
                        </p>
                        <p className="text-xs text-shopify-gray-400">
                          {isOutOfStock ? 'Out of stock' : 'Low stock'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              {stocks.filter(s => parseInt(s.quantity) < 10).length === 0 && (
                <p className="text-center py-8 text-shopify-gray-400">
                  Semua stock dalam kondisi baik
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}