import './admin.css';
import Link from 'next/link';

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="admin-theme">
      <div className="app">
        <aside className="sidebar">
          <div className="brand">
            <div className="brand-icon">T</div>
            <span>Test Series</span>
          </div>

          <nav className="nav">
            <div className="section-label">Overview</div>
            <Link className="active" href="/admin"><span className="icon">⌂</span><span>Dashboard</span></Link>

            <div className="section-label">Management</div>
            <Link href="/admin/users"><span className="icon">👥</span><span>Users</span></Link>
            <Link href="/admin/categories"><span className="icon">📁</span><span>Categories</span></Link>
            <Link href="/admin/test-series"><span className="icon">▣</span><span>Test Series</span></Link>
            <Link href="/admin/tests"><span className="icon">📝</span><span>Tests</span></Link>
            <Link href="/admin/questions"><span className="icon">❓</span><span>Question Bank</span></Link>
            <Link href="/admin/subjects"><span className="icon">📚</span><span>Subjects</span></Link>
            <Link href="/admin/results"><span className="icon">📊</span><span>Results</span></Link>
            <Link href="/admin/leaderboards"><span className="icon">🏆</span><span>Leaderboards</span></Link>

            <div className="section-label">Business</div>
            <Link href="/admin/payments"><span className="icon">💳</span><span>Payments</span></Link>
            <Link href="/admin/coupons"><span className="icon">🎟</span><span>Coupons</span></Link>
            <Link href="/admin/notifications"><span className="icon">🔔</span><span>Notifications</span></Link>

            <div className="section-label">System</div>
            <Link href="/admin/analytics"><span className="icon">📈</span><span>Analytics</span></Link>
            <Link href="/admin/settings"><span className="icon">⚙</span><span>Settings</span></Link>

            <div className="section-label">Guide</div>
            <Link href="/guide" target="_blank"><span className="icon">📖</span><span>Admin Guide</span></Link>
          </nav>
        </aside>

        <main className="main">
          {children}
        </main>
      </div>
    </div>
  );
}
