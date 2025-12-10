// app/dashboard/page.js
"use client";

import React, { useState, useEffect } from 'react';
import { ShoppingCart, Package, ClipboardList, Boxes, Users, List, BarChart3, CheckCircle, XCircle, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import OrderTab from '@/components/order/OrderTab';
import OrderListTab from '@/components/order/OrderListTab';
import MasterItemTab from '@/components/MasterItemTab';
import ShoppingListTab from '@/components/ShoppingListTab';
import StockTab from '@/components/StockTab';
import UsersTab from '@/components/UsersTab';
import AnalyticsDashboard from '@/components/AnalyticsDashboard';
import SettingsTab from '@/components/SettingsTab';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('analytics');
  const [currentUser, setCurrentUser] = useState(null);
  const [masterItems, setMasterItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stocks, setStocks] = useState([]);
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchCurrentUser();
    fetchMasterItems();
    fetchCategories();
    fetchStocks();
  }, []);

  useEffect(() => {
    if (currentUser?.role === 'superadmin') {
      fetchUsers();
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      if (currentUser.role === 'worker') {
        setActiveTab('order');
      } else {
        setActiveTab('analytics');
      }
    }
  }, [currentUser]);

  const fetchCurrentUser = async () => {
    try {
      const res = await fetch('/api/auth/check');
      const data = await res.json();
      if (data.authenticated) {
        setCurrentUser(data.user);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  const fetchMasterItems = async () => {
    try {
      const res = await fetch('/api/master-items');
      const data = await res.json();
      if (data.success) setMasterItems(data.data);
    } catch (error) {
      console.error('Error fetching master items:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      if (data.success) setCategories(data.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchStocks = async () => {
    try {
      const res = await fetch('/api/stock');
      const data = await res.json();
      if (data.success) setStocks(data.data);
    } catch (error) {
      console.error('Error fetching stocks:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      if (data.success) setUsers(data.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 4000);
  };

  useEffect(() => {
    window.refreshStocks = fetchStocks;
    return () => {
      delete window.refreshStocks;
    };
  }, []);

  const canAccessTab = (tab) => {
    if (!currentUser) return false;
    if (currentUser.role === 'superadmin') return true;
    if (currentUser.role === 'admin') return ['analytics', 'order', 'orderlist', 'master', 'shopping', 'stock', 'settings'].includes(tab);
    if (currentUser.role === 'worker') return ['order', 'orderlist'].includes(tab);
    return false;
  };

  const tabs = [
    { id: 'analytics', label: 'Dashboard', icon: BarChart3, requiredRole: ['superadmin', 'admin'] },
    { id: 'order', label: 'Order', icon: ShoppingCart, requiredRole: ['superadmin', 'admin', 'worker'] },
    { id: 'orderlist', label: 'Order List', icon: List, requiredRole: ['superadmin', 'admin', 'worker'] },
    { id: 'master', label: 'Master Item', icon: Package, requiredRole: ['superadmin', 'admin'] },
    { id: 'shopping', label: 'Shopping List', icon: ClipboardList, requiredRole: ['superadmin', 'admin'] },
    { id: 'stock', label: 'Stock', icon: Boxes, requiredRole: ['superadmin', 'admin'] },
    { id: 'users', label: 'Users', icon: Users, requiredRole: ['superadmin'] },
    { id: 'settings', label: 'Settings', icon: Settings, requiredRole: ['superadmin', 'admin'] },
  ];

  return (
    <>
      {/* Sidebar Navigation - This will be rendered inside the sidebar in layout.js */}
      <nav className="space-y-1">
        {tabs.map((tab) => {
          if (!canAccessTab(tab.id)) return null;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-3 rounded-shopify font-medium transition-all',
                activeTab === tab.id 
                  ? 'bg-shopify-accent-primary text-white shadow-shopify' 
                  : 'text-shopify-gray-400 hover:text-white hover:bg-shopify-gray-800'
              )}
            >
              <Icon className="w-5 h-5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Main Content Area - This will be rendered in the main section */}
      <div className="fixed top-16 left-0 lg:left-64 right-0 bottom-0 overflow-y-auto bg-shopify-dark">
        {/* Notification Toast */}
        {message.text && (
          <div className="fixed top-20 right-4 z-50 animate-slide-down">
            <div className={`flex items-center gap-3 px-6 py-4 rounded-shopify-lg shadow-shopify-xl border ${
              message.type === 'success' 
                ? 'bg-shopify-accent-success border-green-600 text-white' 
                : 'bg-shopify-accent-critical border-red-600 text-white'
            }`}>
              {message.type === 'success' ? (
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 flex-shrink-0" />
              )}
              <span className="font-medium">{message.text}</span>
            </div>
          </div>
        )}

        <div className="p-6">
          {activeTab === 'analytics' && (
            <AnalyticsDashboard onMessage={showMessage} />
          )}

          {activeTab === 'order' && (
            <OrderTab
              masterItems={masterItems}
              stocks={stocks}
              categories={categories}
              currentUser={currentUser}
              onMessage={showMessage}
            />
          )}
          
          {activeTab === 'orderlist' && (
            <OrderListTab onMessage={showMessage} />
          )}
          
          {activeTab === 'master' && (
            <MasterItemTab
              masterItems={masterItems}
              categories={categories}
              onRefresh={fetchMasterItems}
              onMessage={showMessage}
            />
          )}

          {activeTab === 'shopping' && (
            <ShoppingListTab onMessage={showMessage} />
          )}

          {activeTab === 'stock' && (
            <StockTab
              stocks={stocks}
              currentUser={currentUser}
              onRefresh={fetchStocks}
              onMessage={showMessage}
            />
          )}

          {activeTab === 'users' && currentUser?.role === 'superadmin' && (
            <UsersTab
              users={users}
              onRefresh={fetchUsers}
              onMessage={showMessage}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsTab
              currentUser={currentUser}
              onMessage={showMessage}
            />
          )}
        </div>
      </div>
    </>
  );
}