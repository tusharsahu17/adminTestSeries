'use client';
import { useEffect, useState } from 'react';
import { adminService } from '../../../../services/adminService';
import { useParams, useRouter } from 'next/navigation';
import { Loader2, ArrowLeft, Activity, Target, Clock, AlertCircle, X } from 'lucide-react';
import Link from 'next/link';

export default function UserDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [attempts, setAttempts] = useState<any[]>([]);
  const [activity, setActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [editForm, setEditForm] = useState({ name: '', email: '', phone: '' });
  const [newPassword, setNewPassword] = useState('');

  const fetchUserDetails = async () => {
    setLoading(true);
    try {
      const [profileRes, attemptsRes, activityRes] = await Promise.all([
        adminService.getUserProfile(id as string).catch(() => ({ data: null })),
        adminService.getUserAttempts(id as string).catch(() => ({ data: [] })),
        adminService.getUserActivity(id as string).catch(() => ({ data: [] }))
      ]);
      
      const p = profileRes.data?.user || profileRes.data || null;
      setProfile(p);
      if (p) {
        setEditForm({ name: p.name || '', email: p.email || '', phone: p.phone || '' });
      }
      
      const attData = attemptsRes.data?.attempts || attemptsRes.data || [];
      setAttempts(Array.isArray(attData) ? attData : []);
      
      const actData = activityRes.data?.activity || activityRes.data || [];
      setActivity(Array.isArray(actData) ? actData : []);
    } catch (err) {
      console.error('Failed to fetch user details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchUserDetails();
  }, [id]);

  const handleUpdateDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await adminService.updateUserDetails(id as string, editForm);
      alert('Details updated successfully');
      setIsEditOpen(false);
      fetchUserDetails();
    } catch (err) {
      console.error('Update failed:', err);
      alert('Failed to update details');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword) return alert('Password is required');
    setSubmitting(true);
    try {
      await adminService.resetUserPassword(id as string, newPassword);
      alert('Password reset successfully');
      setIsResetOpen(false);
      setNewPassword('');
    } catch (err) {
      console.error('Reset failed:', err);
      alert('Failed to reset password');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full min-h-[400px] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] space-y-4">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <h2 className="text-xl font-semibold">User Not Found</h2>
        <button onClick={() => router.back()} className="text-indigo-600 hover:underline">Go Back</button>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-6 pb-10 relative">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{profile.name || profile.username}'s Profile</h1>
          <p className="text-sm text-gray-500">ID: {profile.id} • Registered {profile.createdAt && !isNaN(new Date(profile.createdAt).getTime()) ? new Date(profile.createdAt).toLocaleDateString() : 'N/A'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex flex-col items-center text-center pb-6 border-b border-gray-100">
              <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center text-2xl font-bold mb-4">
                {(profile.name || profile.username || 'U').charAt(0).toUpperCase()}
              </div>
              <h2 className="text-lg font-semibold">{profile.name || profile.username}</h2>
              <p className="text-gray-500 text-sm">{profile.email || 'No email'}</p>
              
              <div className="mt-4 flex gap-2">
                <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                  profile.status === 'blocked' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                }`}>
                  {profile.status || 'Active'}
                </span>
                <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                  profile.subscription_status === 'active' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-700'
                }`}>
                  {profile.subscription_status === 'active' ? 'Pro Plan' : 'Free Plan'}
                </span>
              </div>
            </div>
            
            <div className="pt-6 space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Contact Info</h3>
              <div className="text-sm flex flex-col gap-2 text-gray-600">
                <p><strong>Phone:</strong> {profile.phone || 'N/A'}</p>
                <p><strong>Username:</strong> {profile.username}</p>
              </div>
              
              <div className="pt-4 flex flex-col gap-2">
                <button 
                  onClick={() => setIsEditOpen(true)}
                  className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-sm font-medium transition-colors"
                >
                  Edit Details
                </button>
                <button 
                  onClick={() => setIsResetOpen(true)}
                  className="w-full py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-sm font-medium transition-colors"
                >
                  Reset Password
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Stats & History */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 text-indigo-600 mb-2">
                <Target className="w-5 h-5" />
                <h3 className="font-medium text-gray-900">Total Attempts</h3>
              </div>
              <p className="text-2xl font-bold">{attempts.length}</p>
            </div>
            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 text-green-600 mb-2">
                <Activity className="w-5 h-5" />
                <h3 className="font-medium text-gray-900">Avg Score</h3>
              </div>
              <p className="text-2xl font-bold">
                {attempts.length ? Math.round(attempts.reduce((acc, curr) => acc + (curr.score || 0), 0) / attempts.length) : 0}%
              </p>
            </div>
            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 text-amber-500 mb-2">
                <Clock className="w-5 h-5" />
                <h3 className="font-medium text-gray-900">Last Active</h3>
              </div>
              <p className="text-sm font-bold mt-2">
                {activity.length > 0 && activity[0].timestamp ? new Date(activity[0].timestamp).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>

          {/* Test History Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-gray-900">Recent Test Attempts</h3>
              <Link href="#" className="text-sm text-indigo-600 hover:underline">View All</Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50/50 text-gray-500">
                  <tr>
                    <th className="py-3 px-5 font-medium">Test Name</th>
                    <th className="py-3 px-5 font-medium">Date</th>
                    <th className="py-3 px-5 font-medium">Score</th>
                    <th className="py-3 px-5 font-medium text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {attempts.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-gray-500">No tests attempted yet.</td>
                    </tr>
                  ) : (
                    attempts.slice(0, 5).map((attempt, idx) => (
                      <tr key={idx} className="hover:bg-gray-50/50">
                        <td className="py-3 px-5 font-medium text-gray-900">{attempt.test?.title || attempt.testName || `Test #${attempt.test_id}`}</td>
                        <td className="py-3 px-5 text-gray-600">{new Date(attempt.createdAt || attempt.start_time).toLocaleDateString()}</td>
                        <td className="py-3 px-5 text-gray-600">{attempt.score}/{attempt.total_marks || 100}</td>
                        <td className="py-3 px-5 text-right">
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">Completed</span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Details Modal */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-bold text-gray-900">Edit Details</h3>
              <button onClick={() => setIsEditOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleUpdateDetails} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input 
                  type="text" 
                  value={editForm.name} 
                  onChange={e => setEditForm({...editForm, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input 
                  type="email" 
                  value={editForm.email} 
                  onChange={e => setEditForm({...editForm, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input 
                  type="text" 
                  value={editForm.phone} 
                  onChange={e => setEditForm({...editForm, phone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsEditOpen(false)} className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition-colors">Cancel</button>
                <button type="submit" disabled={submitting} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2">
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />} Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {isResetOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-bold text-gray-900">Reset Password</h3>
              <button onClick={() => setIsResetOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <input 
                  type="password" 
                  required
                  value={newPassword} 
                  onChange={e => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsResetOpen(false)} className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition-colors">Cancel</button>
                <button type="submit" disabled={submitting} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2">
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />} Reset Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
