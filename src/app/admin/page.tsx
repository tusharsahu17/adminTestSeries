'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';
import { Loader2 } from 'lucide-react';

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await adminService.getDashboardOverview();
        setData(response.data);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[500px]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  // Fallback data if API is incomplete
  const stats = data || {
    totalUsers: 12540,
    testAttempts: 8426,
    totalTestSeries: 48,
    revenue: 284000
  };

  return (
    <>
      <header className="topbar">
        <div className="title">
          <h1>Dashboard</h1>
          <p>Welcome back, Admin. Here's what's happening today.</p>
        </div>
        <div className="admin">
          <div className="avatar">A</div>
          <span className="admin-name">Admin User</span>
        </div>
      </header>

      <section className="cards">
        <div className="card">
          <div className="stat-head"><span>Total Users</span><div className="stat-icon">👥</div></div>
          <div className="value">{stats.totalUsers?.toLocaleString()}</div>
          <div className="trend">↑ 12.5% this month</div>
        </div>
        <div className="card">
          <div className="stat-head"><span>Test Attempts</span><div className="stat-icon">📝</div></div>
          <div className="value">{stats.testAttempts?.toLocaleString()}</div>
          <div className="trend">↑ 8.2% this month</div>
        </div>
        <div className="card">
          <div className="stat-head"><span>Test Series</span><div className="stat-icon">📚</div></div>
          <div className="value">{stats.totalTestSeries}</div>
          <div className="trend">↑ 4 new this month</div>
        </div>
        <div className="card">
          <div className="stat-head"><span>Revenue</span><div className="stat-icon">₹</div></div>
          <div className="value">₹{(stats.revenue / 100000)?.toFixed(2)}L</div>
          <div className="trend">↑ 16.8% this month</div>
        </div>
      </section>

      <section className="layout">
        <div className="card">
          <div className="card-title">
            <h2>Test Attempts</h2>
            <Link href="#">Last 7 days ▾</Link>
          </div>
          <div className="chart">
            <div className="bar-wrap"><div className="bar" style={{height: '38%'}}></div><div className="bar-label">Mon</div></div>
            <div className="bar-wrap"><div className="bar" style={{height: '55%'}}></div><div className="bar-label">Tue</div></div>
            <div className="bar-wrap"><div className="bar" style={{height: '48%'}}></div><div className="bar-label">Wed</div></div>
            <div className="bar-wrap"><div className="bar" style={{height: '72%'}}></div><div className="bar-label">Thu</div></div>
            <div className="bar-wrap"><div className="bar" style={{height: '63%'}}></div><div className="bar-label">Fri</div></div>
            <div className="bar-wrap"><div className="bar" style={{height: '86%'}}></div><div className="bar-label">Sat</div></div>
            <div className="bar-wrap"><div className="bar" style={{height: '69%'}}></div><div className="bar-label">Sun</div></div>
          </div>
        </div>

        <div className="card">
          <div className="card-title">
            <h2>Top Test Series</h2>
            <Link href="/admin/test-series">View all →</Link>
          </div>
          <div className="series">
            <div className="series-row">
              <div className="series-name"><div className="mini">G</div><span>GATE CS 2026</span></div>
              <div className="progress"><span style={{width: '88%'}}></span></div>
            </div>
            <div className="series-row">
              <div className="series-name"><div className="mini">U</div><span>UPSC Prelims</span></div>
              <div className="progress"><span style={{width: '74%'}}></span></div>
            </div>
            <div className="series-row">
              <div className="series-name"><div className="mini">N</div><span>NEET Mock Tests</span></div>
              <div className="progress"><span style={{width: '62%'}}></span></div>
            </div>
            <div className="series-row">
              <div className="series-name"><div className="mini">J</div><span>JEE Main 2026</span></div>
              <div className="progress"><span style={{width: '51%'}}></span></div>
            </div>
          </div>
        </div>
      </section>

      <section className="card table-card">
        <div className="card-title">
          <h2>Recent Users</h2>
          <Link href="/admin/users">View all →</Link>
        </div>
        <table>
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Test Series</th>
              <th>Joined</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {(data?.recentUsers || [
              { name: 'Rahul Sharma', email: 'rahul@example.com', series: 'GATE CS 2026', date: 'Today, 10:42 AM', status: 'Active' },
              { name: 'Priya Singh', email: 'priya@example.com', series: 'UPSC Prelims', date: 'Today, 09:18 AM', status: 'Active' },
              { name: 'Aman Verma', email: 'aman@example.com', series: 'JEE Main 2026', date: 'Yesterday', status: 'Pending' }
            ]).map((u: any, i: number) => (
              <tr key={i}>
                <td><strong>{u.name}</strong></td>
                <td>{u.email}</td>
                <td>{u.series || '-'}</td>
                <td>{u.date || new Date(u.createdAt).toLocaleDateString()}</td>
                <td><span className={`status ${u.status === 'Pending' ? 'pending' : 'active-status'}`}>{u.status || 'Active'}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  );
}
