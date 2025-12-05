import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Merge Tailwind classes
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Format currency
export function formatCurrency(amount) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
}

// Format number
export function formatNumber(num) {
  return new Intl.NumberFormat('id-ID').format(num);
}

// Format date
export function formatDate(date, format = 'long') {
  const d = new Date(date);
  
  const formats = {
    short: {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    },
    long: {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    },
    time: {
      hour: '2-digit',
      minute: '2-digit',
    },
  };

  return new Intl.DateTimeFormat('id-ID', formats[format] || formats.long).format(d);
}

// Format date for input
export function formatDateForInput(date) {
  const d = new Date(date);
  return d.toISOString().split('T')[0];
}

// Calculate percentage
export function calculatePercentage(value, total) {
  if (total === 0) return 0;
  return ((value / total) * 100).toFixed(1);
}

// Debounce function
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Get initials from name
export function getInitials(name) {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// Truncate text
export function truncate(str, length = 50) {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

// Generate random ID
export function generateId(prefix = '') {
  return `${prefix}${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
}

// Validate email
export function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// Get stock status
export function getStockStatus(quantity) {
  if (quantity === 0) return { status: 'out', label: 'Habis', color: 'critical' };
  if (quantity < 10) return { status: 'low', label: 'Menipis', color: 'warning' };
  return { status: 'available', label: 'Tersedia', color: 'success' };
}

// Get role badge color
export function getRoleBadgeColor(role) {
  const colors = {
    superadmin: 'badge-critical',
    admin: 'badge-info',
    worker: 'badge-success',
  };
  return colors[role] || 'badge-shopify';
}

// Group array by key
export function groupBy(array, key) {
  return array.reduce((result, item) => {
    const groupKey = item[key];
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
    return result;
  }, {});
}

// Sort array by key
export function sortBy(array, key, order = 'asc') {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    
    if (order === 'asc') {
      return aVal > bVal ? 1 : -1;
    }
    return aVal < bVal ? 1 : -1;
  });
}

// Filter array by search query
export function searchFilter(array, query, keys) {
  const lowerQuery = query.toLowerCase();
  return array.filter(item => {
    return keys.some(key => {
      const value = item[key];
      return value && value.toString().toLowerCase().includes(lowerQuery);
    });
  });
}