'use client';

import { useState } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

export default function UsersTab({ users, onRefresh, onMessage }) {
  const [loading, setLoading] = useState(false);

  const handleUserAction = async (user, status, role) => {
    setLoading(true);
    try {
      const res = await fetch('/api/users/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.user_id,
          username: user.username,
          full_name: user.full_name,
          role: role,
          status: status,
          rowIndex: user._rowIndex
        })
      });
      const data = await res.json();
      if (data.success) {
        onMessage('success', data.message);
        onRefresh();
      } else {
        onMessage('error', data.error);
      }
    } catch (error) {
      onMessage('error', 'Terjadi kesalahan');
    }
    setLoading(false);
  };

  return (
    <div className="bg-white border-2 border-black rounded-lg p-8">
      <h2 className="text-2xl font-bold mb-6">User Management</h2>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-black">
              <th className="text-left py-3 px-4 font-medium">Username</th>
              <th className="text-left py-3 px-4 font-medium">Full Name</th>
              <th className="text-left py-3 px-4 font-medium">Role</th>
              <th className="text-left py-3 px-4 font-medium">Status</th>
              <th className="text-left py-3 px-4 font-medium">Created</th>
              <th className="text-center py-3 px-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, idx) => (
              <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="py-3 px-4">{user.username}</td>
                <td className="py-3 px-4">{user.full_name}</td>
                <td className="py-3 px-4">
                  {user.status === 'pending' ? (
                    <select
                      defaultValue={user.role}
                      className="border-2 border-gray-300 rounded px-2 py-1 text-sm"
                      id={`role-${idx}`}
                    >
                      <option value="worker">Worker</option>
                      <option value="admin">Admin</option>
                    </select>
                  ) : (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-200">
                      {user.role.toUpperCase()}
                    </span>
                  )}
                </td>
                <td className="py-3 px-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    user.status === 'approved' ? 'bg-green-200 text-green-800' :
                    user.status === 'rejected' ? 'bg-red-200 text-red-800' :
                    'bg-yellow-200 text-yellow-800'
                  }`}>
                    {user.status.toUpperCase()}
                  </span>
                </td>
                <td className="py-3 px-4 text-sm">
                  {user.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}
                </td>
                <td className="py-3 px-4">
                  {user.status === 'pending' && (
                    <div className="flex justify-center space-x-2">
                      <button
                        onClick={() => {
                          const roleSelect = document.getElementById(`role-${idx}`);
                          handleUserAction(user, 'approved', roleSelect.value);
                        }}
                        disabled={loading}
                        className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                        title="Approve"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleUserAction(user, 'rejected', user.role)}
                        disabled={loading}
                        className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                        title="Reject"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}