'use client';

import { useRouter } from 'next/navigation';
import { LogOut, User, Crown, Shield, Briefcase, Bell, Search } from 'lucide-react';
import { cn, getInitials } from '@/lib/utils';
import Badge from '../ui/Badge';
import { useState } from 'react';

export default function Navbar({ user }) {
  const router = useRouter();
  const [showUserMenu, setShowUserMenu] = useState(false);

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
      default: return User;
    }
  };

  const getRoleBadgeVariant = (role) => {
    switch(role) {
      case 'superadmin': return 'critical';
      case 'admin': return 'info';
      case 'worker': return 'success';
      default: return 'default';
    }
  };

  const RoleIcon = getRoleIcon(user.role);

  return (
    <nav className="sticky top-0 z-40 bg-shopify-charcoal border-b border-shopify-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-accent rounded-shopify flex items-center justify-center">
                <img 
                  src="/Logo_Ratuna.png" 
                  alt="Ratuna" 
                  className="w-8 h-8 object-contain"
                />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-white">Ratuna</h1>
                <p className="text-xs text-shopify-gray-400">Point of Sale</p>
              </div>
            </div>

            {/* Search Bar (Optional - uncomment if needed) */}
            {/* <div className="hidden md:block">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-shopify-gray-500" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 w-64 bg-shopify-darker border border-shopify-gray-800 rounded-shopify text-sm text-white placeholder-shopify-gray-500 focus:outline-none focus:ring-2 focus:ring-shopify-accent-primary"
                />
              </div>
            </div> */}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            {/* Notifications */}
            <button className="relative p-2 text-shopify-gray-400 hover:text-white hover:bg-shopify-gray-800 rounded-shopify transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-shopify-accent-critical rounded-full"></span>
            </button>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-3 p-2 hover:bg-shopify-gray-800 rounded-shopify transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-accent rounded-full flex items-center justify-center text-white text-sm font-semibold">
                    {getInitials(user.fullName)}
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-white">{user.fullName}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <RoleIcon className="w-3 h-3 text-shopify-gray-400" />
                      <span className="text-xs text-shopify-gray-400 capitalize">{user.role}</span>
                    </div>
                  </div>
                </div>
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-40"
                    onClick={() => setShowUserMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-64 bg-shopify-charcoal border border-shopify-gray-800 rounded-shopify-lg shadow-shopify-xl z-50 animate-slide-down">
                    <div className="p-4 border-b border-shopify-gray-800">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-accent rounded-full flex items-center justify-center text-white font-semibold">
                          {getInitials(user.fullName)}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-white">{user.fullName}</p>
                          <p className="text-sm text-shopify-gray-400">@{user.username}</p>
                        </div>
                      </div>
                      <div className="mt-3">
                        <Badge variant={getRoleBadgeVariant(user.role)} icon={RoleIcon}>
                          {user.role.toUpperCase()}
                        </Badge>
                      </div>
                    </div>

                    <div className="p-2">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2 text-left text-sm text-shopify-gray-300 hover:bg-shopify-gray-800 rounded-shopify transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}