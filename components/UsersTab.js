'use client';

import { useState, useMemo } from 'react';
import { Users, Search, Check, X, Shield, Briefcase } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Select } from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import Modal, { ModalFooter } from '@/components/ui/Modal';
import { formatDate, getInitials } from '@/lib/utils';

export default function UsersTab({ users, onRefresh, onMessage }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [approvalData, setApprovalData] = useState({
    role: 'worker',
    status: 'approved'
  });
  const [loading, setLoading] = useState(false);

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = 
        user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.full_name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [users, searchQuery, filterStatus]);

  const pendingUsers = users.filter(u => u.status === 'pending');
  const approvedUsers = users.filter(u => u.status === 'approved');
  const rejectedUsers = users.filter(u => u.status === 'rejected');

  const handleOpenApprovalModal = (user) => {
    setSelectedUser(user);
    setApprovalData({
      role: user.role || 'worker',
      status: 'approved'
    });
    setShowApprovalModal(true);
  };

  const handleApproval = async () => {
    if (!selectedUser) return;
    setLoading(true);

    try {
      const res = await fetch('/api/users/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: selectedUser.user_id,
          username: selectedUser.username,
          full_name: selectedUser.full_name,
          role: approvalData.role,
          status: approvalData.status,
          rowIndex: selectedUser._rowIndex
        })
      });

      const data = await res.json();

      if (data.success) {
        onMessage('success', data.message);
        setShowApprovalModal(false);
        onRefresh();
      } else {
        onMessage('error', data.error);
      }
    } catch (error) {
      onMessage('error', 'Terjadi kesalahan');
    }
    setLoading(false);
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: <Badge variant="warning">Pending</Badge>,
      approved: <Badge variant="success">Approved</Badge>,
      rejected: <Badge variant="critical">Rejected</Badge>
    };
    return badges[status] || <Badge>{status}</Badge>;
  };

  const getRoleBadge = (role) => {
    const badges = {
      superadmin: <Badge variant="critical" icon={Shield}>Super Admin</Badge>,
      admin: <Badge variant="info" icon={Shield}>Admin</Badge>,
      worker: <Badge variant="success" icon={Briefcase}>Worker</Badge>
    };
    return badges[role] || <Badge>{role}</Badge>;
  };

  return (
    <>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-shopify-gray-400 mb-1">Pending</p>
                <p className="text-3xl font-bold text-yellow-500">{pendingUsers.length}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-900/30 rounded-shopify flex items-center justify-center">
                <Users className="w-6 h-6 text-yellow-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-shopify-gray-400 mb-1">Approved</p>
                <p className="text-3xl font-bold text-shopify-accent-success">{approvedUsers.length}</p>
              </div>
              <div className="w-12 h-12 bg-green-900/30 rounded-shopify flex items-center justify-center">
                <Check className="w-6 h-6 text-shopify-accent-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-shopify-gray-400 mb-1">Rejected</p>
                <p className="text-3xl font-bold text-shopify-accent-critical">{rejectedUsers.length}</p>
              </div>
              <div className="w-12 h-12 bg-red-900/30 rounded-shopify flex items-center justify-center">
                <X className="w-6 h-6 text-shopify-accent-critical" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Manajemen Users</CardTitle>
            <CardDescription>
              Kelola dan approve user baru
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-shopify-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari user..."
                className="input-shopify pl-10"
              />
            </div>
            <Select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              options={[
                { value: 'all', label: 'Semua Status' },
                { value: 'pending', label: 'Pending' },
                { value: 'approved', label: 'Approved' },
                { value: 'rejected', label: 'Rejected' }
              ]}
            />
          </div>

          {/* Users Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredUsers.length === 0 ? (
              <div className="col-span-full text-center py-12 text-shopify-gray-400">
                <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Tidak ada data user</p>
              </div>
            ) : (
              filteredUsers.map((user, idx) => (
                <Card key={idx} hover>
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-12 h-12 bg-gradient-accent rounded-full flex items-center justify-center text-white font-semibold text-lg shadow-shopify">
                        {getInitials(user.full_name)}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-white mb-1">
                          {user.full_name}
                        </h3>
                        <p className="text-sm text-shopify-gray-400">
                          @{user.username}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-shopify-gray-400">Role</span>
                        {getRoleBadge(user.role)}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-shopify-gray-400">Status</span>
                        {getStatusBadge(user.status)}
                      </div>
                      <div className="text-xs text-shopify-gray-500 mt-2">
                        Registered: {formatDate(user.created_at, {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </div>
                    </div>

                    {user.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button
                          variant="success"
                          size="sm"
                          fullWidth
                          icon={Check}
                          onClick={() => handleOpenApprovalModal(user)}
                        >
                          Review
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Approval Modal */}
      <Modal
        isOpen={showApprovalModal}
        onClose={() => setShowApprovalModal(false)}
        title="Review User"
        description={selectedUser ? `Review registration untuk ${selectedUser.full_name}` : ''}
      >
        {selectedUser && (
          <div className="space-y-6">
            {/* User Info */}
            <div className="p-4 bg-shopify-darker rounded-shopify border border-shopify-gray-800">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-gradient-accent rounded-full flex items-center justify-center text-white font-semibold text-xl">
                  {getInitials(selectedUser.full_name)}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {selectedUser.full_name}
                  </h3>
                  <p className="text-sm text-shopify-gray-400">
                    @{selectedUser.username}
                  </p>
                </div>
              </div>
              <div className="text-sm text-shopify-gray-400">
                Registered: {formatDate(selectedUser.created_at)}
              </div>
            </div>

            {/* Approval Form */}
            <div className="space-y-4">
              <Select
                label="Assign Role"
                value={approvalData.role}
                onChange={(e) => setApprovalData({...approvalData, role: e.target.value})}
                options={[
                  { value: 'worker', label: 'Worker' },
                  { value: 'admin', label: 'Admin' },
                  { value: 'superadmin', label: 'Super Admin' }
                ]}
              />

              <Select
                label="Status"
                value={approvalData.status}
                onChange={(e) => setApprovalData({...approvalData, status: e.target.value})}
                options={[
                  { value: 'approved', label: 'Approve User' },
                  { value: 'rejected', label: 'Reject User' }
                ]}
              />
            </div>

            <ModalFooter>
              <Button
                variant="secondary"
                onClick={() => setShowApprovalModal(false)}
                disabled={loading}
              >
                Batal
              </Button>
              <Button
                variant={approvalData.status === 'approved' ? 'success' : 'critical'}
                onClick={handleApproval}
                loading={loading}
                icon={approvalData.status === 'approved' ? Check : X}
              >
                {approvalData.status === 'approved' ? 'Approve' : 'Reject'}
              </Button>
            </ModalFooter>
          </div>
        )}
      </Modal>
    </>
  );
}