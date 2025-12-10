'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  BarChart3, 
  ShoppingCart, 
  List, 
  Package, 
  ClipboardList, 
  Boxes, 
  Users,
  Menu,
  X,
  LogOut,
  Crown,
  Shield,
  Briefcase
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/check');
      const data = await res.json();

      if (data.authenticated) {
        setUser(data.user);
      } else {
        router.push('/login');
      }
    } catch (error) {
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/check', { method: 'DELETE' });
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const getRoleIcon = (role) => {
    switch(role) {
      case 'superadmin': return Crown;
      case 'admin': return Shield;
      case 'worker': return Briefcase;
      default: return Briefcase;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-shopify-dark">
        <div className="text-center">
          <div className="spinner-shopify w-12 h-12 mx-auto mb-4"></div>
          <p className="text-white text-xl">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const RoleIcon = getRoleIcon(user.role);

  return (
    <div className="min-h-screen bg-shopify-dark">
      {/* Top Navbar */}
      <nav className="fixed top-0 left-0 right-0 h-16 bg-shopify-charcoal border-b border-shopify-gray-800 z-40">
        <div className="h-full px-4 flex items-center justify-between">
          {/* Left: Menu Toggle & Logo */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 text-shopify-gray-400 hover:text-white hover:bg-shopify-gray-800 rounded-shopify transition-colors lg:hidden"
            >
              <Menu className="w-6 h-6" />
            </button>
            
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-accent rounded-shopify flex items-center justify-center">
                <img 
                  src="/Logo_Ratuna.png" 
                  alt="Ratuna" 
                  className="w-6 h-6 object-contain"
                />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-semibold text-white">Ratuna</h1>
                <p className="text-xs text-shopify-gray-400">Point of Sale</p>
              </div>
            </div>
          </div>

          {/* Right: User Info */}
          <div className="flex items-center gap-3">
            <div className="hidden md:block text-right">
              <p className="text-sm font-medium text-white">{user.fullName}</p>
              <div className="flex items-center justify-end gap-1 mt-0.5">
                <RoleIcon className="w-3 h-3 text-shopify-gray-400" />
                <span className="text-xs text-shopify-gray-400 capitalize">{user.role}</span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-shopify-gray-400 hover:text-white hover:bg-shopify-gray-800 rounded-shopify transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      {/* Sidebar Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content - TANPA SIDEBAR DI SINI */}
      <main className="pt-16">
        <div className="min-h-screen">
          {children}
        </div>
      </main>
    </div>
  );
}