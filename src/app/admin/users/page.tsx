'use client';
import { useEffect, useState } from 'react';
import { adminService } from '../../../services/adminService';
import Link from 'next/link';
import { Loader2, Search, Filter, ShieldBan, Eye } from 'lucide-react';
import { formatDateTime } from '../../../utils/formatters';

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [subscriptionFilter, setSubscriptionFilter] = useState('');
  
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await adminService.getUsers({ search: searchTerm, status: statusFilter, subscription: subscriptionFilter });
      const dataList = res.data?.users || res.data || res;
      setUsers(Array.isArray(dataList) ? dataList : []);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [statusFilter, subscriptionFilter]); // refetch when filters change

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleBlockUser = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'blocked' ? 'active' : 'blocked';
    if(confirm(`Are you sure you want to ${newStatus === 'blocked' ? 'block' : 'unblock'} this user?`)) {
      try {
        await adminService.updateUserStatus(userId, newStatus);
        fetchUsers();
      } catch (err) {
        console.error('Failed to update user status', err);
        alert('Failed to update user status');
      }
    }
  }

  return (
    <div className="flex flex-col h-full space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-sm text-gray-500">View and manage all registered users.</p>
        </div>
      </header>

      <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex-1">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between gap-4 flex-wrap">
          <form onSubmit={handleSearch} className="flex-1 min-w-[200px] max-w-md relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
            />
          </form>
          <div className="flex items-center gap-2">
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="blocked">Blocked</option>
            </select>
            <select 
              value={subscriptionFilter} 
              onChange={(e) => setSubscriptionFilter(e.target.value)}
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="">All Subscriptions</option>
              <option value="active">Pro (Active)</option>
              <option value="inactive">Free (Inactive)</option>
            </select>
            <button onClick={fetchUsers} className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors">
              <Filter className="w-4 h-4" /> Filter
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="py-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                <th className="py-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="py-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Joined</th>
                <th className="py-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Last Active</th>
                <th className="py-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Subscription</th>
                <th className="py-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <Loader2 className="w-6 h-6 animate-spin text-indigo-500 mx-auto" />
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-500">No users found.</td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-sm">
                          {user.name ? user.name.charAt(0).toUpperCase() : (user.username ? user.username.charAt(0).toUpperCase() : 'U')}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{user.name || user.username || 'Unknown User'}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-5">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.status === 'blocked' ? 'bg-red-100 text-red-800' :
                        user.status === 'inactive' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {user.status || 'active'}
                      </span>
                    </td>
                    <td className="py-3 px-5 text-sm text-gray-600">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}
                    </td>
                    <td className="py-3 px-5 text-xs text-gray-500">
                      {formatDateTime(user.last_active_at || user.lastActiveAt || user.last_login_at || user.lastLoginAt)}
                    </td>
                    <td className="py-3 px-5">
                      {user.subscription_status === 'active' ? (
                        <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">Pro</span>
                      ) : (
                        <span className="text-xs text-gray-500">Free</span>
                      )}
                    </td>
                    <td className="py-3 px-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/admin/users/${user.id}`} className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors" title="View Details">
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button onClick={() => handleBlockUser(user.id, user.status)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors" title={user.status === 'blocked' ? "Unblock User" : "Block User"}>
                          <ShieldBan className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination placeholder */}
        <div className="p-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
          <div>Showing {users.length} users</div>
          <div className="flex items-center gap-1">
            <button className="px-3 py-1 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded disabled:opacity-50">Prev</button>
            <button className="px-3 py-1 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded disabled:opacity-50">Next</button>
          </div>
        </div>
      </section>
    </div>
  );
}
