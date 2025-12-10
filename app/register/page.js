'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { UserPlus, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    full_name: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Password tidak cocok');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password minimal 6 karakter');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
          full_name: formData.full_name
        })
      });

      const data = await res.json();

      if (data.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } else {
        setError(data.error || 'Registrasi gagal');
      }
    } catch (err) {
      setError('Terjadi kesalahan. Silakan coba lagi');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-shopify-dark p-4">
        <div className="w-full max-w-md">
          <div className="card-shopify p-8 text-center shadow-shopify-xl">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-shopify-accent-success/20 rounded-full mb-4">
              <CheckCircle2 className="w-10 h-10 text-shopify-accent-success" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Registration Successful!</h2>
            <p className="text-shopify-gray-400 mb-2">
              Your account has been created successfully.
            </p>
            <p className="text-sm text-shopify-gray-500 mb-6">
              Waiting for approval from Super Admin...
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-shopify-gray-400">
              <div className="spinner-shopify" />
              <span>Redirecting to login...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-shopify-dark p-4">
      <div className="w-full max-w-md">
        {/* Logo & Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-accent rounded-shopify-lg mb-4 shadow-shopify-lg">
            <img
              src="/Logo_Ratuna.png"
              alt="Ratuna Logo"
              className="w-16 h-16 object-contain"
            />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
          <p className="text-shopify-gray-400">Register for Ratuna POS System</p>
        </div>

        {/* Register Card */}
        <div className="card-shopify p-8 shadow-shopify-xl">
          {error && (
            <div className="mb-6 p-4 bg-shopify-accent-critical/10 border border-shopify-accent-critical/30 rounded-shopify flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-shopify-accent-critical flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-shopify-accent-critical">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-shopify-gray-300 mb-2">
                Full Name <span className="text-shopify-accent-critical">*</span>
              </label>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                className="input-shopify"
                placeholder="Enter your full name"
                required
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-shopify-gray-300 mb-2">
                Username <span className="text-shopify-accent-critical">*</span>
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                className="input-shopify"
                placeholder="Choose a username"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-shopify-gray-300 mb-2">
                Password <span className="text-shopify-accent-critical">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="input-shopify pr-12"
                  placeholder="Create a password"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-shopify-gray-400 hover:text-white hover:bg-shopify-gray-800 rounded transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              <p className="text-xs text-shopify-gray-500 mt-1">
                Minimum 6 characters
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-shopify-gray-300 mb-2">
                Confirm Password <span className="text-shopify-accent-critical">*</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  className="input-shopify pr-12"
                  placeholder="Confirm your password"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-shopify-gray-400 hover:text-white hover:bg-shopify-gray-800 rounded transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3 text-base"
            >
              {loading ? (
                <>
                  <div className="spinner-shopify" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  <span>Create Account</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-shopify-gray-800">
            <p className="text-xs text-shopify-gray-500 text-center">
              By creating an account, you agree that your account will require 
              approval from a Super Admin before you can access the system.
            </p>
          </div>
        </div>

        {/* Login Link */}
        <div className="mt-6 text-center">
          <p className="text-sm text-shopify-gray-400">
            Already have an account?{' '}
            <Link 
              href="/login" 
              className="text-shopify-accent-primary hover:text-shopify-accent-primary/80 font-medium transition-colors"
            >
              Sign in here
            </Link>
          </p>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-shopify-gray-500">
            © 2025 Ratuna. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}